import React, { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Project } from '../types';
import { theme } from '../constants/theme';

interface Props {
  visible: boolean;
  projects: Project[];
  activeProjectId: string;
  onClose: () => void;
  onSwitch: (id: string) => void;
  onCreate: (name: string) => void;
}

export function ProjectModal({ visible, projects, activeProjectId, onClose, onSwitch, onCreate }: Props) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  function handleCreate() {
    if (!newName.trim()) return;
    onCreate(newName.trim());
    setNewName('');
    setCreating(false);
    onClose();
  }

  function handleClose() {
    setCreating(false);
    setNewName('');
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>
              {creating ? 'New Project' : 'Your Projects'}
            </Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Ionicons name="close" size={22} color={theme.colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {creating ? (
            // Create new project form
            <View style={styles.createForm}>
              <TextInput
                style={styles.input}
                placeholder="e.g. Cable Knit Scarf"
                placeholderTextColor={theme.colors.mutedForeground}
                value={newName}
                onChangeText={setNewName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleCreate}
              />
              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => { setCreating(false); setNewName(''); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, !newName.trim() && styles.saveButtonDisabled]}
                  onPress={handleCreate}
                  activeOpacity={0.7}
                  disabled={!newName.trim()}
                >
                  <Text style={styles.saveText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // Project list
            <>
              <FlatList
                data={projects}
                keyExtractor={(item) => item.id}
                style={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const isActive = item.id === activeProjectId;
                  return (
                    <TouchableOpacity
                      style={[styles.projectRow, isActive && styles.projectRowActive]}
                      activeOpacity={0.7}
                      onPress={() => { onSwitch(item.id); onClose(); }}
                    >
                      <View style={[styles.projectIcon, isActive && styles.projectIconActive]}>
                        <Text style={styles.projectEmoji}>🧶</Text>
                      </View>
                      <View style={styles.projectInfo}>
                        <Text style={[styles.projectName, isActive && styles.projectNameActive]}>
                          {item.name}
                        </Text>
                        <Text style={styles.projectRows}>
                          {item.rowCount} {item.rowCount === 1 ? 'row' : 'rows'}
                        </Text>
                      </View>
                      {isActive && (
                        <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                }}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
              <TouchableOpacity
                style={styles.newProjectButton}
                onPress={() => setCreating(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle-outline" size={20} color={theme.colors.primaryForeground} />
                <Text style={styles.newProjectText}>New Project</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    paddingBottom: 36,
    paddingHorizontal: 24,
    paddingTop: 12,
    maxHeight: '75%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.muted,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.foreground,
  },
  list: {
    maxHeight: 320,
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: theme.radius.xl,
    gap: 12,
  },
  projectRowActive: {
    backgroundColor: `${theme.colors.primary}0F`,
  },
  projectIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectIconActive: {
    backgroundColor: `${theme.colors.primary}1A`,
  },
  projectEmoji: {
    fontSize: 20,
  },
  projectInfo: {
    flex: 1,
  },
  projectName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.cardForeground,
  },
  projectNameActive: {
    color: theme.colors.primary,
  },
  projectRows: {
    fontSize: 12,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: 12,
  },
  newProjectButton: {
    marginTop: 16,
    height: 56,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  newProjectText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primaryForeground,
  },
  // Create form
  createForm: {
    gap: 16,
    paddingTop: 4,
  },
  input: {
    height: 52,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.input,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.foreground,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: theme.radius.xl,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.mutedForeground,
  },
  saveButton: {
    flex: 2,
    height: 52,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primaryForeground,
  },
});
