import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../lib/supabase";

// 1. Define the interfaces to fix TypeScript 'any' errors
interface TimeSlot {
  time: string;
  startTime: Date;
  available: number;
}

interface HourGroup {
  hour: string;
  slots: TimeSlot[];
}

export default function TimeSlotScreen() {
  const router = useRouter();
  const { shopId, shopName } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [timeGroups, setTimeGroups] = useState<HourGroup[]>([]);

  const MAX_CAPACITY = 15;

  const generateAndFetchSlots = async () => {
    setLoading(true);
    
    // Fetch confirmed orders to calculate real-time availability
    const { data: orders } = await supabase
      .from("orders")
      .select("pick_up_time")
      .eq("paid", true);

    const groups: HourGroup[] = [];
    const hours = [11, 12, 13]; // Lunch hours

    hours.forEach((h) => {
      const slots: TimeSlot[] = [];
      for (let m = 0; m < 60; m += 10) {
        const start = new Date();
        start.setHours(h, m, 0, 0);
        
        // Match orders to this specific 10-minute window
        const orderCount = orders?.filter(o => {
          const pickTime = new Date(o.pick_up_time);
          return pickTime.getTime() === start.getTime();
        }).length || 0;

        slots.push({
          time: `${h}:${m === 0 ? "00" : m} - ${m + 10 === 60 ? h + 1 : h}:${m + 10 === 60 ? "00" : m + 10}`,
          startTime: start,
          available: Math.max(0, MAX_CAPACITY - orderCount),
        });
      }
      groups.push({ hour: `${h}:00`, slots });
    });

    setTimeGroups(groups);
    setLoading(false);
  };

  useEffect(() => {
    generateAndFetchSlots();
  }, [shopId]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.shopBadge}><Text style={styles.shopBadgeText}>1</Text></View>
          <Text style={styles.headerTitle}>{shopName || "Restaurant"}</Text>
        </View>
        <Text style={styles.headerSubtitle}>06:00 - 16:45</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#E95D91" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.titleSection}>
            <View style={styles.pinkIndicator} />
            <Text style={styles.sectionTitle}>Select a time slot</Text>
          </View>

          {timeGroups.map((group) => (
            <View key={group.hour} style={styles.hourSection}>
              <View style={styles.hourHeader}>
                <Text style={styles.hourLabel}>{group.hour}</Text>
                <div style={styles.hourLine} />
              </View>
              
              <View style={styles.slotsGrid}>
                {group.slots.map((slot: TimeSlot) => {
                  const isFull = slot.available === 0;
                  const isLow = slot.available > 0 && slot.available <= 5;
                  const badgeColor = isFull ? "#CCCCCC" : isLow ? "#FFB74D" : "#81C784";

                  return (
                    <TouchableOpacity 
                      key={slot.time} 
                      style={[styles.slotCard, isFull && styles.disabledCard]}
                      disabled={isFull}
                      onPress={() => router.push({
                        pathname: "/menu",
                        params: { shopId, shopName, slotTime: slot.startTime.toISOString() }
                      })}
                    >
                      <View style={[styles.availableBadge, { backgroundColor: badgeColor }]}>
                        <Text style={styles.availableLabel}>Available</Text>
                        <Text style={styles.availableNum}>{slot.available}</Text>
                      </View>
                      <Text style={[styles.slotTimeText, { color: isFull ? "#999" : "#333" }]}>
                        {slot.time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: { backgroundColor: "#E95D91", paddingTop: 50, paddingBottom: 20, alignItems: 'center' },
  backButton: { position: 'absolute', left: 20, top: 55 },
  headerInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  shopBadge: { backgroundColor: 'white', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  shopBadgeText: { color: '#E95D91', fontWeight: 'bold', fontSize: 12 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  
  scrollContent: { padding: 20, paddingBottom: 100 },
  titleSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  pinkIndicator: { width: 4, height: 22, backgroundColor: '#E95D91', borderRadius: 2, marginRight: 10 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  
  hourSection: { marginBottom: 25 },
  hourHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  hourLabel: { fontSize: 14, color: '#BBB', fontWeight: '600', width: 45 },
  hourLine: { flex: 1, height: 1, backgroundColor: '#EEE' },
  
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  slotCard: { 
    width: '48%', 
    backgroundColor: 'white', 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#EEE', 
    elevation: 2,
    overflow: 'hidden'
  },
  disabledCard: { backgroundColor: '#FAFAFA', opacity: 0.7 },
  availableBadge: { paddingVertical: 8, paddingHorizontal: 6, alignItems: 'center', width: 55 },
  availableLabel: { fontSize: 7, color: 'white', fontWeight: 'bold', textTransform: 'uppercase' },
  availableNum: { fontSize: 18, color: 'white', fontWeight: 'bold' },
  slotTimeText: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600' }
});