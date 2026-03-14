import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "../lib/supabase";

export default function RestaurantScreen() {
  const router = useRouter();
  const { restId, restName } = useLocalSearchParams();

  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  /* ---------------- FETCH MENU ---------------- */

  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from("menu")
      .select("*")
      .eq("rest_id", restId);

    if (error) {
      console.log("Menu fetch error:", error);
      return;
    }

    setMenu(data || []);
    setLoading(false);
  };

  /* ---------------- ADD TO CART ---------------- */

  const addToCart = async (item: any) => {
  console.log("Add to cart called:", item);

  /* get auth user */
  const { data: authData } = await supabase.auth.getUser();
  const authId = authData?.user?.id;

  if (!authId) {
    console.log("User not logged in");
    return;
  }

  /* get integer user id */
  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("auth_id", authId)
    .single();

  if (userError) {
    console.log("User fetch error:", userError);
    return;
  }

  const userId = userRow.id;

  console.log("App user ID:", userId);

  /* check if item already in cart */
  const { data: existing } = await supabase
    .from("cart")
    .select("*")
    .eq("user_id", userId)
    .eq("menu_id", item.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("cart")
      .update({
        quantity: existing.quantity + 1,
      })
      .eq("id", existing.id);

    if (error) console.log("Update error:", error);
  } else {
    const { error } = await supabase.from("cart").insert([
      {
        user_id: userId,
        menu_id: item.id,
        quantity: 1,
      },
    ]);

    if (error) console.log("Insert error:", error);
  }
};

  /* ---------------- QUANTITY ---------------- */

  const increaseQty = (item: any) => {
    console.log("Increase button pressed", item);
    setQuantities((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));

    addToCart(item);
  };

  const decreaseQty = (item: any) => {
    console.log("Decrease button pressed", item);
    setQuantities((prev) => {

      const newQty = (prev[item.id] || 0) - 1;

      if (newQty <= 0) {
        const updated = { ...prev };
        delete updated[item.id];
        return updated;
      }

      return {
        ...prev,
        [item.id]: newQty
      };
    });
  };

  /* ---------------- LOAD ---------------- */

  useEffect(() => {
    fetchMenu();
  }, []);

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.title}>{restName}</Text>
        <Text style={styles.subtitle}>{menu.length} menu items</Text>

      </View>

      {/* MENU */}

      {loading ? (
        <Text style={styles.loading}>Loading menu...</Text>
      ) : (
        <FlatList
          data={menu}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.menuList}
          renderItem={({ item }) => (
            <View style={styles.card}>

              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.price}>฿ {item.price}</Text>
              </View>

              <View style={styles.qtyContainer}>

                {quantities[item.id] ? (
                  <>

                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => decreaseQty(item)}
                    >
                      <Ionicons name="remove" size={16} color="white" />
                    </TouchableOpacity>

                    <Text style={styles.qtyText}>
                      {quantities[item.id]}
                    </Text>

                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => increaseQty(item)}
                    >
                      <Ionicons name="add" size={16} color="white" />
                    </TouchableOpacity>

                  </>
                ) : (

                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => increaseQty(item)}
                  >
                    <Text style={styles.addText}>Add</Text>
                  </TouchableOpacity>

                )}

              </View>

            </View>
          )}
        />
      )}

      {/* CART BAR */}

      {totalItems > 0 && (

        <View style={styles.cartBar}>

          <Text style={styles.cartText}>
            {totalItems} item{totalItems > 1 ? "s" : ""}
          </Text>

          <TouchableOpacity
            style={styles.viewCartButton}
            onPress={() => router.push("/cart")}
          >
            <Text style={styles.viewCartText}>View Cart</Text>
          </TouchableOpacity>

        </View>

      )}

    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },

  header: {
    backgroundColor: "#E95D91",
    paddingTop: 60,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    alignItems: "center",
  },

  backButton: {
    position: "absolute",
    left: 20,
    top: 60,
  },

  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "800",
  },

  subtitle: {
    color: "#ffe6f0",
    marginTop: 5,
    fontSize: 13,
  },

  loading: {
    padding: 30,
    textAlign: "center",
    fontSize: 16,
  },

  menuList: {
    padding: 20,
    paddingBottom: 120,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },

  foodInfo: {
    maxWidth: "70%",
  },

  foodName: {
    fontSize: 16,
    fontWeight: "700",
  },

  price: {
    marginTop: 6,
    fontSize: 14,
    color: "#E95D91",
    fontWeight: "600",
  },

  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  qtyButton: {
    backgroundColor: "#E95D91",
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  qtyText: {
    marginHorizontal: 10,
    fontWeight: "700",
    fontSize: 16,
  },

  addButton: {
    backgroundColor: "#E95D91",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 12,
  },

  addText: {
    color: "white",
    fontWeight: "700",
  },

  cartBar: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#E95D91",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cartText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },

  viewCartButton: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10,
  },

  viewCartText: {
    color: "#E95D91",
    fontWeight: "700",
  },

});