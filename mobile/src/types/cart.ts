import { MenuItem } from "./menu";

export interface CartLine {
  itemId: string;
  quantity: number;
  options?: Record<string, string>;
}

export interface CartDisplayItem extends CartLine {
  menuItem: MenuItem;
}

export type CartAction =
  | { type: "add"; itemId: string; quantity: number; options?: Record<string, string> }
  | { type: "remove"; itemId: string }
  | { type: "update_quantity"; itemId: string; quantity: number }
  | { type: "replace_item"; fromItemId: string; toItemId: string; quantity?: number }
  | { type: "clear_cart" };
