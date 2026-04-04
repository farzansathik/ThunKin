import { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { Stack, useRouter } from "expo-router";
import Typography from "@/components/typography";
import OrderInTimeSlot, { FoodItem } from "@/components/vendor_components/OrderInTimeSlot";
import ShelfBottomSheet from "@/components/vendor_components/ShelfBottomSheet";
import AvailableSpaceButton from "@/components/vendor_components/AvailableSpaceButton";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useUser } from "../context/UserContext";
import { getCurrentDebugTime, getCurrentDateString } from "../utils/debugTime";

type Column = {
  time: string;
  items: FoodItem[];
  isActive?: boolean;
};

// Must match columnWrapper width + marginRight in OrderInTimeSlot.tsx
const COLUMN_WIDTH = 320 + 16;

export default function Vendor() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [shelfBottomSheetOpen, setShelfBottomSheetOpen] = useState(false);
  const [columns, setColumns] = useState<Column[]>([]);
  const [vendorName, setVendorName] = useState("");
  const [selectedItem, setSelectedItem] = useState<{ id: number; name: string } | null>(null);
  const { restId } = useUser();
  const router = useRouter();

  const scrollRef = useRef<ScrollView>(null);
  const activeIndexRef = useRef<number>(-1);
  const nextOrderIndexRef = useRef<number>(-1);
  const [jumpedToOrder, setJumpedToOrder] = useState(false);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!restId) return;

    // 1. Fetch restaurant info
    const { data: restData, error: restError } = await supabase
      .from("restaurant")
      .select("open_time, close_time, vendor_name")
      .eq("id", restId)
      .single();

    console.log("restData:", restData, "restError:", restError);

    if (restError || !restData) {
      console.error("Failed to fetch restaurant:", restError);
      return;
    }

    setVendorName(restData.vendor_name ?? "");

    // 2. Generate ALL 10-min slots between open and close
    const allSlots = generateSlots(restData.open_time, restData.close_time);

    // 3. Fetch today's order_items — pending AND ready
    //    pending = still in queue (show with actual qty)
    //    ready   = already on shelf (show with qty 0, card stays visible)
    const todayStr = getCurrentDateString();

    const { data: orderItems, error: orderError } = await supabase
      .from("order_items")
      .select(`
        id,
        quantity,
        status,
        orders!inner ( pick_up_time ),
        menu!inner ( name )
      `)
      .eq("rest_id", restId)
      .in("status", ["pending", "ready"])      // ← fetch both
      .gte("orders.pick_up_time", `${todayStr} 00:00:00`)      // today's orders only
      .lte("orders.pick_up_time", `${todayStr} 23:59:59`);

    console.log("todayStr:", todayStr);
    console.log("pick_up_time stored as:", "2026-04-04 06:30:00");
    console.log("filter gte:", `${todayStr} 00:00:00`);

    console.log("orderItems:", orderItems);
    console.log("orderError:", orderError);
    console.log("ALL orderItems:", orderItems);

    if (orderError) {
      console.error("Failed to fetch orders:", orderError);
      return;
    }

    // 4. Group orders by 10-min slot key
    //    pending items contribute their qty
    //    ready items contribute 0 (already on shelf)
    const grouped: Record<string, FoodItem[]> = {};

    (orderItems || []).forEach((item: any) => {
      const pickUpTime = new Date(item.orders.pick_up_time);
      const slotKey = toSlotKey(pickUpTime);
      if (!grouped[slotKey]) grouped[slotKey] = [];

      const displayQty = item.status === "pending" ? item.quantity : 0;

      const existing = grouped[slotKey].find(f => f.name === item.menu.name);
      if (existing) {
        existing.qty += displayQty;
        existing.ids.push(item.id);
      } else {
        grouped[slotKey].push({
          id: item.id,
          ids: [item.id],
          name: item.menu.name,
          qty: displayQty,
        });
      }
    });

    // Sort each slot's items by qty descending on load (0s sink to bottom)
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => b.qty - a.qty);
    });

    const now = getCurrentDebugTime();

    // 5. Build columns with correct visibility rules:
    //
    //    SHOW if ANY of these are true:
    //      - Slot is currently active (now is within this window)
    //      - Slot is in the future (startDate > now) — even if empty
    //      - Slot is past BUT has orders (show even if all 0 so vendor can see)
    //
    //    HIDE only when:
    //      - Slot is fully past AND has no orders at all
    const builtColumns: Column[] = [];
    let foundActiveIndex = -1;
    let foundNextOrderIndex = -1;

    allSlots.forEach(({ start, end, startDate }) => {
      const slotEndDate = new Date(startDate);
      slotEndDate.setMinutes(slotEndDate.getMinutes() + 10);

      const isActive = now >= startDate && now < slotEndDate;
      const isFutureOrCurrent = startDate >= now || isActive;
      const hasOrders = !!(grouped[start] && grouped[start].length > 0);
      const allItemsZero = hasOrders && grouped[start].every(item => item.qty === 0);
      const isPastWithOrders = slotEndDate <= now && hasOrders;

      // Hide only: fully past + no orders at all
      if (!isFutureOrCurrent && !isPastWithOrders) return;

      const colIndex = builtColumns.length;

      if (isActive) foundActiveIndex = colIndex;

      // Next slot AFTER active that has orders with qty > 0
      if (
        foundActiveIndex >= 0 &&
        colIndex > foundActiveIndex &&
        hasOrders &&
        !allItemsZero &&
        foundNextOrderIndex === -1
      ) {
        foundNextOrderIndex = colIndex;
      }

      builtColumns.push({
        time: `${start} - ${end}`,
        items: grouped[start] ?? [],
        isActive,
      });
    });

    activeIndexRef.current = foundActiveIndex;
    nextOrderIndexRef.current = foundNextOrderIndex;
    setColumns(builtColumns);
  }, [restId]);

  useEffect(() => {
    if (!restId) return;

    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  // ── Decrease qty by 1, consume first id from ids, sort so 0s sink ────
  const handleAssigned = async (itemId: number) => {
    // Update database: mark as ready (on shelf) and update timestamp
    await supabase
      .from("order_items")
      .update({ status: "ready", updated_at: getCurrentDebugTime().toISOString() })
      .eq("id", itemId)
    
    setColumns(prev => {
      const updatedColumns = prev.map(col => ({
        ...col,
        items: col.items
          .map(item => {
            if (item.id !== itemId) return item;
            const remainingIds = item.ids.slice(1); // remove first id (just assigned)
            return {
              ...item,
              ids: remainingIds,
              id: remainingIds[0] ?? item.id,       // next id becomes active
              qty: Math.max(0, item.qty - 1),
            };
          })
          .sort((a, b) => b.qty - a.qty),
      }));
      
      // Check if there are still more items of this type with qty > 0
      let nextItemId: number | null = null;
      const selectedItemName = selectedItem?.name;
      
      for (const col of updatedColumns) {
        for (const item of col.items) {
          if (item.name === selectedItemName && item.qty > 0 && item.ids.length > 0) {
            nextItemId = item.ids[0];
            break;
          }
        }
        if (nextItemId) break;
      }
      
      // Update selection: if more items exist, keep it with new id; otherwise deselect
      if (nextItemId) {
        setSelectedItem({ id: nextItemId, name: selectedItemName! });
      } else {
        setSelectedItem(null);
      }
      
      return updatedColumns;
    });
  };

  // ── Increase qty by 1 when returned from shelf, re-sort ───────────────
  const handleCleared = async (itemId: number) => {
    // Update database: mark back as pending (return to queue) and update timestamp
    await supabase
      .from("order_items")
      .update({ status: "pending", updated_at: getCurrentDebugTime().toISOString() })
      .eq("id", itemId)
    
    // Re-fetch orders to properly merge returned items with existing orders of same food
    await fetchOrders();
  };

  // ── Item selection — tap same item again to deselect, auto-open shelf ──
  const handleSelectItem = (item: FoodItem) => {
    setSelectedItem(prev => {
      const isCurrentlySelected = prev?.id === item.ids[0];
      const newSelection = isCurrentlySelected ? null : { id: item.ids[0], name: item.name };
      
      // Auto-open shelf when selecting, auto-close when deselecting
      if (newSelection) {
        setShelfBottomSheetOpen(true);
      } else {
        setShelfBottomSheetOpen(false);
      }
      
      return newSelection;
    });
  };

  const jumpToActive = () => {
    const idx = activeIndexRef.current;
    if (idx < 0) return;
    scrollRef.current?.scrollTo({ x: idx * COLUMN_WIDTH, animated: true });
    setJumpedToOrder(false);
  };

  const jumpToNextOrder = () => {
    if (jumpedToOrder) {
      jumpToActive();
      return;
    }
    const idx = nextOrderIndexRef.current;
    if (idx < 0) return;
    scrollRef.current?.scrollTo({ x: idx * COLUMN_WIDTH, animated: true });
    setJumpedToOrder(true);
  };

  const generateSlots = (openTime: string, closeTime: string) => {
    const slots: { start: string; end: string; startDate: Date }[] = [];
    const base = getCurrentDebugTime();
    const today = new Date(base);
    today.setHours(0, 0, 0, 0);

    const [openH, openM] = openTime.split(":").map(Number);
    const [closeH, closeM] = closeTime.split(":").map(Number);

    const cursor = new Date(today);
    cursor.setHours(openH, openM + 20, 0, 0); // 20 min after open

    const closeDate = new Date(today);
    closeDate.setHours(closeH, closeM - 30, 0, 0); // 30 min before close

    while (cursor <= closeDate) {
      const startStr = formatTime(cursor);
      const next = new Date(cursor);
      next.setMinutes(next.getMinutes() + 10);
      const endStr = formatTime(next);

      slots.push({
        start: startStr,
        end: endStr,
        startDate: new Date(cursor),
      });

      cursor.setMinutes(cursor.getMinutes() + 10);
    }

    return slots;
  };

  const formatTime = (date: Date) => {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  };

  const toSlotKey = (date: Date) => {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(Math.floor(date.getMinutes() / 10) * 10).padStart(2, "0");
    return `${h}:${m}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(w => w[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "V";
  };

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

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.container}>

        {/* ── Sidebar ──────────────────────────────────────── */}
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
                <Typography weight="regular" size={20} color="#fff">
                  Order Control
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <Typography weight="regular" size={20} color="#fff">
                  Dashboard
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <Typography weight="regular" size={20} color="#fff">
                  History
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <Typography weight="regular" size={20} color="#fff">
                  Wallet
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <Typography weight="regular" size={20} color="#fff">
                  QR Reader
                </Typography>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.spacer} />

          {/* Bottom profile */}
          {sidebarOpen ? (
            <View style={styles.profileRow}>
              <TouchableOpacity onPress={handleLogout}>
                <View style={styles.avatar}>
                  <Typography weight="bold" size={16} color="#E15284">
                    {getInitials(vendorName)}
                  </Typography>
                </View>
              </TouchableOpacity>

              <View style={styles.profileText}>
                <Typography weight="bold" size={15} color="#fff">
                  {vendorName || "Vendor"}
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
                  <Typography weight="bold" size={16} color="#E15284">
                    {getInitials(vendorName)}
                  </Typography>
                </View>
              </TouchableOpacity>
            </View>
          )}

        </View>

        {/* ── Right panel ───────────────────────────────────── */}
        <View style={styles.rightPanel}>

          {/* Top bar */}
          <View style={styles.topBar}>

            {/* Jump buttons on the left */}
            <View style={styles.topBarButtons}>

              <TouchableOpacity
                style={styles.topBarButton}
                onPress={jumpToActive}
              >
                <Ionicons name="time-outline" size={18} color="#E15284" />
                <Typography
                  weight="medium"
                  size={14}
                  color="#E15284"
                  style={styles.topBarButtonText}
                >
                  Now
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.topBarButton,
                  jumpedToOrder && styles.topBarButtonActive,
                ]}
                onPress={jumpToNextOrder}
                disabled={nextOrderIndexRef.current < 0}
              >
                <Ionicons
                  name={jumpedToOrder ? "arrow-back-outline" : "arrow-forward-outline"}
                  size={18}
                  color={
                    jumpedToOrder ? "#fff"
                    : nextOrderIndexRef.current < 0 ? "#CCC"
                    : "#E15284"
                  }
                />
                <Typography
                  weight="medium"
                  size={14}
                  color={
                    jumpedToOrder ? "#fff"
                    : nextOrderIndexRef.current < 0 ? "#CCC"
                    : "#E15284"
                  }
                  style={styles.topBarButtonText}
                >
                  {jumpedToOrder ? "Back to Now" : "Next Order"}
                </Typography>
              </TouchableOpacity>

            </View>

            {/* Logo on the far right */}
            <Image
              source={require("../assets/images/Thunkin_images/THUNKIN_logo_black.png")}
              style={styles.topBarLogo}
              resizeMode="contain"
            />

          </View>

          {/* Main horizontal scroll */}
          <ScrollView
            ref={scrollRef}
            horizontal
            style={styles.main}
            contentContainerStyle={styles.mainContent}
            showsHorizontalScrollIndicator={false}
          >
            {columns.map((col) => (
              <OrderInTimeSlot
                key={col.time}
                time={col.time}
                items={col.items}
                isActive={col.isActive}
                selectedItemId={selectedItem?.id ?? null}
                onSelectItem={handleSelectItem}
                onRefresh={fetchOrders}
              />
            ))}
          </ScrollView>

        </View>

        <AvailableSpaceButton onPress={() => setShelfBottomSheetOpen(true)} />

        <ShelfBottomSheet
          isVisible={shelfBottomSheetOpen}
          onClose={() => setShelfBottomSheetOpen(false)}
          restId={restId!}
          selectedItemId={selectedItem?.id ?? null}
          selectedFoodName={selectedItem?.name ?? null}
          onAssigned={handleAssigned}
          onCleared={handleCleared}
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

  spacer: {
    flex: 0.9,
  },

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
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  profileText: {
    flex: 1,
  },

  rightPanel: {
    flex: 1,
    flexDirection: "column",
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },

  topBarButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  topBarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E15284",
    backgroundColor: "#fff",
  },

  topBarButtonActive: {
    backgroundColor: "#E15284",
    borderColor: "#E15284",
  },

  topBarButtonText: {
    letterSpacing: 0.2,
  },

  topBarLogo: {
    height: "200%",
    width: 150,
    opacity: 0.8,
  },

  main: {
    flex: 1,
    backgroundColor: "#eaecf0",
  },

  mainContent: {
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
    bottom: 10,
  },
});