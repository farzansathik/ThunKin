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
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";

const { width } = Dimensions.get("window");

export default function ReserveScreen() {
  const router = useRouter();
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from("restaurant")
      .select("location, status")
      .order("location", { ascending: true });

    if (!error && data) {
      const uniqueMap = new Map();
      data.forEach((item) => {
        if (!uniqueMap.has(item.location)) uniqueMap.set(item.location, item);
      });
      setLocations(Array.from(uniqueMap.values()));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const filteredData = locations.filter((item) =>
    (item.location || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* --- HEADER SECTION --- */}
      <View style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <View style={styles.logoRow}>
              <Text style={styles.brandText}>THUNKIN</Text>
            </View>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color="#333" />
              <TextInput
                placeholder="Search"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
              <TouchableOpacity>
                <Ionicons name="heart-outline" size={22} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Map Toggle Switch */}
            <TouchableOpacity style={styles.toggleTrack}>
              <View style={styles.toggleThumb} />
              <Ionicons name="map-outline" size={14} color="#666" style={{ marginRight: 4 }} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* --- CONTENT SECTION --- */}
      {loading ? (
        <ActivityIndicator size="large" color="#E95D91" style={{ marginTop: 50 }} />
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={filteredData}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isOpen = item.status?.toLowerCase() === "open";
              return (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() =>
                    router.push({
                      pathname: "/restaurant",
                      params: { filterLocation: item.location },
                    })
                  }
                >
                  <View style={styles.cardInfo}>
                    <Text style={styles.locationTitle} numberOfLines={1}>
                      {item.location}
                    </Text>
                    <View style={styles.statusRow}>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: isOpen ? "#D1FAE5" : "#FEE2E2" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: isOpen ? "#10B981" : "#EF4444" },
                          ]}
                        >
                          {isOpen ? "OPEN" : "CLOSED"}
                        </Text>
                      </View>
                      <Text style={styles.timeText}>08:00 - 18:00</Text>
                      <Ionicons name="heart-outline" size={18} color="#E95D91" style={{ marginLeft: 8 }} />
                    </View>
                  </View>

                  <View style={styles.distanceContainer}>
                    <View style={styles.distanceBox}>
                      <View style={styles.distValueRow}>
                        <Text style={styles.distNum}>5</Text>
                        <MaterialCommunityIcons name="run" size={18} color="#E95D91" />
                      </View>
                      <Text style={styles.minLabel}>min</Text>
                    </View>
                    <Text style={styles.meterText}>12 meters</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          {/* QUICK ORDER BUTTON */}
          <TouchableOpacity style={styles.quickOrderFloatingBtn}>
            <Ionicons name="sparkles" size={20} color="#E95D91" />
            <View style={styles.quickOrderPinkPill}>
              <Text style={styles.quickOrderText}>QUICK ORDER</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  header: {
    backgroundColor: "#E95D91",
    paddingBottom: 20,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTop: { marginTop: 10, marginBottom: 15, alignItems: "center" },
  logoRow: { flexDirection: "row", alignItems: "center" },
  brandText: { color: "#FFF", fontSize: 32, fontWeight: "900", letterSpacing: 1 },
  logoIcon: { marginHorizontal: -2, marginTop: 4 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  searchBar: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 25,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: "#333" },
  toggleTrack: {
    width: 50,
    height: 26,
    backgroundColor: "#D1D1D1",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 3,
    justifyContent: "space-between",
  },
  toggleThumb: { width: 20, height: 20, backgroundColor: "#FFF", borderRadius: 10, elevation: 2 },

  listContent: { padding: 15, paddingBottom: 160 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardInfo: { flex: 1 },
  locationTitle: { fontSize: 18, fontWeight: "800", color: "#333" },
  subLocationText: { fontSize: 14, color: "#E95D91", fontWeight: "600", marginBottom: 8 },
  statusRow: { flexDirection: "row", alignItems: "center" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginRight: 8 },
  statusText: { fontSize: 10, fontWeight: "900" },
  timeText: { fontSize: 12, color: "#999" },

  distanceContainer: { alignItems: "center", justifyContent: "center", marginLeft: 10 },
  distanceBox: {
    width: 65,
    height: 65,
    backgroundColor: "#FFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#EEE",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  distValueRow: { flexDirection: "row", alignItems: "center" },
  distNum: { fontSize: 22, fontWeight: "900", color: "#E95D91", marginRight: 2 },
  minLabel: { fontSize: 11, fontWeight: "bold", color: "#333", marginTop: -4 },
  meterText: { fontSize: 9, color: "#AAA", marginTop: 4 },

  quickOrderFloatingBtn: {
    position: "absolute",
    bottom: 110,
    right: 20,
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
  },
  quickOrderPinkPill: {
    backgroundColor: "#E95D91",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  quickOrderText: { color: "#FFF", fontWeight: "900", fontSize: 11 },

  navBar: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "#E95D91",
    width: "100%",
    height: 80,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 15,
  },
  navItem: { alignItems: "center" },
  navLabel: { color: "#FFF", fontSize: 10, marginTop: 4 },
  reserveContainer: { top: -25 },
  reserveCircle: {
    width: 80,
    height: 80,
    backgroundColor: "#FFF",
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "#E95D91",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  reserveLabel: { color: "#E95D91", fontSize: 10, fontWeight: "bold", marginTop: 2 },
});