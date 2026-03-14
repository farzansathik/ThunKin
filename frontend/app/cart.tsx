import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";

export default function CartScreen() {

  const router = useRouter();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const fetchCart = async () => {

    const { data: userData } = await supabase.auth.getUser();

    const userId = userData?.user?.id;

    if (!userId) return;

    const { data, error } = await supabase
      .from("cart")
      .select(`
        id,
        quantity,
        menu (
          name,
          price
        )
      `)
      .eq("user_id", userId);

    if (error) {
      console.log("Cart fetch error:", error);
      return;
    }

    if (!data) return;

    setCartItems(data);

    let sum = 0;

    data.forEach((item) => {
      const menu = item.menu?.[0];
      if (menu) {
        sum += menu.price * item.quantity;
      }
    });

    setTotal(sum);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>Your Cart</Text>

      </View>

      {/* CART ITEMS */}

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => {

          const menu = item.menu?.[0];

          return (
            <View style={styles.card}>

              <Text style={styles.foodName}>
                {menu?.name}
              </Text>

              <Text style={styles.quantity}>
                x{item.quantity}
              </Text>

              <Text style={styles.price}>
                ฿ {menu?.price * item.quantity}
              </Text>

            </View>
          );
        }}
      />

      {/* FOOTER */}

      <View style={styles.footer}>

        <Text style={styles.totalText}>
          Total: ฿ {total}
        </Text>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => console.log("Checkout pressed")}
        >
          <Text style={styles.checkoutText}>Checkout</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },

  header: {
    backgroundColor: "#E95D91",
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: "center",
  },

  backButton: {
    position: "absolute",
    left: 20,
    top: 60,
  },

  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
  },

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  foodName: {
    fontWeight: "700",
    fontSize: 16,
  },

  quantity: {
    fontWeight: "600",
  },

  price: {
    color: "#E95D91",
    fontWeight: "700",
  },

  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  totalText: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },

  checkoutButton: {
    backgroundColor: "#E95D91",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  checkoutText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },

});