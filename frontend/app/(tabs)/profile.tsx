import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.topCard}>
        <View style={styles.imagePlaceholder} />
        <Text style={styles.name}>ThunKin User</Text>
        <Text style={styles.points}>1,250 Points</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.push("/vendor")}
        >
          <IconSymbol name="shop.fill" color="#E95D91" size={20} />
          <Text style={styles.btnText}>Vendor Portal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn}>
          <IconSymbol name="gearshape.fill" color="#666" size={20} />
          <Text style={styles.btnText}>Account Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.replace("/login")}
        >
          <Text style={[styles.btnText, { color: "red" }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topCard: {
    backgroundColor: "#FFF0F5",
    padding: 40,
    alignItems: "center",
    borderBottomRightRadius: 50,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E95D91",
    marginBottom: 10,
  },
  name: { fontSize: 22, fontWeight: "bold" },
  points: { color: "#E95D91", fontWeight: "600" },
  menu: { padding: 25 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 15,
  },
  btnText: { marginLeft: 15, fontSize: 16, fontWeight: "500" },
});
