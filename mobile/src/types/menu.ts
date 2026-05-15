export type MenuCategory = "Chicken" | "Beef" | "Drinks";

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  description: string;
  imageUrl: string;
  imageFallbackUrls?: string[];
  aliases: string[];
}
