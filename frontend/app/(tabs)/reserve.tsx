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
  SafeAreaView,
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
        <SafeAreaView>
          <View style={styles.headerTop}>
            <Text style={styles.brand}>THUNKIN</Text>
          </View>
          
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color="#666" />
              <TextInput
                placeholder="Search"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
              <TouchableOpacity>
                <Ionicons name="heart-outline" size={20} color="#666" style={{marginRight: 10}} />
              </TouchableOpacity>
              <View style={styles.togglePlaceholder} /> 
            </View>
          </View>
        </SafeAreaView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#E95D91" style={{marginTop: 50}} />
      ) : (
        <View style={{flex: 1}}>
          <FlatList
            data={filteredData}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isOpen = item.status?.toLowerCase() === 'open';
              return (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => router.push({
                    pathname: "/restaurant",
                    params: { filterLocation: item.location },
                  })}
                >
                  <View style={styles.cardInfo}>
                    <Text style={styles.locationTitle} numberOfLines={1}>{item.location}</Text>
         
                    
                    <View style={styles.statusRow}>
                      {/* Dynamic Color Logic */}
                      <View style={[
                        styles.statusBadge, 
                        { backgroundColor: isOpen ? "#D1FAE5" : "#FEE2E2" }
                      ]}>
                        <Text style={[
                          styles.statusText, 
                          { color: isOpen ? "#10B981" : "#EF4444" }
                        ]}>
                          {isOpen ? "OPEN" : "CLOSED"}
                        </Text>
                      </View>
                      <Text style={styles.timeText}>08:00 - 18:00</Text>
                      <TouchableOpacity>
                          <Ionicons name="heart-outline" size={18} color="#E95D91" style={{marginLeft: 8}} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.distanceContainer}>
                      <View style={styles.distanceBox}>
                          <View style={styles.distValueRow}>
                              <Text style={styles.distNum}>5</Text>
                              <MaterialCommunityIcons name="run" size={16} color="#333" />
                          </View>
                          <Text style={styles.minLabel}>min</Text>
                      </View>
                      <Text style={styles.meterText}>12 meters</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          <TouchableOpacity style={styles.quickOrderBtn}>
            <Ionicons name="sparkles" size={18} color="#FFF" />
            <Text style={styles.quickOrderText}>QUICK ORDER</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F2" },
  header: { 
    backgroundColor: "#E95D91", 
    paddingBottom: 25, 
    paddingHorizontal: 20, 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
    elevation: 5,
  },
  headerTop: { marginTop: 10, marginBottom: 15 },
  brand: { color: "#fff", fontSize: 38, fontWeight: "900", letterSpacing: 1 },
  searchRow: { flexDirection: "row", alignItems: "center" },
  searchBar: { 
    flex: 1, 
    backgroundColor: "white", 
    borderRadius: 25, 
    height: 45, 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 15 
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16 },
  togglePlaceholder: { width: 40, height: 22, backgroundColor: '#EEE', borderRadius: 12 },
  
  listContent: { padding: 15, paddingTop: 20, paddingBottom: 120 },
  card: { 
    backgroundColor: "white", 
    borderRadius: 20, 
    padding: 15, 
    flexDirection: "row", 
    marginBottom: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  cardInfo: { flex: 1, justifyContent: 'center' },
  locationTitle: { fontSize: 19, fontWeight: "800", color: "#333", marginBottom: 2 },
  subText: { fontSize: 14, color: "#E95D91", fontWeight: '600', marginBottom: 10 },
  
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusBadge: { 
    paddingHorizontal: 10, 
    paddingVertical: 3, 
    borderRadius: 12, 
    marginRight: 8 
  },
  statusText: { fontSize: 11, fontWeight: '900' },
  timeText: { fontSize: 13, color: "#666", fontWeight: '500' },

  distanceContainer: { alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  distanceBox: { 
    width: 68, 
    height: 68, 
    backgroundColor: "#FFF", 
    borderRadius: 15, 
    borderWidth: 1, 
    borderColor: "#E0E0E0", 
    alignItems: "center", 
    justifyContent: "center",
  },
  distValueRow: { flexDirection: 'row', alignItems: 'center' },
  distNum: { fontSize: 24, fontWeight: "900", color: "#E95D91", marginRight: 2 },
  minLabel: { fontSize: 11, fontWeight: "bold", color: "#333", marginTop: -4 },
  meterText: { fontSize: 10, color: '#999', marginTop: 4 },

  quickOrderBtn: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#E95D91',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    elevation: 5,
  },
  quickOrderText: { color: '#FFF', fontWeight: '800', marginLeft: 8, fontSize: 12 }
});