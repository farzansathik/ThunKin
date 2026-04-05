import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Typography from "@/components/typography";
import MealSuggestCard from "@/components/user_components/MealSuggestCard";
import { fetchAISuggestions, AISuggestion } from "@/utils/aiSuggestions";
import { useUser } from "@/context/UserContext";

interface MealItem {
  id: string;
  name: string;
  restaurant: string;
  price: number;
  timeSlot: string;
  timeStatus: "available" | "limited";
  menuId: number;
  restaurantId: number;
}

export default function AIQuickOrderScreen() {
  const router = useRouter();
  const { userId } = useUser();
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAISuggestedMeals();
  }, [userId]);

  const fetchAISuggestedMeals = async () => {
    if (!userId) {
      setLoading(false);
      setError("Please log in to get suggestions.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const suggestions: AISuggestion[] = await fetchAISuggestions(userId);

      // Map AISuggestion → MealItem for the card component
      const mapped: MealItem[] = suggestions.map(s => ({
        id: String(s.menuId),
        name: s.menuName,
        restaurant: s.restaurantName,
        cafeteriaName: s.cafeteriaName,
        price: s.price,
        timeSlot: s.timeSlot,
        timeStatus: "available",
        menuId: s.menuId,
        restaurantId: s.restaurantId,
        imageUrl: s.imageUrl,
      }));

      setMeals(mapped);
    } catch (err) {
      console.error("Error fetching AI meals:", err);
      setError("Could not load suggestions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleMealPress = (mealId: string) => {
    const meal = meals.find(m => m.id === mealId);
    if (!meal) return;

    router.push({
      pathname: "/food",
      params: {
        foodId: meal.menuId,
        foodName: meal.name,
        shopId: meal.restaurantId,
        shopName: meal.restaurant,
        slotTime: meal.timeSlot,
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── HEADER ────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Typography size={26} weight="bold" style={styles.headerTitle}>
            All Quick Orders
          </Typography>
        </View>

        {/* Refresh button */}
        <TouchableOpacity
          onPress={fetchAISuggestedMeals}
          disabled={loading}
          style={styles.refreshButton}
        >
          <Ionicons
            name="refresh"
            size={22}
            color={loading ? "rgba(255,255,255,0.4)" : "white"}
          />
        </TouchableOpacity>
      </View>

      {/* ── LABEL SECTION ─────────────────────────────── */}
      <View style={styles.labelSection}>
        <View style={styles.labelLeft}>
          <View style={styles.pinkBar} />
          <Typography weight="bold" size={21} style={styles.labelText}>
            AI Suggested Meals
          </Typography>
        </View>

        <View style={styles.smartPicksBadge}>
          <Octicons name="sparkles-fill" size={16} color="#DF5789" />
          <Typography weight="bold" size={12} style={styles.smartPicksText}>
            Smart Picks
          </Typography>
        </View>
      </View>

      {/* ── CONTENT ───────────────────────────────────── */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E95D91" />
          <Typography weight="medium" size={14} style={styles.loadingText}>
            Finding your favourites...
          </Typography>
        </View>

      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#CCC" />
          <Typography weight="medium" size={14} style={styles.errorText}>
            {error}
          </Typography>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchAISuggestedMeals}
          >
            <Typography weight="bold" size={14} style={styles.retryText}>
              Try Again
            </Typography>
          </TouchableOpacity>
        </View>

      ) : meals.length === 0 ? (
        <View style={styles.errorContainer}>
          <Ionicons name="restaurant-outline" size={48} color="#CCC" />
          <Typography weight="medium" size={14} style={styles.errorText}>
            No suggestions available right now.
          </Typography>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchAISuggestedMeals}
          >
            <Typography weight="bold" size={14} style={styles.retryText}>
              Refresh
            </Typography>
          </TouchableOpacity>
        </View>

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

  // ── Header ─────────────────────────────────────────────
  header: {
    backgroundColor: "#E95D91",
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  backButton: {
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

  refreshButton: {
    width: 28,
    alignItems: "center",
  },

  // ── Label section ───────────────────────────────────────
  labelSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "white",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
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

  // ── Loading ─────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
  },

  loadingText: {
    color: "#999",
  },

  // ── Error / Empty ───────────────────────────────────────
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 32,
  },

  errorText: {
    color: "#999",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 4,
    backgroundColor: "#E95D91",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },

  retryText: {
    color: "#fff",
  },

  // ── Meals list ──────────────────────────────────────────
  mealsContainer: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    paddingBottom: 30,
    top: 5,
  },
});