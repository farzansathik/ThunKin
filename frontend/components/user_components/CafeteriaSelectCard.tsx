import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome6, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Typography from "../typography";

type CafeteriaItem = {
  location_name: string;
  name: string;
  status: string;
  open_time: string;
  close_time: string;
  favorite: boolean;
};
type Props = {
  item: CafeteriaItem;
  onPress: () => void;
};

export default function CafeteriaSelectCard({ item, onPress }: Props) {
// if real data from database is missing any of these fields, use default values to avoid crashes
  const isOpen = item.status;
  const formatTime = (time: string) => time.slice(0, 5);
  const openTime = item.open_time ? formatTime(item.open_time) : "--:--";
  const closeTime = item.close_time ? formatTime(item.close_time) : "--:--";
  const distMin = "0"; // sync with google maps API later when we have real distance data
  const distMeters = "0";
  const name = item.name ?? "โรงอาหาร";
  const locationName = item.location_name ?? "ไม่มีชื่อสถานที่";
  const favorite = item.favorite ?? false; // didnt do yet

  // Hide card if closed (อันที่ปิดเราจะไม่โชว์เลย)
  if (!isOpen) return null;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      {/* Left: Info */}
      <View style={styles.cardInfo}>

        {/* TOP: Location title   - num.of line อาจเสร็จเป็น 2 ทีหลัง*/}
        <Typography weight="bold" size={18} color="#454545" numberOfLines={1}>  
          {locationName}
        </Typography>

        {/* MIDDLE: Sub location on next line */}
        {name ? (
        <Typography weight="bold" size={17} color="#DF5789" numberOfLines={1}>
            {name}
        </Typography>
        ) : null}

        {/* BOTTOM: Status row */}
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isOpen ? "#81E687" : "#fd8888" },
              { opacity: 0.63 },
            ]}
          >
            <Typography weight="bold" size={14} color={isOpen ? "#007708" : "#EF4444"}
              style={[
                { color: isOpen ? "#006b07" : "#EF4444" },
              ]}
            >
              {isOpen ? "OPEN" : "CLOSED"}
            </Typography>
          </View>
          <Typography fontType={3} weight="bold" size={16} color="#888888">
            {openTime} - {closeTime}
          </Typography>
          <FontAwesome6 name="heart" size={16} color="#DF5789" style={{ marginLeft: 8 }} />
        </View>
      </View>

    {/* Right: Distance Box */}
    <View style={styles.distanceContainer}>
        <View style={styles.distanceBox}>
            <View style={styles.distTopRow}>
                <Typography weight="bold" size={32} color="#DF5789">
                    {distMin}
                </Typography>
                <View style={styles.distRightCol}>
                    <MaterialCommunityIcons name="run" size={21} color="#454545" />
                    <Text style={styles.minLabel}>min</Text>
                </View>
                </View>
                <Typography weight="bold" size={9} color="#848484" style={{ marginTop: -5 }}>
                    {distMeters} meters
                </Typography>
            </View>
        </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "stretch",  
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardInfo: {
    flex: 1,
    paddingRight: 12,
    justifyContent: "space-between",  
    minHeight: 70,                    
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 8,
  },
  distanceContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  distanceBox: {
    width: 63,
    height: 90,
    backgroundColor: "#FFF9FB",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#FCE8F0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E95D91",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
    distTopRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    distRightCol: {
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        marginLeft: 1,
    },
    minLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: "#555",
        marginTop: -4,         
        lineHeight: 11,
    },
});