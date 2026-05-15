import { CartAction, CartLine } from "./cart";

export interface ParseOrderResponse {
  intent: string;
  actions: CartAction[];
  assistantMessage: string;
  source?: "openrouter" | "fallback";
}

export interface ParseOrderRequest {
  message: string;
  cart: CartLine[];
}
