import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from "react-native";
import { supabase } from "../../lib/supabase"; 

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2; // Modern 2-column calculation

export default function HomeScreen() {
  const [email, setEmail] = useState("Loading...");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
      }
    };
    getUser();
  }, []);

  // Professional Promotion Data with High-Res Images
  const promotions = [
    { id: 1, title: "50% OFF Glass Noodles" },
    { id: 2, title: "Buy 1 Get 1 Free" },
    { id: 3, title: "" },
  ];

  // Professional Combination Data with High-Res Images
  const combinations = [
    { id: 1, name: "Family Set A", price: "299฿"},
    { id: 2, name: "Solo Feast", price: "129฿" },
    { id: 3, name: "Party Mix", price: "450฿" },
    { id: 4, name: "Snack Box", price: "89฿" },
  ];

  return (
    <View style={{flex: 1}}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* REFINED HEADER SECTION */}
        <View style={styles.header}>
          <Text style={styles.brand}>THUNKIN</Text>
          <Text style={styles.headerSub}>Account: {email}</Text>
        </View>

        {/* PROMOTION SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promotion</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingRight: 20}}>
            {promotions.map((item) => (
              <TouchableOpacity key={item.id} style={styles.foodCardSmall} activeOpacity={0.8}>
                {/* <Image source={{ uri: item.image }} style={styles.promoImage} resizeMode="cover"/> */}
                <View style={styles.promoOverlay}>
                  <Text style={styles.cardTextSmall}>{item.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* COMBINATION GRID SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Combination</Text>
          <View style={styles.grid}>
            {combinations.map((item) => (
              <TouchableOpacity key={item.id} style={styles.foodCardLarge} activeOpacity={0.8}>
                {/* <Image source={{ uri: item.image }} style={styles.largeCardImage} resizeMode="cover"/> */}
                <View style={styles.infoArea}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardPrice}>{item.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Placeholder Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
          <Text style={{color: '#fff', fontSize: 12}}>Home</Text>
          <Text style={{color: '#fff', fontSize: 12}}>Cart</Text>
          <Text style={{color: '#fff', fontSize: 12}}>Orders</Text>
          <Text style={{color: '#fff', fontSize: 12}}>Profile</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    backgroundColor: "#E95D91",
    padding: 30,
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8, // Prompts shadow on Android
    shadowColor: "#E95D91", // Prompts shadow on iOS
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  brand: { color: "#fff", fontSize: 34, fontWeight: "900", letterSpacing: 0.5 },
  headerSub: { color: "#fff", opacity: 0.95, marginTop: 7, fontSize: 14, fontWeight: "600" },
  
  section: { padding: 20, paddingTop: 10 },
  sectionTitle: { fontSize: 22, fontWeight: "800", marginBottom: 20, color: "#111827" },
  
  // PROMOTION CARD STYLES
  foodCardSmall: {
    width: 220, // Modern wide promo look
    height: 120,
    marginRight: 15,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  promoImage: { width: "100%", height: "100%", position: "absolute" },
  promoOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.4)", // Dynamic text darken overlay
    justifyContent: "flex-end", 
    padding: 15 
  },
  cardTextSmall: { fontWeight: "bold", color: "#FFF", textAlign: "left", fontSize: 16, letterSpacing: 0.2 },

  // MODERN GRID STYLES
  grid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    justifyContent: "space-between",
    marginHorizontal: 0, 
  },
  foodCardLarge: {
    width: CARD_WIDTH,
    height: 230,
    backgroundColor: "#FFF",
    marginBottom: 20,
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    overflow: "hidden",
  },
  largeCardImage: { width: "100%", height: "65%" },
  infoArea: { padding: 15, justifyContent: "center", flex: 1 },
  cardTitle: { fontWeight: "700", fontSize: 15, color: "#1F2937" },
  cardPrice: { color: "#E95D91", fontWeight: "bold", marginTop: 4, fontSize: 17 },

  // Bottom Nav Placeholder for the screenshot
  bottomNav: {
    height: 70,
    backgroundColor: '#E95D91',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  }
});