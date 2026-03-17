import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Typography from '@/components/typography';

interface AvailableSpaceButtonProps {
  onPress: () => void;
}

const AvailableSpaceButton: React.FC<AvailableSpaceButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons name="chevron-up" size={32} color="#fff" style={styles.icon} />
      <Typography weight="bold" size={20} color="#fff">
        Available Space 
      </Typography>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: '#E15284',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 8,
    shadowColor: '#E15284',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  icon: {
    marginTop: -2,
  },
});

export default AvailableSpaceButton;