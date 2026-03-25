import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { useRouter } from "expo-router";
import Typography from "../typography";

type Props = {
  item: {
    id: string | number;
    name: string;
  };
  index: number;
};

export default function VendorStallSelectCard({ item, index }: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.shopCard}
      onPress={() => router.push({ pathname: "/timeslot", params: { shopId: item.id, shopName: item.name } })}
    >
      <Image source={{ uri: `https://loremflickr.com/320/240/food?random=${item.id}` }} style={styles.shopImage} />
      <View style={styles.numberBadge}>
        <Typography size={16} style={styles.numberText}>
          {item.id}
        </Typography>
      </View>
      <Typography weight="bold" size={18} style={styles.shopName}>
        {item.name}
      </Typography>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shopCard: {
    width: '48%',
    aspectRatio: 0.9,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    backgroundColor: 'white',
  },
  shopImage: { 
    width: '100%', 
    height: '80%',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
 },
  numberBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: 'white',
    width: 30,
    height: 30,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  numberText: { color: '#E95D91', fontWeight: 'bold' },
  shopName: { 
    color: '#454545',
    top: 6,
    textAlign: 'center',
    flex: 1, 
  },
});
