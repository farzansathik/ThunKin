import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AntDesign from '@expo/vector-icons/AntDesign';
import { supabase } from "../../lib/supabase";
import Typography from "@/components/typography";

interface OrderItem {
  id: string;
  order_id: string;
  menu_id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  user_id: string;
  rest_id: string;
  restaurant_name: string;
  cafeteria_name: string;
  items: OrderItem[];
  total_price: number;
  status: "ready" | "pending" | string;
  pick_up_time: string;
  created_at: string | null;
}

interface GroupedOrders {
  ready: Order[];
  pending: Order[];
  [key: string]: Order[];
}

export default function HistoryScreen() {
  const [orders, setOrders] = useState<GroupedOrders>({
    ready: [],
    pending: [],
  });
  const [loading, setLoading] = useState(true);

  const pulseAnimReady = React.useRef(new Animated.Value(1)).current;
  const spinAnimOngoing = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Ready — pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimReady, {
          toValue: 1.15,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimReady, {
          toValue: 1,     
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Ongoing — spin
    Animated.loop(
      Animated.timing(spinAnimOngoing, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      { iterations: -1 }
    ).start();
  }, []);

  const spinOngoing = spinAnimOngoing.interpolate({
    inputRange: [0, 0.99, 1],
    outputRange: ["0deg", "356deg", "360deg"],
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("id", { ascending: false });

      if (ordersError) throw ordersError;

      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select("id, order_id, menu_id, rest_id");

      if (itemsError) throw itemsError;

      const { data: menuData, error: menuError } = await supabase
        .from("menu")
        .select("id, name, price");

      if (menuError) throw menuError;

      const { data: restData, error: restError } = await supabase
        .from("restaurant")
        .select("id, name");

      if (restError) throw restError;

      const menuMap = new Map(menuData?.map((m: any) => [m.id, m]) || []);
      const restMap = new Map(restData?.map((r: any) => [r.id, r]) || []);

      const itemsByOrder = new Map<string, OrderItem[]>();
      const restIdByOrder = new Map<string, number>();

      itemsData?.forEach((item: any) => {
        const menu = menuMap.get(item.menu_id);
        const orderItem: OrderItem = {
          id: item.id,
          order_id: item.order_id,
          menu_id: item.menu_id,
          name: menu?.name || "Unknown Item",
          price: menu?.price || 0,
          quantity: 1,
        };

        if (!itemsByOrder.has(item.order_id)) {
          itemsByOrder.set(item.order_id, []);
        }
        itemsByOrder.get(item.order_id)!.push(orderItem);

        if (!restIdByOrder.has(item.order_id) && item.rest_id) {
          restIdByOrder.set(item.order_id, item.rest_id);
        }
      });

      const completeOrders: Order[] = ordersData
        ?.map((order: any) => {
          const restId = restIdByOrder.get(order.id);
          const restaurant = restId ? restMap.get(restId) : null;
          return {
            id: order.id,
            user_id: order.user_id,
            rest_id: restId?.toString() || "",
            restaurant_name: restaurant?.name || "Unknown Restaurant",
            cafeteria_name: "Cafeteria",
            items: itemsByOrder.get(order.id) || [],
            total_price: order.total_price,
            status: order.status,
            pick_up_time: order.pick_up_time,
            created_at: order.created_at,
          };
        })
        .filter((order) => order.items.length > 0) || [];

      const groupedOrders: GroupedOrders = {
        ready: [],
        pending: [],
      };

      const todayStr = new Date().toLocaleDateString("en-CA");
      const todayDate = new Date(todayStr + "T00:00:00");

      completeOrders.forEach((order) => {
        if (order.status === "ready") {
          groupedOrders.ready.push(order);
        } else if (order.status === "pending") {
          groupedOrders.pending.push(order);
        } else if (order.status === "picked_up") {
          let dateKey = "Today";

          if (order.created_at) {
            const orderDateStr = order.created_at.slice(0, 10);
            const orderDate = new Date(orderDateStr + "T00:00:00");
            const diffTime = todayDate.getTime() - orderDate.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
              dateKey = "Today";
            } else if (diffDays === 1) {
              dateKey = "Yesterday";
            } else {
              dateKey = formatDate(orderDate);
            }
          }

          if (!groupedOrders[dateKey]) {
            groupedOrders[dateKey] = [];
          }
          groupedOrders[dateKey].push(order);
        }
      });

      setOrders(groupedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    const options = { year: "numeric", month: "long", day: "numeric" } as const;
    return date.toLocaleDateString("en-US", options);
  };

  const formatTime = (time: string): string => {
    if (!time) return "--:--";
    try {
      const date = new Date(time);
      if (isNaN(date.getTime())) {
        const clean = time.slice(0, 5);
        return `${clean} - ${addMinutes(clean, 10)}`;
      }
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const startTime = `${hours}:${minutes}`;
      return `${startTime} - ${addMinutes(startTime, 10)}`;
    } catch {
      return time.slice(0, 5);
    }
  };

  const getPickupTimeInMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) {
        const [h, m] = timeStr.slice(0, 5).split(":").map(Number);
        return h * 60 + m;
      }
      return date.getHours() * 60 + date.getMinutes();
    } catch {
      return 0;
    }
  };

  const sortOrdersByPickupTime = (orderList: Order[]): Order[] => {
    return [...orderList].sort((a, b) => {
      return getPickupTimeInMinutes(a.pick_up_time) - getPickupTimeInMinutes(b.pick_up_time);
    });
  };

  const addMinutes = (timeStr: string, minutesToAdd: number): string => {
    const [h, m] = timeStr.split(":").map(Number);
    const total = h * 60 + m + minutesToAdd;
    const newH = Math.floor(total / 60) % 24;
    const newM = total % 60;
    return `${newH.toString().padStart(2, "0")}:${newM.toString().padStart(2, "0")}`;
  };

  const renderOrderItem = (order: Order) => (
    <View key={order.id} style={styles.orderCard}>
      <View style={styles.orderCardLeft}>
        <View style={[styles.orderImage, { backgroundColor: "#E0E0E0" }]} />
      </View>

      <View style={styles.orderCardMiddle}>
        <Typography
          size={20}
          weight="bold"
          style={styles.foodName}
          numberOfLines={1}
        >
          {order.items[0]?.name}
        </Typography>

        <View style={styles.restaurantRow}>
          <Ionicons name="storefront-outline" size={14} color="#E95D91" />
          <Typography
            size={14}
            weight="medium"
            style={styles.restaurantName}
            numberOfLines={1}
          >
            {order.restaurant_name}
          </Typography>
        </View>

        {order.items.length > 1 && (
          <Typography size={12} style={styles.moreItems}>
            +{order.items.length - 1} more
          </Typography>
        )}

        <View style={styles.pickupRow}>
          <Typography weight="medium" size={12} style={styles.pickupLabel}>
            Pick-Up Time:{"  "}
          </Typography>
          <Typography fontType={3} weight="bold" size={16} style={styles.pickupValue}>
            {formatTime(order.pick_up_time)}
          </Typography>
        </View>
      </View>

      <View style={styles.orderCardRight}>
        <Typography size={20} weight="bold" style={styles.price}>
          ฿ {order.total_price}
        </Typography>
      </View>
    </View>
  );

  // ── Ready section ────────────────────────────────────────────────────────
  const renderReadySection = (orderList: Order[]) => {
    if (orderList.length === 0) return null;
    const sortedOrders = sortOrdersByPickupTime(orderList);

    return (
      <View style={styles.boxedSection}>
        <View style={styles.sectionHeaderInBox}>
          <Animated.View style={{ transform: [{ scale: pulseAnimReady }], marginRight: 8 }}>
            <AntDesign name="check-circle" size={20} color="#E95D91" />
          </Animated.View>
          <Typography size={16} weight="bold" style={styles.sectionTitleBoxed}>
            Ready
          </Typography>
          <View style={styles.sectionLineReady} />
        </View>
        <View style={styles.ordersListInBox}>
          {sortedOrders.map(renderOrderItem)}
        </View>
      </View>
    );
  };

  // ── Ongoing section ──────────────────────────────────────────────────────
  const renderOngoingSection = (orderList: Order[]) => {
    if (orderList.length === 0) return null;
    const sortedOrders = sortOrdersByPickupTime(orderList);

    return (
      <View>
        <View style={styles.sectionHeader}>
          <Animated.View style={{ transform: [{ rotate: spinOngoing }], marginRight: 8 }}>
            <MaterialCommunityIcons name="timer-sand" size={20} color="#888888" />
          </Animated.View>
          <Typography size={16} weight="bold" style={styles.sectionTitle}>
            Ongoing
          </Typography>
          <View style={styles.sectionLine} />
        </View>
        <View style={styles.ordersList}>
          {sortedOrders.map(renderOrderItem)}
        </View>
      </View>
    );
  };

  // ── Date-grouped history sections ────────────────────────────────────────
  const renderSection = (title: string, orderList: Order[]) => {
    if (orderList.length === 0) return null;
    const sortedOrders = sortOrdersByPickupTime(orderList);

    return (
      <View key={title}>
        <View style={styles.sectionHeader}>
          <View style={styles.pinkBar} />
          <Typography size={16} weight="bold" style={styles.sectionTitle}>
            {title}
          </Typography>
          <View style={styles.sectionLine} />
        </View>
        <View style={styles.ordersList}>
          {sortedOrders.map(renderOrderItem)}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Typography size={28} weight="bold" style={styles.headerTitle}>
            Order History
          </Typography>
        </View>
        <ActivityIndicator
          size="large"
          color="#E95D91"
          style={{ marginTop: 50 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Typography size={28} weight="bold" style={styles.headerTitle}>
          Order History
        </Typography>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.topPadding} />

        {/* Recent Orders label */}
        <View style={styles.recentOrdersLabel}>
          <View style={styles.pinkBarLarge} />
          <Typography size={28} weight="bold" style={styles.recentTitle}>
            Recent Orders
          </Typography>
        </View>

        {renderReadySection(orders.ready)}
        {renderOngoingSection(orders.pending)}

        {/* History Orders section */}
        {Object.entries(orders).filter(
          ([key]) => key !== "ready" && key !== "pending" && orders[key].length > 0
        ).length > 0 ? (
          <>
            <View style={styles.historyOrdersLabel}>
              <Ionicons name="receipt-outline" size={26} color="#888888" style={{ marginRight: 10 }} />
              <Typography size={28} weight="bold" style={styles.historyTitle}>
                History Orders
              </Typography>
            </View>

            {Object.entries(orders)
              .filter(
                ([key]) =>
                  key !== "ready" && key !== "pending" && orders[key].length > 0
              )
              .map(([dateKey, orderList]) =>
                renderSection(dateKey, orderList as Order[])
              )}
          </>
        ) : (
          <View style={styles.noHistoryContainer}>
            <Typography size={18} weight="bold" style={styles.noHistoryText}>
              No History Orders
            </Typography>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffbd",
  },
  header: {
    height: 115,
    backgroundColor: "#E95D91",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 26,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  headerTitle: {
    color: "#ffffff",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  topPadding: {
    height: 12,
  },
  bottomPadding: {
    height: 125,
  },
  recentOrdersLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  pinkBarLarge: {
    width: 5,
    height: 32,
    borderRadius: 4,
    backgroundColor: "#E95D91",
    marginRight: 12,
  },
  recentTitle: {
    color: "#454545",
    marginLeft: 4
  },
  historyOrdersLabel: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    marginTop: 50,
  },
  historyTitle: {
    color: "#454545",
    marginLeft: 4
  },
  noHistoryContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  noHistoryText: {
    color: "#999999",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 12,
  },
  sectionHeaderInBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  boxedSection: {
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#ffeaf1",
    borderWidth: 1.5,
    borderColor: "#fadee9",
    shadowColor: "#E95D91",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pinkBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: "#E95D91",
    marginRight: 10,
  },
  sectionLineReady: {
    flex: 1,
    height: 2,
    backgroundColor: "#f5b8d0",
    marginLeft: 10,
    borderRadius: 2,
  },
  sectionTitle: {
    color: "#2D2D2D",
    fontSize: 16,
  },
  sectionTitleBoxed: {
    color: "#E95D91",
    fontSize: 16,
  },
  sectionLine: {
    flex: 1,
    height: 0.8,
    backgroundColor: "#CCCCCC",
    marginLeft: 10,
  },
  ordersList: {
    gap: 10,
  },
  ordersListInBox: {
    gap: 8,
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#ebebeb",
    elevation: 1,
  },
  orderCardLeft: {
    marginRight: 12,
  },
  orderImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#E0E0E0",
  },
  orderCardMiddle: {
    flex: 1,
    justifyContent: "flex-start",
    gap: 3,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  restaurantName: {
    color: "#8f8f8f",
    marginLeft: 6,
    maxWidth: 140,
  },
  restaurantRow: {
    bottom: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  foodName: {
    color: "#454545",
  },
  pickupRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  pickupLabel: {
    color: "#222222",
  },
  pickupValue: {
    color: "#E95D91",
  },
  moreItems: {
    color: "#999999",
    marginBottom: 4,
  },
  pickupTime: {
    color: "#2D2D2D",
  },
  orderCardRight: {
    alignItems: "flex-end",
    alignSelf: "flex-start",
    marginLeft: 8,
  },
  price: {
    color: "#E95D91",
  },
});