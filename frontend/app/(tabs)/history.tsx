import { FlatList, StyleSheet, Text, View } from "react-native";

const ORDERS = [
  {
    id: "1",
    item: "Chicken Rice",
    price: "45.00",
    status: "Completed",
    date: "Jan 30",
  },
  {
    id: "2",
    item: "Iced Tea",
    price: "20.00",
    status: "Cancelled",
    date: "Jan 29",
  },
];

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Order History</Text>
      </View>
      <FlatList
        data={ORDERS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View>
              <Text style={styles.orderItem}>{item.item}</Text>
              <Text style={styles.orderDate}>{item.date}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.orderPrice}>{item.price} THB</Text>
              <Text
                style={[
                  styles.status,
                  { color: item.status === "Completed" ? "green" : "red" },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  header: { backgroundColor: "#E95D91", padding: 50, alignItems: "center" },
  headerText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  orderCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 2,
  },
  orderItem: { fontSize: 16, fontWeight: "bold" },
  orderDate: { color: "#888", fontSize: 12 },
  orderPrice: { fontWeight: "bold", fontSize: 16 },
  status: { fontSize: 12, marginTop: 5 },
});
