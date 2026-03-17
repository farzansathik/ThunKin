import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image 
} from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { Stack } from "expo-router";
import Typography from "@/components/typography";
import TimeSlotCard, { FoodItem } from "@/components/vendor_components/TimeSlotCard";  // น่าจะ bugged อย่าไปปรับเป็น non capital letter ตาม suggest เพราะมันจะหาย error เเต่โค้ดมันจะไม่เรียก script นั้น
import ShelfBottomSheet from "@/components/vendor_components/ShelfBottomSheet";
import AvailableSpaceButton from "@/components/vendor_components/AvailableSpaceButton";

import { Alert } from "react-native";
import { useRouter } from "expo-router";

type Column = {
  time: string;
  items: FoodItem[];
  isActive?: boolean; 
};

export default function Vendor() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [shelfBottomSheetOpen, setShelfBottomSheetOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => router.replace("/login"),
        },
      ]
    );
  };

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
  }, []);

  // ─── Replace this with ur real DB data later ───── (เวลาเมนูอาหารมาเยอะ สามารถ scroll ลงล่างได้)
  // ตอนทำ sync กับเวลาจริง คิดว่าควรจะใส่กรอบเวลา highlight สีต่างหากอีกที เพื่อให้แยกออกจากกรอบเวลาอื่นๆ ได้ง่ายๆ จะได้รู้ว่าอยู่ในช่วงเวลาไหนอยู่
  const columns: Column[] = [
    {
      time: "09:30 - 09:40",
      items: [
        { name: "ข้าวเหนียวไก่ทอด", qty: 3 },
        { name: "ข้าวเหนียวหมู", qty: 2 },
        { name: "ข้าวเหนียวไก่", qty: 1 },
        { name: "ข้าวสวย", qty: 0 },
      ],
      isActive: true, // ใช้สำหรับ mark ว่า column ไหนคือช่วงเวลาปัจจุบัน (รอ link กับ real time เเต่ตอนนี้ขอ hard code ไว้ก่อน)
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
      items: [
        { name: "ข้าวไข่ดาว", qty: 4 },
        { name: "ข้าวไข่เจียว", qty: 3 },
        { name: "ไก่ทอด", qty: 1 },
      ],
    },
    {
      time: "10:00 - 10:10",
      items: [], // in case no orders in this time slot, time slot will still show up but with empty card (เเต่สำหรับเวลาที่ผ่านมาเเล้วควรจะเอาออกเลย)
    },
    {
      time: "10:10 - 10:20",
      items: [
        { name: "ข้าวเหนียวไก่ทอด", qty: 3 },
        { name: "ข้าวเหนียวหมู", qty: 2 },
        { name: "ข้าวเหนียวไก่", qty: 1 },
      ],
    }
  ];
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>
        {/* Sidebar */}
        <View style={[styles.sidebar, !sidebarOpen && styles.sidebarClosed]}>
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
              <View style={styles.logoRow}>
                <View style={styles.verticalLine} />
                
                <Typography weight="bold" size={36} color="#fff" style={styles.logo}>
                  Queue
                </Typography>
              </View>

              <TouchableOpacity style={styles.menuItem}>
                <Typography weight="regular" size={20} color="#fff">Dashboard</Typography>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <Typography weight="regular" size={20} color="#fff">History</Typography>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <Typography weight="regular" size={20} color="#fff">Wallet</Typography>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <Typography weight="regular" size={20} color="#fff">QR Reader</Typography>
              </TouchableOpacity>
            </>
          )}

          {/* Spacer to push profile to bottom */}
          <View style={styles.spacer} />

          {/* Bottom Profile */}
          {sidebarOpen ? (
            <View style={styles.profileRow}>
              {/* Avatar — tap to log out */}
              <TouchableOpacity onPress={handleLogout}>
                <View style={styles.avatar}>
                  <Typography weight="bold" size={16} color="#E15284">
                      TD {/* change to real initials for log in later */}
                  </Typography>
                </View>
              </TouchableOpacity>

              <View style={styles.profileText}>
                <Typography weight="bold" size={15} color="#fff">
                  Thanatat_D {/* change to real name for log in later (อย่าลืมเปลี่ยนตัวย่อโปรไฟล์สองจุดด้วย) */}
                </Typography>
                <Typography weight="regular" size={12} color="rgba(255,255,255,0.7)">
                  Vendor
                </Typography>
              </View>
            </View>
          ) : (
            <View style={styles.avatarOnly}>
              <TouchableOpacity onPress={handleLogout}>
                <View style={styles.avatar}>
                  <Typography weight="bold" size={14} color="#E15284">
                    TD {/* change to real initials for log in later */}
                  </Typography>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Main Dashboard */}
        <ScrollView
          horizontal
          style={styles.main}
          contentContainerStyle={styles.mainContent}
          showsHorizontalScrollIndicator={false}
        >
          {columns.map((col, index) => (
            <TimeSlotCard
              key={index}
              time={col.time}
              items={col.items}
              isActive={col.isActive}
            />
          ))}
        </ScrollView>

        {/* Available Space Button - Bottom Right */}
        <AvailableSpaceButton onPress={() => setShelfBottomSheetOpen(true)} />
 
        {/* Shelf Bottom Sheet */}
        <ShelfBottomSheet
          isVisible={shelfBottomSheetOpen}
          onClose={() => setShelfBottomSheetOpen(false)}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#eaecf0",
  },

  sidebar: {
    width: 210,
    backgroundColor: "#E15284",
    paddingTop: 36,
    paddingHorizontal: 20,
  },

  sidebarClosed: {
    width: 60,
    paddingHorizontal: 8,
  },

  toggleButton: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },

  dash: {
    width: 20,
    height: 2.5,
    backgroundColor: "#fff",
    borderRadius: 2,
  },

  logo: {
    marginTop: 16,
    marginBottom: 20,
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  verticalLine: {
    width: 4,
    height: 32,
    backgroundColor: "#fff",
    borderRadius: 2,
  },

  menuItem: {
    paddingVertical: 16,
  },

  main: {
    flex: 1,
    backgroundColor: "#eaecf0",
  },

  mainContent: {
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  spacer: {
    flex: 0.9,
  },

  // Profile section at the bottom
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.25)",
  },
 
  avatarOnly: {
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.25)",
  },
 
  avatar: {
    paddingLeft: 4,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
 
  profileText: {
    flex: 1,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    width: "90%",
    height: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    flexDirection: "column",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },

  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  gridScrollView: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
});