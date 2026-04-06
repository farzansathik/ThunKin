import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Typography from '@/components/typography';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { getCurrentDebugTime } from '@/utils/debugTime';

export type ShelfSlot = {
  id: number;
  slot_label: string;
  order_item_id: number | null;
  status: 'empty' | 'occupied';
  menu_name: string | null;
};

interface ShelfBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  restId: number;
  selectedItemId: number | null;
  selectedFoodName: string | null;
  onAssigned: (itemId: number) => void;
  onCleared: (itemId: number) => void;
}

const ROWS = 4;
const COLS = 4;
const BUTTON_SIZE = 70;
const PANEL_SIZE = 395;

const ShelfBottomSheet: React.FC<ShelfBottomSheetProps> = ({
  isVisible,
  onClose,
  restId,
  selectedItemId,
  selectedFoodName,
  onAssigned,
  onCleared,
}) => {
const [slots, setSlots] = useState<ShelfSlot[]>([]);
const [loading, setLoading] = useState(false);
const [isAssigning, setIsAssigning] = useState(false);
const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

// Store previous data to prevent re-render
const prevSlotsRef = useRef<ShelfSlot[] | null>(null);

// Auto-fetch when panel is open
useEffect(() => {
  if (isVisible) {
    fetchSlots(); // Initial fetch

    // Prevent duplicate intervals
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        fetchSlots();
      }, 3000);
    }
  } else {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  // Cleanup on unmount
  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
}, [isVisible, restId]);

  const fetchSlots = async () => {
    // Only show loading on first load
    if (!prevSlotsRef.current) {
      setLoading(true);
    }

    const { data, error } = await supabase
      .from('shelf_slots')
      .select(`
        id,
        slot_label,
        order_item_id,
        status,
        order_items (
          menu ( name )
        )
      `)
      .eq('rest_id', restId)
      .order('slot_label');

    if (!error && data) {
      const mapped: ShelfSlot[] = (data as any[]).map(row => ({
        id: row.id,
        slot_label: row.slot_label,
        order_item_id: row.order_item_id,
        status: row.status,
        menu_name: row.order_items?.menu?.name ?? null,
      }));
    
      // Compare with previous data
    const isSame =
      prevSlotsRef.current &&
      prevSlotsRef.current.length === mapped.length &&
      prevSlotsRef.current.every((item, i) =>
        item.id === mapped[i].id &&
        item.status === mapped[i].status &&
        item.order_item_id === mapped[i].order_item_id &&
        item.menu_name === mapped[i].menu_name
      );

    // STOP re-render if nothing changed
    if (isSame) {
      setLoading(false);
      return;
    }

    // Only update when changed
    prevSlotsRef.current = mapped;
    setSlots(mapped);
  }

    setLoading(false);
  };

  const handleSlotPress = async (slot: ShelfSlot) => {

    // ── Occupied slot → confirm before clearing ──────────
    if (slot.status === 'occupied') {
      Alert.alert(
        'Remove from Shelf',
        `Put "${slot.menu_name}" out of slot ${slot.slot_label}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            style: 'destructive',
            onPress: async () => {

              // 1. Get order_id from order_items
              const { data: orderItemData } = await supabase
                .from('order_items')
                .select('order_id')
                .eq('id', slot.order_item_id)
                .single();

              if (orderItemData?.order_id) {
                // 2. Update orders.status → "pending"
                await supabase
                  .from('orders')
                  .update({ 
                    status: 'pending',
                    updated_at: getCurrentDebugTime().toISOString(), 
                  })
                  .eq('id', orderItemData.order_id);
              }

              // 3. Update order_items.status → "pending"
              await supabase
                .from('order_items')
                .update({ 
                  status: 'pending',
                  updated_at: getCurrentDebugTime().toISOString(),  
                })
                .eq('id', slot.order_item_id);

              // 4. Log ready → pending
              await supabase
                .from('order_items_logs')
                .insert({
                  order_item_id: slot.order_item_id,
                  from_status: 'ready',
                  to_status: 'pending',
                });

              // 5. Clear the shelf slot
              const { error } = await supabase
                .from('shelf_slots')
                .update({
                  order_item_id: null,
                  status: 'empty',
                  updated_at: getCurrentDebugTime().toISOString(),
                })
                .eq('id', slot.id);

              if (!error) {
                fetchSlots();
                onCleared(slot.order_item_id!);
              }
            },
          },
        ]
      );
      return;
    }

    // ── Empty slot → assign selected order ───────────────
    if (!selectedItemId) return;
    if (isAssigning) return; // block while busy
    setIsAssigning(true);    // lock all buttons immediately

    try {
    // 1. Get order_id from order_items
    const { data: orderItemData } = await supabase
      .from('order_items')
      .select('order_id')
      .eq('id', selectedItemId)
      .single();

    if (orderItemData?.order_id) {
      // 2. Update orders.status → "ready"
      await supabase
        .from('orders')
        .update({ 
          status: 'ready',
          updated_at: getCurrentDebugTime().toISOString(), 
        })
        .eq('id', orderItemData.order_id);
    }

    // 3. Update order_items.status → "ready"
    await supabase
      .from('order_items')
      .update({ 
        status: 'ready',
        updated_at: getCurrentDebugTime().toISOString(), 
      })
      .eq('id', selectedItemId);

    // 4. Log pending → ready
    await supabase
      .from('order_items_logs')
      .insert({
        order_item_id: selectedItemId,
        from_status: 'pending',
        to_status: 'ready',
      });

    // 5. Assign the shelf slot
    const { error } = await supabase
      .from('shelf_slots')
      .update({
        order_item_id: selectedItemId,
        status: 'occupied',
        assigned_at: getCurrentDebugTime().toISOString(),
        updated_at: getCurrentDebugTime().toISOString()
      })
      .eq('id', slot.id);

    if (!error) {
      await fetchSlots(); // wait for shelf to update
      await new Promise(resolve => setTimeout(resolve, 500)); // small delay (shouldn't lower than this cuz now when quickly assigning shelf will still occur)
      onAssigned(selectedItemId);
    }
    } finally {
      setIsAssigning(false); // always unlock
    }
  };

  const getSlot = (row: number, col: number): ShelfSlot | undefined => {
    const rowNum = ROWS - row;
    const colLetter = String.fromCharCode(65 + col);
    const label = `${rowNum}${colLetter}`;
    return slots.find(s => s.slot_label === label);
  };

  if (!isVisible) return null;

  return (
    <>
      <View style={styles.overlayVisual} pointerEvents="none" />
      <View style={styles.panel} pointerEvents="box-none">

        <View style={styles.header}>
          <View>
            <Typography weight="bold" size={20} color="#333" style={{ bottom: 5 }}>
              Shelf Space
            </Typography>
            {selectedItemId && (
              <Typography fontType={2} weight="bold" size={13} color="#E15284" style={{ marginTop: -3 }}>
                Placing: {selectedFoodName}
              </Typography>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#E15284" style={{ marginTop: 40 }} />
        ) : (
          <View style={{ flex: 1 }}>
            {/* Assigning overlay — blocks all taps and shows spinner */}
            {isAssigning && (
              <View style={styles.assigningOverlay}>
                <ActivityIndicator size="large" color="#E15284" />
                <Typography weight="bold" size={14} color="#E15284" style={{ marginTop: 10 }}>
                  Placing on shelf...
                </Typography>
              </View>
            )}

            <View style={[styles.gridContainer, isAssigning && { opacity: 0.3 }]}>
              {Array.from({ length: ROWS }).map((_, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                  {Array.from({ length: COLS }).map((_, colIndex) => {
                    const slot = getSlot(rowIndex, colIndex);
                    const occupied = slot?.status === 'occupied';
                    const rowNum = ROWS - rowIndex;
                    const colLetter = String.fromCharCode(65 + colIndex);
                    const label = `${rowNum}${colLetter}`;

                    return (
                      <TouchableOpacity
                        key={colIndex}
                        style={[
                          styles.gridButton,
                          occupied && styles.gridButtonOccupied,
                        ]}
                        onPress={() => slot && handleSlotPress(slot)}
                        disabled={isAssigning}
                      >
                        <Typography weight="bold" size={14} color={occupied ? '#fff' : '#E15284'}>
                          {label}
                        </Typography>
                        {occupied && (
                          <Typography
                            weight="medium"
                            size={10}
                            color="#fff"
                            style={styles.slotFoodName}
                            numberOfLines={2}
                          >
                            {slot?.menu_name}
                          </Typography>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlayVisual: {
    position: 'absolute',
    top: 0, left: 0, right: 1, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.0005)',
    zIndex: 99,
  },
  panel: {
    position: 'absolute',
    bottom: 15, right: 15,
    width: PANEL_SIZE,
    height: PANEL_SIZE,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#c2c2c2',
  },
  closeBtn: {
    width: 32, height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 5
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  gridButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E15284',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  gridButtonOccupied: {
    backgroundColor: '#E15284',
    borderColor: '#C1216B',
  },
  slotFoodName: {
    textAlign: 'center',
    marginTop: 2,
  },
  assigningOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 12,
  },
});

export default ShelfBottomSheet;