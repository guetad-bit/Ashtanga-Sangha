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
            placeholderTextColor="#6B5C82"
            value={stoppedAt}
            onChangeText={setStoppedAt}
          />

          {/* Notes */}
          <Text style={s.label}>Notes</Text>
          <TextInput
            style={[s.input, s.textArea]}
            placeholder="How was your practice today?"
            placeholderTextColor="#6B5C82"
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
            placeholderTextColor="#6B5C82"
            value={workOnNext}
            onChangeText={setWorkOnNext}
          />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0B1E' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: '#231A3D',
    backgroundColor: '#0F0B1E',
  },
  headerTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18, color: '#FFFFFF',
  },
  cancelBtn: { ...typography.bodyMd, color: '#9B8CB8' },
  saveBtn: { ...typography.headingMd, color: '#A855F7' },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing['4xl'] },

  label: {
    ...typography.headingSm, color: '#FFFFFF',
    marginBottom: spacing.sm, marginTop: spacing.lg,
  },

  chipsRow: { gap: spacing.sm },
  chip: {
    backgroundColor: '#1A1432', borderRadius: radius.full,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderWidth: 1.5, borderColor: '#231A3D',
  },
  chipActive: {
    backgroundColor: '#A855F7', borderColor: '#A855F7',
  },
  chipText: { ...typography.labelMd, color: '#E8E0F0' },
  chipTextActive: { color: '#FFFFFF' },

  input: {
    backgroundColor: '#1A1432', borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: '#231A3D',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    ...typography.bodyMd, color: '#FFFFFF',
  },
  textArea: {
    height: 100, paddingTop: spacing.md,
  },
});
