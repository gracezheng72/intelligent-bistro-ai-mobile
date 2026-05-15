import { menuItems } from "../data/menu.js";
import { CartItem } from "../types/cart.js";
import { ParseOrderResponse } from "../types/ai.js";
import { validateCartActions } from "./validateCartActions.js";
import { parseWithFallback } from "./fallbackParserService.js";

function extractJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in model response");
    return JSON.parse(match[0]);
  }
}

function isValidIntent(intent: string): intent is ParseOrderResponse["intent"] {
  return ["add_items", "remove_items", "update_quantity", "replace_item", "clear_cart", "show_cart", "unknown"].includes(intent);
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function isAmbiguousGenericSandwich(message: string): boolean {
  const clean = normalizeText(message);
  return /\bsandwich(es)?\b/.test(clean) && !/\b(spicy|classic|non spicy|regular|beef|chicken)\b/.test(clean);
}

function normalizeModelResponse(raw: unknown, cart: CartItem[], originalMessage: string): ParseOrderResponse {
  const data = raw as Partial<ParseOrderResponse>;
  const intent = typeof data.intent === "string" && isValidIntent(data.intent) ? data.intent : "unknown";
  if (isAmbiguousGenericSandwich(originalMessage)) {
    return {
      intent: "unknown",
      actions: [],
      assistantMessage: "Which sandwich would you like: Spicy Chicken Sandwich, Classic Chicken Sandwich, or Beef Sandwich?",
      source: "openrouter"
    };
  }

  const actions = Array.isArray(data.actions) ? validateCartActions(data.actions as any, cart) : [];
  let assistantMessage =
    typeof data.assistantMessage === "string" && data.assistantMessage.trim().length > 0
      ? data.assistantMessage.trim()
      : actions.length
        ? "Updated your cart."
        : "I need a little more detail before I can update your cart.";

  if (actions.length === 0) {
    const fallback = parseWithFallback(originalMessage, cart);
    assistantMessage = fallback.assistantMessage;
  }

  return { intent: actions.length ? intent : "unknown", actions, assistantMessage, source: "openrouter" };
}

export async function parseOrderIntent(message: string, cart: CartItem[] = []): Promise<ParseOrderResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "openrouter/free";

  if (!apiKey) {
    console.log("OpenRouter key not found. Using fallback parser.");
    return parseWithFallback(message, cart);
  }

  const systemPrompt = `You are the ordering intelligence for a mobile restaurant app called BistroBot.
Convert the user's natural language request into structured JSON cart actions.
Only use item IDs from the provided menu. Do not invent items.
Supported action types:
- add: {"type":"add","itemId":"...","quantity":number}
- remove: {"type":"remove","itemId":"..."}
- update_quantity: {"type":"update_quantity","itemId":"...","quantity":number}
- replace_item: {"type":"replace_item","fromItemId":"...","toItemId":"...","quantity":number}
- clear_cart: {"type":"clear_cart"}
If the request is ambiguous, such as “add sandwich”, return no actions and ask which sandwich type.
If the user asks to remove or change an item that is not in the current cart, return no actions and explain that the item is not currently in the cart.
Return JSON only. No markdown. No explanation.
The JSON must match this shape:
{"intent":"add_items|remove_items|update_quantity|replace_item|clear_cart|show_cart|unknown","actions":[],"assistantMessage":"short user-friendly sentence"}`;

  const userPayload = {
    userMessage: message,
    currentCart: cart,
    menu: menuItems.map(({ id, name, category, aliases }) => ({ id, name, category, aliases }))
  };

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:8081",
        "X-Title": process.env.OPENROUTER_APP_NAME || "Intelligent Bistro"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(userPayload) }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("OpenRouter request failed:", response.status, errorBody);
      return parseWithFallback(message, cart);
    }

    const json = (await response.json()) as any;
    const content = json?.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("OpenRouter returned no text content");

    return normalizeModelResponse(extractJson(content), cart, message);
  } catch (error) {
    console.error("OpenRouter parser error:", error);
    return parseWithFallback(message, cart);
  }
}
