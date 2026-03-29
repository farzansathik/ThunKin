import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Typography from "@/components/typography";

export type FoodItem = {
  id: number;
  name: string;
  qty: number;
};

type OrderInTimeSlotProps = {
  time: string;
  items: FoodItem[];
  isActive?: boolean;
  selectedItemId?: number | null;
  onSelectItem?: (item: FoodItem) => void;
};

export default function OrderInTimeSlot({
  time,
  items,
  isActive = false,
  selectedItemId,
  onSelectItem,
}: OrderInTimeSlotProps) {

  const isEmpty = items.length === 0;

  return (
    <View style={styles.columnWrapper}>
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
        <View style={[styles.line, isActive ? styles.activeLine : styles.inactiveLine]} />
      </View>

      <View style={[styles.shell, isActive && styles.activeShell]}>
        <View style={styles.column}>
          {isEmpty ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={26} color="#C0C0C0" />
              <Typography weight="medium" size={18} color="#C0C0C0" style={styles.emptyText}>
                No Orders
              </Typography>
            </View>
          ) : (
            <ScrollView style={styles.itemScroll} showsVerticalScrollIndicator={false}>
              {items.map((item, i) => {
                const isSelected = selectedItemId === item.id;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.card, isSelected && styles.cardSelected]}
                    onPress={() => onSelectItem?.(item)}
                    activeOpacity={0.75}
                    disabled={item.qty === 0}  // ← add this
                  >
                    <Typography weight="medium" size={20} style={styles.food}>
                      {item.name}
                    </Typography>
                    <View style={[styles.qtyBox, item.qty === 0 ? styles.gray : styles.green]}>
                      <Typography
                        weight="bold"
                        size={22}
                        color={item.qty === 0 ? "#6b7280" : "#454545"}
                      >
                        {item.qty}
                      </Typography>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
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
  activeLine: { backgroundColor: "#E15284" },
  inactiveLine: { backgroundColor: "#41404073" },
  shell: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  activeShell: {
    borderColor: "#F472B6",
    shadowColor: "#E15284",
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  column: {
    flex: 1,
    minHeight: 200,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    padding: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingVertical: 32,
  },
  emptyText: { letterSpacing: 0.3 },
  itemScroll: { flexGrow: 1 },
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
  cardSelected: {
    borderColor: "#E15284",
    borderWidth: 2,
    backgroundColor: "#fff0f5",
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
  green: { backgroundColor: "#86EFAC" },
  gray: { backgroundColor: "#d1d5db" },
});