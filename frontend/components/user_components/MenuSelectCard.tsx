import { Image, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Typography from "../typography";

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
  return (
    <TouchableOpacity 
      style={styles.menuCard}
      onPress={() => onPress(item)}
    >
      <Image 
        source={{ uri: item.image_url || `https://loremflickr.com/320/240/food?random=${item.id}` }} 
        style={styles.foodImage} 
      />
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
  foodName: { marginTop: 8, color: "#000000" },
  foodPrice: { color: "#E95D91", bottom: 3 },
});
