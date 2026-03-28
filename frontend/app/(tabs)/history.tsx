import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from "../../lib/supabase";
import { useLocalSearchParams, useRouter } from "expo-router";
import Typography from "@/components/typography";
import OrderCard from "@/components/user_components/OrderCard";

interface MenuItem {
  id: string;
  rest_id: string;
  name: string;
  price: number;
  image_url?: string;
}

export default function HistoryScreen() {
    const router = useRouter();
    const { foodId, foodName, shopId, shopName, slotTime } = useLocalSearchParams();
    
    console.log("StatusScreen params:", { foodId, foodName, shopId, shopName, slotTime });
    
    const [foodItem, setFoodItem] = useState<MenuItem | null>(null);
    const [shopItem, setShopItem] = useState(null);
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
      }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header with pink background and title*/}
            <View style={styles.header}> 
                <Typography size={28} weight="bold" style={styles.headerTitle}>Order History</Typography>
            </View>

            {/* Content of the page*/}
            <View style={styles.content}>
                <View style={styles.sectionTitleRow}>
                    <View style={styles.pinkBar} />
                    <Typography size={28} weight="bold" style={styles.sectionTitle}>Recent Orders</Typography>
                </View>

                <View style={styles.summaryBox}>
                    <View style={styles.shopRow}>
                        <Ionicons name="storefront-outline" size={25} color="#DE5B8E" />
                        <Typography size={22} weight="bold" style={styles.shopName}>{shopName}</Typography>
                    </View> 

                    <OrderCard foodItem={foodItem} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "white" },

    header: {
        height: 115,
        backgroundColor: "#E95D91",
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 26,
        shadowColor: "#000",
        shadowOpacity: 0.16,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 5,
    },

    headerTitle: {
        color: "#ffffff",
    },

    content: {
        flex: 1,
        paddingHorizontal: 22,
        bottom: 10,
    },

    // ── Payment card  ──
    paymentCard: {
        backgroundColor: "#f0f0f063",
        borderRadius: 14,
        minHeight: 82,
        paddingHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1.5,
        borderColor: "#E0E0E0",
    },

    paymentLeft: {
        flexDirection: "row",
        alignItems: "center",
    },

    paymentText: {
        color: "#4A4A4A",
        marginLeft: 10,
    },

    checkCircle: {
        elevation: 5
    },

    sectionTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 24,
        marginBottom: 14,
    },

    pinkBar: {
        width: 6,
        height: 32,
        borderRadius: 4,
        backgroundColor: "#E95D91",
        marginRight: 14,
    },

    sectionTitle: {
        color: "#454545",
    },

    // ── Summary box ──
    summaryBox: {
        borderRadius: 14,
        padding: 12,
        backgroundColor: "#f0f0f063",
        borderWidth: 1.5,
        borderColor: "#E0E0E0",
    },

    pickupLabel: {
        color: "#2D2D2D",
        textAlign: "center",
        elevation: 5
    },

    pickupTime: {
        textAlign: "center",
        color: "#E95D91",
        marginTop: 2,
        marginBottom: 15,
        elevation: 5
    },

    shopRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },

    shopName: {
        marginLeft: 10,
        top: 2,
        color: "#454545",
        elevation: 5
    },

    bottomBar: {
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 18,
        backgroundColor: "#F5F5F5",
    },

    homeButton: {
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

    homeButtonText: {
        color: "#fff",
    },

    divider: {
        height: 1,
        backgroundColor: "#C3C3C3",
        marginVertical: 3,
    },

    // ── Total card: white fill, soft border ──
    totalCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginTop: 16,
        borderWidth: 1,
        borderColor: "#E8E8E8",
    },

    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 4,
    },

    totalValue: {
        color: "#111",
    },

    discountValue: {
        color: "#1DBA45",
    },

    totalFinalText: {
        color: "#111",
    },

    totalFinalValue: {
        color: "#111",
    },
});