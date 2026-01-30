import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brand}>THUNKIN</Text>
        <Text style={styles.headerSub}>ACCOUNT: xxxx-xxx-xxx</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Promotion</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.foodCardSmall} />
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Combination</Text>
        <View style={styles.grid}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.foodCardLarge} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    backgroundColor: "#E95D91",
    padding: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  brand: { color: "#fff", fontSize: 32, fontWeight: "bold" },
  headerSub: { color: "#fff", opacity: 0.8 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 15 },
  foodCardSmall: {
    width: 120,
    height: 100,
    backgroundColor: "#f0f0f0",
    marginRight: 15,
    borderRadius: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  foodCardLarge: {
    width: "48%",
    height: 150,
    backgroundColor: "#f0f0f0",
    marginBottom: 15,
    borderRadius: 10,
  },
});
