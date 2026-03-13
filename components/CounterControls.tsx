import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface Props {
  onDecrement: () => void;
  onIncrement: () => void;
}

export function CounterControls({ onDecrement, onIncrement }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.decrementButton}
        onPress={onDecrement}
        activeOpacity={0.75}
      >
        <Ionicons name="remove" size={28} color={theme.colors.foreground} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.incrementButton}
        onPress={onIncrement}
        activeOpacity={0.75}
      >
        <Ionicons name="add" size={38} color={theme.colors.primaryForeground} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  decrementButton: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.secondary,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}33`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incrementButton: {
    flex: 1,
    height: 72,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
});
