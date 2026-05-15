import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { fetchMenu, parseOrder, API_BASE_URL } from "./src/services/api";
import { fallbackMenu } from "./src/data/fallbackMenu";
import { useCartStore } from "./src/store/cartStore";
import { MenuCategory, MenuItem } from "./src/types/menu";

const heroImage = "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80";
const categories: Array<MenuCategory | "All"> = ["All", "Chicken", "Beef", "Drinks"];

type Screen = "home" | "menu" | "cart" | "assistant";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

function money(value: number) {
  return `$${value.toFixed(2)}`;
}


function FoodImage({ uri, fallbackUris = [], style, label }: { uri: string; fallbackUris?: string[]; style: any; label: string }) {
  const candidates = useMemo(() => [uri, ...fallbackUris].filter(Boolean), [uri, fallbackUris]);
  const [index, setIndex] = useState(0);
  const currentUri = candidates[index];

  useEffect(() => {
    setIndex(0);
  }, [uri]);

  if (!currentUri) {
    return (
      <View style={[style, styles.foodImageFallback]}>
        <Ionicons name="fast-food" size={28} color="#777" />
        <Text style={styles.foodImageFallbackText} numberOfLines={2}>{label}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: currentUri }}
      style={style}
      resizeMode="cover"
      onError={() => {
        if (index < candidates.length - 1) setIndex(index + 1);
      }}
    />
  );
}

function ChatButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.floatingChat} onPress={onPress}>
      <Ionicons name="chatbubble-ellipses" size={30} color="#fff" />
    </Pressable>
  );
}

function Header({ title, onBack, onCart, cartCount }: { title: string; onBack?: () => void; onCart?: () => void; cartCount?: number }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.headerIcon}>
        {onBack ? <Ionicons name="arrow-back" size={30} color="#111" /> : <Ionicons name="menu" size={30} color="#111" />}
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <Pressable onPress={onCart} style={styles.headerIcon}>
        <Ionicons name="cart-outline" size={30} color="#111" />
        {!!cartCount && cartCount > 0 && <Text style={styles.cartBadge}>{cartCount}</Text>}
      </Pressable>
    </View>
  );
}

function HomeScreen({ go }: { go: (screen: Screen) => void }) {
  const itemCount = useCartStore((state) => state.getItemCount());
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
        <ImageBackground source={{ uri: heroImage }} style={styles.hero} imageStyle={styles.heroImage}>
          <View style={styles.heroTopRow}>
            <Pressable style={styles.circleButton}>
              <Ionicons name="arrow-back" size={26} color="#111" />
            </Pressable>
            <View style={styles.heroActions}>
              <Pressable style={styles.circleButton}><Ionicons name="heart-outline" size={25} color="#111" /></Pressable>
              <Pressable style={styles.circleButton}><Ionicons name="share-outline" size={25} color="#111" /></Pressable>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.restaurantCard}>
          <View style={styles.logoCircle}><Text style={styles.logoText}>B</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.restaurantName}>BistroBot</Text>
            <Text style={styles.mutedText}>Fast food · AI ordering · Mobile demo</Text>
          </View>
        </View>

        <View style={styles.modeCard}>
          <View style={styles.modePillActive}><Text style={styles.modePillActiveText}>Delivery</Text></View>
          <View style={styles.modePill}><Text style={styles.modePillText}>Pickup</Text></View>
          <View style={styles.modePill}><Text style={styles.modePillText}>AI Order</Text></View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoBox}><Text style={styles.infoValue}>Quick</Text><Text style={styles.infoLabel}>ordering flow</Text></View>
          <View style={styles.infoBox}><Text style={styles.infoValue}>JSON</Text><Text style={styles.infoLabel}>cart actions</Text></View>
        </View>

        <Text style={styles.sectionTitle}>Deals & benefits</Text>
        <View style={styles.dealCard}>
          <Ionicons name="pricetag" size={30} color="#e21b13" />
          <View style={{ flex: 1 }}>
            <Text style={styles.dealTitle}>AI-powered ordering</Text>
            <Text style={styles.dealSubtitle}>Try: “Add two spicy chicken sandwiches and a Coke.”</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#777" />
        </View>

        <Text style={styles.sectionTitle}>What can we help you find?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {categories.map((category, index) => (
            <Pressable key={category} style={[styles.categoryChip, index === 0 && styles.categoryChipActive]} onPress={() => go("menu")}>
              <Text style={[styles.categoryChipText, index === 0 && styles.categoryChipActiveText]}>{category}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Pressable style={styles.primaryButton} onPress={() => go("menu")}>
          <Text style={styles.primaryButtonText}>Browse Menu</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => go("assistant")}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#111" />
          <Text style={styles.secondaryButtonText}>Ask AI Assistant</Text>
        </Pressable>

        <View style={{ height: 120 }} />
      </ScrollView>
      <ChatButton onPress={() => go("assistant")} />
      {itemCount > 0 && <BottomCartBar go={go} />}
    </SafeAreaView>
  );
}

