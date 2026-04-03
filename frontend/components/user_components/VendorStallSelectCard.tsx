import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import Typography from "../typography";
import { Ionicons } from "@expo/vector-icons";
import { toJpegUrl } from "@/utils/imageUtils";

type Props = {
  item: {
    id: string | number;
    name: string;
    shop_num: number;
    image_url: string | null;
  };
  index: number;
};

export default function VendorStallSelectCard({ item, index }: Props) {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  return (
    <TouchableOpacity
      style={styles.shopCard}
      onPress={() => router.push({ pathname: "/timeslot", params: { shopId: item.id, shopNum: item.shop_num, shopName: item.name, shopImage: item.image_url ?? '' } })}
    >
      {item.image_url && !imgError ? (
        <Image
          source={{ uri: toJpegUrl(item.image_url) ?? undefined }}
          style={styles.shopImage}
          onError={() => setImgError(true)}
        />
      ) : (
        <View style={[styles.shopImage, styles.fallbackImage]}>
          <Ionicons name="storefront-outline" size={48} color="#ccc" />
        </View>
      )}
      <View style={styles.numberBadge}>
        <Typography size={16} style={styles.numberText}>
          {item.shop_num}
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
  fallbackImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopName: { 
    color: '#454545',
    top: 6,
    textAlign: 'center',
    flex: 1, 
  },
});
