// src/components/LogPracticeModal.tsx
import React, { useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity,
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

const PRACTICE_DURATION = 90; // 1.5 hours in minutes

export default function LogPracticeModal() {
  const {
    isLogModalOpen, setLogModalOpen,
    user, addPracticeLog,
    isPracticing, setIsPracticing,
  } = useAppStore();

  const [selectedSeries, setSelectedSeries] = useState('primary');
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    setLogModalOpen(false);
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

      const { error } = await logPractice(user.id, selectedSeries, PRACTICE_DURATION);
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
        durationMin: PRACTICE_DURATION,
      });

      setLogModalOpen(false);
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleStopPracticing = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setPracticingNow(user.id, false);
      setIsPracticing(false);
      setLogModalOpen(false);
    } catch {
      Alert.alert('Error', 'Could not update status.');
    } finally {
      setSaving(false);
    }
  };

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
            <Text style={styles.closeBtnText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>On the Mat</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isPracticing ? (
            <>
              <View style={styles.activeCard}>
                <Text style={styles.activeEmoji}>🧘</Text>
                <Text style={styles.activeTitle}>You're on the mat!</Text>
                <Text style={styles.activeSub}>
                  Your sangha can see you're practicing.{'\n'}
                  You'll automatically go off the mat after 1.5 hours.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.stopBtn, saving && styles.btnDisabled]}
                onPress={handleStopPracticing}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator color={colors.ink} />
                ) : (
                  <Text style={styles.stopBtnText}>I'm done — leave the mat</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
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
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.page },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.skyMid, backgroundColor: colors.white,
  },
  closeBtn: { width: 60 },
  closeBtnText: { ...typography.labelLg, color: colors.blue },
  headerTitle: { ...typography.headingLg, color: colors.ink },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, paddingBottom: spacing['4xl'] },

  // Date card
  dateCard: {
    alignItems: 'center', backgroundColor: colors.white,
    borderRadius: radius['2xl'], padding: spacing.xl,
    marginBottom: spacing['2xl'], ...shadows.sm,
  },
  dateEmoji: { fontSize: 32, marginBottom: spacing.sm },
  dateText: { ...typography.headingLg, color: colors.ink },

  // Active practicing card
  activeCard: {
    alignItems: 'center', backgroundColor: colors.white,
    borderRadius: radius['2xl'], padding: spacing['2xl'],
    marginBottom: spacing['2xl'], ...shadows.sm,
    borderWidth: 2, borderColor: colors.sage,
  },
  activeEmoji: { fontSize: 48, marginBottom: spacing.md },
  activeTitle: { ...typography.headingLg, color: colors.sage, fontSize: 22, marginBottom: spacing.sm },
  activeSub: { ...typography.bodySm, color: colors.muted, textAlign: 'center', lineHeight: 20 },

  // Section labels
  sectionLabel: { ...typography.headingMd, color: colors.ink, marginBottom: spacing.md },

  // Series grid
  seriesGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: spacing.md, marginBottom: spacing['2xl'],
  },
  seriesCard: {
    width: '47%', backgroundColor: colors.white,
    borderRadius: radius.xl, padding: spacing.lg,
    borderWidth: 2, borderColor: colors.skyMid, position: 'relative',
  },
  seriesCardSelected: { borderColor: colors.blue, backgroundColor: colors.sky },
  seriesEmoji: { fontSize: 24, marginBottom: spacing.sm },
  seriesLabel: { ...typography.headingSm, color: colors.ink },
  seriesLabelSelected: { color: colors.blueDeep },
  checkMark: {
    position: 'absolute', top: spacing.sm, right: spacing.sm,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center',
  },
  checkMarkText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Go on mat button
  goBtn: {
    backgroundColor: colors.sage, borderRadius: radius['2xl'],
    paddingVertical: spacing.xl, alignItems: 'center', ...shadows.md,
  },
  goBtnText: { ...typography.headingLg, color: '#fff', fontSize: 20 },
  goBtnSub: { ...typography.bodyXs, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  // Stop button
  stopBtn: {
    borderWidth: 2, borderColor: colors.skyMid, borderRadius: radius['2xl'],
    paddingVertical: spacing.lg, alignItems: 'center', backgroundColor: colors.white,
  },
  stopBtnText: { ...typography.headingMd, color: colors.inkMid },

  btnDisabled: { opacity: 0.6 },
});
