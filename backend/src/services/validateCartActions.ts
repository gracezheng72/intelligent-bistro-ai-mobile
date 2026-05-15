import { CartAction, CartItem } from "../types/cart.js";
import { findMenuItemById } from "./menuService.js";

function inCart(cart: CartItem[], itemId: string): boolean {
  return cart.some((item) => item.itemId === itemId && item.quantity > 0);
}

export function validateCartActions(actions: CartAction[], cart: CartItem[] = []): CartAction[] {
  const safe: CartAction[] = [];

  for (const action of actions) {
    if (action.type === "clear_cart") {
      safe.push(action);
      continue;
    }

    if (action.type === "add") {
      if (!findMenuItemById(action.itemId)) continue;
      const quantity = Math.max(1, Math.min(20, Number(action.quantity) || 1));
      safe.push({ ...action, quantity });
      continue;
    }

    if (action.type === "remove") {
      if (findMenuItemById(action.itemId) && inCart(cart, action.itemId)) safe.push(action);
      continue;
    }

    if (action.type === "update_quantity") {
      if (!findMenuItemById(action.itemId) || !inCart(cart, action.itemId)) continue;
      const quantity = Math.max(0, Math.min(20, Number(action.quantity) || 0));
      safe.push({ ...action, quantity });
      continue;
    }

    if (action.type === "replace_item") {
      if (findMenuItemById(action.fromItemId) && findMenuItemById(action.toItemId) && inCart(cart, action.fromItemId)) {
        safe.push(action);
      }
    }
  }

  return safe;
}
