import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  StatusBar,
  Platform,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getCurrentDebugTime, getCurrentTimeString } from "../../utils/debugTime";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Octicons from '@expo/vector-icons/Octicons';
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";

import CafeteriaSelectCard from "../../components/user_components/CafeteriaSelectCard";

export default function ReserveScreen() {
  const router = useRouter();
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFavoriteMode, setIsFavoriteMode] = useState(false);

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from("cafeteria")                          
      .select("id, location_name, name, status, open_time, close_time, favorite")  
      .order("id", { ascending: true });   //เดี่ยวถ้าผูกกับ google maps API ได้ค่อยเอา order by distance มาใส่แทน

    if (!error && data) {
      const uniqueMap = new Map();
      data.forEach((item) => {
        if (!uniqueMap.has(item.location_name)) uniqueMap.set(item.location_name, item);
      });
      setLocations(Array.from(uniqueMap.values()));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Helper function to check if cafeteria is currently open
  const isCafeteriaOpen = (item: any) => {
    if (!item.status || !item.open_time || !item.close_time) return false;
    
    const now = getCurrentDebugTime();
    const currentTime = getCurrentTimeString();
    
    return currentTime >= item.open_time.slice(0, 5) && currentTime < item.close_time.slice(0, 5);
  };

  const filteredData = locations.filter((item) => {
    // Search filter: search for location_name or name in Thai and English
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (item.location_name || "").toLowerCase().includes(searchLower) ||
      (item.name || "").toLowerCase().includes(searchLower);

    // Favorite mode filter: only show if favorite is true
    const matchesFavoriteFilter = isFavoriteMode ? item.favorite === true : true;

    return matchesSearch && matchesFavoriteFilter;
  }).sort((a, b) => {
    // Sort: open cafeterias first, closed ones at the bottom
    const aOpen = isCafeteriaOpen(a);
    const bOpen = isCafeteriaOpen(b);
    if (aOpen === bOpen) return 0;
    return aOpen ? -1 : 1;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          {/* Decorative dish image — behind everything */}
          <Image
            source={require("../../assets/images/Thunkin_images/UserSide_img/dish_banner.png")}
            style={styles.dishDecor}
            resizeMode="contain"
          />
          {/* Brand Title Row */}
          <View style={styles.headerTop}>
            <Image
              source={require("../../assets/images/Thunkin_images/THUNKIN_logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Search Row */}
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color="#757575" />
              <TextInput
                placeholder="Search"

                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#757575"
              />
              <TouchableOpacity onPress={() => setIsFavoriteMode(!isFavoriteMode)}>
                <FontAwesome6 name="heart" size={18} color={isFavoriteMode ? "#E95D91" : "#616161"} solid={isFavoriteMode} />
              </TouchableOpacity>
            </View>

            {/* Map Toggle */}
            <TouchableOpacity style={styles.toggleTrack}>
              <View style={styles.toggleThumb} />
              <Ionicons name="map-outline" size={14} color="#888" style={{ marginRight: 5 }} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

    {/* CONTENT */}
      {loading ? (
        <ActivityIndicator size="large" color="#E95D91" style={{ marginTop: 50 }} />
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={filteredData}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <CafeteriaSelectCard
                item={item}
                onPress={() =>
                  router.push({
                    pathname: "/restaurant",
                    params: { cafeId: item.id },
                  })
                }
                onFavoritePress={() => {
                  // Update the local state
                  setLocations((prevLocations) =>
                    prevLocations.map((loc) =>
                      loc.id === item.id ? { ...loc, favorite: !loc.favorite } : loc
                    )
                  );
                }}
              />
            )}
          />

          {/* QUICK ORDER FLOATING BUTTON */}
          <TouchableOpacity 
            style={styles.quickOrderFloatingBtn} 
            activeOpacity={0.85}
            onPress={() => router.push("/aiquickorder")}
          >
            <Octicons name="sparkles-fill" size={24} color="#DF5789" />
            <View style={styles.quickOrderPinkPill}>
              <Text style={styles.quickOrderText}>QUICK</Text>
              <Text style={styles.quickOrderText}>ORDER</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EBEBEB",
  },

  /* ── HEADER ── */
  header: {
    backgroundColor: "#DF5789",
    paddingBottom: 22,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 25 : 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: Platform.OS === "ios" ? 180 : 160,
    overflow: "hidden", // clips dish image inside rounded header
    elevation: 10,
  },
  headerTop: {
    marginTop: 10,
    marginBottom: -17,
    alignItems: "flex-start",
    paddingLeft: 0, // flush to left
  },
  logo: {
    width: 200, 
    height: 110,  
  },
  dishDecor: {
    position: "absolute",
    right: -63,
    top: -12,
    width: 230,
    height: 230,
    opacity: 0.12,
    transform: [{ rotate: "-15deg" }],
  },

  /* ── SEARCH ROW ── */
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchBar: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 25,
    height: 33,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 5,
    fontSize: 15,
    height: 33,
    color: "#333",
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  toggleTrack: {
    width: 50,
    height: 26,
    backgroundColor: "#D1D1D1",
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 3,
    justifyContent: "space-between",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    backgroundColor: "#FFF",
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },

  /* ── LIST ── */
  listContent: {
    padding: 16,
    paddingBottom: 170,
  },

  /* ── CARD ── */
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardInfo: {
    flex: 1,
    paddingRight: 10,
  },
  locationTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#222",
    marginBottom: 3,
    lineHeight: 22,
  },
  subLocationText: {
    fontSize: 13,
    color: "#E95D91",
    fontWeight: "600",
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  timeText: {
    fontSize: 12,
    color: "#AAA",
    fontWeight: "500",
  },

  /* ── QUICK ORDER ── */
  quickOrderFloatingBtn: {
    position: "absolute",
    bottom: 105,
    right: 12,
    width: 140,
    height: 50,
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
    paddingRight: 5,
    paddingVertical: 5,
    borderRadius: 30,
    borderColor: "#e95d9067",
    borderWidth: 1.5,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  quickOrderPinkPill: {
    backgroundColor: "#E95D91",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginLeft: 8,
    width: 80,
    height: 35,
  },
  quickOrderText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 0.5,
    textAlign: "center",
    bottom: 4,
  },
});