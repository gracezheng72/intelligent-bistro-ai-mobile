import { create } from "zustand";
import { CartAction, CartLine } from "../types/cart";
import { MenuItem } from "../types/menu";

interface CartState {
  items: CartLine[];
  addItem: (itemId: string, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyActions: (actions: CartAction[]) => void;
  getSubtotal: (menu: MenuItem[]) => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (itemId, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((item) => item.itemId === itemId);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.itemId === itemId ? { ...item, quantity: item.quantity + quantity } : item
          )
        };
      }
      return { items: [...state.items, { itemId, quantity }] };
    });
  },
  removeItem: (itemId) => set((state) => ({ items: state.items.filter((item) => item.itemId !== itemId) })),
  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) => (item.itemId === itemId ? { ...item, quantity } : item))
    }));
  },
  clearCart: () => set({ items: [] }),
  applyActions: (actions) => {
    for (const action of actions) {
      if (action.type === "add") get().addItem(action.itemId, action.quantity);
      if (action.type === "remove") get().removeItem(action.itemId);
      if (action.type === "update_quantity") get().updateQuantity(action.itemId, action.quantity);
      if (action.type === "clear_cart") get().clearCart();
      if (action.type === "replace_item") {
        const existing = get().items.find((item) => item.itemId === action.fromItemId);
        const quantity = action.quantity ?? existing?.quantity ?? 1;
        get().removeItem(action.fromItemId);
        get().addItem(action.toItemId, quantity);
      }
    }
  },
  getSubtotal: (menu) => {
    return get().items.reduce((sum, line) => {
      const menuItem = menu.find((item) => item.id === line.itemId);
      return sum + (menuItem?.price ?? 0) * line.quantity;
    }, 0);
  },
  getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0)
}));
