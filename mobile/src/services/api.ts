import { Platform } from "react-native";
import Constants from "expo-constants";
import { CartLine } from "../types/cart";
import { MenuItem } from "../types/menu";
import { ParseOrderResponse } from "../types/ai";

function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_BASE_URL || Constants.expoConfig?.extra?.apiBaseUrl;
  if (configured && typeof configured === "string" && configured.length > 0) return configured;

  if (Platform.OS === "web") return "http://localhost:4000";

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:4000`;
  }

  return "http://localhost:4000";
}

const API_BASE_URL = getApiBaseUrl();

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchMenu(): Promise<MenuItem[]> {
  const data = await request<{ items: MenuItem[] }>("/api/menu");
  return data.items;
}

export async function parseOrder(message: string, cart: CartLine[]): Promise<ParseOrderResponse> {
  return request<ParseOrderResponse>("/api/ai/parse-order", {
    method: "POST",
    body: JSON.stringify({ message, cart })
  });
}

export { API_BASE_URL };
