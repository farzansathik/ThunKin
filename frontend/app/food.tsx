import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import Typography from "@/components/typography";
import { toJpegUrl } from "@/utils/imageUtils";
import { useUser } from "../context/UserContext";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image_url?: string;
}

export default function FoodScreen() {
  const router = useRouter();
  const { userId } = useUser();
  const { foodId, foodName, shopId, shopName, slotTime } = useLocalSearchParams();
  const [foodItem, setFoodItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFoodName, setSelectedFoodName] = useState<string>("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [nextPageParams, setNextPageParams] = useState<any>(null);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log("FoodScreen params:", { foodId, foodName, shopId, shopName, slotTime });

    const fetchFood = async () => {
      if (!foodId) return;

      const { data, error } = await supabase
        .from("menu")
        .select("*")
        .eq("id", foodId)
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
    } else if (foodItem?.name) {
      setSelectedFoodName(foodItem.name);
    }
  }, [foodName, foodItem]);

  useEffect(() => {
    if (showSuccessPopup) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 12,
          bounciness: 8,
        }),
      ]).start();

      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
        if (nextPageParams) {
          router.push({
            pathname: "/status",
            params: nextPageParams,
          });
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);

  const logStatusChange = async (orderItemId: number, fromStatus: string | null, toStatus: string) => {
  const { error } = await supabase
    .from("order_items_logs")
    .insert({
      order_item_id: orderItemId,
      from_status: fromStatus,
      to_status: toStatus,
    });

    if (error) console.error("Log insert failed:", error);
  };

  const placeOrder = async () => {
    if (!foodItem) {
      Alert.alert("Error", "Food item not loaded yet.");
      return;
    }

    if (!userId) {
      Alert.alert("Error", "User not found. Please log in again.");
      return;
    }

    try {
      setIsPlacingOrder(true);

      const slotString = String(slotTime);
      const startTime = slotString.split(" - ")[0].trim();
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const pickUpDateTime = `${year}-${month}-${day}T${startTime}:00`;

      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "create_order_if_slot_available",
        {
          p_rest_id:      Number(shopId),
          p_pick_up_time: pickUpDateTime,
          p_user_id:      userId,
          p_menu_id:      Number(foodId),
          p_price:        foodItem.price,
        }
      );

      if (rpcError) {
        console.error("RPC failed:", rpcError);
        Alert.alert("Error", "Failed to place order. Please try again.");
        return;
      }

      if (!rpcData.success) {
        Alert.alert(
          "Time Slot Full",
          "Someone just took the last spot in this time slot. Please go back and choose another."
        );
        return;
      }

      const orderData     = { id: rpcData.order_id };
      const orderItemData = { id: rpcData.order_item_id };

      // Step 3 — Log the first status: null → "pending"
      await logStatusChange(orderItemData.id, null, "pending");

      console.log("Order placed:", orderData);
      console.log("Order item:", orderItemData);

      // Show success popup and navigate after 2 seconds
      const params = {
        foodId,
        foodName: selectedFoodName,
        shopId,
        shopName,
        slotTime,
        orderId: orderData.id,
        orderItemId: orderItemData.id,
      };

      setNextPageParams(params);
      setShowSuccessPopup(true);

    } catch (err) {
      console.error("Unexpected error:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };


// **หลักการทำงานน่าจะประมาณนี้**

// User places order   → null        to "pending"   (order history show in Ongoing)   (logged in food.tsx now)
// Vendor sees order   → "pending"   to "ready"     (order history show in Ready)   (logged in vendor screen later)
// User picks up       → "ready"     to "picked_up" (order history show in Date)  (logged in status screen later)

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.content}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.topBanner}>
            {foodItem?.image_url && !imgError ? (
              <Image
                source={{ uri: toJpegUrl(foodItem.image_url) ?? undefined }}
                style={styles.bannerImage}
                onError={() => setImgError(true)}
              />
            ) : (
              <View style={[styles.bannerImage, styles.fallbackBanner]}>
                <Ionicons name="fast-food" size={215} style={{ top: 30, left: 70 }} color="#ffffff33" />
              </View>
            )}

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

        <Pressable
          style={[styles.orderButton, isPlacingOrder && { opacity: 0.6 }]}
          onPress={placeOrder}
          disabled={isPlacingOrder}
        >
          <Typography size={26} weight="bold" style={styles.orderButtonText}>
            {isPlacingOrder ? "Placing Order..." : "Place Order"}
          </Typography>
        </Pressable>
      </View>

      {/* Success Popup Modal */}
      <Modal
        visible={showSuccessPopup}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.popupOverlay}>
          <Animated.View
            style={[
              styles.successPopup,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <View style={styles.checkmarkCircle}>
                <Ionicons name="checkmark" size={60} color="#fff" />
              </View>
            </Animated.View>
            <Typography size={24} weight="bold" style={styles.successText}>
              Successfully Ordered!
            </Typography>
            <Typography fontType={2} size={14} style={styles.successSubtext}>
              {selectedFoodName} from {shopName}
            </Typography>
          </Animated.View>
        </View>
      </Modal>
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
  fallbackBanner: { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  backButton: { position: "absolute", top: 50, left: 20, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 30, padding: 6 },

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

  /* Success Popup */
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  successPopup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },

  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E95D91",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  successText: {
    color: "#2D2D2D",
    marginBottom: 8,
    textAlign: "center",
  },

  successSubtext: {
    color: "#999",
    textAlign: "center",
  },
});