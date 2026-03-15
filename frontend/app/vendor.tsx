import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { Stack } from "expo-router";

export default function Vendor() {
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);

    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
  }, []);

  const columns = [
    {
      time: "09:30 - 09:40",
      items: [
        { name: "ข้าวเหนียวไก่ทอด", qty: 3 },
        { name: "ข้าวเหนียวหมู", qty: 2 },
        { name: "ข้าวเหนียวไก่", qty: 1 },
        { name: "ข้าวสวย", qty: 0 },
      ],
    },
    {
      time: "09:40 - 09:50",
      items: [
        { name: "ข้าวไข่ดาว", qty: 4 },
        { name: "ข้าวไข่เจียว", qty: 3 },
        { name: "ไก่ทอด", qty: 1 },
      ],
    },
    {
      time: "09:50 - 10:00",
      items: [{ name: "ยำมาม่า", qty: 5 }],
    },
  ];

  return (
    <>
      {/* This removes the white header */}
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <Text style={styles.logo}>Queue</Text>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>QR Reader</Text>
          </TouchableOpacity>
        </View>

        {/* Main Dashboard */}
        <ScrollView
          horizontal
          style={styles.main}
          showsHorizontalScrollIndicator={false}
        >
          {columns.map((col, index) => (
            <View key={index} style={styles.column}>
              <View style={styles.columnHeader}>
                <Text style={styles.columnTitle}>{col.time}</Text>
              </View>

              <View style={styles.cardContainer}>
                {col.items.map((item, i) => (
                  <View key={i} style={styles.card}>
                    <Text style={styles.food}>{item.name}</Text>

                    <View
                      style={[
                        styles.qtyBox,
                        item.qty === 0 ? styles.gray : styles.green,
                      ]}
                    >
                      <Text style={styles.qty}>{item.qty}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },

  sidebar: {
    width: 180,
    backgroundColor: "#E15284",
    paddingTop: 40,
    paddingHorizontal: 20,
  },

  logo: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    marginBottom: 40,
  },

  menuItem: {
    paddingVertical: 14,
  },

  menuText: {
    color: "white",
    fontSize: 18,
  },

  main: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },

  column: {
    width: 300,
    borderRightWidth: 1,
    borderColor: "#ddd",
  },

  columnHeader: {
    padding: 20,
    backgroundColor: "#eee",
    alignItems: "center",
  },

  columnTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  cardContainer: {
    padding: 10,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
  },

  food: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },

  qtyBox: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },

  qty: {
    fontSize: 20,
    fontWeight: "bold",
  },

  green: {
    backgroundColor: "#86EFAC",
  },

  gray: {
    backgroundColor: "#d1d5db",
  },
});