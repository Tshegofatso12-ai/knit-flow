import React, { useState } from 'react';
import {
  Alert,
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

type Mode = 'list' | 'create' | 'edit';

interface Props {
  visible: boolean;
  projects: Project[];
  activeProjectId: string;
  onClose: () => void;
  onSwitch: (id: string) => void;
  onCreate: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export function ProjectModal({
  visible,
  projects,
  activeProjectId,
  onClose,
  onSwitch,
  onCreate,
  onRename,
  onDelete,
}: Props) {
  const [mode, setMode] = useState<Mode>('list');
  const [inputValue, setInputValue] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  function resetAndClose() {
    setMode('list');
    setInputValue('');
    setEditingProject(null);
    onClose();
  }

  function handleCreate() {
    if (!inputValue.trim()) return;
    onCreate(inputValue.trim());
    setInputValue('');
    setMode('list');
    onClose();
  }

  function handleRename() {
    if (!inputValue.trim() || !editingProject) return;
    onRename(editingProject.id, inputValue.trim());
    setInputValue('');
    setEditingProject(null);
    setMode('list');
  }

  function startEdit(project: Project) {
    setEditingProject(project);
    setInputValue(project.name);
    setMode('edit');
  }

  function confirmDelete(project: Project) {
    if (projects.length <= 1) {
      Alert.alert("Can't Delete", "You need at least one project.");
      return;
    }
    Alert.alert(
      'Delete Project',
      `Delete "${project.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(project.id);
            if (mode === 'edit') setMode('list');
          },
        },
      ]
    );
  }

  const title = mode === 'create' ? 'New Project' : mode === 'edit' ? 'Edit Project' : 'Your Projects';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={resetAndClose}>
      <Pressable style={styles.overlay} onPress={resetAndClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.sheetHeader}>
            {mode !== 'list' ? (
              <TouchableOpacity
                onPress={() => { setMode('list'); setInputValue(''); setEditingProject(null); }}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={20} color={theme.colors.foreground} />
              </TouchableOpacity>
            ) : (
              <View style={styles.backButton} />
            )}
            <Text style={styles.sheetTitle}>{title}</Text>
            <TouchableOpacity onPress={resetAndClose} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <Ionicons name="close" size={22} color={theme.colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {mode === 'list' && (
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
                        <Text style={[styles.projectName, isActive && styles.projectNameActive]} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.projectRows}>
                          {item.rowCount} {item.rowCount === 1 ? 'row' : 'rows'}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => startEdit(item)}
                        hitSlop={{ top: 8, right: 4, bottom: 8, left: 4 }}
                      >
                        <Ionicons name="pencil-outline" size={17} color={theme.colors.mutedForeground} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => confirmDelete(item)}
                        hitSlop={{ top: 8, right: 4, bottom: 8, left: 4 }}
                        disabled={projects.length <= 1}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={17}
                          color={projects.length <= 1 ? theme.colors.muted : theme.colors.destructive}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                }}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
              <TouchableOpacity
                style={styles.newProjectButton}
                onPress={() => { setInputValue(''); setMode('create'); }}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle-outline" size={20} color={theme.colors.primaryForeground} />
                <Text style={styles.newProjectText}>New Project</Text>
              </TouchableOpacity>
            </>
          )}

          {(mode === 'create' || mode === 'edit') && (
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder={mode === 'create' ? 'e.g. Cable Knit Scarf' : 'Project name'}
                placeholderTextColor={theme.colors.mutedForeground}
                value={inputValue}
                onChangeText={setInputValue}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={mode === 'create' ? handleCreate : handleRename}
              />
              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => { setMode('list'); setInputValue(''); setEditingProject(null); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, !inputValue.trim() && styles.saveButtonDisabled]}
                  onPress={mode === 'create' ? handleCreate : handleRename}
                  activeOpacity={0.7}
                  disabled={!inputValue.trim()}
                >
                  <Text style={styles.saveText}>{mode === 'create' ? 'Create' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
              {mode === 'edit' && editingProject && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => confirmDelete(editingProject)}
                  activeOpacity={0.7}
                  disabled={projects.length <= 1}
                >
                  <Ionicons name="trash-outline" size={18} color={projects.length <= 1 ? theme.colors.muted : theme.colors.destructive} />
                  <Text style={[styles.deleteText, projects.length <= 1 && styles.deleteTextDisabled]}>
                    Delete Project
                  </Text>
                </TouchableOpacity>
              )}
            </View>
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
  backButton: {
    width: 28,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.foreground,
  },
  // List view
  list: {
    maxHeight: 320,
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: theme.radius.xl,
    gap: 10,
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
  iconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
  // Form (create / edit)
  form: {
    gap: 12,
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.destructive,
  },
  deleteTextDisabled: {
    color: theme.colors.muted,
  },
});
