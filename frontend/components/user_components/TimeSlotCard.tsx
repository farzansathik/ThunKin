import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Typography from "../typography";

interface TimeSlot {
  time: string;
  startTime: Date;
  available: number;
}

type Props = {
  slot: TimeSlot;
  shopId: string | string[];
  shopName: string | string[];
};

export default function TimeSlotCard({ slot, shopId, shopName }: Props) {
  const router = useRouter();
  const isFull = slot.available === 0;
  const isLow = slot.available > 0 && slot.available <= 5;
  const badgeColor = isFull ? "#D5D1D1" : isLow ? "#FFBA42" : "#7EDD7E";
  const textColor = isFull ? "#B4B4B4" : isLow ? "#67370A" : "#0A671E";

  return (
    <TouchableOpacity
      style={[styles.slotCard, isFull && styles.disabledCard]}
      disabled={isFull}
      onPress={() => router.push({
        pathname: "/menu",
        params: { shopId, shopName, slotTime: slot.startTime.toISOString() }
      })}
    >
    <View style={[styles.availableBadge, { backgroundColor: badgeColor }]}>
        <Typography weight="bold" size={8} style={{ color: textColor, textAlign: 'center' }}>
          Available
        </Typography>
        <Typography weight="bold" size={24} style={{ color: textColor, textAlign: 'center', marginTop: -5 }}>
          {slot.available}
        </Typography>
      </View>
      <View style={styles.divider} />
      <View style={styles.timeTextContainer}>
        <Typography weight="bold" size={18} fontType={3} style={[styles.slotTimeText, { color: isFull ? "#999" : "#333" }]}>
          {slot.time}
        </Typography>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  slotCard: {
    width: '48%',
    height: 60,
    backgroundColor: 'white',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#454545',
    elevation: 3,
    overflow: 'hidden',
  },
  disabledCard: { backgroundColor: '#FAFAFA', opacity: 0.7 },
  availableBadge: { 
    paddingVertical: 10, 
    paddingHorizontal: 6, 
    alignItems: 'center', 
    justifyContent: 'center',
    width: 50, 
    height: '100%',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#454545',
  },
  timeTextContainer: { flex: 1, paddingRight: 3 },
  slotTimeText: { textAlign: 'center', color: '#454545' },
});