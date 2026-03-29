import { View, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Typography from "@/components/typography";

export type FoodItem = {
  name: string;
  qty: number;
};

type OrderInTimeSlotProps = {
  time: string;
  items: FoodItem[];
  isActive?: boolean;
};

export default function OrderInTimeSlot({
  time,
  items,
  isActive = false,
}: OrderInTimeSlotProps) {

  const isEmpty = items.length === 0;

  return (
    <View style={styles.columnWrapper}>

      {/* Time label + decorative line */}
      <View style={styles.timeRow}>
        <Typography
          fontType={3}
          weight="bold"
          size={25}
          color={isActive ? "#E15284" : "#414040"}
          style={styles.timeLabel}
        >
          {time}
        </Typography>

        <View
          style={[
            styles.line,
            isActive ? styles.activeLine : styles.inactiveLine,
          ]}
        />
      </View>

      {/* Card container */}
      <View style={[styles.column, isActive && styles.activeColumn]}>

        {isEmpty ? (
          // ── No orders state ──────────────────────────────
          <View style={styles.emptyContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={26}
              color="#C0C0C0"
            />
            <Typography
              weight="medium"
              size={18}
              color="#C0C0C0"
              style={styles.emptyText}
            >
              No Orders
            </Typography>
          </View>

        ) : (
          // ── Order list ───────────────────────────────────
          <ScrollView
            style={styles.itemScroll}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item, i) => (
              <View key={i} style={styles.card}>

                <Typography
                  weight="medium"
                  size={20}
                  style={styles.food}
                >
                  {item.name}
                </Typography>

                <View
                  style={[
                    styles.qtyBox,
                    item.qty === 0 ? styles.gray : styles.green,
                  ]}
                >
                  <Typography
                    weight="bold"
                    size={22}
                    color={item.qty === 0 ? "#6b7280" : "#454545"}
                  >
                    {item.qty}
                  </Typography>
                </View>

              </View>
            ))}
          </ScrollView>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  columnWrapper: {
    width: 320,
    marginRight: 16,
    alignSelf: "stretch",
    marginBottom: 15,
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  timeLabel: {
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 4,
  },

  line: {
    flex: 0.95,
    height: 4,
    borderRadius: 2,
  },

  activeLine: {
    backgroundColor: "#E15284",
  },

  inactiveLine: {
    backgroundColor: "#41404073",
  },

  column: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    padding: 10,
  },

  activeColumn: {
    shadowColor: "#E15284",
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 10,
    borderWidth: 1.5,
    borderColor: "#F472B6",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingVertical: 32,
  },

  emptyText: {
    letterSpacing: 0.3,
  },

  itemScroll: {
    flex: 1,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
    alignItems: "stretch",
    borderWidth: 1,
    borderColor: "#e2e2e2",
  },

  food: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    color: "#1a1a1a",
  },

  qtyBox: {
    width: 70,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    margin: 5,
  },

  green: {
    backgroundColor: "#86EFAC",
  },

  gray: {
    backgroundColor: "#d1d5db",
  },
});