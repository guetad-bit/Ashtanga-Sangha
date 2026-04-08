// src/components/LogPracticeModal.tsx
import React, { useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity, TextInput,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';
import { useAppStore } from '@/store/useAppStore';
import { logPractice, setPracticingNow } from '@/lib/supabase';

const SERIES_OPTIONS = (t: any) => [
  { value: 'sun_sals', label: t('series.sun_sals'), emoji: '☀️' },
  { value: 'primary', label: t('series.primary'), emoji: '🧘' },
  { value: 'intermediate', label: t('series.intermediate'), emoji: '🔥' },
  { value: 'advanced_a', label: t('series.advanced_a'), emoji: '⚡' },
  { value: 'advanced_b', label: t('series.advanced_b'), emoji: '🌟' },
  { value: 'short', label: t('series.short'), emoji: '🕐' },
] as const;

const MOOD_OPTIONS = (t: any) => [
  { value: 'strong', label: t('logModal.moodStrong'), emoji: '🔥' },
  { value: 'steady', label: t('logModal.moodSteady'), emoji: '🧘' },
  { value: 'challenging', label: t('logModal.moodChallenging'), emoji: '💧' },
  { value: 'low_energy', label: t('logModal.moodLowEnergy'), emoji: '🌙' },
  { value: 'blissful', label: t('logModal.moodBlissful'), emoji: '✨' },
] as const;

const DURATION_OPTIONS = [30, 45, 60, 75, 90, 120];

// Three modal steps
type ModalStep = 'select_series' | 'on_the_mat' | 'questionnaire';

/* ── Stone & Moss palette ──────────────────────────────────────────────────── */
const moss = {
  bg: '#F6F2EC',
  cardBg: '#FFFFFF',
  ink: '#3B3228',
  inkMid: '#5E5245',
  muted: '#9B8E7E',
  accent: '#C26B4D',
  sage: '#A8B59B',
  sageBg: '#F0F5EB',
  coral: '#C26B4D',
  coralLight: '#F7F1E7',
  divider: '#E8DFD0',
  sky: '#A5502F',
  accentBg: '#F7F1E7',
  white: '#FFFFFF',
};

export default function LogPracticeModal() {
  const { t } = useTranslation();
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
      Alert.alert(t('logModal.notSignedIn'), t('logModal.signInFirst'));
      return;
    }
    setSaving(true);
    try {
      await setPracticingNow(user.id, true);
      setIsPracticing(true);
      setStep('on_the_mat');
    } catch {
      Alert.alert(t('logModal.error'), t('logModal.somethingWrong'));
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
        mood && `Feeling: ${MOOD_OPTIONS(t).find(m => m.value === mood)?.label ?? mood}`,
        stoppedAt && `Stopped at: ${stoppedAt}`,
        notes && notes,
        workingOn && `Working on: ${workingOn}`,
      ].filter(Boolean).join('\n');

      const { error } = await logPractice(user.id, selectedSeries, duration, fullNotes || undefined);
      if (error) {
        Alert.alert(t('logModal.error'), error.message);
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
      Alert.alert(t('logModal.error'), t('logModal.somethingWrong'));
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
              {step === 'questionnaire' ? t('practiceLog.cancel') : t('practiceLog.cancel')}
            </Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === 'select_series' ? t('practiceLog.logPractice') :
             step === 'on_the_mat' ? t('logModal.onTheMat') :
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

              <Text style={styles.sectionLabel}>{t('practiceLog.series')}</Text>
              <View style={styles.seriesGrid}>
                {SERIES_OPTIONS(t).map((series) => {
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
                    <Text style={styles.goBtnText}>{t('logModal.imOnTheMat')} 🧘</Text>
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
                  Take your time.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.finishBtn}
                onPress={handleFinishPractice}
                activeOpacity={0.85}
              >
                <Text style={styles.finishBtnText}>{t('practiceLog.logPractice')}</Text>
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

              <Text style={styles.qLabel}>{t('practiceLog.series')}</Text>
              <View style={styles.seriesGrid}>
                {SERIES_OPTIONS(t).map((series) => {
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
                {MOOD_OPTIONS(t).map((m) => {
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

              <Text style={styles.qLabel}>{t('practiceLog.aboutHowLong')}</Text>
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

              <Text style={styles.qLabel}>{t('practiceLog.stoppedAt')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('practiceLog.stoppedAtPlaceholder')}
                placeholderTextColor={moss.muted}
                value={stoppedAt}
                onChangeText={setStoppedAt}
              />

              <Text style={styles.qLabel}>{t('practiceLog.workOnNext')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('practiceLog.workOnNextPlaceholder')}
                placeholderTextColor={moss.muted}
                value={workingOn}
                onChangeText={setWorkingOn}
              />

              <Text style={styles.qLabel}>{t('practiceLog.notes')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('practiceLog.notesPlaceholder')}
                placeholderTextColor={moss.muted}
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
                  <Text style={styles.saveBtnText}>{t('practiceLog.save')}</Text>
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
  container: { flex: 1, backgroundColor: moss.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderBottomColor: moss.divider, backgroundColor: moss.cardBg,
  },
  closeBtn: { width: 60 },
  closeBtnText: { ...typography.labelLg, color: moss.accent },
  headerTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18,
    color: moss.ink,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing['4xl'] },

  dateCard: {
    alignItems: 'center', backgroundColor: moss.cardBg,
    borderRadius: radius['2xl'], padding: spacing.xl,
    marginBottom: spacing['2xl'], ...shadows.sm,
    borderWidth: 1, borderColor: moss.divider,
  },
  dateEmoji: { fontSize: 32, marginBottom: spacing.sm },
  dateText: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18,
    color: moss.ink,
  },

  activeCard: {
    alignItems: 'center', backgroundColor: moss.cardBg,
    borderRadius: radius['2xl'], padding: spacing['2xl'],
    marginBottom: spacing['2xl'], ...shadows.sm,
    borderWidth: 2, borderColor: moss.sage,
  },
  activeEmoji: { fontSize: 48, marginBottom: spacing.md },
  activeTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22,
    color: moss.sage, marginBottom: spacing.sm,
  },
  activeSub: { ...typography.bodySm, color: moss.muted, textAlign: 'center', lineHeight: 20 },

  sectionLabel: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 16,
    color: moss.ink, marginBottom: spacing.md,
  },

  seriesGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: spacing.md, marginBottom: spacing['2xl'],
  },
  seriesCard: {
    width: '47%', backgroundColor: moss.cardBg,
    borderRadius: radius.xl, padding: spacing.lg,
    borderWidth: 2, borderColor: moss.divider, position: 'relative',
  },
  seriesCardSmall: {
    width: '47%', backgroundColor: moss.cardBg,
    borderRadius: radius.lg, paddingVertical: spacing.md, paddingHorizontal: spacing.md,
    borderWidth: 2, borderColor: moss.divider,
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
  },
  seriesCardSelected: { borderColor: moss.accent, backgroundColor: moss.accentBg },
  seriesEmoji: { fontSize: 24, marginBottom: spacing.sm },
  seriesEmojiSmall: { fontSize: 18 },
  seriesLabel: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: moss.ink,
  },
  seriesLabelSmall: {
    fontFamily: 'DMSans_500Medium', fontSize: 14, color: moss.ink, flex: 1,
  },
  seriesLabelSelected: { color: moss.accent },
  checkMark: {
    position: 'absolute', top: spacing.sm, right: spacing.sm,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: moss.accent, alignItems: 'center', justifyContent: 'center',
  },
  checkMarkText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  goBtn: {
    backgroundColor: moss.accent, borderRadius: radius['2xl'],
    paddingVertical: spacing.xl, alignItems: 'center', ...shadows.md,
  },
  goBtnText: {
    fontFamily: 'DMSans_700Bold', fontSize: 20, color: '#fff',
  },
  goBtnSub: { ...typography.bodyXs, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  finishBtn: {
    backgroundColor: moss.coral, borderRadius: radius['2xl'],
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
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, color: moss.ink,
    marginBottom: 4,
  },
  questionnaireSub: {
    ...typography.bodySm, color: moss.muted, textAlign: 'center',
  },

  qLabel: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 15,
    color: moss.ink, marginBottom: spacing.sm, marginTop: spacing.lg,
  },

  moodRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
    marginBottom: spacing.md,
  },
  moodChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: moss.cardBg, borderRadius: radius.full,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderWidth: 1.5, borderColor: moss.divider,
  },
  moodChipSelected: {
    borderColor: moss.coral, backgroundColor: moss.coralLight,
  },
  moodEmoji: { fontSize: 16 },
  moodLabel: {
    fontFamily: 'DMSans_500Medium', fontSize: 14, color: moss.ink,
  },
  moodLabelSelected: { color: moss.coral },

  durationRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
    marginBottom: spacing.md,
  },
  durationChip: {
    backgroundColor: moss.cardBg, borderRadius: radius.full,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderWidth: 1.5, borderColor: moss.divider,
  },
  durationChipSelected: {
    borderColor: moss.accent, backgroundColor: moss.accentBg,
  },
  durationText: {
    fontFamily: 'DMSans_500Medium', fontSize: 14, color: moss.ink,
  },
  durationTextSelected: { color: moss.accent },

  input: {
    backgroundColor: moss.cardBg, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: moss.divider,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    ...typography.bodyMd, color: moss.ink,
    marginBottom: spacing.sm,
  },
  textArea: {
    height: 80, paddingTop: spacing.md,
  },

  saveBtn: {
    backgroundColor: moss.accent, borderRadius: radius['2xl'],
    paddingVertical: spacing.xl, alignItems: 'center',
    marginTop: spacing.xl, ...shadows.md,
  },
  saveBtnText: {
    fontFamily: 'DMSans_700Bold', fontSize: 18, color: '#fff',
  },

  btnDisabled: { opacity: 0.6 },
});
