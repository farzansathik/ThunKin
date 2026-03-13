import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function VendorPortal() {
  return (
    <View style={styles.container}>
      {/* This ensures the header shows back button */}
      <Stack.Screen
        options={{ headerShown: true, title: "Vendor Dashboard" }}
      />

      <Text style={styles.text}>Welcome to the Vendor Portal</Text>
      <Text style={styles.subtext}>
        Manage your reservations and menu here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: { fontSize: 22, fontWeight: "bold" },
  subtext: { color: "#666", marginTop: 10 },
});
