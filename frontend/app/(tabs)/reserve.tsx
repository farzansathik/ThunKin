import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function ReserveScreen() {
  const router = useRouter();
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from("restaurant")
      .select("location, status")
      .order('location', { ascending: true });

    if (!error && data) {
      const uniqueMap = new Map();
      data.forEach(item => {
        if (!uniqueMap.has(item.location)) uniqueMap.set(item.location, item);
      });
      setLocations(Array.from(uniqueMap.values()));
    }
    setLoading(false);
  };

  useEffect(() => { fetchLocations(); }, []);

  const filteredData = locations.filter((item) =>
    (item.location || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.brand}>THUNKIN</Text>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#999" />
            <TextInput
              placeholder="Search locations"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#E95D91" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={filteredData}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push({
                pathname: "/restaurant",
                params: { filterLocation: item.location },
              })}
            >
              <View style={styles.cardInfo}>
                <Text style={styles.locationTitle}>{item.location}</Text>
                <Text style={styles.subText}>Chulalongkorn University</Text>
                <View style={[styles.statusPill, { backgroundColor: item.status === 'open' ? "#D1FAE5" : "#FEE2E2" }]}>
                  <Text style={{ color: item.status === 'open' ? "#10B981" : "#EF4444", fontSize: 10, fontWeight: 'bold' }}>
                    {item.status?.toUpperCase() || "CLOSED"}
                  </Text>
                </View>
              </View>
              <View style={styles.distanceBox}>
                <Text style={styles.distNum}>5</Text>
                <Text style={styles.minLabel}>min</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: { backgroundColor: "#E95D91", paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 35, borderBottomRightRadius: 35 },
  brand: { color: "#fff", fontSize: 34, fontWeight: "900", marginBottom: 20 },
  searchRow: { flexDirection: "row", alignItems: "center" },
  searchBar: { flex: 1, backgroundColor: "white", borderRadius: 30, height: 48, flexDirection: "row", alignItems: "center", paddingHorizontal: 15 },
  searchInput: { flex: 1, marginLeft: 8 },
  listContent: { padding: 18, paddingBottom: 100 },
  card: { backgroundColor: "white", borderRadius: 22, padding: 18, flexDirection: "row", marginBottom: 16, elevation: 3 },
  cardInfo: { flex: 1 },
  locationTitle: { fontSize: 18, fontWeight: "800" },
  subText: { fontSize: 14, color: "#E95D91", marginBottom: 8 },
  statusPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10 },
  distanceBox: { width: 65, height: 65, backgroundColor: "#FDFDFD", borderRadius: 15, borderWidth: 1, borderColor: "#EEE", alignItems: "center", justifyContent: "center" },
  distNum: { fontSize: 20, fontWeight: "bold", color: "#E95D91" },
  minLabel: { fontSize: 10, fontWeight: "bold" },
});