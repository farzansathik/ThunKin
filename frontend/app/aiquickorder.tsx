import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import Typography from "@/components/typography";
import MealSuggestCard from "@/components/user_components/MealSuggestCard";

interface MealItem {
  id: string;
  name: string;
  restaurant: string;
  price: number;
  timeSlot: string;
  timeStatus: "available" | "limited";
}

export default function AIQuickOrderScreen() {
  const router = useRouter();
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAISuggestedMeals();
  }, []);

  const fetchAISuggestedMeals = async () => {
    try {
      // Mock data for demo - replace with actual data when you have images
      const mockMeals: MealItem[] = [
        {
          id: "1",
          name: "ข้าวเหนียวไก่",
          restaurant: "iCanteen - ร้านอาหาร",
          price: 30,
          timeSlot: "12:20 - 12:30",
          timeStatus: "available",
        },
        {
          id: "2",
          name: "น้ำตกหมู",
          restaurant: "iCanteen - ร้านอาหาร",
          price: 40,
          timeSlot: "12:30 - 12:40",
          timeStatus: "available",
        },
        {
          id: "3",
          name: "ข้าวเหนียวไก่",
          restaurant: "iCanteen - ร้านอาหาร",
          price: 30,
          timeSlot: "12:30 - 12:40",
          timeStatus: "available",
        },
      ];

      setMeals(mockMeals);
    } catch (error) {
      console.error("Error fetching meals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleMealPress = (mealId: string) => {
    // Navigate to meal detail or add to cart
    console.log("Selected meal:", mealId);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Typography size={26} weight="bold" style={styles.headerTitle}>All Quick Orders</Typography>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* AI SUGGESTED MEALS LABEL */}
      <View style={styles.labelSection}>
        <View style={styles.labelLeft}>
          <View style={styles.pinkBar} />
          <Typography weight="bold" size={22} style={styles.labelText}>AI Suggested Meals</Typography>
        </View>
        <View style={styles.smartPicksBadge}>
          <Octicons name="sparkles-fill" size={16} color="#DF5789" />
          <Typography weight="bold" size={12} style={styles.smartPicksText}>Smart Picks</Typography>
        </View>
      </View>

      {/* MEALS LIST */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#E95D91"
          style={{ marginTop: 50 }}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.mealsContainer}
          showsVerticalScrollIndicator={false}
        >
          {meals.map((meal) => (
            <MealSuggestCard
              key={meal.id}
              meal={meal}
              onPress={handleMealPress}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  /* ── HEADER ── */
  header: {
    backgroundColor: "#E95D91",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 5,
  },
  backButton: {
    marginRight: 16,
    width: 28,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    letterSpacing: 0.5,
    left: -6,
  },
  headerSpacer: {
    width: 28,
  },

  /* ── LABEL SECTION ── */
  labelSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "white",
    elevation: 10,
  },
  labelLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  pinkBar: {
    width: 5,
    height: 30,
    backgroundColor: "#E95D91",
    borderRadius: 10,
    marginRight: 10,
  },
  labelText: {
    color: "#454545",
  },
  smartPicksBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFE5F0",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 16,
  },
  smartPicksText: {
    color: "#E95D91",
  },

  /* ── MEALS CONTAINER ── */
  mealsContainer: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    paddingBottom: 30,
    top: 10,
  },
});