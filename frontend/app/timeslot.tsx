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
import { supabase } from "../lib/supabase";
import Typography from "@/components/typography";
import TimeSlotCard from "@/components/user_components/TimeSlotCard";

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
  const [restaurant, setRestaurant] = useState<{ id: number; open_time: string; close_time: string } | null>(null);
  const formatTime = (time: string) => time.slice(0, 5);
  const openTime = restaurant?.open_time ? formatTime(restaurant.open_time) : "--:--";
  const closeTime = restaurant?.close_time ? formatTime(restaurant.close_time) : "--:--";

  const MAX_CAPACITY = 16;

  const generateAndFetchSlots = async () => {
    setLoading(true);

    const { data: restaurantData } = await supabase
      .from("restaurant")
      .select("id, open_time, close_time")
      .eq("id", shopId)
      .single();

    if (restaurantData) setRestaurant(restaurantData);

    const { data: orders } = await supabase
      .from("orders")
      .select("pick_up_time")
      .eq("paid", true);

    const groups: HourGroup[] = [];
    const hours = [11, 12, 13]; 

    hours.forEach((h) => {
      const slots: TimeSlot[] = [];
      for (let m = 0; m < 60; m += 10) {
        const start = new Date();
        start.setHours(h, m, 0, 0);
        
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

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/restaurant");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.shopBadge}>
            <Typography weight="bold" size={16} style={{ color: '#E95D91'}}>{shopId}</Typography>
          </View>
          <Typography weight="bold" style={{ color: 'white', left: 5 }} size={28}>
            {shopName}
          </Typography>
        </View>
        <Typography weight="bold" style={{ color: 'rgba(255,255,255,0.65)' }} size={14}>
          {restaurant ? `${openTime} - ${closeTime}` : ""}
        </Typography>
      </View>
      <View style={styles.titleSection}>
        <View style={styles.pinkIndicator} />
        <Typography weight="bold" size={26} style={styles.sectionTitle}>
          Select a time slot
        </Typography>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#E95D91" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {timeGroups.map((group) => (
            <View key={group.hour} style={styles.hourSection}>
              <View style={styles.hourHeader}>
                <Typography fontType={3} size={14} style={styles.hourLabel}>
                  {group.hour}
                </Typography>
                <View style={styles.hourLine} />
              </View>
              
              <View style={styles.slotsGrid}>
                {group.slots.map((slot: TimeSlot) => (
                  <TimeSlotCard key={slot.time} slot={slot} shopId={shopId} shopName={shopName} />
                ))}
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
  header: { 
    backgroundColor: "#E95D91", 
    paddingTop: 40, 
    paddingBottom: 12, 
    alignItems: 'center',
    elevation: 10,
  },
  backButton: { 
    position: 'absolute',
    left: 10,     
    paddingTop: 48, 
  },
  headerInfo: { flexDirection: 'row', alignItems: 'center', left: 10},
  shopBadge: {
    position: 'absolute',
    backgroundColor: 'white',
    width: 30,
    height: 30,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10, 
    elevation: 10,
    marginLeft: -40,
  },
  scrollContent: { 
    paddingLeft: 18, 
    paddingRight: 18, 
  },
  titleSection: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20,
    paddingBottom: 5,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    height: 60,
    elevation: 10,
  },
  pinkIndicator: { 
    width: 5, 
    height: 30, 
    backgroundColor: '#E95D91', 
    borderRadius: 10, 
    marginRight: 10 
  },
  sectionTitle: { 
    color: '#454545' 
  },

  // body section
  hourSection: { marginBottom: 5 },
  hourHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  hourLabel: { color: '#474747', opacity: 0.65, width: 35},
  hourLine: { flex: 1, height: 0.8, backgroundColor: '#A1A1A1', opacity: 0.7},
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});