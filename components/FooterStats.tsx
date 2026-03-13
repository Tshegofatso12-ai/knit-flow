import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface Props {
  sessionTime: string;
  pace: string;
}

export function FooterStats({ sessionTime, pace }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
        <Text style={styles.value}>{sessionTime}</Text>
        <Text style={styles.label}>Session</Text>
      </View>
      <View style={styles.card}>
        <Ionicons name="speedometer-outline" size={20} color={theme.colors.primary} />
        <Text style={styles.value}>{pace === '--' ? pace : `${pace} rows/h`}</Text>
        <Text style={styles.label}>Pace</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xxl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.cardForeground,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
