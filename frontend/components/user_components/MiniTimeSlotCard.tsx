import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Typography from "@/components/typography";

interface MiniTimeSlotCardProps {
  timeSlot: string;
  timeStatus: "available" | "limited";
}

export default function MiniTimeSlotCard({
  timeSlot,
  timeStatus,
}: MiniTimeSlotCardProps) {
  const isLimited = timeStatus === "limited";
  const badgeColor = isLimited ? "#FFBA42" : "#7EDD7E";
  const iconColor = isLimited ? "#67370A" : "#4A4A4A";

  return (
    <View style={styles.card}>

      {/* Left green badge with pencil */}
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <MaterialCommunityIcons name="pencil" size={16} color={iconColor} />
      </View>

      {/* Time text */}
      <View style={styles.timeContainer}>
        <Typography
          weight="bold"
          size={13}
          fontType={3}
          style={styles.timeText}
        >
          {timeSlot}
        </Typography>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    height: 30,
    width: 110,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  badge: {
    width: 26,
    height: 36,
    borderRadius: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  timeContainer: {
    paddingHorizontal: 10,
    justifyContent: "center",
  },

  timeText: {
    color: "#454545",
    right: 2,
  },
});