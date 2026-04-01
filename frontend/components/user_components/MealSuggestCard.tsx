import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Typography from "@/components/typography";
import MiniTimeSlotCard from "./MiniTimeSlotCard";

interface MealItem {
  id: string;
  name: string;
  restaurant: string;
  price: number;
  timeSlot: string;
  timeStatus: "available" | "limited";
}

interface MealSuggestCardProps {
  meal: MealItem;
  onPress: (mealId: string) => void;
}

export default function MealSuggestCard({ meal, onPress }: MealSuggestCardProps) {
  return (
    <TouchableOpacity
      style={styles.mealCard}
      activeOpacity={0.8}
      onPress={() => onPress(meal.id)}
    >
      {/* PLACEHOLDER IMAGE AREA */}
      <View style={styles.imagePlaceholder}>
        <Ionicons name="image-outline" size={52} color="#CCC" />
      </View>

      {/* TIME SLOT BADGE */}
      <MiniTimeSlotCard
        timeSlot={meal.timeSlot}
        timeStatus={meal.timeStatus}
      />

      {/* MEAL INFO */}
      <View style={styles.mealInfo}>
        <View style={styles.nameSection}>
          <Typography
            weight="bold"
            size={22}
            style={styles.mealName}
          >
            {meal.name}
          </Typography>

          <Typography
            weight="bold"
            size={26}
            style={styles.priceText}
          >
            ฿ {meal.price}
          </Typography>
        </View>

        <Typography
          weight="bold"
          size={18}
          style={styles.restaurantText}
        >
          {meal.restaurant}
        </Typography>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  mealCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },

  imagePlaceholder: {
    width: "100%",
    height: 160,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF",
  },

  mealInfo: {
    padding: 12,
    paddingBottom: 0,
    backgroundColor: "#FFFFFF",
  },

  nameSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },

  mealName: {
    color: "#454545",
    flex: 1,
    marginRight: 8,
  },

  priceText: {
    color: "#E95D91",
    minWidth: 40,
  },

  restaurantText: {
    bottom: 12,
    color: "#E95D91",
  },
});