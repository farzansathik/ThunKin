import { Image, View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import Typography from "../typography";
import { toJpegUrl } from "@/utils/imageUtils";

const { width } = Dimensions.get("window");

export interface MenuItem {
  id: string | number;
  name: string;
  price: number;
  image_url?: string;
}

interface MenuSelectCardProps {
  item: MenuItem;
  onPress: (item: MenuItem) => void;
}

export default function MenuSelectCard({ item, onPress }: MenuSelectCardProps) {
  const [imgError, setImgError] = useState(false);
  return (
    <TouchableOpacity 
      style={styles.menuCard}
      onPress={() => onPress(item)}
    >
      {item.image_url && !imgError ? (
        <Image
          source={{ uri: toJpegUrl(item.image_url) ?? undefined }}
          style={styles.foodImage}
          onError={() => setImgError(true)}
        />
      ) : (
        <View style={[styles.foodImage, styles.fallbackImage]}>
          <Ionicons name="fast-food-outline" size={40} color="#ccc" />
        </View>
      )}
      <Typography size={16} weight="semibold" style={styles.foodName}>{item.name}</Typography>
      <Typography size={16} style={styles.foodPrice}>{item.price} Baht</Typography>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuCard: { 
    width: (width - 55) / 2, 
    marginBottom: 20,
    flexDirection: "column",
  },
  foodImage: { 
    width: "100%", 
    height: (width - 55) / 2,
    borderRadius: 15, 
    backgroundColor: "#F5F5F5" 
  },
  fallbackImage: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
  foodName: { marginTop: 8, color: "#000000" },
  foodPrice: { color: "#E95D91", bottom: 3 },
});
