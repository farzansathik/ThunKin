import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  ActivityIndicator,
  Platform,
} from "react-native";
import { supabase } from "../lib/supabase";
import Typography from "@/components/typography";
import TimeSlotCard from "@/components/user_components/TimeSlotCard";
import RefreshableScrollView from "@/components/RefreshableScrollView";
import { getCurrentDebugTime, getCurrentDateString } from "../utils/debugTime";

interface TimeSlot {
  time: string;
  startTime: Date;
  available: number;
}

interface HourGroup {
  hour: string;
  slots: TimeSlot[];
}

const DEFAULT_CAPACITY = 12; // avg baseline shown to users
const MAX_CAPACITY = 16;

/** Parse "HH:MM:SS" or "HH:MM" into { h, m } */
function parseTime(t: string): { h: number; m: number } {
  const [h, m] = t.split(":").map(Number);
  return { h, m };
}

/** Build a Date for today at the given hour+minute */
function todayAt(h: number, m: number): Date {
  const d = getCurrentDebugTime();
  d.setHours(h, m, 0, 0);
  return d;
}

export default function TimeSlotScreen() {
  const router = useRouter();
  const { shopId, shopName, shopImage, shopNum } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [timeGroups, setTimeGroups] = useState<HourGroup[]>([]);
  const [restaurant, setRestaurant] = useState<{
    id: number;
    open_time: string;
    close_time: string;
  } | null>(null);

  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const formatTime = (time: string) => time.slice(0, 5);
  const openTime = restaurant?.open_time ? formatTime(restaurant.open_time) : "--:--";
  const closeTime = restaurant?.close_time ? formatTime(restaurant.close_time) : "--:--";

  // ─── Core: fetch restaurant + orders, build slots ──────────────────────────
  const buildSlots = async (showLoader = false) => {
    if (showLoader) setLoading(true);

    // 1. Fetch restaurant open/close times
    const { data: restaurantData } = await supabase
      .from("restaurant")
      .select("id, open_time, close_time")
      .eq("id", shopId)
      .single();

    if (!restaurantData) {
      setLoading(false);
      return;
    }
    setRestaurant(restaurantData);

    const { h: openH, m: openM } = parseTime(restaurantData.open_time);
    const { h: closeH, m: closeM } = parseTime(restaurantData.close_time);

    // 2. "Earliest bookable" = the LATER of (now + 30 min) OR (open + 30 min)
    const now = getCurrentDebugTime();
    const earliestFromNow = new Date(now.getTime() + 30 * 60 * 1000);
    const openDate = todayAt(openH, openM);
    const earliestFromOpen = new Date(openDate.getTime() + 30 * 60 * 1000);

    // Earliest bookable = whichever boundary is later
    const earliest = earliestFromNow > earliestFromOpen ? earliestFromNow : earliestFromOpen;

    // 3. "Latest slot start" = close - 30 min
    const closeDate = todayAt(closeH, closeM);
    const latestStart = new Date(closeDate.getTime() - 30 * 60 * 1000);

    // 4. Fetch all orders for THIS restaurant with a pick_up_time today
    const todayStr = getCurrentDateString(); // "YYYY-MM-DD"
    const { data: orders, error } = await supabase
      .from("orders")
      .select("pick_up_time, status, order_items!inner(rest_id)")
      .eq("order_items.rest_id", shopId)
      .neq("status", "picked_up")
      .gte("pick_up_time", `${todayStr}T00:00:00`)
      .lte("pick_up_time", `${todayStr}T23:59:59`);

    console.log("Orders fetched:", orders);

    // 5. Build a lookup: ISO-minute-string → count
    const countMap: Record<string, number> = {};
    orders?.forEach((o) => {
      const t = new Date(o.pick_up_time);
      // normalise to HH:MM on today
      const key = `${t.getHours()}:${String(t.getMinutes()).padStart(2, "0")}`;
      countMap[key] = (countMap[key] ?? 0) + 1;
    });

    // 6. Generate 10-min slots from open to latestStart
    const groups: HourGroup[] = [];
    let cursor = todayAt(openH, openM);
    let currentHour = -1;
    let currentGroup: HourGroup | null = null;

    while (cursor <= latestStart) {
      const h = cursor.getHours();
      const m = cursor.getMinutes();

      // Skip slots that are too soon (< now + 30 min)
      if (cursor < earliest) {
        cursor = new Date(cursor.getTime() + 10 * 60 * 1000);
        continue;
      }

      // Group by hour
      if (h !== currentHour) {
        currentHour = h;
        currentGroup = { hour: `${h}:00`, slots: [] };
        groups.push(currentGroup);
      }

      const next = new Date(cursor.getTime() + 10 * 60 * 1000);
      const fmt = (d: Date) =>
        `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;

      const key = `${h}:${String(m).padStart(2, "0")}`;
      const ordersInSlot = countMap[key] ?? 0;
      const available = Math.max(0, DEFAULT_CAPACITY - ordersInSlot);

      currentGroup!.slots.push({
        time: `${fmt(cursor)} - ${fmt(next)}`,
        startTime: new Date(cursor),
        available,
      });

      cursor = next;
    }

    setTimeGroups(groups);
    setLoading(false);
  };

  // ─── Real-time subscription on the orders table ────────────────────────────
  const subscribeRealtime = () => {
    // Clean up previous channel if any
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
    }

    const channel = supabase
      .channel(`orders-realtime-${shopId}`)
      .on(
        "postgres_changes",
        {
          event: "*",           // INSERT, UPDATE, DELETE
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${shopId}`,
        },
        () => {
          // Re-build slots whenever any order changes for this restaurant
          buildSlots();
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;
  };

  useFocusEffect(
    useCallback(() => {
      buildSlots(true); // spinner on first load only
      subscribeRealtime(); // instant updates when orders change
      
      // Also refresh every 60 s so the "earliest" window stays accurate
      const tick = setInterval(buildSlots, 60_000); // silent, just to advance time window

      // This cleanup runs when you LEAVE the page
      return () => {
        clearInterval(tick);
        if (realtimeChannelRef.current) {
          supabase.removeChannel(realtimeChannelRef.current);
          realtimeChannelRef.current = null;
        }
      };
    }, [shopId])
  );

  const handleBack = () => {
    router.back();
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
            <Typography weight="bold" size={16} style={{ color: "#E95D91" }}>
              {shopNum}
            </Typography>
          </View>
          <Typography weight="bold" style={{ color: "white", left: 5 }} size={28}>
            {shopName}
          </Typography>
        </View>
        <Typography
          weight="bold"
          style={{ color: "rgba(255,255,255,0.65)" }}
          size={14}
        >
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
        <ActivityIndicator
          size="large"
          color="#E95D91"
          style={{ marginTop: 50 }}
        />
      ) : timeGroups.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="time-outline" size={48} color="#ccc" />
          <Typography size={16} style={{ color: "#aaa", marginTop: 12 }}>
            No available time slots today
          </Typography>
        </View>
      ) : (
        <RefreshableScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onRefresh={buildSlots}
        >
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
                  <TimeSlotCard
                    key={slot.time}
                    slot={slot}
                    shopId={shopId}
                    shopName={shopName}
                    shopImage={shopImage}
                  />
                ))}
              </View>
            </View>
          ))}
        </RefreshableScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    backgroundColor: "#E95D91",
    paddingTop: Platform.OS === "ios" ? 55 : 40,
    paddingBottom: 12,
    alignItems: "center",
    elevation: 10,
  },
  backButton: {
    position: "absolute",
    left: 10,
    paddingTop: Platform.OS === "ios" ? 63 : 48,
  },
  headerInfo: { flexDirection: "row", alignItems: "center", left: 10 },
  shopBadge: {
    position: "absolute",
    backgroundColor: "white",
    width: 30,
    height: 30,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    elevation: 10,
    marginLeft: -40,
  },
  scrollContent: {
    paddingLeft: 18,
    paddingRight: 18,
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 5,
    paddingHorizontal: 20,
    backgroundColor: "white",
    height: 60,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  pinkIndicator: {
    width: 5,
    height: 30,
    backgroundColor: "#E95D91",
    borderRadius: 10,
    marginRight: 10,
  },
  sectionTitle: { color: "#454545" },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.5,
  },

  // body
  hourSection: { marginBottom: 5 },
  hourHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  hourLabel: { color: "#474747", opacity: 0.65, width: 35 },
  hourLine: {
    flex: 1,
    height: 0.8,
    backgroundColor: "#A1A1A1",
    opacity: 0.7,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});