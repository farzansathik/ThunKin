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
} from "react-native";
import { supabase } from "../lib/supabase";
import Typography from "@/components/typography";
import MenuSelectCard, { MenuItem } from "@/components/user_components/MenuSelectCard";

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
  // const handleBack = () => {
  //   router.push({
  //     pathname: "/timeslot",
  //     params: { shopId, shopName } // Passing params back to ensure timeslot can reload
  //   });
  // };

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
    <MenuSelectCard item={item} onPress={handleMenuSelect} />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Banner */}
      <View style={styles.topBanner}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800' }} 
          style={styles.bannerImage} 
        />

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Content Card with Rounded Top */}
      <View style={styles.contentCard}>
        <View style={styles.shopTitleRow}>
          <View style={styles.pinkIndicator} />
          <Typography weight="bold" size={29} style={styles.shopName} numberOfLines={1}>
            {shopName}
          </Typography>
        </View>
        <View style={styles.divider} />

        <Typography weight="bold" size={24} style={styles.sectionTitle}>
          For You
        </Typography>

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
  backButton: { position: 'absolute', top: 50, left: 20 , elevation: 5, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 30, padding: 6 },
  
  contentCard: { 
    flex: 1, 
    marginTop: -50, 
    backgroundColor: "white", 
    borderTopLeftRadius: 35, 
    borderTopRightRadius: 35, 
    paddingHorizontal: 21, 
    paddingTop: 15 
  },

  pinkIndicator: { 
    width: 5.5, 
    height: 33, 
    backgroundColor: "#E95D91", 
    borderRadius: 12, 
    marginRight: 15 
  },

  shopTitleRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center",   
    marginBottom: 16,
    left: -7
  },

  shopName: { 
    color: "#454545",
  },

  divider: {
    bottom: 6,
    height: 2,
    backgroundColor: "#D4D4D4",
    marginBottom: 10,
    marginHorizontal: -21,
  },

  sectionTitle: { color: "#454545", marginBottom: 15 },
  row: { justifyContent: "space-between" },
});