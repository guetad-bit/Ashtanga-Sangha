// src/components/LogPracticeModal.tsx
import React, { useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity, TextInput,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';
import { useAppStore } from '@/store/useAppStore';
import { logPractice, setPracticingNow } from '@/lib/supabase';

const SERIES_OPTIONS = [
  { value: 'sun_sals', label: 'Sun Salutations', emoji: '☀️' },
  { value: 'primary', label: 'Primary Series', emoji: '🧘' },
  { value: 'intermediate', label: 'Intermediate', emoji: '🔥' },
  { value: 'advanced_a', label: 'Advanced A', emoji: '⚡' },
  { value: 'advanced_b', label: 'Advanced B', emoji: '🌟' },
  { value: 'short', label: 'Short Practice', emoji: '🕐' },
] as const;

const MOOD_OPTIONS = [
  { value: 'strong', label: 'Strong', emoji: '🔥' },
  { value: 'steady', label: 'Steady', emoji: '🧘' },
  { value: 'challenging', label: 'Challenging', emoji: '💧' },
  { value: 'low_energy', label: 'Low Energy', emoji: '🌙' },
  { value: 'blissful', label: 'Blissful', emoji: '✨' },
] as const;

const DURATION_OPTIONS = [30, 45, 60, 75, 90, 120];

// Three modal steps
type ModalStep = 'select_series' | 'on_the_mat' | 'questionnaire';

/* ── Insta Ocean palette ──────────────────────────────────────────────────── */
const ocean = {
  bg: '#F0F4FF',
  cardBg: '#FFFFFF',
  ink: '#1A2744',
  inkMid: '#3D5070',
  muted: '#7B8FAD',
  accent: '#405DE6',
  sage: '#34D399',
  sageBg: '#E0FFF0',
  coral: '#FF6B6B',
  coralLight: '#FFF0F0',
  divider: '#DDE4F0',
  sky: '#5B8DEF',
  accentBg: '#E8EEFF',
  white: '#FFFFFF',
};

export default function LogPracticeModal() {
  const {
    isLogModalOpen, setLogModalOpen,
    user, addPracticeLog,
    isPracticing, setIsPracticing,
  } = useAppStore();

  const [step, setStep] = useState<ModalStep>('select_series');
  const [selectedSeries, setSelectedSeries] = useState('primary');
  const [saving, setSaving] = useState(false);

  // Questionnaire state
  const [mood, setMood] = useState('');
  const [duration, setDuration] = useState(90);
  const [stoppedAt, setStoppedAt] = useState('');
  const [notes, setNotes] = useState('');
  const [workingOn, setWorkingOn] = useState('');

  const resetForm = () => {
    setStep('select_series');
    setSelectedSeries('primary');
    setMood('');
    setDuration(90);
    setStoppedAt('');
    setNotes('');
    setWorkingOn('');
  };

  const handleClose = () => {
    setLogModalOpen(false);
    if (!isPracticing) resetForm();
  };

  const handleGoOnMat = async () => {
    if (!user) {
      Alert.alert('Not signed in', 'Please sign in first.');
      return;
    }
    setSaving(true);
    try {
      await setPracticingNow(user.id, true);
      setIsPracticing(true);
      setStep('on_the_mat');
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleFinishPractice = () => {
    setStep('questionnaire');
  };

  const handleSaveLog = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const fullNotes = [
        mood && `Feeling: ${MOOD_OPTIONS.find(m => m.value === mood)?.label ?? mood}`,
        stoppedAt && `Stopped at: ${stoppedAt}`,
        notes && notes,
        workingOn && `Working on: ${workingOn}`,
      ].filter(Boolean).join('\n');

      const { error } = await logPractice(user.id, selectedSeries, duration, fullNotes || undefined);
      if (error) {
        Alert.alert('Error', error.message);
        setSaving(false);
        return;
      }

      addPracticeLog({
        id: Date.now().toString(),
        userId: user.id,
        loggedAt: new Date().toISOString(),
        series: selectedSeries,
        durationMin: duration,
      });

      setLogModalOpen(false);
      resetForm();
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  React.useEffect(() => {
    if (isLogModalOpen && isPracticing && step === 'select_series') {
      setStep('on_the_mat');
    }
  }, [isLogModalOpen]);

  if (!isLogModalOpen) return null;

  return (
    <Modal
      visible={isLogModalOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>
              {step === 'questionnaire' ? 'Skip' : 'Cancel'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === 'select_series' ? 'Start Practice' :
             step === 'on_the_mat' ? 'On the Mat' :
             'How Was Your Practice?'}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ═══ STEP 1: Select series & go on the mat ═══ */}
          {step === 'select_series' && (
            <>
              <View style={styles.dateCard}>
                <Text style={styles.dateEmoji}>🙏</Text>
                <Text style={styles.dateText}>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>

              <Text style={styles.sectionLabel}>What are you practicing?</Text>
              <View style={styles.seriesGrid}>
                {SERIES_OPTIONS.map((series) => {
                  const isSelected = selectedSeries === series.value;
                  return (
                    <TouchableOpacity
                      key={series.value}
                      style={[styles.seriesCard, isSelected && styles.seriesCardSelected]}
                      onPress={() => setSelectedSeries(series.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.seriesEmoji}>{series.emoji}</Text>
                      <Text style={[styles.seriesLabel, isSelected && styles.seriesLabelSelected]}>
                        {series.label}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkMark}>
                          <Text style={styles.checkMarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[styles.goBtn, saving && styles.btnDisabled]}
                onPress={handleGoOnMat}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.goBtnText}>I'm on the mat</Text>
                    <Text style={styles.goBtnSub}>Your sangha will see you're practicing</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* ═══ STEP 2: You're on the mat ═══ */}
          {step === 'on_the_mat' && (
            <>
              <View style={styles.activeCard}>
                <Text style={styles.activeEmoji}>🧘</Text>
                <Text style={styles.activeTitle}>You're on the mat!</Text>
                <Text style={styles.activeSub}>
                  Your sangha can see you're practicing.{'\n'}
                  Take your time — enjoy your practice.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.finishBtn}
                onPress={handleFinishPractice}
                activeOpacity={0.85}
              >
                <Text style={styles.finishBtnText}>Finish Practice</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ═══ STEP 3: Post-practice questionnaire ═══ */}
          {step === 'questionnaire' && (
            <>
              <View style={styles.questionnaireHeader}>
                <Text style={styles.questionnaireEmoji}>🙏</Text>
                <Text style={styles.questionnaireTitle}>Great practice!</Text>
                <Text style={styles.questionnaireSub}>
                  Tell us a bit about how it went.
                </Text>
              </View>

              <Text style={styles.qLabel}>What did you practice?</Text>
              <View style={styles.seriesGrid}>
                {SERIES_OPTIONS.map((series) => {
                  const isSelected = selectedSeries === series.value;
                  return (
                    <TouchableOpacity
                      key={series.value}
                      style={[styles.seriesCardSmall, isSelected && styles.seriesCardSelected]}
                      onPress={() => setSelectedSeries(series.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.seriesEmojiSmall}>{series.emoji}</Text>
                      <Text style={[styles.seriesLabelSmall, isSelected && styles.seriesLabelSelected]}>
                        {series.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.qLabel}>How did you feel?</Text>
              <View style={styles.moodRow}>
                {MOOD_OPTIONS.map((m) => {
                  const isSelected = mood === m.value;
                  return (
                    <TouchableOpacity
                      key={m.value}
                      style={[styles.moodChip, isSelected && styles.moodChipSelected]}
                      onPress={() => setMood(m.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.moodEmoji}>{m.emoji}</Text>
                      <Text style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.qLabel}>How long? (minutes)</Text>
              <View style={styles.durationRow}>
                {DURATION_OPTIONS.map((d) => {
                  const isSelected = duration === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      style={[styles.durationChip, isSelected && styles.durationChipSelected]}
                      onPress={() => setDuration(d)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.durationText, isSelected && styles.durationTextSelected]}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.qLabel}>Stopped at (posture)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Navasana, Marichyasana C..."
                placeholderTextColor={ocean.muted}
                value={stoppedAt}
                onChangeText={setStoppedAt}
              />

              <Text style={styles.qLabel}>What are you working on?</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Jump-backs, deeper twists..."
                placeholderTextColor={ocean.muted}
                value={workingOn}
                onChangeText={setWorkingOn}
              />

              <Text style={styles.qLabel}>Anything else?</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Notes about your practice..."
                placeholderTextColor={ocean.muted}
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.btnDisabled]}
                onPress={handleSaveLog}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Practice</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ocean.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderBottomColor: ocean.divider, backgroundColor: ocean.cardBg,
  },
  closeBtn: { width: 60 },
  closeBtnText: { ...typography.labelLg, color: ocean.accent },
  headerTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18,
    color: ocean.ink,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing['4xl'] },

  dateCard: {
    alignItems: 'center', backgroundColor: ocean.cardBg,
    borderRadius: radius['2xl'], padding: spacing.xl,
    marginBottom: spacing['2xl'], ...shadows.sm,
    borderWidth: 1, borderColor: ocean.divider,
  },
  dateEmoji: { fontSize: 32, marginBottom: spacing.sm },
  dateText: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18,
    color: ocean.ink,
  },

  activeCard: {
    alignItems: 'center', backgroundColor: ocean.cardBg,
    borderRadius: radius['2xl'], padding: spacing['2xl'],
    marginBottom: spacing['2xl'], ...shadows.sm,
    borderWidth: 2, borderColor: ocean.sage,
  },
  activeEmoji: { fontSize: 48, marginBottom: spacing.md },
  activeTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22,
    color: ocean.sage, marginBottom: spacing.sm,
  },
  activeSub: { ...typography.bodySm, color: ocean.muted, textAlign: 'center', lineHeight: 20 },

  sectionLabel: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 16,
    color: ocean.ink, marginBottom: spacing.md,
  },

  seriesGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: spacing.md, marginBottom: spacing['2xl'],
  },
  seriesCard: {
    width: '47%', backgroundColor: ocean.cardBg,
    borderRadius: radius.xl, padding: spacing.lg,
    borderWidth: 2, borderColor: ocean.divider, position: 'relative',
  },
  seriesCardSmall: {
    width: '47%', backgroundColor: ocean.cardBg,
    borderRadius: radius.lg, paddingVertical: spacing.md, paddingHorizontal: spacing.md,
    borderWidth: 2, borderColor: ocean.divider,
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
  },
  seriesCardSelected: { borderColor: ocean.accent, backgroundColor: ocean.accentBg },
  seriesEmoji: { fontSize: 24, marginBottom: spacing.sm },
  seriesEmojiSmall: { fontSize: 18 },
  seriesLabel: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: ocean.ink,
  },
  seriesLabelSmall: {
    fontFamily: 'DMSans_500Medium', fontSize: 13, color: ocean.ink, flex: 1,
  },
  seriesLabelSelected: { color: ocean.accent },
  checkMark: {
    position: 'absolute', top: spacing.sm, right: spacing.sm,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: ocean.accent, alignItems: 'center', justifyContent: 'center',
  },
  checkMarkText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  goBtn: {
    backgroundColor: ocean.accent, borderRadius: radius['2xl'],
    paddingVertical: spacing.xl, alignItems: 'center', ...shadows.md,
  },
  goBtnText: {
    fontFamily: 'DMSans_700Bold', fontSize: 20, color: '#fff',
  },
  goBtnSub: { ...typography.bodyXs, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  finishBtn: {
    backgroundColor: ocean.coral, borderRadius: radius['2xl'],
    paddingVertical: spacing.xl, alignItems: 'center', ...shadows.md,
  },
  finishBtnText: {
    fontFamily: 'DMSans_700Bold', fontSize: 18, color: '#fff',
  },

  questionnaireHeader: {
    alignItems: 'center', marginBottom: spacing.xl,
  },
  questionnaireEmoji: { fontSize: 36, marginBottom: spacing.sm },
  questionnaireTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, color: ocean.ink,
    marginBottom: 4,
  },
  questionnaireSub: {
    ...typography.bodySm, color: ocean.muted, textAlign: 'center',
  },

  qLabel: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 15,
    color: ocean.ink, marginBottom: spacing.sm, marginTop: spacing.lg,
  },

  moodRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
    marginBottom: spacing.md,
  },
  moodChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: ocean.cardBg, borderRadius: radius.full,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderWidth: 1.5, borderColor: ocean.divider,
  },
  moodChipSelected: {
    borderColor: ocean.coral, backgroundColor: ocean.coralLight,
  },
  moodEmoji: { fontSize: 16 },
  moodLabel: {
    fontFamily: 'DMSans_500Medium', fontSize: 13, color: ocean.ink,
  },
  moodLabelSelected: { color: ocean.coral },

  durationRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
    marginBottom: spacing.md,
  },
  durationChip: {
    backgroundColor: ocean.cardBg, borderRadius: radius.full,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderWidth: 1.5, borderColor: ocean.divider,
  },
  durationChipSelected: {
    borderColor: ocean.accent, backgroundColor: ocean.accentBg,
  },
  durationText: {
    fontFamily: 'DMSans_500Medium', fontSize: 13, color: ocean.ink,
  },
  durationTextSelected: { color: ocean.accent },

  input: {
    backgroundColor: ocean.cardBg, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: ocean.divider,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    ...typography.bodyMd, color: ocean.ink,
    marginBottom: spacing.sm,
  },
  textArea: {
    height: 80, paddingTop: spacing.md,
  },

  saveBtn: {
    backgroundColor: ocean.accent, borderRadius: radius['2xl'],
    paddingVertical: spacing.xl, alignItems: 'center',
    marginTop: spacing.xl, ...shadows.md,
  },
  saveBtnText: {
    fontFamily: 'DMSans_700Bold', fontSize: 18, color: '#fff',
  },

  btnDisabled: { opacity: 0.6 },
});
