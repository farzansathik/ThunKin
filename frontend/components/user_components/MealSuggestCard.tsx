import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Typography from "@/components/typography";
import MiniTimeSlotCard from "./MiniTimeSlotCard";

interface MealItem {
  id: string;
  name: string;
  restaurant: string;
  cafeteriaName?: string | null;
  price: number;
  timeSlot: string;
  timeStatus: "available" | "limited";
  imageUrl?: string | null;
  menuId: number;
  restaurantId: number;
  shopNum: number | null;
  shopImage?: string | null;
}

interface MealSuggestCardProps {
  meal: MealItem;
  onPress: (mealId: string) => void;
  onTimeSlotPress?: (meal: MealItem) => void;
}

export default function MealSuggestCard({ meal, onPress, onTimeSlotPress }: MealSuggestCardProps) {
  const [imageError, setImageError] = useState(false);
  const showImage = meal.imageUrl && !imageError;

  const handleTimeSlotPress = () => {
    if (onTimeSlotPress) {
      onTimeSlotPress(meal);
    }
  };

  return (
    <TouchableOpacity
      style={styles.mealCard}
      activeOpacity={0.8}
      onPress={() => onPress(meal.id)}
    >
      {/* IMAGE or PLACEHOLDER */}
      {showImage ? (
        <Image
          source={{ uri: meal.imageUrl! }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={52} color="#CCC" />
        </View>
      )}

      {/* TIME SLOT BADGE - CLICKABLE */}
      <TouchableOpacity
        style={styles.timeSlotBadgeContainer}
        onPress={handleTimeSlotPress}
        activeOpacity={0.7}
      >
        <MiniTimeSlotCard
          timeSlot={meal.timeSlot}
          timeStatus={meal.timeStatus}
        />
      </TouchableOpacity>

      {/* MEAL INFO */}
      <View style={styles.mealInfo}>

        {/* Name + Price row */}
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

        {/* Cafeteria - Shop name row */}
        <View style={styles.locationRow}>
          {meal.cafeteriaName ? (
            <>
              <Typography
                weight="bold"
                size={15}
                style={styles.cafeteriaText}
              >
                {meal.cafeteriaName}
              </Typography>

              <Typography
                weight="bold"
                size={15}
                style={styles.dashText}
              >
                {" - "}
              </Typography>

              <Typography
                weight="medium"
                size={15}
                style={styles.shopText}
              >
                {meal.restaurant}
              </Typography>
            </>
          ) : (
            <Typography
              weight="bold"
              size={15}
              style={styles.cafeteriaText}
            >
              {meal.restaurant}
            </Typography>
          )}
        </View>

      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  mealCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: "#F0F0F0",
    height: 235,
  },

  image: {
    width: "100%",
    height: 160,
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

  timeSlotBadgeContainer: {
    position: "absolute",
    top: 10,
    right: 10,
  },

  mealInfo: {
    padding: 12,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
  },

  nameSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    bottom: 4,
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

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    bottom: 10,
  },

  cafeteriaText: {
    color: "#E95D91",
  },

  dashText: {
    color: "#E95D91",
  },

  shopText: {
    color: "#999999",
  },
});