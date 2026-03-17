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

export default function TimeSlotCard({
  time,
  items,
  isActive = false, // default false
}: TimeSlotCardProps) {
  return (
    <View style={styles.columnWrapper}>
      {/* Time + active line */}
      <View style={styles.timeRow}>
        <Typography
          fontType={3}
          weight="bold"
          size={25}
          color={isActive ? "#E15284" : "#414040"} // ✅ highlight when active
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

      {/* Card */}
      <View style={[styles.column, isActive && styles.activeColumn]}>
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
    width: 320,
    marginRight: 16,
    alignSelf: "stretch",
    marginBottom: 15,
  },

  // row for time + line
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

  // pink line
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

  // glow effect when active
  activeColumn: {
    // iOS shadow (stronger)
    shadowColor: "#E15284",
    shadowOpacity: 0.6,
    shadowRadius: 20,
    shadowOffset: {
        width: 0,
        height: 0,
    },

    // Android glow 
    elevation: 10,

    // slight border to enhance glow effect
    borderWidth: 1.5,
    borderColor: "#F472B6",
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