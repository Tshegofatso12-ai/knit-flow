import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface Props {
  count: number;
  onReset: () => void;
}

export function RowCounter({ count, onReset }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.circleWrapper}>
        {/* Subtle glow behind the circle */}
        <View style={styles.glow} />
        <View style={styles.circle}>
          <Text style={styles.rowLabel}>Row</Text>
          <Text style={styles.count}>{count}</Text>
          <View style={styles.divider} />
        </View>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={onReset}
          activeOpacity={0.7}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        >
          <Ionicons name="refresh" size={18} color={theme.colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  circleWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: `${theme.colors.primary}0D`,
  },
  circle: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 8,
    borderColor: `${theme.colors.primary}1A`,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.05,
    shadowRadius: 50,
    elevation: 5,
  },
  rowLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.mutedForeground,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  count: {
    fontSize: 88,
    fontWeight: '900',
    color: theme.colors.primary,
    lineHeight: 96,
    letterSpacing: -4,
  },
  divider: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    marginTop: 16,
  },
  resetButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
