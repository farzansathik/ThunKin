import { View, StyleSheet, ScrollView } from "react-native";
import Typography from "@/components/typography";

export type FoodItem = {
  name: string;
  qty: number;
};

type TimeSlotCardProps = {
  time: string;
  items: FoodItem[];
  isActive?: boolean;
};

export default function TimeSlotCard({ time, items }: TimeSlotCardProps) {
  return (
    <View style={styles.columnWrapper}>
      {/* Time label above the card */}       
      <Typography fontType={3} weight="bold" size={25} color="#414040" style={styles.timeLabel}>
        {time}
      </Typography>

      {/* Fixed-height white card with internal scroll */}
      <View style={styles.column}>
        <ScrollView
          style={styles.itemScroll}
          showsVerticalScrollIndicator={false}
        >
          {items.map((item, i) => (
            <View key={i} style={styles.card}>
              <Typography weight="medium" size={20} style={styles.food}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  columnWrapper: {
    width: 360,
    marginRight: 16,
    alignSelf: "stretch",
  },

  timeLabel: {
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 4,
  },

  column: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    padding: 10,
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