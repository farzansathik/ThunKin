import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { Stack } from "expo-router";
import Typography from "@/components/typography";

export default function Vendor() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        {/* Sidebar */}
        <View style={[styles.sidebar, !sidebarOpen && styles.sidebarClosed]}>

          {/* Hamburger toggle button */}
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setSidebarOpen(!sidebarOpen)}
          >
            <View style={styles.dash} />
            <View style={styles.dash} />
            <View style={styles.dash} />
          </TouchableOpacity>

          {sidebarOpen && (
            <>
              <Typography weight="bold" size={28} color="#fff" style={styles.logo}>
                Queue
              </Typography>

              <TouchableOpacity style={styles.menuItem}>
                <Typography weight="regular" size={18} color="#fff">
                  Dashboard
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <Typography weight="regular" size={18} color="#fff">
                  History
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <Typography weight="regular" size={18} color="#fff">
                  Wallet
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <Typography weight="regular" size={18} color="#fff">
                  QR Reader
                </Typography>
              </TouchableOpacity>
            </>
          )}
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
                <Typography fontType={3} weight="bold" size={20}>
                  {col.time}
                </Typography>
              </View>

              <View style={styles.cardContainer}>
                {col.items.map((item, i) => (
                  <View key={i} style={styles.card}>
                    <Typography weight="medium" size={18} style={styles.food}>
                      {item.name}
                    </Typography>

                    <View
                      style={[
                        styles.qtyBox,
                        item.qty === 0 ? styles.gray : styles.green,
                      ]}
                    >
                      <Typography weight="bold" size={20}>
                        {item.qty}
                      </Typography>
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

  sidebarClosed: {
    width: 52,
    paddingHorizontal: 8,
  },

  toggleButton: {
    width: 36,
    height: 36,
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },

  dash: {
    width: 18,
    height: 2,
    backgroundColor: "#fff",
    borderRadius: 2,
  },

  logo: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    marginBottom: 40,
    marginTop: 16,
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