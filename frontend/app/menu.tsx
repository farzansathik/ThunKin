import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from "react-native";
import { supabase } from "../lib/supabase";

const { width } = Dimensions.get("window");

interface MenuItem {
  id: string | number;
  name: string;
  price: number;
  image_url?: string;
}

export default function MenuScreen() {
  const router = useRouter();
  const { shopId, shopName, slotTime } = useLocalSearchParams();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedFoodName, setSelectedFoodName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMenu = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("menu")
      .select("*")
      .eq("rest_id", shopId);

    if (!error) setMenuItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMenu();
  }, [shopId]);

  // Updated Navigation Handler
  const handleBack = () => {
    router.push({
      pathname: "/timeslot",
      params: { shopId, shopName } // Passing params back to ensure timeslot can reload
    });
  };

  const handleMenuSelect = (item: MenuItem) => {
    console.log("Selected item:", item.name, item.id);
    console.log("Menu params received:", { shopId, shopName, slotTime });
    setSelectedFoodName(item.name);

    const params = {
      filterFood: item.name,
      foodId: item.id,
      foodName: item.name,
      shopId,
      shopName,
      slotTime,
    };
    console.log("Sending to food:", params);

    router.push({
      pathname: "/food",
      params,
    });
  };

  const renderItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity 
      style={styles.menuCard}
      onPress={() => handleMenuSelect(item)}
    >
      <Image 
        source={{ uri: item.image_url || `https://loremflickr.com/320/240/food?random=${item.id}` }} 
        style={styles.foodImage} 
      />
      <Text style={styles.foodName}>{item.name}</Text>
      <Text style={styles.foodPrice}>{item.price} Baht</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* 1. Header with Background Image */}
      <View style={styles.topBanner}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800' }} 
          style={styles.bannerImage} 
        />
        {/* Updated Button Style to match other pages */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* 2. Content Card with Rounded Top */}
      <View style={styles.contentCard}>
        <View style={styles.shopTitleRow}>
          <View style={styles.pinkIndicator} />
          <Text style={styles.shopName} numberOfLines={1}>{shopName || "Restaurant Name"}</Text>
        </View>

        <Text style={styles.sectionTitle}>For You</Text>

        {loading ? (
          <ActivityIndicator color="#E95D91" size="large" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={menuItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  topBanner: { height: 220, backgroundColor: "#333" },
  bannerImage: { width: "100%", height: "100%", opacity: 0.8 },
  backButton: { 
    position: "absolute", 
    top: 55, // Adjusted to match header alignment
    left: 20, 
    padding: 8 
  },
  contentCard: { 
    flex: 1, 
    marginTop: -40, 
    backgroundColor: "white", 
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40, 
    paddingHorizontal: 20, 
    paddingTop: 30 
  },
  shopTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 25 },
  pinkIndicator: { width: 4, height: 28, backgroundColor: "#E95D91", borderRadius: 2, marginRight: 12 },
  shopName: { fontSize: 26, fontWeight: "900", color: "#333", flex: 1 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 20 },
  row: { justifyContent: "space-between" },
  menuCard: { 
    width: (width - 55) / 2, 
    marginBottom: 20 
  },
  foodImage: { 
    width: "100%", 
    height: 160, 
    borderRadius: 20, // More rounded like the other cards
    backgroundColor: "#F5F5F5" 
  },
  foodName: { fontSize: 16, fontWeight: "800", marginTop: 8, color: "#333" },
  foodPrice: { fontSize: 14, color: "#E95D91", fontWeight: "700", marginTop: 2 }, // Made price pink for contrast
});