function MenuRow({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  return (
    <View style={styles.menuRow}>
      <FoodImage uri={item.imageUrl} fallbackUris={item.imageFallbackUrls} label={item.name} style={styles.menuImage} />
      <View style={styles.menuInfo}>
        <Text style={styles.menuItemTitle}>{item.name}</Text>
        <Text style={styles.menuDescription}>{item.description}</Text>
        <Text style={styles.menuPrice}>{money(item.price)}</Text>
      </View>
      <Pressable style={styles.addCircle} onPress={onAdd}>
        <Ionicons name="add" size={26} color="#111" />
      </Pressable>
    </View>
  );
}

function MenuScreen({ menu, go }: { menu: MenuItem[]; go: (screen: Screen) => void }) {
  const [selected, setSelected] = useState<MenuCategory | "All">("All");
  const [query, setQuery] = useState("");
  const addItem = useCartStore((state) => state.addItem);
  const itemCount = useCartStore((state) => state.getItemCount());

  const filtered = useMemo(() => {
    return menu.filter((item) => {
      const matchCategory = selected === "All" || item.category === selected;
      const q = query.trim().toLowerCase();
      const matchQuery = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [menu, selected, query]);

  const grouped = useMemo(() => {
    const groups: Record<string, MenuItem[]> = {};
    for (const item of filtered) {
      groups[item.category] = groups[item.category] ?? [];
      groups[item.category].push(item);
    }
    return groups;
  }, [filtered]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Menu" onBack={() => go("home")} onCart={() => go("cart")} cartCount={itemCount} />
      <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={24} color="#111" />
          <TextInput
            placeholder="Search menu items"
            placeholderTextColor="#777"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRowSmall}>
          {categories.map((category) => (
            <Pressable key={category} style={[styles.categoryChip, selected === category && styles.categoryChipActive]} onPress={() => setSelected(category)}>
              <Text style={[styles.categoryChipText, selected === category && styles.categoryChipActiveText]}>{category}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {Object.entries(grouped).map(([category, items]) => (
          <View key={category} style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{category}</Text>
            {items.map((item) => (
              <MenuRow key={item.id} item={item} onAdd={() => addItem(item.id, 1)} />
            ))}
          </View>
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyBox}>
            <Ionicons name="fast-food-outline" size={52} color="#aaa" />
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptyText}>Try searching for chicken, beef, Coke, Sprite, or juice.</Text>
          </View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
      <ChatButton onPress={() => go("assistant")} />
      {itemCount > 0 && <BottomCartBar go={go} />}
    </SafeAreaView>
  );
}

function BottomCartBar({ go }: { go: (screen: Screen) => void }) {
  const itemCount = useCartStore((state) => state.getItemCount());
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal(fallbackMenu));
  return (
    <Pressable style={styles.bottomCart} onPress={() => go("cart")}>
      <View style={styles.bottomCartBadge}><Text style={styles.bottomCartBadgeText}>{itemCount}</Text></View>
      <Text style={styles.bottomCartText}>View Cart</Text>
      <Text style={styles.bottomCartTotal}>{money(subtotal)}</Text>
    </Pressable>
  );
}

function CartScreen({ menu, go }: { menu: MenuItem[]; go: (screen: Screen) => void }) {
  const { items, removeItem, updateQuantity, clearCart, addItem } = useCartStore();
  const subtotal = useCartStore((state) => state.getSubtotal(menu));
  const suggestions = menu.filter((item) => !items.some((line) => line.itemId === item.id)).slice(0, 5);
  const displayItems = items.map((line) => ({ ...line, menuItem: menu.find((item) => item.id === line.itemId) })).filter((item) => item.menuItem) as Array<{ itemId: string; quantity: number; menuItem: MenuItem }>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.cartHeader}>
        <Pressable onPress={() => go("menu")}><Ionicons name="close" size={42} color="#111" /></Pressable>
        <Text style={styles.cartTitle}>Cart</Text>
        <Pressable onPress={clearCart}><Text style={styles.clearText}>Clear</Text></Pressable>
      </View>
      <ScrollView style={styles.screenLight} showsVerticalScrollIndicator={false}>
        <View style={styles.cartRestaurantCard}>
          <View style={styles.cartRestaurantTop}>
            <View>
              <Text style={styles.cartRestaurantName}>BistroBot</Text>
              <Text style={styles.cartSubText}>AI-powered quick order</Text>
              <Text style={styles.cartSubText}>{money(subtotal)} Subtotal</Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 10 }}>
              <Pressable style={styles.addItemsPill} onPress={() => go("menu")}><Text style={styles.addItemsPillText}>Add items</Text></Pressable>
              <Pressable style={styles.cartAiPill} onPress={() => go("assistant")}>
                <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
                <Text style={styles.cartAiPillText}>AI</Text>
              </Pressable>
            </View>
          </View>

          {displayItems.length === 0 ? (
            <View style={styles.emptyCartBox}>
              <Ionicons name="cart-outline" size={56} color="#bbb" />
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
              <Text style={styles.emptyText}>Add items manually or ask the AI assistant to build your order.</Text>
              <Pressable style={styles.blackButton} onPress={() => go("assistant")}>
                <Ionicons name="chatbubble-ellipses" size={22} color="#fff" />
                <Text style={styles.blackButtonText}>Ask AI Assistant</Text>
              </Pressable>
            </View>
          ) : (
            displayItems.map(({ itemId, quantity, menuItem }) => (
              <View key={itemId} style={styles.cartLine}>
                <FoodImage uri={menuItem.imageUrl} fallbackUris={menuItem.imageFallbackUrls} label={menuItem.name} style={styles.cartLineImage} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.cartLineTitle}>{menuItem.name}</Text>
                  <Text style={styles.cartLinePrice}>{money(menuItem.price)}</Text>
                </View>
                <View style={styles.quantityControl}>
                  <Pressable onPress={() => removeItem(itemId)}><Ionicons name="trash-outline" size={21} color="#111" /></Pressable>
                  <Pressable onPress={() => updateQuantity(itemId, quantity - 1)}><Ionicons name="remove" size={22} color="#111" /></Pressable>
                  <Text style={styles.quantityText}>{quantity}</Text>
                  <Pressable onPress={() => updateQuantity(itemId, quantity + 1)}><Ionicons name="add" size={24} color="#111" /></Pressable>
                </View>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>Complement your cart</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionRow}>
          {suggestions.map((item) => (
            <View key={item.id} style={styles.suggestionCard}>
              <FoodImage uri={item.imageUrl} fallbackUris={item.imageFallbackUrls} label={item.name} style={styles.suggestionImage} />
              <Pressable style={styles.suggestionAdd} onPress={() => addItem(item.id, 1)}>
                <Ionicons name="add" size={24} color="#111" />
              </Pressable>
              <Text style={styles.suggestionTitle} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.suggestionPrice}>{money(item.price)}</Text>
              <Text style={styles.likeText}>👍 {item.category === "Drinks" ? "90%" : "81%"}</Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.deliveryTitle}>Order summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryLine}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>{money(subtotal)}</Text></View>
          <View style={styles.summaryLine}><Text style={styles.summaryLabel}>Estimated tax</Text><Text style={styles.summaryValue}>{money(subtotal * 0.09)}</Text></View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryLine}><Text style={styles.summaryTotalLabel}>Total</Text><Text style={styles.summaryTotalValue}>{money(subtotal * 1.09)}</Text></View>
        </View>
        <View style={{ height: 110 }} />
      </ScrollView>
      <ChatButton onPress={() => go("assistant")} />
      <Pressable style={styles.continueButton} onPress={() => Alert.alert("Demo order", "Checkout is mocked for this challenge demo.")}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function AssistantScreen({ go }: { go: (screen: Screen) => void }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I can update your cart from normal sentences. Try: Add two spicy chicken sandwiches and a Coke."
    }
  ]);
  const items = useCartStore((state) => state.items);
  const applyActions = useCartStore((state) => state.applyActions);

  const sendMessage = async (text = input) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { id: `${Date.now()}-user`, role: "user", text: trimmed }]);
    setLoading(true);
    try {
      const result = await parseOrder(trimmed, items);
      applyActions(result.actions);
      setMessages((prev) => [...prev, { id: `${Date.now()}-assistant`, role: "assistant", text: result.assistantMessage }]);
    } catch (error) {
      setMessages((prev) => [...prev, { id: `${Date.now()}-assistant`, role: "assistant", text: "I had trouble reaching the ordering service. Please check that the Node backend is running." }]);
    } finally {
      setLoading(false);
    }
  };

  const prompts = [
    "Add two spicy chicken sandwiches and a Coke",
    "Remove the Coke",
    "Set chicken nuggets to 2",
    "Change spicy chicken sandwich to classic chicken sandwich",
    "Clear my cart"
  ];

  return (
    <SafeAreaView style={styles.safeAreaWarm}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.assistantHeader}>
          <Pressable onPress={() => go("home")}><Ionicons name="close" size={38} color="#111" /></Pressable>
          <View style={styles.assistantTitleWrap}>
            <Text style={styles.assistantTitle}>AI Assistant</Text>
            <Text style={styles.assistantSubtitle}>Natural language → cart JSON actions</Text>
          </View>
          <Pressable onPress={() => go("cart")}><Ionicons name="cart-outline" size={30} color="#111" /></Pressable>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatList}
          renderItem={({ item }) => (
            <View style={[styles.chatBubble, item.role === "user" ? styles.userBubble : styles.assistantBubble]}>
              <Text style={[styles.chatText, item.role === "user" && styles.userChatText]}>{item.text}</Text>
            </View>
          )}
          ListFooterComponent={loading ? <ActivityIndicator size="large" color="#e21b13" style={{ margin: 20 }} /> : null}
        />

        <View style={styles.promptPanel}>
          <Text style={styles.promptLabel}>Quick demo prompts</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {prompts.map((prompt) => (
              <Pressable key={prompt} style={styles.promptChip} onPress={() => sendMessage(prompt)}>
                <Text style={styles.promptChipText}>{prompt}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputBar}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask AI to update your cart..."
            placeholderTextColor="#777"
            style={styles.assistantInput}
            multiline
          />
          <Pressable style={styles.sendButton} onPress={() => sendMessage()}>
            <Ionicons name="send" size={22} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [menu, setMenu] = useState<MenuItem[]>(fallbackMenu);

  useEffect(() => {
    fetchMenu()
      .then(setMenu)
      .catch((error) => console.log("Using local fallback menu. Backend menu fetch failed:", error.message));
  }, []);

  return (
    <>
      <ExpoStatusBar style="dark" />
      <StatusBar barStyle="dark-content" />
      {screen === "home" && <HomeScreen go={setScreen} />}
      {screen === "menu" && <MenuScreen menu={menu} go={setScreen} />}
      {screen === "cart" && <CartScreen menu={menu} go={setScreen} />}
      {screen === "assistant" && <AssistantScreen go={setScreen} />}
    </>
  );
}

const RED = "#e21b13";
const BLACK = "#111111";
const GRAY = "#6f6f6f";
const BG = "#f4f4f4";
const WARM = "#fff7e8";

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  foodImageFallback: { backgroundColor: "#f7f7f7", alignItems: "center", justifyContent: "center", padding: 8 },
  foodImageFallbackText: { marginTop: 6, color: "#777", fontSize: 12, fontWeight: "800", textAlign: "center" },

  safeAreaWarm: { flex: 1, backgroundColor: WARM },
  screen: { flex: 1, backgroundColor: "#fff" },
  screenLight: { flex: 1, backgroundColor: BG },
  hero: { height: 300, justifyContent: "space-between" },
  heroImage: { borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  heroTopRow: { paddingTop: 18, paddingHorizontal: 20, flexDirection: "row", justifyContent: "space-between" },
  heroActions: { flexDirection: "row", gap: 12 },
  circleButton: { width: 54, height: 54, borderRadius: 27, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 12, elevation: 5 },
  restaurantCard: { marginTop: -36, marginHorizontal: 22, borderRadius: 24, backgroundColor: "#fff", padding: 18, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 20, elevation: 4 },
  logoCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: RED, alignItems: "center", justifyContent: "center", marginRight: 14 },
  logoText: { color: "#ffd400", fontSize: 42, fontWeight: "900" },
  restaurantName: { fontSize: 34, fontWeight: "900", color: BLACK },
  mutedText: { fontSize: 15, fontWeight: "600", color: GRAY, marginTop: 4 },
  modeCard: { marginTop: 22, marginHorizontal: 22, backgroundColor: "#fff", borderRadius: 24, padding: 10, flexDirection: "row", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 18, elevation: 2 },
  modePillActive: { flex: 1, backgroundColor: BLACK, paddingVertical: 14, borderRadius: 20, alignItems: "center" },
  modePillActiveText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  modePill: { flex: 1, paddingVertical: 14, alignItems: "center" },
  modePillText: { color: GRAY, fontWeight: "900", fontSize: 16 },
  infoRow: { flexDirection: "row", gap: 14, paddingHorizontal: 22, marginTop: 16 },
  infoBox: { flex: 1, backgroundColor: "#fff", borderRadius: 22, borderWidth: 1, borderColor: "#eee", padding: 18 },
  infoValue: { fontSize: 22, fontWeight: "900", color: BLACK },
  infoLabel: { marginTop: 4, fontSize: 14, color: GRAY, fontWeight: "700" },
  sectionTitle: { fontSize: 32, fontWeight: "900", color: BLACK, marginTop: 26, marginHorizontal: 24, marginBottom: 14 },
  dealCard: { marginHorizontal: 22, backgroundColor: "#fff", borderRadius: 22, borderWidth: 1, borderColor: "#eee", padding: 18, flexDirection: "row", alignItems: "center", gap: 14 },
  dealTitle: { fontSize: 18, fontWeight: "900", color: RED },
  dealSubtitle: { fontSize: 14, color: GRAY, fontWeight: "600", marginTop: 2 },
  chipRow: { paddingHorizontal: 22, gap: 10, paddingBottom: 4 },
  chipRowSmall: { paddingHorizontal: 22, gap: 10, paddingVertical: 12 },
  categoryChip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 22, backgroundColor: "#f0f0f0" },
  categoryChipActive: { backgroundColor: BLACK },
  categoryChipText: { fontSize: 16, fontWeight: "900", color: BLACK },
  categoryChipActiveText: { color: "#fff" },
  primaryButton: { marginTop: 24, marginHorizontal: 22, borderRadius: 30, backgroundColor: RED, paddingVertical: 20, alignItems: "center" },
  primaryButtonText: { color: "#fff", fontSize: 22, fontWeight: "900" },
  secondaryButton: { marginTop: 12, marginHorizontal: 22, borderRadius: 30, backgroundColor: "#f2f2f2", paddingVertical: 18, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10 },
  secondaryButtonText: { color: BLACK, fontSize: 18, fontWeight: "900" },
  floatingChat: { position: "absolute", right: 22, bottom: 95, width: 70, height: 70, borderRadius: 35, backgroundColor: BLACK, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 18, elevation: 10 },
  header: { height: 82, backgroundColor: "#fff", paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#eee" },
  headerIcon: { width: 54, height: 54, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 32, fontWeight: "900", color: BLACK },
  cartBadge: { position: "absolute", top: 6, right: 6, backgroundColor: RED, color: "#fff", fontSize: 11, fontWeight: "900", borderRadius: 8, overflow: "hidden", minWidth: 16, textAlign: "center" },
  searchBox: { marginHorizontal: 22, marginTop: 18, borderRadius: 24, backgroundColor: "#f4f4f4", paddingHorizontal: 18, paddingVertical: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  searchInput: { flex: 1, fontSize: 18, fontWeight: "700", color: BLACK },
  menuSection: { marginTop: 10 },
  menuSectionTitle: { fontSize: 36, fontWeight: "900", color: BLACK, marginHorizontal: 24, marginTop: 18, marginBottom: 4 },
  menuRow: { minHeight: 150, flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: "#e8e8e8", backgroundColor: "#fff" },
  menuImage: { width: 110, height: 100, borderRadius: 18, backgroundColor: "#f6f6f6", marginRight: 18 },
  menuInfo: { flex: 1, paddingRight: 10 },
  menuItemTitle: { fontSize: 22, fontWeight: "900", color: BLACK, marginBottom: 6 },
  menuDescription: { fontSize: 15, color: GRAY, fontWeight: "600", lineHeight: 20 },
  menuPrice: { fontSize: 19, color: BLACK, fontWeight: "800", marginTop: 8 },
  addCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.14, shadowRadius: 14, elevation: 5, borderWidth: 1, borderColor: "#f0f0f0" },
  bottomCart: { position: "absolute", bottom: 20, left: 20, right: 20, backgroundColor: BLACK, borderRadius: 30, paddingVertical: 16, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.24, shadowRadius: 16, elevation: 10 },
  bottomCartBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: RED, alignItems: "center", justifyContent: "center", marginRight: 12 },
  bottomCartBadgeText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  bottomCartText: { color: "#fff", fontWeight: "900", fontSize: 18, flex: 1 },
  bottomCartTotal: { color: "#fff", fontWeight: "900", fontSize: 18 },
  emptyBox: { alignItems: "center", padding: 40 },
  emptyTitle: { marginTop: 14, fontSize: 26, fontWeight: "900", color: BLACK, textAlign: "center" },
  emptyText: { marginTop: 10, fontSize: 17, fontWeight: "700", color: GRAY, textAlign: "center", lineHeight: 24 },
  cartHeader: { height: 88, backgroundColor: "#fff", paddingHorizontal: 22, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cartTitle: { fontSize: 34, fontWeight: "900", color: BLACK },
  clearText: { color: RED, fontSize: 18, fontWeight: "900" },
  cartRestaurantCard: { margin: 20, borderRadius: 28, backgroundColor: "#fff", borderWidth: 1, borderColor: "#dedede", padding: 18 },
  cartRestaurantTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 },
  cartRestaurantName: { fontSize: 28, fontWeight: "900", color: BLACK },
  cartSubText: { fontSize: 17, color: GRAY, fontWeight: "800", marginTop: 4 },
  addItemsPill: { backgroundColor: "#f1f1f1", borderRadius: 24, paddingHorizontal: 22, paddingVertical: 12 },
  addItemsPillText: { fontSize: 17, fontWeight: "900", color: BLACK },
  cartAiPill: { backgroundColor: BLACK, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 9, flexDirection: "row", alignItems: "center", gap: 6 },
  cartAiPillText: { color: "#fff", fontSize: 15, fontWeight: "900" },
  emptyCartBox: { alignItems: "center", paddingVertical: 28 },
  blackButton: { marginTop: 22, backgroundColor: BLACK, borderRadius: 26, paddingVertical: 16, paddingHorizontal: 28, flexDirection: "row", alignItems: "center", gap: 10 },
  blackButtonText: { color: "#fff", fontSize: 18, fontWeight: "900" },
  cartLine: { flexDirection: "row", alignItems: "center", paddingVertical: 16 },
  cartLineImage: { width: 82, height: 72, borderRadius: 16, backgroundColor: "#f3f3f3", marginRight: 14 },
  cartLineTitle: { fontSize: 20, fontWeight: "900", color: BLACK },
  cartLinePrice: { fontSize: 18, color: GRAY, fontWeight: "800", marginTop: 4 },
  quantityControl: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "#dedede", borderRadius: 24, paddingHorizontal: 10, paddingVertical: 10 },
  quantityText: { fontSize: 20, fontWeight: "900", color: BLACK },
  suggestionRow: { paddingHorizontal: 20, gap: 14 },
  suggestionCard: { width: 152, backgroundColor: "#fff", borderRadius: 20, paddingBottom: 12, borderWidth: 1, borderColor: "#e2e2e2" },
  suggestionImage: { width: "100%", height: 130, borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: "#f5f5f5" },
  suggestionAdd: { position: "absolute", right: 10, top: 92, width: 48, height: 48, borderRadius: 24, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.14, shadowRadius: 14, elevation: 5 },
  suggestionTitle: { marginTop: 14, marginHorizontal: 10, fontSize: 18, fontWeight: "900", color: BLACK },
  suggestionPrice: { marginHorizontal: 10, marginTop: 4, fontSize: 17, color: GRAY, fontWeight: "800" },
  likeText: { marginHorizontal: 10, marginTop: 8, fontSize: 16, color: GRAY, fontWeight: "900" },
  deliveryTitle: { marginHorizontal: 24, marginTop: 28, fontSize: 32, fontWeight: "900", color: BLACK },
  summaryCard: { margin: 20, backgroundColor: "#fff", borderRadius: 24, padding: 18, gap: 12 },
  summaryLine: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 17, color: GRAY, fontWeight: "800" },
  summaryValue: { fontSize: 17, color: BLACK, fontWeight: "900" },
  summaryDivider: { height: 1, backgroundColor: "#eee" },
  summaryTotalLabel: { fontSize: 22, color: BLACK, fontWeight: "900" },
  summaryTotalValue: { fontSize: 22, color: BLACK, fontWeight: "900" },
  continueButton: { position: "absolute", left: 22, right: 22, bottom: 22, backgroundColor: RED, borderRadius: 30, paddingVertical: 20, alignItems: "center" },
  continueButtonText: { color: "#fff", fontSize: 24, fontWeight: "900" },
  assistantHeader: { paddingHorizontal: 20, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: WARM },
  assistantTitleWrap: { alignItems: "center" },
  assistantTitle: { fontSize: 30, fontWeight: "900", color: BLACK },
  assistantSubtitle: { fontSize: 12, color: GRAY, fontWeight: "800", marginTop: 2 },
  chatList: { padding: 20, paddingBottom: 24 },
  chatBubble: { maxWidth: "86%", borderRadius: 24, padding: 18, marginBottom: 14 },
  assistantBubble: { alignSelf: "flex-start", backgroundColor: "#fff", borderWidth: 1, borderColor: "#f0d9b2" },
  userBubble: { alignSelf: "flex-end", backgroundColor: RED },
  chatText: { color: BLACK, fontSize: 18, fontWeight: "800", lineHeight: 26 },
  userChatText: { color: "#fff" },
  promptPanel: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: WARM },
  promptLabel: { color: "#87745e", textTransform: "uppercase", fontSize: 13, fontWeight: "900", letterSpacing: 1.4, marginBottom: 8 },
  promptChip: { backgroundColor: "#fff", borderRadius: 22, borderWidth: 1, borderColor: "#f0d9b2", paddingVertical: 10, paddingHorizontal: 16, marginRight: 10 },
  promptChipText: { color: BLACK, fontSize: 15, fontWeight: "900" },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 10, padding: 14, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#eee" },
  assistantInput: { flex: 1, minHeight: 48, maxHeight: 100, backgroundColor: "#f5f5f5", borderRadius: 24, paddingHorizontal: 18, paddingVertical: 13, fontSize: 17, fontWeight: "700", color: BLACK },
  sendButton: { width: 52, height: 52, borderRadius: 26, backgroundColor: RED, alignItems: "center", justifyContent: "center" }
});
