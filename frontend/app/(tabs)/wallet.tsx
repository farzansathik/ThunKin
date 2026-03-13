import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function WalletScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>ThunKin Wallet</Text>
      </View>
      <View style={styles.balanceContainer}>
        <View style={styles.circle}>
          <Text style={styles.balanceText}>100.00</Text>
        </View>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.btn}>
          <Text>Add Fund</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn}>
          <Text>Scan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { backgroundColor: "#E95D91", padding: 50, alignItems: "center" },
  headerText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  balanceContainer: { alignItems: "center", marginTop: -50 },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#FFF0F5",
    borderWidth: 2,
    borderColor: "#E95D91",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  balanceText: { fontSize: 36, fontWeight: "bold", color: "#333" },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  btn: {
    backgroundColor: "#FFF0F5",
    padding: 15,
    borderRadius: 10,
    width: "40%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E95D91",
  },
});
