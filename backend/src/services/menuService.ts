import { menuItems } from "../data/menu.js";

export function getMenuItems() {
  return menuItems;
}

export function findMenuItemById(itemId: string) {
  return menuItems.find((item) => item.id === itemId);
}
