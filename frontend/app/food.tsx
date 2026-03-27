import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import Typography from "@/components/typography";

const BASE_PRICE = 40; // Keep as fallback

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image_url?: string;
}

export default function FoodScreen() {
  const router = useRouter();
  const { filterFood, foodId, foodName, shopId, shopName, slotTime } = useLocalSearchParams();
  
  // Debug logging
  console.log("FoodScreen params:", { filterFood, foodId, foodName, shopId, shopName, slotTime });
  
  const [foodItem, setFoodItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFoodName, setSelectedFoodName] = useState<string>("");

  useEffect(() => {
    const fetchFood = async () => {
      if (!foodId) return;

      const { data, error } = await supabase
        .from('menu')
        .select('*')
        .eq('id', foodId)
        .single();

      if (error) {
        console.log(error);
        return;
      }

      setFoodItem(data as MenuItem | null);
      setLoading(false);
    };

    fetchFood();
  }, [foodId]);

  useEffect(() => {
    if (foodName) {
      setSelectedFoodName(String(foodName));
    } else if (filterFood) {
      setSelectedFoodName(String(filterFood));
    } else if (foodItem?.name) {
      setSelectedFoodName(foodItem.name);
    }
  }, [foodName, filterFood, foodItem]);

  // Updated Navigation Handler
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/menu");
    }
  };

  const placeOrder = () => {
    console.log("Order placed for:", selectedFoodName);
    console.log("Sending to status:", {foodId, foodName: selectedFoodName, shopId, shopName, slotTime});

    router.push({
      pathname: "/status",
      params: {foodId, foodName: selectedFoodName, shopId, shopName, slotTime}
    });
  };

  return (
  <View style={styles.container}>
    <StatusBar barStyle="light-content" />

    <View style={styles.content}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topBanner}>
          <Image
            source={{
              uri:
                foodItem?.image_url ||
                `https://loremflickr.com/320/240/food?random=${foodItem?.id}`,
            }}
            style={styles.bannerImage}
          />

          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.productHeader}>
          <View>
            <Typography weight="bold" size={24} style={styles.title}>
              {selectedFoodName || foodItem?.name}
            </Typography>
          </View>

          <Typography weight="bold" size={28} style={styles.price}>
            ฿{foodItem?.price || BASE_PRICE}
          </Typography>
        </View>

        <SectionTitle title="Add-ons" />
        <OptionRow label="Extra Sticky Rice" price="+฿10" checked={false} />
        <OptionRow label="Extra Chicken (1 piece)" price="+฿15" checked={false} />

        <SectionTitle title="Sauce" />
        <OptionRow label="Sweet Chili Sauce" price="Free" checked={false} />

        <SectionTitle title="To-go Box" />
        <OptionRow label="Standard Box" price="+฿5" checked={false} />
      </ScrollView>
    </View>

    <View style={styles.bottomBar}>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalPrice}>{foodItem?.price} Baht</Text>
      </View>

      <Pressable style={styles.orderButton} onPress={placeOrder}>
        <Text style={styles.orderButtonText}>Place Order</Text>
      </Pressable>
    </View>
  </View>
);}

function SectionTitle({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );
}

function OptionRow({ label, price, checked }: { label: string; price: string; checked: boolean }) {
  return (
    <View style={styles.optionRow}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Ionicons name="checkmark" size={16} color="#222" />}
      </View>

      <Text style={styles.optionText}>
        {label} — {price}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: "white" },
  screen: {
    flex: 1,
    backgroundColor: "#1F1F1F",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },

  content: {
    flex:1,
  },

  scrollContent: {
    paddingBottom: 12,
},

  imageWrapper: {
    position: "relative",
  },

  foodImage: {
    width: "100%",
    height: 230,
  },

  topBanner: { height: 220, backgroundColor: "#333" },
  bannerImage: { width: "100%", height: "100%", opacity: 0.8 },
  backButton: { 
    position: "absolute", 
    top: 55, // Adjusted to match header alignment
    left: 20, 
    padding: 8 
  },

  productHeader: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  title: {
    color: "#444",
    bottom: -3
  },

  price: {
    fontSize: 28,
    fontWeight: "800",
    color: "#E95D91",
    bottom: 2
  },

  sectionHeader: {
    backgroundColor: "#DDDDDD",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111",
  },

  optionRow: {
    minHeight: 58,
    backgroundColor: "#F7F7F7",
    borderBottomWidth: 1,
    borderBottomColor: "#D0D0D0",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  checkbox: {
    width: 18,
    height: 18,
    backgroundColor: "#D9D9D9",
    marginRight: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxChecked: {
    backgroundColor: "#ECECEC",
  },

  optionText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },

  bottomBar: {
    backgroundColor: "#F7F7F7",
    paddingTop: 8,
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: "#F7F7F7",
  },

  totalLabel: {
    fontSize: 18,
    fontWeight: "500",
    color: "#111",
    marginRight: 8,
  },

  totalPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#E15A8B",
  },

  orderButton: {
    marginHorizontal: 8,
    marginTop: 4,
    marginBottom: 12,
    backgroundColor: "#DD5C92",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  orderButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
  },
});