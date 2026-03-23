import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator } from "react-native";
import { supabase } from "../lib/supabase";

export default function RestaurantScreen() {
  const router = useRouter();
  const { filterLocation } = useLocalSearchParams();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      const { data } = await supabase.from("restaurant").select("*").eq("location", filterLocation);
      setRestaurants(data || []);
      setLoading(false);
    };
    fetchRestaurants();
  }, [filterLocation]);

  return (
    <View style={styles.container}>
      <View style={styles.topBanner}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800' }} style={styles.bannerImage} />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <View style={styles.headerPillContainer}><View style={styles.headerPill}><Text style={styles.headerTitle}>{filterLocation}</Text></View></View>
      </View>

      <View style={styles.contentCard}>
        <Text style={styles.sectionTitle}>Select Restaurants</Text>
        {loading ? <ActivityIndicator color="#E95D91" /> : (
          <FlatList
            data={restaurants}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={({ item, index }) => (
              <TouchableOpacity 
                style={styles.shopCard} 
                onPress={() => router.push({ pathname: "/timeslot", params: { shopId: item.id, shopName: item.name } })}
              >
                <Image source={{ uri: `https://loremflickr.com/320/240/food?random=${item.id}` }} style={styles.shopImage} />
                <View style={styles.numberBadge}><Text style={styles.numberText}>{index + 1}</Text></View>
                <Text style={styles.shopName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  topBanner: { height: 180 },
  bannerImage: { width: '100%', height: '100%', opacity: 0.8 },
  backButton: { position: 'absolute', top: 50, left: 20 },
  headerPillContainer: { position: 'absolute', bottom: -20, width: '100%', alignItems: 'center' },
  headerPill: { backgroundColor: '#E95D91', paddingHorizontal: 25, paddingVertical: 10, borderRadius: 20 },
  headerTitle: { color: 'white', fontWeight: 'bold' },
  contentCard: { flex: 1, paddingTop: 40, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  shopCard: { width: '48%', marginBottom: 20, borderRadius: 15, overflow: 'hidden', elevation: 2, backgroundColor: 'white' },
  shopImage: { width: '100%', height: 120 },
  numberBadge: { position: 'absolute', top: 5, left: 5, backgroundColor: 'white', width: 25, height: 25, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  numberText: { color: '#E95D91', fontWeight: 'bold' },
  shopName: { padding: 10, fontWeight: 'bold', textAlign: 'center' }
});