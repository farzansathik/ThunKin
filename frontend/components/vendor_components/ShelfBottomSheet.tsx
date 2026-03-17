import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Typography from '@/components/typography';
import { MaterialIcons } from '@expo/vector-icons';

interface ShelfBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

const ROWS = 4;
const COLS = 4;
const BUTTON_SIZE = 70;
const PANEL_SIZE = 400;

const ShelfBottomSheet: React.FC<ShelfBottomSheetProps> = ({
  isVisible,
  onClose,
}) => {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);

  if (!isVisible) return null;

  // Generate label: row number (bottom to top) + column letter (A-D)
  const getLabel = (row: number, col: number) => {
    const rowNum = ROWS - row; // 4, 3, 2, 1 (bottom to top)
    const colLetter = String.fromCharCode(65 + col); // A, B, C, D
    return `${rowNum}${colLetter}`;
  };

  return (
    <>
      {/* Non-blocking overlay - just visual, doesn't block clicks */}
      <View style={styles.overlayVisual} pointerEvents="none" />

      {/* Bottom Right Panel - Static and Larger */}
      <View style={styles.panel} pointerEvents="box-none">
        {/* Header */}
        <View style={styles.header}>
          <Typography weight="bold" size={18} color="#333">
            Shelf Space
          </Typography>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialIcons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Grid of 4x4 buttons */}
        <View style={styles.gridContainer}>
          {Array.from({ length: ROWS }).map((_, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {Array.from({ length: COLS }).map((_, colIndex) => {
                const label = getLabel(rowIndex, colIndex);
                const cellKey = `${rowIndex}-${colIndex}`;
                return (
                  <TouchableOpacity
                    key={cellKey}
                    style={[
                      styles.gridButton,
                      selectedCell === cellKey && styles.gridButtonSelected,
                    ]}
                    onPress={() => setSelectedCell(cellKey)}
                  >
                    <Typography
                      weight="bold"
                      size={16}
                      color={selectedCell === cellKey ? '#fff' : '#E15284'}
                    >
                      {label}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlayVisual: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 1,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 99,
  },
  panel: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    width: PANEL_SIZE,
    height: PANEL_SIZE,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    zIndex: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  gridButtonSelected: {
    backgroundColor: '#E15284',
    borderColor: '#C1216B',
  },
});

export default ShelfBottomSheet;