import { MenuItem } from "../types/menu.js";

export const menuItems: MenuItem[] = [
  {
    id: "spicy_chicken_sandwich",
    name: "Spicy Chicken Sandwich",
    category: "Chicken",
    price: 6.99,
    description: "Crispy chicken, spicy sauce, pickles, toasted bun.",
    imageUrl: "https://loremflickr.com/700/500/spicy,chicken,sandwich/all",
    imageFallbackUrls: [
      "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=700",
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80"
    ],
    aliases: ["spicy chicken sandwich", "spicy chicken", "spicy sandwich"]
  },
  {
    id: "classic_chicken_sandwich",
    name: "Classic Chicken Sandwich",
    category: "Chicken",
    price: 6.49,
    description: "Crispy chicken, mayo, lettuce, pickles, toasted bun.",
    imageUrl: "https://loremflickr.com/700/500/chicken,sandwich/all",
    imageFallbackUrls: [
      "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=700",
      "https://images.unsplash.com/photo-1606755962773-d324e2d533e1?auto=format&fit=crop&w=700&q=80"
    ],
    aliases: ["classic chicken sandwich", "non spicy chicken sandwich", "regular chicken sandwich", "classic chicken"]
  },
  {
    id: "beef_sandwich",
    name: "Beef Sandwich",
    category: "Beef",
    price: 7.49,
    description: "Juicy beef patty, cheese, lettuce, and house sauce.",
    imageUrl: "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=700",
    imageFallbackUrls: [
      "https://loremflickr.com/700/500/beef,burger/all",
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=80"
    ],
    aliases: ["beef sandwich", "beef burger", "burger", "cheeseburger"]
  },
  {
    id: "chicken_nuggets",
    name: "Chicken Nuggets",
    category: "Chicken",
    price: 5.99,
    description: "Golden crispy nuggets with a creamy dipping sauce.",
    imageUrl: "https://loremflickr.com/700/500/chicken,nuggets/all",
    imageFallbackUrls: [
      "https://images.pexels.com/photos/6941023/pexels-photo-6941023.jpeg?auto=compress&cs=tinysrgb&w=700",
      "https://images.unsplash.com/photo-1562967916-eb82221dfb36?auto=format&fit=crop&w=700&q=80"
    ],
    aliases: ["chicken nuggets", "nuggets", "nugget"]
  },
  {
    id: "chicken_strips",
    name: "Chicken Strips",
    category: "Chicken",
    price: 7.99,
    description: "Tender breaded chicken strips with a crunchy coating.",
    imageUrl: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=700&q=80",
    imageFallbackUrls: ["https://loremflickr.com/700/500/chicken,tenders/all"],
    aliases: ["chicken strips", "strips", "chicken tenders", "tenders"]
  },
  {
    id: "water",
    name: "Water",
    category: "Drinks",
    price: 1.49,
    description: "Cold bottled water.",
    imageUrl: "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=700&q=80",
    imageFallbackUrls: ["https://loremflickr.com/700/500/bottled,water/all"],
    aliases: ["water", "bottled water", "large water"]
  },
  {
    id: "coke",
    name: "Coke",
    category: "Drinks",
    price: 2.49,
    description: "Classic chilled cola.",
    imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=700&q=80",
    imageFallbackUrls: ["https://loremflickr.com/700/500/cola,drink/all"],
    aliases: ["coke", "cola", "coca cola", "soda", "code"]
  },
  {
    id: "sprite",
    name: "Sprite",
    category: "Drinks",
    price: 2.49,
    description: "Crisp lemon-lime soda.",
    imageUrl: "https://loremflickr.com/700/500/lemon,lime,soda/all",
    imageFallbackUrls: ["https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=700&q=80"],
    aliases: ["sprite", "lemon lime soda", "lemon-lime soda"]
  },
  {
    id: "apple_juice",
    name: "Apple Juice",
    category: "Drinks",
    price: 2.99,
    description: "Refreshing apple juice.",
    imageUrl: "https://loremflickr.com/700/500/apple,juice/all",
    imageFallbackUrls: ["https://images.unsplash.com/photo-1576673442511-7e39b6545c87?auto=format&fit=crop&w=700&q=80"],
    aliases: ["apple juice", "apple drink"]
  },
  {
    id: "orange_juice",
    name: "Orange Juice",
    category: "Drinks",
    price: 2.99,
    description: "Bright citrus orange juice.",
    imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=700&q=80",
    imageFallbackUrls: ["https://loremflickr.com/700/500/orange,juice/all"],
    aliases: ["orange juice", "orange drink", "oj"]
  }
];
