import React, { useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import Typography from "@/components/typography";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { toJpegUrl } from "@/utils/imageUtils";

interface MenuItem {
  id: string;
  rest_id: string;
  name: string;
  price: number;
  image_url?: string;
}

interface OrderCardProps {
  foodItem: MenuItem | null;
}

export default function OrderCard({ foodItem }: OrderCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <View style={styles.itemCard}>
        {foodItem?.image_url && !imgError ? (
          <Image
            source={{ uri: toJpegUrl(foodItem.image_url) ?? undefined }}
            style={styles.itemImage}
            onError={() => setImgError(true)}
          />
        ) : (
        <View style={[styles.itemImage, styles.fallbackImage]}>
          <Ionicons
              name="fast-food"
              size={45}
              color="#77777733"
            />
        </View>
        )}
          
      <View style={styles.itemInfo}>
        <Typography size={20} weight="bold" style={styles.itemName}>{foodItem?.name}</Typography>
        <Typography size={12} style={styles.itemSub}>ไม่มีเพิ่มเติม</Typography>
      </View>
      <Typography fontType={1} weight="bold" size={20} style={styles.itemPrice}>
        {foodItem ? `฿ ${foodItem.price}` : ""}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#E8E8E8",
    elevation: 2,
  },

  itemImage: {
    width: 75,
    height: 75,
    borderRadius: 12,
    marginRight: 12,
  },

  fallbackImage: {
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },

  itemInfo: {
    flex: 1,
    justifyContent: "center",
  },

  itemName: {
    color: "#4A4A4A",
  },

  itemSub: {
    color: "#A0A0A0",
  },

  itemPrice: {
    color: "#DE5B8E",
    marginLeft: 10,
  },
});
