// src/screens/home/PracticeLogScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';
import { useAppStore } from '@/store/useAppStore';
import { logPractice } from '@/lib/supabase';

const SERIES_OPTIONS = ['Primary', 'Intermediate', 'Advanced A', 'Led Class', 'Half Primary'];
const LOCATION_OPTIONS = ['Home', 'Shala', 'Online', 'Outdoors', 'Workshop'];
const DURATION_OPTIONS = [30, 45, 60, 75, 90, 120];

export default function PracticeLogScreen() {
  const router = useRouter();
  const { user, addPracticeLog } = useAppStore();

  const [series, setSeries] = useState('Primary');
  const [location, setLocation] = useState('Home');
  const [duration, setDuration] = useState(75);
  const [stoppedAt, setStoppedAt] = useState('');
  const [notes, setNotes] = useState('');
  const [workOnNext, setWorkOnNext] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);

    const fullNotes = [
      location && `📍 ${location}`,
      stoppedAt && `Stopped at: ${stoppedAt}`,
      notes && notes,
      workOnNext && `🎯 Work on next: ${workOnNext}`,
    ].filter(Boolean).join('\n');

    const { error } = await logPractice(user.id, series.toLowerCase(), duration, fullNotes);
    if (!error) {
      addPracticeLog({
        id: Date.now().toString(),
        userId: user.id,
        loggedAt: new Date().toISOString(),
        series: series.toLowerCase(),
        durationMin: duration,
      });
    }

    setSaving(false);
    router.back();
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.cancelBtn}>Cancel</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Log Practice</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <Text style={[s.saveBtn, saving && { opacity: 0.5 }]}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Series */}
          <Text style={s.label}>Series</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
            {SERIES_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[s.chip, series === opt && s.chipActive]}
                onPress={() => setSeries(opt)}
              >
                <Text style={[s.chipText, series === opt && s.chipTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Location */}
          <Text style={s.label}>Where did you practice?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
            {LOCATION_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[s.chip, location === opt && s.chipActive]}
                onPress={() => setLocation(opt)}
              >
                <Text style={[s.chipText, location === opt && s.chipTextActive]}>
                  {opt === 'Home' ? '🏠' : opt === 'Shala' ? '🧘' : opt === 'Online' ? '💻' : opt === 'Outdoors' ? '🌿' : '📚'} {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Duration */}
          <Text style={s.label}>Duration (min)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
            {DURATION_OPTIONS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[s.chip, duration === d && s.chipActive]}
                onPress={() => setDuration(d)}
              >
                <Text style={[s.chipText, duration === d && s.chipTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Stopped at */}
          <Text style={s.label}>Stopped at (posture)</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Navasana, Marichyasana C..."
            placeholderTextColor={colors.mutedL}
            value={stoppedAt}
            onChangeText={setStoppedAt}
          />

          {/* Notes */}
          <Text style={s.label}>Notes</Text>
          <TextInput
            style={[s.input, s.textArea]}
            placeholder="How was your practice today?"
            placeholderTextColor={colors.mutedL}
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />

          {/* Work on next time */}
          <Text style={s.label}>🎯 Work on next time</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Jump-backs, deeper twist in Mari C..."
            placeholderTextColor={colors.mutedL}
            value={workOnNext}
            onChangeText={setWorkOnNext}
          />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF8F5' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: '#EEEAE5',
  },
  headerTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18, color: colors.ink,
  },
  cancelBtn: { ...typography.bodyMd, color: colors.muted },
  saveBtn: { ...typography.headingMd, color: colors.sage },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing['4xl'] },

  label: {
    ...typography.headingSm, color: colors.ink,
    marginBottom: spacing.sm, marginTop: spacing.lg,
  },

  chipsRow: { gap: spacing.sm },
  chip: {
    backgroundColor: '#fff', borderRadius: radius.full,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderWidth: 1.5, borderColor: '#E8E4DE',
  },
  chipActive: {
    backgroundColor: colors.sage, borderColor: colors.sage,
  },
  chipText: { ...typography.labelMd, color: colors.inkMid },
  chipTextActive: { color: '#fff' },

  input: {
    backgroundColor: '#fff', borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: '#E8E4DE',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    ...typography.bodyMd, color: colors.ink,
  },
  textArea: {
    height: 100, paddingTop: spacing.md,
  },
});
