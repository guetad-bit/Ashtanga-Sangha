// src/screens/home/PracticeLogScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';
import { useAppStore } from '@/store/useAppStore';
import { logPractice } from '@/lib/supabase';

// Keys match what goes into the database
const SERIES_KEYS = ['primary', 'intermediate', 'advanced_a', 'led_class', 'half_primary'] as const;
const LOCATION_KEYS = ['home', 'shala', 'online', 'outdoors', 'workshop'] as const;

const SERIES_I18N: Record<string, string> = {
  primary: 'series.primary',
  intermediate: 'series.intermediate',
  advanced_a: 'series.advanced_a',
  led_class: 'series.ledClass',
  half_primary: 'series.halfPrimary',
};

const LOCATION_I18N: Record<string, { i18nKey: string; emoji: string }> = {
  home:     { i18nKey: 'practiceLog.locationHome', emoji: '🏠' },
  shala:    { i18nKey: 'practiceLog.locationShala', emoji: '🧘' },
  online:   { i18nKey: 'practiceLog.locationOnline', emoji: '💻' },
  outdoors: { i18nKey: 'practiceLog.locationOutdoors', emoji: '🌿' },
  workshop: { i18nKey: 'practiceLog.locationWorkshop', emoji: '📚' },
};

const DURATION_OPTIONS = [30, 45, 60, 75, 90, 120];

export default function PracticeLogScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, addPracticeLog } = useAppStore();

  const [series, setSeries] = useState<string>('primary');
  const [location, setLocation] = useState<string>('home');
  const [duration, setDuration] = useState(75);
  const [stoppedAt, setStoppedAt] = useState('');
  const [notes, setNotes] = useState('');
  const [workOnNext, setWorkOnNext] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    const locationLabel = t(LOCATION_I18N[location]?.i18nKey ?? 'practiceLog.locationHome');
    const fullNotes = [
      location && `📍 ${locationLabel}`,
      stoppedAt && `Stopped at: ${stoppedAt}`,
      notes && notes,
      workOnNext && `🎯 Work on next: ${workOnNext}`,
    ].filter(Boolean).join('\n');

    const { error } = await logPractice(user.id, series, duration, fullNotes);
    if (!error) {
      addPracticeLog({
        id: Date.now().toString(),
        userId: user.id,
        loggedAt: new Date().toISOString(),
        series,
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
            <Text style={s.cancelBtn}>{t('practiceLog.cancel')}</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>{t('practiceLog.logPractice')}</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <Text style={[s.saveBtn, saving && { opacity: 0.5 }]}>
              {saving ? t('practiceLog.saving') : t('practiceLog.save')}
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
          <Text style={s.label}>{t('practiceLog.series')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
            {SERIES_KEYS.map((key) => (
              <TouchableOpacity
                key={key}
                style={[s.chip, series === key && s.chipActive]}
                onPress={() => setSeries(key)}
              >
                <Text style={[s.chipText, series === key && s.chipTextActive]}>
                  {t(SERIES_I18N[key])}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Location */}
          <Text style={s.label}>{t('practiceLog.whereDidYouPractice')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
            {LOCATION_KEYS.map((key) => {
              const loc = LOCATION_I18N[key];
              return (
                <TouchableOpacity
                  key={key}
                  style={[s.chip, location === key && s.chipActive]}
                  onPress={() => setLocation(key)}
                >
                  <Text style={[s.chipText, location === key && s.chipTextActive]}>
                    {loc.emoji} {t(loc.i18nKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Duration */}
          <Text style={s.label}>{t('practiceLog.aboutHowLong')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
            {DURATION_OPTIONS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[s.chip, duration === d && s.chipActive]}
                onPress={() => setDuration(d)}
              >
                <Text style={[s.chipText, duration === d && s.chipTextActive]}>{t('practiceLog.min', { d })}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Stopped at */}
          <Text style={s.label}>{t('practiceLog.stoppedAt')}</Text>
          <TextInput
            style={s.input}
            placeholder={t('practiceLog.stoppedAtPlaceholder')}
            placeholderTextColor="#C4B8A8"
            value={stoppedAt}
            onChangeText={setStoppedAt}
          />

          {/* Notes */}
          <Text style={s.label}>{t('practiceLog.notes')}</Text>
          <TextInput
            style={[s.input, s.textArea]}
            placeholder={t('practiceLog.notesPlaceholder')}
            placeholderTextColor="#C4B8A8"
            value={notes}
            onChangeText={setNotes}
            multiline
            textAlignVertical="top"
          />

          {/* Work on next */}
          <Text style={s.label}>{t('practiceLog.workOnNext')}</Text>
          <TextInput
            style={s.input}
            placeholder={t('practiceLog.workOnNextPlaceholder')}
            placeholderTextColor="#C4B8A8"
            value={workOnNext}
            onChangeText={setWorkOnNext}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F2EC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E0D4',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 18,
    color: '#3B3228',
  },
  cancelBtn: { ...typography.bodyMd, color: '#9B8E7E' },
  saveBtn: { ...typography.headingMd, color: '#8A9E78' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing['4xl'] },
  label: {
    ...typography.headingSm,
    color: '#3B3228',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  chipsRow: { gap: spacing.sm },
  chip: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1.5,
    borderColor: '#E8E0D4',
  },
  chipActive: {
    backgroundColor: '#8A9E78',
    borderColor: '#8A9E78',
  },
  chipText: { ...typography.labelMd, color: '#5E5245' },
  chipTextActive: { color: '#FFFFFF' },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: '#E8E0D4',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.bodyMd,
    color: '#3B3228',
  },
  textArea: {
    height: 100,
    paddingTop: spacing.md,
  },
});
