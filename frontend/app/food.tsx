import React, { useState, useEffect } from "react";
import {
  View,
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


interface MenuItem {
  id: string;
  name: string;
  price: number;
  image_url?: string;
}

export default function FoodScreen() {
  const router = useRouter();
  const { filterFood, foodId, foodName, shopId, shopName, slotTime } = useLocalSearchParams();
  
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

  // const handleBack = () => {
  //   if (router.canGoBack()) {
  //     router.back();
  //   } else {
  //     router.replace("/menu");
  //   }
  // };

  const placeOrder = () => {
    console.log("Order placed for:", selectedFoodName);
    console.log("Sending to status:", { foodId, foodName: selectedFoodName, shopId, shopName, slotTime });

    router.push({
      pathname: "/status",
      params: { foodId, foodName: selectedFoodName, shopId, shopName, slotTime }
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

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color="white" />
            </TouchableOpacity>
          </View>

          {/* Product Header: name+subtitle left, price right */}
          <View style={styles.productHeader}>
            <View style={styles.productTitleBlock}>
              <Typography weight="bold" size={28} style={styles.foodName}>
                {selectedFoodName || foodItem?.name}
              </Typography>
              <Typography weight="medium" size={16} style={styles.shopSubtitle}>
                {shopName as string}
              </Typography>
            </View>
            <Typography weight="bold" size={30} style={styles.price}>
              ฿ {foodItem?.price}
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
          <Typography size={26} weight="medium" style={styles.totalLabel}>Total:</Typography>
          <Typography size={26} weight="bold" style={styles.totalPrice}>{foodItem?.price} Baht</Typography>
        </View>

        <Pressable style={styles.orderButton} onPress={placeOrder}>
          <Typography size={26} weight="bold" style={styles.orderButtonText}>Place Order</Typography>
        </Pressable>
      </View>
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Typography size={18} weight="medium" style={styles.sectionHeaderText}>
        {title}
      </Typography>
    </View>
  );
}

function OptionRow({ label, price, checked }: { label: string; price: string; checked: boolean }) {
  return (
    <View style={styles.optionRow}>
      <View style={styles.optionLeft}>
      <View style={styles.checkbox}>
        {checked && <Ionicons name="checkmark" size={16} color="#222" />}
      </View>
      <Typography size={16} style={styles.optionText}>
        {label}
      </Typography>
    </View>

      {/* Price on the right */}
      <Typography size={16} style={styles.optionPrice}>
        {price}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },

  content: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 12,
  },

  /* Banner */
  topBanner: { height: 200, backgroundColor: "#333" },
  bannerImage: { width: "100%", height: "100%", opacity: 0.8 },
  backButton: { position: 'absolute', top: 50, left: 20 , backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 30, padding: 6 },

  /* Product Header */
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEB",
  },

  productTitleBlock: {
    flex: 1,
    marginRight: 12,
  },

  foodName: {
    color: "#333",
  },
  shopSubtitle: {
    color: "#999",
    bottom: 2,
  },

  price: {
    color: "#E95D91",
  },

  sectionHeader: {
    backgroundColor: "#E4E4E4",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  sectionHeaderText: {
    color: "#000000",
  },

  optionRow: {
    minHeight: 60,
    backgroundColor: "#f7f7f79d",
    borderBottomWidth: 1,
    borderBottomColor: "#d0d0d065",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#CCC",
    backgroundColor: "#fff",
    marginRight: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  optionText: {
    flex: 1,
    color: "#333",
  },

  optionPrice: {
    color: "#888",
  },

  bottomBar: {
    backgroundColor: "#F7F7F7",
    paddingTop: 3,
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 18,
    backgroundColor: "#F7F7F7",
  },

  totalLabel: {
    color: "#111",
    marginRight: 8,
  },

  totalPrice: {
    color: "#E95D91",
  },

  orderButton: {
    marginHorizontal: 8,
    marginTop: 4,
    marginBottom: 12,
    backgroundColor: "#DF5789",
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
  },
});