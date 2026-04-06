import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Animated, Easing, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Typography from "@/components/typography";
import { toJpegUrl } from "@/utils/imageUtils";

interface OrderItem {
  id: string;
  order_id: string;
  menu_id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
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
  updated_at: string | null;
  created_at: string | null;
}

interface Props {
  order: Order;
  formatTime: (time: string) => string;
}

export default function OrderHistoryCard({ order, formatTime }: Props) {
  const router = useRouter();
  const pulseAnimReady = React.useRef(new Animated.Value(1)).current;
  const [imgError, setImgError] = useState(false);

  React.useEffect(() => {
    if (order.status === "ready" && order.updated_at) {
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
    }
  }, [order.status, order.updated_at]);

  const handleQRPress = () => {
    const firstItem = order.items[0];
    if (firstItem) {
      router.push({
        pathname: "/pickup",
        params: {
          foodId: firstItem.menu_id,
          foodName: firstItem.name,
          shopId: order.rest_id,
          shopName: order.restaurant_name,
          slotTime: formatTime(order.pick_up_time),
          orderId: order.id,       
          orderItemId: firstItem.id, 
        },
      });
    }
  };

  const firstItem = order.items[0];
  const imageUrl = toJpegUrl(firstItem?.image_url);
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderCardLeft}>
        {imageUrl && !imgError ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.orderImage}
            onError={() => setImgError(true)}
          />
        ) : (
          <View style={[styles.orderImage, styles.fallbackImage]}>
            <Ionicons
              name="fast-food"
              size={35}
              color="#77777733"
            />
          </View>
        )}
      </View>

      <View style={styles.orderCardMiddle}>
        <Typography
          size={18}
          weight="bold"
          style={styles.foodName}
          numberOfLines={1}
        >
          {order.items[0]?.name}
        </Typography>

        {order.cafeteria_name && (
          <View style={styles.cafeteriaRow}>
            <Ionicons name="location-outline" size={12} color="#E95D91" />
            <Typography
              size={12}
              weight="medium"
              style={styles.cafeteriaName}
              numberOfLines={1}
            >
              {order.cafeteria_name}
            </Typography>
          </View>
        )}

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

        {order.status !== "ready" && (
          <View style={styles.pickupRow}>
            <Typography weight="medium" size={12} style={styles.pickupLabel}>
              Pick-Up:{"  "}
            </Typography>
            <Typography fontType={3} weight="bold" size={16} style={styles.pickupValue}>
              {formatTime(order.pick_up_time)}
            </Typography>
          </View>
        )}

        {order.updated_at && order.status === "ready" && (
          <View>
            <View style={styles.readyTimeBadge}>
              {/* <Animated.View style={{ transform: [{ scale: pulseAnimReady }] }}>
                <Ionicons name="checkmark-circle" size={12} color="#ffffff" />
              </Animated.View> */}
              <Ionicons name="checkmark-circle" size={12} color="#ffffff" />
              <Typography weight="bold" size={11} style={styles.readyTimeLabel}>
                Ready:
              </Typography>
              <Typography fontType={3} weight="bold" size={12} style={styles.readyTimeBadgeText}>
                {formatTime(order.updated_at)}
              </Typography>
            </View>
          </View>
        )}
      </View>

      <View style={styles.orderCardRight}>
        <Typography size={20} weight="bold" style={styles.price}>
          ฿ {order.total_price}
        </Typography>

        {order.status === "ready" && (
        <TouchableOpacity style={styles.qrButton} onPress={handleQRPress}>
            <Ionicons name="qr-code-sharp" size={48} color="#bcbcbc" />
        </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    width: 95,
    height: 95,
    borderRadius: 10,
    backgroundColor: "#E0E0E0",
  },
  fallbackImage: {
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  orderCardMiddle: {
    flex: 1,
    justifyContent: "flex-start",
    gap: 3,
  },
  restaurantName: {
    color: "#8f8f8f",
    marginLeft: 6,
    maxWidth: 140,
  },
  restaurantRow: {
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  cafeteriaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: -4,
    bottom: 3,
  },
  cafeteriaName: {
    color: "#E95D91",
    marginLeft: 6,
    maxWidth: 140,
  },
  foodName: {
    color: "#454545",
  },
  pickupRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pickupLabel: {
    color: "#222222",
  },
  pickupValue: {
    color: "#E95D91",
  },
  readyTimeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#e95d90f1",
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  readyTimeLabel: {
    color: "#ffffff",
  },
  readyTimeBadgeText: {
    color: "#ffffff",
  },
  moreItems: {
    color: "#999999",
    marginBottom: 4,
  },
  orderCardRight: {
    alignItems: "flex-end",
    alignSelf: "flex-start",
    marginLeft: 8,
    gap: 8,
  },
  price: {
    color: "#E95D91",
  },
  qrButton: {
    alignItems: "flex-end",
    borderRadius: 5,
    backgroundColor: "#f0f0f063",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    top: 5,
    justifyContent: "space-between",
    aspectRatio: 1,
  },
});
