import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

export function Header() {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>KnitFlow</Text>
        <Text style={styles.subtitle}>Keep your rhythm</Text>
      </View>
      <TouchableOpacity style={styles.settingsButton} activeOpacity={0.7}>
        <Ionicons name="settings-sharp" size={22} color={theme.colors.foreground} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.foreground,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
