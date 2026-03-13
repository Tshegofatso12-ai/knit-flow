import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Header } from '../components/Header';
import { ActiveProjectCard } from '../components/ActiveProjectCard';
import { RowCounter } from '../components/RowCounter';
import { CounterControls } from '../components/CounterControls';
import { FooterStats } from '../components/FooterStats';
import { ProjectModal } from '../components/ProjectModal';

import { useRowCounter } from '../hooks/useRowCounter';
import { useSessionTimer } from '../hooks/useSessionTimer';
import { theme } from '../constants/theme';

function calculatePace(sessionRowsAdded: number, sessionStartedAt: number | null): string {
  if (sessionStartedAt === null || sessionRowsAdded === 0) return '--';
  const elapsedHours = (Date.now() - sessionStartedAt) / 3_600_000;
  if (elapsedHours < 0.005) return '--';
  return `${Math.round(sessionRowsAdded / elapsedHours)}`;
}

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  const {
    count,
    activeProject,
    projects,
    activeProjectId,
    sessionRowsAdded,
    sessionStartedAt,
    increment,
    decrement,
    reset,
    createProject,
    switchProject,
  } = useRowCounter();

  const { display: sessionTime } = useSessionTimer(sessionStartedAt);
  const pace = calculatePace(sessionRowsAdded, sessionStartedAt);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <ActiveProjectCard
          projectName={activeProject?.name ?? ''}
          onPress={() => setModalVisible(true)}
        />
        <View style={styles.counterSection}>
          <RowCounter count={count} onReset={reset} />
          <CounterControls onDecrement={decrement} onIncrement={increment} />
        </View>
        <FooterStats sessionTime={sessionTime} pace={pace} />
      </ScrollView>

      <ProjectModal
        visible={modalVisible}
        projects={projects}
        activeProjectId={activeProjectId}
        onClose={() => setModalVisible(false)}
        onSwitch={switchProject}
        onCreate={createProject}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  counterSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
});
