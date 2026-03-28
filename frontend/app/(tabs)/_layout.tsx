import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Tabs } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";

const ACTIVE_COLOR = "#FFFFFF";
const INACTIVE_COLOR = "rgba(255,255,255,0.4)";
const DisabledTab = (props: any) => (
  <View {...props} pointerEvents="none" />
);

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="reserve"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      {/* 1. HOME */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="home"
              size={24}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
          tabBarButton: (props) => <DisabledTab {...props} />, // ไม่่ใช้หน้านี้ เอามันออกชั่วคราวก่อน
        }}
      />

      {/* 2. WALLET */}
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarItemStyle: styles.walletItem,
          tabBarIcon: ({ focused }) => (
            <FontAwesome6
              name="wallet"
              size={24}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
          tabBarButton: (props) => <DisabledTab {...props} />, // ไม่่ใช้หน้านี้ เอามันออกชั่วคราวก่อน
        }}
      />

      {/* 3. RESERVE */}
      <Tabs.Screen
        name="reserve"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.reserveRing}>
              <View style={styles.reserveShadowWrapper}>
                <View style={styles.reserveCircle}>
                  <MaterialCommunityIcons
                    name="silverware-fork-knife"
                    size={39}
                    color={focused ? "#DF5789" : "#CCCCCC"}
                    style={{ marginLeft: -3 }}
                  />
                  <Text style={[styles.reserveLabel, { color: focused ? "#DF5789" : "#CCCCCC" }]}>
                    Reserve
                  </Text>
                </View>
              </View>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />

      {/* 4. PURCHASED */}
      <Tabs.Screen
        name="history"
        options={{
          title: "Purchased",
          tabBarItemStyle: styles.purchasedItem,
          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              name="history"
              size={24}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
        }}
      />

      {/* 5. PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="person"
              size={24}
              color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const CIRCLE_SIZE = 78;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#DF5789",
    borderTopWidth: 0,
    height: Platform.OS === "ios" ? 106 : 90,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    paddingTop: Platform.OS === "ios" ? 8 : 6,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    position: "absolute",

    // iOS — negative Y pushes shadow upward
    shadowColor: "#4b1d2e",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -6 },
    // Android — elevation always goes downward, can't go up
    elevation: 20,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },

  walletItem: {
    marginRight: 20,
  },
  purchasedItem: {
    marginLeft: 20,
  },

  reserveRing: {
    width: CIRCLE_SIZE + 16,
    height: CIRCLE_SIZE + 16,
    borderRadius: (CIRCLE_SIZE + 16) / 2,
    backgroundColor: "#DF5789",
    justifyContent: "center",
    alignItems: "center",
  },
  reserveShadowWrapper: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    overflow: "visible",
    elevation: 8,
    backgroundColor: "#FFFFFF",
  },
  reserveCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  reserveLabel: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 1,
  },
});