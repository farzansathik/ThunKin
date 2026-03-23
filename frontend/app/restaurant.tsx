import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator } from "react-native";
import { supabase } from "../lib/supabase";
import Typography from "@/components/typography";
import VendorStallSelectCard from "@/components/user_components/VendorStallSelectCard";

export default function RestaurantScreen() {
  const router = useRouter();
  const { cafeId } = useLocalSearchParams();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [availableFrom, setAvailableFrom] = useState('Available From');
  const [availableUntil, setAvailableUntil] = useState('Available Until');

  const [locationName, setLocationName] = useState("");
  
  useEffect(() => {
    const fetchRestaurants = async () => {
      // Fetch location name
      const { data: cafeData } = await supabase
        .from("cafeteria")
        .select("location_name")
        .eq("id", cafeId)
        .single();

      if (cafeData) setLocationName(cafeData.location_name);

      // Fetch restaurants
      const { data } = await supabase
        .from("restaurant")
        .select("*")
        .eq("cafe_id", cafeId)
        .eq("status", true);  // only fetch open restaurants

      setRestaurants(data || []);
      setLoading(false);
    };

    fetchRestaurants();
  }, [cafeId]);

  return (
    <View style={styles.container}>
      <View style={styles.topBanner}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800' }} style={styles.bannerImage} />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>

        {/* Pink pill banner — overlaps bottom of image */}
        <View style={styles.locationPillWrapper}>
          <View style={styles.locationPill}>
            <Typography weight="bold" style={styles.locationText} size={22}>
              {locationName}
            </Typography>
          </View>
        </View>
      </View>
        <View style={styles.contentCard}>
        <View style={[styles.sectionTitleRow, { bottom: 3 }]}>
          <View style={styles.titleAccent} />
          <Typography weight="bold" style={{ color: "#3c3c3c" }} size={30}>
            Select Restaurants
          </Typography>
        </View>

        <View style={styles.filterRow}>
          <Ionicons name="time-outline" size={18} color="#888" style={{ bottom: 10 }} />
          <TouchableOpacity style={styles.filterPill}>
            <Text style={styles.filterText}>{availableFrom}</Text>
            <Ionicons name="chevron-down" size={14} color="#888" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterPill}>
            <Text style={styles.filterText}>{availableUntil}</Text>
            <Ionicons name="chevron-down" size={14} color="#888" />
          </TouchableOpacity>
        </View>
        
        {loading ? <ActivityIndicator color="#E95D91" /> : (
          <FlatList
            data={restaurants}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
              renderItem={({ item, index }) => (
                <VendorStallSelectCard item={item} index={index} />
              )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E95D91" },

  // Banner
  topBanner: { height: 180 },
  bannerImage: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', top: 50, left: 20 , elevation: 5, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 30, padding: 6 },

  locationPillWrapper: {
    position: 'absolute',
    bottom: -0,        
    width: '100%',
    zIndex: 1,
  },
  
  locationPill: {
    backgroundColor: '#E95D91',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  locationText: {
    color: 'white',
    textAlign: 'center',
  },

  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 3,
    backgroundColor: 'white',
    bottom: 14,
  },
  filterText: {
    fontSize: 13,
    color: '#888',
  },

  // Content below
  contentCard: { 
    flex: 1, 
    paddingTop: 20, 
    paddingHorizontal: 20, 
    backgroundColor: 'white',
    zIndex: 2, // above the pink banner
    borderTopLeftRadius: 25,   
    borderTopRightRadius: 25,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleAccent: {
    width: 5,
    height: 32,
    backgroundColor: '#E95D91',
    borderRadius: 3,
    marginRight: 10,
  },

  // Shop cards
  shopCard: { width: '48%', marginBottom: 20, borderRadius: 15, overflow: 'hidden', elevation: 2, backgroundColor: 'white' },
  shopImage: { width: '100%', height: 120 },
  numberBadge: { position: 'absolute', top: 5, left: 5, backgroundColor: 'white', width: 25, height: 25, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  numberText: { color: '#E95D91', fontWeight: 'bold' },
  shopName: { padding: 10, fontWeight: 'bold', textAlign: 'center' },
});