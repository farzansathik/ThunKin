import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.5)",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      {/* 1. HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size ?? 26} color={color} />
          ),
        }}
      />

      {/* 2. WALLET */}
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet" size={size ?? 26} color={color} />
          ),
        }}
      />

      {/* 3. RESERVE (Center Floating Button) */}
      <Tabs.Screen
        name="reserve"
        options={{
          title: "Reserve",
          tabBarIcon: ({ focused }) => (
            <View style={styles.reserveButton}>
              <Ionicons name="restaurant" size={28} color="#E95D91" />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />

      {/* 4. PURCHASED (Points to your history file) */}
      <Tabs.Screen
        name="history"
        options={{
          title: "Purchased",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size ?? 26} color={color} />
          ),
        }}
      />

      {/* 5. PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size ?? 26} color={color} />
          ),
        }}
      />

      {/* --- HIDDEN SCREENS --- */}
      {/* These will NOT show in the footer but can still be navigated to via router.push */}
      
      <Tabs.Screen
        name="restaurant"
        options={{
          href: null, // This hides it from the footer
        }}
      />

      <Tabs.Screen
        name="timeslot"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="menu"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  reserveButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -30, // Lifts the button above the bar
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },

  tabBar: {
    backgroundColor: "#E95D91",
    borderTopWidth: 0,
    height: Platform.OS === "ios" ? 90 : 75,
    paddingBottom: Platform.OS === "ios" ? 30 : 15,
    paddingTop: 10,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    position: "absolute", // Makes it float so we can round the corners
    elevation: 0,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },
});