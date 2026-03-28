import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  StatusBar,
  Image,
  TouchableOpacity,
  Modal,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import Typography from "@/components/typography";

interface MenuItem {
  id: string;
  rest_id: string;
  name: string;
  price: number;
  image_url?: string;
}

export default function StatusScreen() {
  const router = useRouter();
  const { foodId, foodName, shopId, shopName, slotTime, orderId, orderItemId } = useLocalSearchParams();

  const [foodItem, setFoodItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const tickAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchFood = async () => {
      if (!foodId) return;
      const { data, error } = await supabase
        .from("menu")
        .select("*")
        .eq("id", foodId)
        .single();
      if (error) { console.log(error); return; }
      setFoodItem(data as MenuItem | null);
      setLoading(false);
    };
    fetchFood();
  }, [foodId]);

  const playSuccessAnimation = () => {
    // Reset
    scaleAnim.setValue(0);
    opacityAnim.setValue(0);
    tickAnim.setValue(0);

    // Card pop in
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Tick draw after card appears
      Animated.timing(tickAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
  };

    const handleConfirm = async () => {
    try {
        console.log("orderId:", orderId);
        console.log("orderItemId:", orderItemId);

        // Update orders table
        if (orderId) {
        const { error: orderError } = await supabase
            .from("orders")
            .update({ status: "picked_up" })
            .eq("id", Number(orderId)); 

        if (orderError) console.error("Order update error:", orderError);
        else console.log("Order updated ✓");
        } else {
        console.warn("orderId is missing!");
        }

        // Update order_items table
        if (orderItemId) {
        const { error: itemError } = await supabase
            .from("order_items")
            .update({ status: "picked_up" })
            .eq("id", Number(orderItemId)); 

        if (itemError) console.error("Order item update error:", itemError);
        else console.log("Order item updated ✓");
        } else {
        console.warn("orderItemId is missing!");
        }

        setShowSuccess(true);
        playSuccessAnimation();
        
        // navigate after 2 sec
        setTimeout(() => {
        setShowSuccess(false);
        router.replace("/reserve");
        }, 2000);

    } catch (err) {
        console.error("Confirm pick-up error:", err);
    }
    };

  const displayName = foodItem?.name ?? (Array.isArray(foodName) ? foodName[0] : foodName) ?? "N/A";
  const displayShop = Array.isArray(shopName) ? shopName[0] : shopName ?? "N/A";
  const displaySlot = "1A"; 

  const tickScale = tickAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1.2, 1],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Typography size={28} weight="bold" style={styles.headerTitle}>Status</Typography>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.pinkBar} />
          <Typography size={28} weight="bold" style={styles.sectionTitle}>Pick-Up QR</Typography>
        </View>

        <View style={styles.qrCard}>
          <View style={styles.cardTopRow}>
            <View style={styles.cardTopLeft}>
              <Typography size={24} weight="bold" style={styles.foodName}>{displayName}</Typography>
              <Typography size={16} style={styles.shopNameText}>{displayShop}</Typography>
            </View>
            <Typography size={34} weight="bold" style={styles.slotNumber}>{displaySlot}</Typography>
          </View>
          <View style={styles.divider} />
          <View style={styles.qrWrapper}>
            <Image
              source={require("../assets/images/Thunkin_images/UserSide_img/Rickrolling_QR_code.png")}
              style={styles.qrImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.confirmButton} onPress={handleConfirm}>
          <Typography size={26} weight="bold" style={styles.confirmButtonText}>
            Confirm Pick-Up
          </Typography>
        </Pressable>
      </View>

      {/* Success Modal */}
      <Modal transparent visible={showSuccess} animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.successCard,
              { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
            ]}
          >
            {/* Tick circle */}
            <Animated.View
              style={[styles.tickCircle, { transform: [{ scale: tickScale }] }]}
            >
              <Ionicons name="checkmark" size={52} color="#fff" />
            </Animated.View>

            <Typography size={22} weight="bold" style={styles.successTitle}>
              Pick-Up Confirmed!
            </Typography>
            <Typography size={15} style={styles.successSub}>
              Enjoy your meal
            </Typography>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },

  header: {
    height: 115,
    backgroundColor: "#E95D91",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: 20,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  backButton: { marginRight: 12, paddingBottom: 2 },
  headerTitle: { color: "#ffffff" },

  content: { paddingHorizontal: 22, paddingTop: 22 },

  sectionTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  pinkBar: { width: 5, height: 32, borderRadius: 6, backgroundColor: "#E95D91", marginRight: 14 },
  sectionTitle: { color: "#454545" },

  qrCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 18,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  cardTopLeft: { flex: 1, marginRight: 12 },
  foodName: { color: "#2D2D2D" },
  shopNameText: { color: "#A0A0A0" },
  slotNumber: { color: "#E95D91" },
  divider: { height: 2, backgroundColor: "#e2e2e2b6" },
  qrWrapper: { alignItems: "center", justifyContent: "center" },
  qrImage: { width: "100%", height: 350, borderRadius: 8 },

  bottomBar: { paddingHorizontal: 10, top: 20, backgroundColor: "#F5F5F5" },
  confirmButton: {
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
    elevation: 5,
  },
  confirmButtonText: { color: "#fff" },

  // ── Success Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  successCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 48,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  tickCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E95D91",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#E95D91",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  successTitle: { color: "#2D2D2D" },
  successSub: { color: "#999999" },
});