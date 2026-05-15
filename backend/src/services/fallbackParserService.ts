import { menuItems } from "../data/menu.js";
import { CartAction, CartItem } from "../types/cart.js";
import { ParseOrderResponse } from "../types/ai.js";
import { parseQuantityFromPrefix } from "../utils/numberWords.js";
import { validateCartActions } from "./validateCartActions.js";

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function getDisplayName(itemId: string): string {
  return menuItems.find((item) => item.id === itemId)?.name ?? itemId;
}

function cartHas(cart: CartItem[], itemId: string): boolean {
  return cart.some((item) => item.itemId === itemId && item.quantity > 0);
}

function allAliases() {
  return menuItems
    .flatMap((item) => item.aliases.map((alias) => ({ itemId: item.id, alias: normalize(alias) })))
    .sort((a, b) => b.alias.length - a.alias.length);
}

function findMentionedItems(text: string): Array<{ itemId: string; quantity: number }> {
  let remaining = ` ${normalize(text)} `;
  const found: Array<{ itemId: string; quantity: number }> = [];

  for (const { itemId, alias } of allAliases()) {
    const index = remaining.indexOf(` ${alias} `);
    if (index === -1) continue;

    const before = remaining.slice(Math.max(0, index - 35), index);
    const quantity = parseQuantityFromPrefix(before);
    found.push({ itemId, quantity });

    remaining = remaining.replace(` ${alias} `, " ");
  }

  const unique = new Map<string, number>();
  for (const item of found) {
    unique.set(item.itemId, (unique.get(item.itemId) ?? 0) + item.quantity);
  }
  return Array.from(unique.entries()).map(([itemId, quantity]) => ({ itemId, quantity }));
}

function isGenericSandwichRequest(text: string): boolean {
  const clean = normalize(text);
  return /\bsandwich(es)?\b/.test(clean) && !/\b(spicy|classic|non spicy|regular|beef|chicken)\b/.test(clean);
}

function buildNoActionMessage(message: string, cart: CartItem[]): string {
  const clean = normalize(message);
  const mentioned = findMentionedItems(message);

  if (isGenericSandwichRequest(message)) {
    return "Which sandwich would you like: Spicy Chicken Sandwich, Classic Chicken Sandwich, or Beef Sandwich?";
  }

  if (/\b(remove|delete|cancel|take off)\b/.test(clean) && mentioned.length > 0) {
    const missing = mentioned.filter((item) => !cartHas(cart, item.itemId)).map((item) => getDisplayName(item.itemId));
    if (missing.length > 0) {
      return `${missing.join(", ")} ${missing.length === 1 ? "is" : "are"} not currently in your cart, so I didn't remove anything.`;
    }
  }

  if (/\b(set|make|change|update)\b/.test(clean) && mentioned.length > 0) {
    const missing = mentioned.filter((item) => !cartHas(cart, item.itemId)).map((item) => getDisplayName(item.itemId));
    if (missing.length > 0) {
      return `${missing.join(", ")} ${missing.length === 1 ? "is" : "are"} not currently in your cart. Add it first, then I can change the quantity.`;
    }
  }

  return "I need a little more detail. Try saying the exact item, like “Add two spicy chicken sandwiches” or “Remove Coke.”";
}

function buildMessage(actions: CartAction[], originalMessage: string, cart: CartItem[]): string {
  if (actions.length === 0) return buildNoActionMessage(originalMessage, cart);
  if (actions.some((a) => a.type === "clear_cart")) return "Cleared your cart.";

  const parts = actions.map((action) => {
    if (action.type === "add") return `added ${action.quantity} ${getDisplayName(action.itemId)}`;
    if (action.type === "remove") return `removed ${getDisplayName(action.itemId)}`;
    if (action.type === "update_quantity") return `set ${getDisplayName(action.itemId)} to ${action.quantity}`;
    if (action.type === "replace_item") return `changed ${getDisplayName(action.fromItemId)} to ${getDisplayName(action.toItemId)}`;
    return "updated your cart";
  });
  return `I ${parts.join(", ")}.`;
}

function detectReplace(text: string): CartAction[] {
  const clean = normalize(text);
  if (!/(change|replace|swap)/.test(clean) || !/\b(to|with|for)\b/.test(clean)) return [];

  const [left, right] = clean.split(/\b(?:to|with|for)\b/, 2);
  const from = findMentionedItems(left)[0];
  const to = findMentionedItems(right)[0];
  if (!from || !to || from.itemId === to.itemId) return [];
  return [{ type: "replace_item", fromItemId: from.itemId, toItemId: to.itemId, quantity: from.quantity }];
}

export function parseWithFallback(message: string, cart: CartItem[] = []): ParseOrderResponse {
  const text = normalize(message);
  let intent: ParseOrderResponse["intent"] = "unknown";
  let actions: CartAction[] = [];

  if (isGenericSandwichRequest(message)) {
    return { intent: "unknown", actions: [], assistantMessage: buildNoActionMessage(message, cart), source: "fallback" };
  }

  if (/\b(clear|empty|reset)\b/.test(text) && /\bcart\b/.test(text)) {
    intent = "clear_cart";
    actions = [{ type: "clear_cart" }];
  } else {
    const replaceActions = detectReplace(text);
    if (replaceActions.length) {
      intent = "replace_item";
      actions = replaceActions;
    } else {
      const items = findMentionedItems(text);
      if (/\b(remove|delete|cancel|take off)\b/.test(text)) {
        intent = "remove_items";
        actions = items.map((item) => ({ type: "remove", itemId: item.itemId }));
      } else if (/\b(set|make|change|update)\b/.test(text) && /\b(to|quantity)\b/.test(text)) {
        intent = "update_quantity";
        actions = items.map((item) => ({ type: "update_quantity", itemId: item.itemId, quantity: item.quantity }));
      } else if (/\b(add|order|get|want|need|put)\b/.test(text) || items.length) {
        intent = "add_items";
        actions = items.map((item) => ({ type: "add", itemId: item.itemId, quantity: item.quantity }));
      }
    }
  }

  actions = validateCartActions(actions, cart);
  return {
    intent: actions.length ? intent : "unknown",
    actions,
    assistantMessage: buildMessage(actions, message, cart),
    source: "fallback"
  };
}
