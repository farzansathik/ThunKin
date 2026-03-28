import React from "react";
import { View, Image, StyleSheet } from "react-native";
import Typography from "@/components/typography";

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
  return (
    <View style={styles.itemCard}>
      <Image
        source={{
          uri:
            foodItem?.image_url ||
            `https://loremflickr.com/320/240/food?random=${foodItem?.id}`,
        }}
        style={styles.itemImage}
      />
      <View style={styles.itemInfo}>
        <Typography size={21} weight="bold" style={styles.itemName}>{foodItem?.name}</Typography>
        <Typography size={13} style={styles.itemSub}>ไม่มีเพิ่มเติม</Typography>
      </View>
      <Typography fontType={1} weight="bold" size={24} style={styles.itemPrice}>
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
