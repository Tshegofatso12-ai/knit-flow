import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface Props {
  projectName: string;
  onPress: () => void;
}

export function ActiveProjectCard({ projectName, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.iconWrapper}>
        <Text style={styles.emoji}>🧶</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.projectName}>{projectName}</Text>
        <Text style={styles.label}>PROJECT ACTIVE</Text>
      </View>
      <Ionicons name="chevron-down" size={20} color={theme.colors.mutedForeground} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xxl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.lg,
    backgroundColor: `${theme.colors.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  info: {
    flex: 1,
  },
  projectName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.foreground,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.mutedForeground,
    letterSpacing: 0.8,
    marginTop: 2,
  },
});
