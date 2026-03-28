import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  StatusBar,
  Image,
  TouchableOpacity,
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
    const { foodId, foodName, shopId, shopName, slotTime } = useLocalSearchParams();

    const [foodItem, setFoodItem] = useState<MenuItem | null>(null);
    const [loading, setLoading] = useState(true);

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

    const returnHome = () => {
        router.replace("/reserve");
    };

    const handleConfirm = () => {
        // TODO: handle confirm pick-up logic (ยังไม่ได้ทำ ต้องทำให้เวลากดมี popup เเละส่งไปให้ vendor)
        router.replace("/reserve");
    };

    // Display name: prefer fetched foodItem, fallback to param
    const displayName = foodItem?.name ?? (Array.isArray(foodName) ? foodName[0] : foodName) ?? "ข้าวเหนียวหมูปลอม";
    const displayShop = Array.isArray(shopName) ? shopName[0] : shopName ?? "ร้านอีสานเก๊";
    const displaySlot = Array.isArray(slotTime) ? slotTime[0] : slotTime ?? "1A";

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

                {/* QR Card */}
                <View style={styles.qrCard}>
                    {/* Food name + slot number row */}
                    <View style={styles.cardTopRow}>
                        <View style={styles.cardTopLeft}>
                            <Typography size={24} weight="bold" style={styles.foodName}>
                                {displayName}
                            </Typography>
                            <Typography size={16} style={styles.shopNameText}>
                                {displayShop}
                            </Typography>
                        </View>
                        <Typography size={34} weight="bold" style={styles.slotNumber}>
                            {displaySlot}
                        </Typography>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* QR Code — fake image */}
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

    backButton: {
        marginRight: 12,
        paddingBottom: 2,
    },

    headerTitle: {
        color: "#ffffff",
    },

    content: {
        paddingHorizontal: 22,
        paddingTop: 22,
    },

    sectionTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },

    pinkBar: {
        width: 5,
        height: 32,
        borderRadius: 6,
        backgroundColor: "#E95D91",
        marginRight: 14,
    },

    sectionTitle: {
        color: "#454545",
    },

    // ── QR Card ──
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

    cardTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },

    cardTopLeft: {
        flex: 1,
        marginRight: 12,
    },

    foodName: {
        color: "#2D2D2D",
    },

    shopNameText: {
        color: "#A0A0A0",
    },

    slotNumber: {
        color: "#E95D91",
    },

    divider: {
        height: 2,
        backgroundColor: "#e2e2e2b6",
    },

    qrWrapper: {
        alignItems: "center",
        justifyContent: "center",
    },

    qrImage: {
        width: "100%",
        height: 350,
        borderRadius: 8,
    },

    // ── Bottom bar ──
    bottomBar: {
        paddingHorizontal: 10,
        top: 20,
        backgroundColor: "#F5F5F5",
    },

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

    confirmButtonText: {
        color: "#fff",
    },
});