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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
    
    // Debug logging
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
        router.replace("/");
      }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header with pink background and title*/}
            <View style={styles.header}> 
                <Typography style={styles.headerTitle}>Order Confirmed</Typography>
            </View>

            {/* Content of the page*/}
            <View style={styles.content}>
                <View style={styles.paymentCard}>
                    <View style={styles.paymentLeft}>
                        <MaterialCommunityIcons
                        name="credit-card-outline"
                        size={28}
                        color="#DE5B8E"
                        />
                        <Typography style={styles.paymentText}>Payment</Typography>
                    </View>

                    <View style={styles.checkCircle}>
                        <Ionicons name="checkmark" size={24} color="#fff" />
                    </View>
                </View>

                <View style={styles.sectionTitleRow}>
                    <View style={styles.pinkBar} />
                    <Typography style={styles.sectionTitle}>Order Summary</Typography>
                </View>

                <View style={styles.summaryBox}>
                    <Typography style={styles.pickupLabel}> Pick-Up Time</Typography>
                    <Typography style={styles.pickupTime}>{slotTime}</Typography>

                    <View style={styles.shopRow}>
                        <Ionicons name="storefront-outline" size={20} color="#DE5B8E" />
                        <Typography style={styles.shopName}>{shopName}</Typography>
                    </View> 

                    <View style={styles.itemCard}>
                        <Image 
                            source={{ uri: foodItem?.image_url || `https://loremflickr.com/320/240/food?random=${foodItem?.id}` }} 
                            style={styles.itemImage} 
                        />
                        <View style={styles.itemInfo}>
                            <Typography style={styles.itemName}>{foodItem?.name}</Typography>
                            <Typography style={styles.itemSub}>ไม่มีเพิ่มเติม</Typography>
                        </View>
                        <Typography style={styles.itemPrice}>{foodItem ? `฿${foodItem.price}` : ""}</Typography>

                        <View style={styles.divider} />
                    </View>

                    <View style={styles.totalCard}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalText}>Subtotal</Text>
                            <Text style={styles.totalValue}>30</Text>
                        </View>

                        <View style={styles.totalRow}>
                            <Text style={styles.totalText}>Discount</Text>
                            <Text style={styles.discountValue}>0</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.totalRow}>
                            <Text style={styles.totalFinalText}>Total</Text>
                            <Text style={styles.totalFinalValue}>30</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.bottomBar}>
                <Pressable style={styles.homeButton} onPress={returnHome}>
                    <Typography style={styles.homeButtonText}>Back to Home</Typography>
                </Pressable>
            </View>


        </View>)
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "white" },
    header: {
        height: 138,
        backgroundColor: "#DE5B8E",
        borderBottomLeftRadius: 26,
        borderBottomRightRadius: 26,
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
        fontSize: 28,
        fontWeight: "800",
        color: "#F4F4F4",
    },

    content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 26,
  },

  paymentCard: {
    backgroundColor: "#EDEDED",
    borderRadius: 14,
    minHeight: 82,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  paymentText: {
    fontSize: 24,
    fontWeight: "500",
    color: "#4A4A4A",
    marginLeft: 10,
  },

  checkCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#72D97B",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 14,
  },

  pinkBar: {
    width: 6,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#DE5B8E",
    marginRight: 14,
  },

  sectionTitle: {
    fontSize: 28,
    fontWeight: "500",
    color: "#4A4A4A",
  },

  summaryBox: {
    borderRadius: 14,
    padding: 12,
    backgroundColor: "#EDEDED",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  pickupLabel: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },

  pickupTime: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "600",
    color: "#E95D91",
    marginTop: 4,
    marginBottom: 16,
  },

  shopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  shopName: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "800",
    color: "#4A4A4A",
  },

   bottomBar: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 18,
    backgroundColor: "#F5F5F5",
  },

  homeButton: {
    backgroundColor: "#DE5B8E",
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  homeButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },

  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  itemImage: {
    width: 82,
    height: 82,
    borderRadius: 12,
    marginRight: 12,
  },

  itemInfo: {
    flex: 1,
    justifyContent: "center",
  },

  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  itemImage: {
    width: 82,
    height: 82,
    borderRadius: 12,
    marginRight: 12,
  },

  itemInfo: {
    flex: 1,
    justifyContent: "center",
  },

  itemName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4A4A4A",
    marginBottom: 4,
  },

  itemSub: {
    fontSize: 14,
    color: "#A0A0A0",
    fontWeight: "500",
  },

  itemPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: "#DE5B8E",
    marginLeft: 10,
  },

  divider: {
    height: 1,
    backgroundColor: "#D9D9D9",
    marginVertical: 2,
  },

  totalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },

  totalText: {
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
  },

  totalValue: {
    fontSize: 16,
    color: "#111",
    fontWeight: "500",
  },

  discountValue: {
    fontSize: 16,
    color: "#1DBA45",
    fontWeight: "500",
  },

  totalFinalText: {
    fontSize: 17,
    color: "#111",
    fontWeight: "500",
  },

  totalFinalValue: {
    fontSize: 17,
    color: "#111",
    fontWeight: "500",
  },
});