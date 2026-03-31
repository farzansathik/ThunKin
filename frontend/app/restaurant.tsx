import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator, Modal, ScrollView } from "react-native";
import { supabase } from "../lib/supabase";
import Typography from "@/components/typography";
import VendorStallSelectCard from "@/components/user_components/VendorStallSelectCard";

export default function RestaurantScreen() {
  const router = useRouter();
  const { cafeId } = useLocalSearchParams();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [allRestaurants, setAllRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [availableFrom, setAvailableFrom] = useState<string | null>(null);
  const [availableUntil, setAvailableUntil] = useState<string | null>(null);

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showUntilPicker, setShowUntilPicker] = useState(false);

  const [locationName, setLocationName] = useState("");

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minuteOptions = ['00', '10', '20', '30', '40', '50'];

  // Get current time rounded up to nearest 10 min
  const getCurrentRoundedTime = (): { hour: string; minute: string } => {
    const now = new Date();
    //now.setHours(17, 0, 0, 0); // Hardcode time for testing
    const rawMinute = Math.ceil(now.getMinutes() / 10) * 10;
    const overflow = rawMinute >= 60;
    return {
      hour: (overflow ? now.getHours() + 1 : now.getHours()).toString().padStart(2, '0'),
      minute: (overflow ? 0 : rawMinute).toString().padStart(2, '0'),
    };
  };

  const getBookableRange = async (restaurant: any): Promise<{ earliest: number; latest: number } | null> => {
    const toMinutes = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const open = toMinutes(restaurant.open_time.slice(0, 5));
    const close = toMinutes(restaurant.close_time.slice(0, 5));

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const earliest = Math.max(open, nowMinutes + 30);
    const latest = close - 30;

    if (earliest >= latest) return null;

    const todayStr = new Date().toISOString().slice(0, 10);
    const { data: orders } = await supabase
      .from("orders")
      .select("pick_up_time, status, order_items!inner(rest_id)")
      .eq("order_items.rest_id", Number(restaurant.id))
      .neq("status", "picked_up")
      .gte("pick_up_time", `${todayStr}T00:00:00`)
      .lte("pick_up_time", `${todayStr}T23:59:59`);

    const countMap: Record<number, number> = {};
    orders?.forEach((o) => {
      const t = new Date(o.pick_up_time);
      const slotMin = t.getHours() * 60 + t.getMinutes();
      countMap[slotMin] = (countMap[slotMin] ?? 0) + 1;
    });

    let actualEarliest: number | null = null;
    let actualLatest: number | null = null;

    for (let m = earliest; m <= latest; m += 10) {
      const used = countMap[m] ?? 0;
      if (used < 12) {
        if (actualEarliest === null) actualEarliest = m;
        actualLatest = m;
      }
    }

    if (actualEarliest === null) return null;
    return { earliest: actualEarliest, latest: actualLatest! };
  };

  useEffect(() => {
    const applyFilters = async () => {
      if (!availableFrom && !availableUntil) {
        setRestaurants(allRestaurants);
        return;
      }

      const toMinutes = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      };

      const fromMin = availableFrom ? toMinutes(availableFrom) : null;
      const untilMin = availableUntil ? toMinutes(availableUntil) : null;

      const results = await Promise.all(
        allRestaurants.map(async (r) => {
          const range = await getBookableRange(r);
          if (!range) return null;
          if (fromMin !== null && range.latest < fromMin) return null;
          if (untilMin !== null && range.earliest > untilMin) return null;
          return r;
        })
      );

      setRestaurants(results.filter(Boolean));
    };

    if (allRestaurants.length > 0) applyFilters();
  }, [availableFrom, availableUntil, allRestaurants]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      // Fetch location name
      const { data: cafeData } = await supabase
        .from("cafeteria")
        .select("location_name")
        .eq("id", cafeId)
        .single();

      if (cafeData) setLocationName(cafeData.location_name);
      
      // Fetch location name
      const { data } = await supabase
        .from("restaurant")
        .select("*")
        .eq("cafe_id", cafeId)
        .eq("status", true)
        .order("id", { ascending: true });

      setAllRestaurants(data || []);
      setRestaurants(data || []);
      setLoading(false);
    };

    fetchRestaurants();
  }, [cafeId]);

  // ─── TimePickerModal ──────────────────────────────────────────────────────
  const TimePickerModal = ({
    visible,
    onClose,
    onSelect,
    onClear,
    title,
    minTime,         // "HH:MM" — hides hours/minutes strictly before this
    currentValue,    // "HH:MM" — pre-selects if already set
  }: {
    visible: boolean;
    onClose: () => void;
    onSelect: (time: string) => void;
    onClear: () => void;
    title: string;
    minTime: string | null;
    currentValue: string | null;
  }) => {
    const { hour: nowHour, minute: nowMinute } = getCurrentRoundedTime();

    // Resolve the starting defaults:
    // 1. If there's a current value, start there.
    // 2. Else if there's a minTime, start there.
    // 3. Else default to current time.
    const defaultHour = currentValue
      ? currentValue.split(':')[0]
      : minTime
        ? minTime.split(':')[0]
        : nowHour;

    const defaultMinute = currentValue
      ? currentValue.split(':')[1]
      : minTime
        ? minTime.split(':')[1]
        : nowMinute;

    const [selectedHour, setSelectedHour] = useState(defaultHour);
    const [selectedMinute, setSelectedMinute] = useState(defaultMinute);

    // Reset local state whenever the modal opens
    useEffect(() => {
      if (visible) {
        const h = currentValue
          ? currentValue.split(':')[0]
          : minTime
            ? minTime.split(':')[0]
            : nowHour;
        const m = currentValue
          ? currentValue.split(':')[1]
          : minTime
            ? minTime.split(':')[1]
            : nowMinute;
        setSelectedHour(h);
        setSelectedMinute(m);
      }
    }, [visible]);

    const minHour = minTime ? parseInt(minTime.split(':')[0]) : 0;
    const minMin  = minTime ? parseInt(minTime.split(':')[1]) : 0;

    const allowedHours = hours.filter(h => parseInt(h) >= minHour);

    const allowedMinutes = minuteOptions.filter(m => {
      if (parseInt(selectedHour) > minHour) return true;
      return parseInt(m) >= minMin;
    });

    // If selected minute is no longer valid after hour changes, snap to first valid
    useEffect(() => {
      if (!allowedMinutes.includes(selectedMinute)) {
        setSelectedMinute(allowedMinutes[0] ?? '00');
      }
    }, [selectedHour]);

    const handleSelect = () => {
      onSelect(`${selectedHour}:${selectedMinute}`);
      onClose();
    };

    const handleClear = () => {
      onClear();
      onClose();
    };

    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          {/* Tapping the dim area closes without saving */}
          <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} />

          <View style={styles.modalContent}>
            {/* Handle bar */}
            <View style={styles.handleBar} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={28} color="#575757" />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              {/* Hour Column */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Hour</Text>
                <ScrollView
                  style={styles.picker}
                  snapToInterval={50}
                  decelerationRate="fast"
                  showsVerticalScrollIndicator={false}
                >
                  {allowedHours.map(hour => (
                    <TouchableOpacity
                      key={hour}
                      onPress={() => setSelectedHour(hour)}
                      style={[styles.pickerItem, selectedHour === hour && styles.pickerItemSelected]}
                    >
                      <Text style={[styles.pickerItemText, selectedHour === hour && styles.pickerItemTextSelected]}>
                        {hour}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Text style={styles.colonSeparator}>:</Text>

              {/* Minute Column */}
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Minute</Text>
                <ScrollView
                  style={styles.picker}
                  snapToInterval={50}
                  decelerationRate="fast"
                  showsVerticalScrollIndicator={false}
                >
                  {allowedMinutes.map(minute => (
                    <TouchableOpacity
                      key={minute}
                      onPress={() => setSelectedMinute(minute)}
                      style={[styles.pickerItem, selectedMinute === minute && styles.pickerItemSelected]}
                    >
                      <Text style={[styles.pickerItemText, selectedMinute === minute && styles.pickerItemTextSelected]}>
                        {minute}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Preview */}
            <Text style={styles.previewText}>{selectedHour}:{selectedMinute}</Text>

            {/* Action buttons */}
            <TouchableOpacity style={styles.selectButton} onPress={handleSelect}>
              <Text style={styles.selectButtonText}>Confirm Time</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>Clear Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBanner}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800' }} style={styles.bannerImage} />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>

        <View style={styles.locationPillWrapper}>
          <View style={styles.locationPill}>
            <Typography weight="bold" style={styles.locationText} size={22}>
              {locationName}
            </Typography>
          </View>
        </View>
      </View>

      <View style={styles.contentCard}>
        <View style={[styles.sectionTitleRow, { bottom: 3 }]}>
          <View style={styles.titleAccent} />
          <Typography weight="bold" style={{ color: "#3c3c3c" }} size={30}>
            Select Restaurants
          </Typography>
        </View>

        <View style={styles.filterRow}>
          <Ionicons name="time-outline" size={18} style={{bottom: 12}} color="#888" />

          {/* Available From pill */}
          <TouchableOpacity
            style={[styles.filterPill, availableFrom ? styles.filterPillActive : null]}
            onPress={() => setShowFromPicker(true)}
          >
            <Text style={[styles.filterText, availableFrom ? styles.filterTextActive : null]}>
              {availableFrom || 'Available From'}
            </Text>
            {availableFrom ? (
              <TouchableOpacity onPress={() => {
                setAvailableFrom(null);
                // If Until is now before nothing, keep it; it will be re-evaluated
              }}>
                <Ionicons name="close-circle" size={16} color="#E95D91" />
              </TouchableOpacity>
            ) : (
              <Ionicons name="chevron-down" size={14} color="#888" />
            )}
          </TouchableOpacity>

          {/* Available Until pill */}
          <TouchableOpacity
            style={[styles.filterPill, availableUntil ? styles.filterPillActive : null]}
            onPress={() => setShowUntilPicker(true)}
          >
            <Text style={[styles.filterText, availableUntil ? styles.filterTextActive : null]}>
              {availableUntil || 'Available Until'}
            </Text>
            {availableUntil ? (
              <TouchableOpacity onPress={() => setAvailableUntil(null)}>
                <Ionicons name="close-circle" size={16} color="#E95D91" />
              </TouchableOpacity>
            ) : (
              <Ionicons name="chevron-down" size={14} color="#888" />
            )}
          </TouchableOpacity>
        </View>

        {loading ? <ActivityIndicator color="#E95D91" /> : (
          <FlatList
            data={restaurants}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={({ item, index }) => (
              <VendorStallSelectCard item={item} index={index} />
            )}
          />
        )}
      </View>

      {/* From picker: starts at current time, no minTime */}
      <TimePickerModal
        visible={showFromPicker}
        onClose={() => setShowFromPicker(false)}
        onSelect={(time) => {
          setAvailableFrom(time);
          // If Until is now before the new From, clear it
          if (availableUntil) {
            const [fh, fm] = time.split(':').map(Number);
            const [uh, um] = availableUntil.split(':').map(Number);
            if (uh < fh || (uh === fh && um < fm)) {
              setAvailableUntil(null);
            }
          }
        }}
        onClear={() => setAvailableFrom(null)}
        title="Available From"
        minTime={null}
        currentValue={availableFrom}
      />

      {/* Until picker: starts at From time (or current time), minTime is From */}
      <TimePickerModal
        visible={showUntilPicker}
        onClose={() => setShowUntilPicker(false)}
        onSelect={setAvailableUntil}
        onClear={() => setAvailableUntil(null)}
        title="Available Until"
        minTime={availableFrom}
        currentValue={availableUntil}
      />
      {/* Fill the gap on very tall screens after modal closes */}
      <View style={styles.safeAreaFill} />   
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E95D91" },

  // Banner
  topBanner: { height: 180 },
  bannerImage: { width: '100%', height: '100%' },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 30,
    padding: 6,
  },

  locationPillWrapper: {
    bottom: 0,
    position: 'absolute',
    width: '100%',
    zIndex: 1,
  },
  locationPill: {
    backgroundColor: '#E95D91',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  locationText: {
    color: 'white',
    textAlign: 'center',
  },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 3,
    backgroundColor: 'white',
    bottom: 12,
  },
  filterPillActive: {
    borderColor: '#E95D91',
    backgroundColor: '#FFF0F6',
  },
  filterText: {
    fontSize: 13,
    color: '#888',
  },
  filterTextActive: {
    color: '#E95D91',
    fontWeight: '600',
  },

  // Content below
  contentCard: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    zIndex: 2,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleAccent: {
    width: 5,
    height: 32,
    backgroundColor: '#E95D91',
    borderRadius: 3,
    marginRight: 10,
  },

  // ── Modal ──────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 0,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingVertical: 24,
    paddingHorizontal: 10,
    gap: 8,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#aaa',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  picker: {
    height: 200,
    width: 90,
  },
  pickerItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  pickerItemSelected: {
    backgroundColor: '#E95D91',
  },
  pickerItemText: {
    fontSize: 20,
    color: '#ccc',
  },
  pickerItemTextSelected: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 22,
  },
  colonSeparator: {
    fontSize: 28,
    color: '#ccc',
    marginTop: 62, // align with picker items (label + offset)
    paddingHorizontal: 4,
  },
  previewText: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '700',
    color: '#E95D91',
    letterSpacing: 2,
    marginBottom: 20,
  },
  selectButton: {
    backgroundColor: '#E95D91',
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  selectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 0,
  },
  clearButtonText: {
    color: '#aaa',
    fontSize: 15,
    fontWeight: '500',
  },
  safeAreaFill: {
    height: 40,
    backgroundColor: 'white',
  },
});