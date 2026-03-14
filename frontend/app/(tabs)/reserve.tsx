import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  FlatList,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

export default function ReserveScreen() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<any[]>([]);

  const fetchRestaurants = async () => {
    const { data, error } = await supabase.from("restaurant").select("*");

    if (error) {
      console.log("Error fetching restaurants:", error);
      return;
    }

    setRestaurants(data || []);
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>THUNKIN</Text>

        {/* Search */}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput placeholder="Search canteens" style={styles.searchInput} />
          <Ionicons name="heart-outline" size={20} color="#E95D91" />
        </View>

        {/* Toggle */}
        <View style={styles.toggleRow}>
          <Text style={styles.toggleText}>List</Text>
          <Switch thumbColor="#fff" trackColor={{ true: "#E95D91" }} />
          <Ionicons name="map-outline" size={18} color="#fff" />
        </View>
      </View>

      {/* LIST */}
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/restaurant",
                params: {
                  restId: item.id,
                  restName: item.name,
                },
              })
            }
          >
            <View style={styles.cardLeft}>
              <View style={styles.logoCircle}>
                <Ionicons name="restaurant" size={22} color="#E95D91" />
              </View>

              <View>
                <Text style={styles.cardTitle}>{item.name}</Text>

                <Text style={styles.cardTime}>
                  {item.status === "open" ? "OPEN" : "CLOSED"}
                </Text>
              </View>
            </View>

            <View style={styles.distance}>
              <Ionicons name="walk-outline" size={14} color="#E95D91" />
              <Text style={styles.distText}>5 min</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F4F4" },

  header: {
    backgroundColor: "#E95D91",
    padding: 20,
    paddingTop: 55,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 15,
  },

  searchRow: {
    backgroundColor: "#fff",
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  searchInput: {
    flex: 1,
    marginHorizontal: 10,
  },

  toggleRow: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },

  toggleText: {
    color: "#fff",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF0F5",
    justifyContent: "center",
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  cardTime: {
    fontSize: 12,
    color: "green",
    marginTop: 3,
  },

  distance: {
    alignItems: "center",
  },

  distText: {
    fontSize: 12,
    color: "#E95D91",
    fontWeight: "700",
    marginTop: 2,
  },
});