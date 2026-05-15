import { CartAction, CartItem } from "./cart.js";

export interface ParseOrderRequest {
  message: string;
  cart?: CartItem[];
}

export interface ParseOrderResponse {
  intent: "add_items" | "remove_items" | "update_quantity" | "replace_item" | "clear_cart" | "show_cart" | "unknown";
  actions: CartAction[];
  assistantMessage: string;
  source: "openrouter" | "fallback";
}
