// src/screens/shalas/ShalaFinderScreen.tsx â "My Log" redesigned
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TextInput,
  TouchableOpacity, Image, Modal, Pressable, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'expo-router';
import { getPracticeLogs, deletePracticeLog, updatePracticeLog } from '@/lib/supabase';
import { calculateStreak } from '@/utils/practiceStreak';
import type { PracticeLog } from '@/utils/practiceStreak';
import AppHeader from '@/components/AppHeader';
import i18n from '@/i18n';

/* ââ Warm palette (shared with HomeScreen / CommunityScreen) ââ */
const warm = {
  bg: '#F5EFE6', cardBg: '#FFFFFF', headerBg: '#FFFFFF',
  ink: '#2A2420', inkMid: '#4A3F36', muted: '#8A7A68', mutedLight: '#B5A793',
  accent: '#C26B4D', accentLight: '#F7F1E7',
  orange: '#C26B4D', orangeLight: '#FFF5EC',
  sage: '#A8B59B', sageBg: '#F0F5EB',
  gold: '#C4956A', goldBg: '#FFF5EC',
  blue: '#7A8B6A', blueBg: '#F0F5EB',
  red: '#C26B4D', redBg: '#FFF0EB',
  divider: '#E8DFD0', white: '#FFFFFF',
};

// SERIES_LABELS will be computed inside component using t() to support translations
const getSeriesLabels = (t: any): Record<string, string> => ({
  sun_sals: t('series.sun_sals'),
  primary: t('series.primarySeries'),
  intermediate: t('series.intermediate'),
  advanced_a: t('series.advanced_a'),
  advanced_b: t('series.advanced_b'),
  short: t('series.short'),
});

const SERIES_ICONS: Record<string, string> = {
  sun_sals: 'sunny-outline', primary: 'fitness-outline',
  intermediate: 'flash-outline', advanced_a: 'rocket-outline',
  advanced_b: 'star-outline', short: 'timer-outline',
};

const FEELING_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  strong: 'flash', steady: 'leaf', challenging: 'flame', low_energy: 'moon', blissful: 'sunny',
};
const FEELING_COLORS: Record<string, string> = {
  strong: '#E07A3A', steady: '#6B9E6B', challenging: '#D05555', low_energy: '#7B8EC2', blissful: '#E6A817',
};

const getFeelingLabels = (t: any): Record<string, string> => ({
  strong: t('logModal.moodStrong'),
  steady: t('logModal.moodSteady'),
  challenging: t('logModal.moodChallenging'),
  low_energy: t('logModal.moodLowEnergy'),
  blissful: t('logModal.moodBlissful'),
});

const SERIES_COLORS: Record<string, { bg: string; fg: string }> = {
  sun_sals:     { bg: '#FFF8E1', fg: '#F9A825' },
  primary:      { bg: warm.orangeLight, fg: warm.orange },
  intermediate: { bg: warm.blueBg, fg: warm.blue },
  advanced_a:   { bg: warm.redBg, fg: warm.red },
  advanced_b:   { bg: '#F3E5F5', fg: '#8E24AA' },
  short:        { bg: warm.sageBg, fg: warm.sage },
};

/* ââ Helpers ââ */
function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return i18n.t('myLog.today');
  const y = new Date(now.getTime() - 86400000);
  if (d.toDateString() === y.toDateString()) return i18n.t('myLog.yesterday');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function groupByMonth(logs: PracticeLog[]) {
  const map = new Map<string, PracticeLog[]>();
  for (const log of logs) {
    const key = new Date(log.loggedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(log);
  }
  return Array.from(map.entries()).map(([month, logs]) => ({ month, logs }));
}

function getFavoriteSeries(logs: PracticeLog[], seriesLabels: Record<string, string>): string {
  if (logs.length === 0) return '-';
  const freq: Record<string, number> = {};
  logs.forEach(l => { freq[l.series] = (freq[l.series] || 0) + 1; });
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
  return seriesLabels[top[0]] || top[0];
}

function getAvgDuration(logs: PracticeLog[]): number {
  if (logs.length === 0) return 0;
  return Math.round(logs.reduce((s, l) => s + l.durationMin, 0) / logs.length);
}

/* ââ Calendar helpers ââ */
function getMonthCalendar(year: number, month: number) {
  const first = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const startDow = first.getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= lastDay; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/* ââ Mini Calendar ââ */
function PracticeCalendar({ logs, year, month }: { logs: PracticeLog[]; year: number; month: number }) {
  const { t } = useTranslation();
  const cells = getMonthCalendar(year, month);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const practicedDays = new Set<number>();
  const dayCount: Record<number, number> = {};
  logs.forEach(l => {
    const d = new Date(l.loggedAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      practicedDays.add(d.getDate());
      dayCount[d.getDate()] = (dayCount[d.getDate()] || 0) + 1;
    }
  });
  const locale = i18n.language === 'he' ? 'he-IL' : 'en-US';
  const monthName = new Date(year, month).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  const dayLabels = t('home.dayLabels', { returnObjects: true }) as string[];

  return (
    <View style={st.calWrap}>
      <Text style={st.calTitle}>{monthName}</Text>
      <View style={st.calGrid}>
        {dayLabels.map((d, i) => (
          <View key={'lbl' + i} style={st.calCell}>
            <Text style={st.calDayLabel}>{d}</Text>
          </View>
        ))}
        {cells.map((day, i) => {
          const practiced = day ? practicedDays.has(day) : false;
          const isToday = isCurrentMonth && day === today.getDate();
          const count = day ? (dayCount[day] || 0) : 0;
          return (
            <View key={i} style={st.calCell}>
              {day ? (
                <View style={[
                  st.calDay,
                  practiced && st.calDayPracticed,
                  count > 1 && st.calDayMulti,
                  isToday && st.calDayToday,
                ]}>
                  <Text style={[
                    st.calDayText,
                    practiced && st.calDayTextPracticed,
                    isToday && !practiced && st.calDayTextToday,
                  ]}>{day}</Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

/* ââ Main Component ââ */
const DURATION_OPTIONS = [5, 10, 15, 20, 30, 45, 60, 75, 90, 120];

export default function MyLogScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const router = useRouter();
  const { user, practiceLogs, setPracticeLogs, removePracticeLog, updatePracticeLog: updateLogInStore } = useAppStore();
  const SERIES_LABELS = getSeriesLabels(t);
  const FEELING_LABELS = getFeelingLabels(t);
  const SERIES_OPTIONS = Object.entries(SERIES_LABELS).map(([key, label]) => ({ key, label }));
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Edit modal state
  const [editingLog, setEditingLog] = useState<PracticeLog | null>(null);
  const [editSeries, setEditSeries] = useState('');
  const [editDuration, setEditDuration] = useState(0);
  const [editFeeling, setEditFeeling] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const safeLogs = practiceLogs && Array.isArray(practiceLogs) ? practiceLogs : [];
  const streak = calculateStreak(safeLogs);
  const totalPractices = safeLogs.length;
  const totalMinutes = safeLogs.reduce((sum, l) => sum + l.durationMin, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const favSeries = useMemo(() => getFavoriteSeries(safeLogs, SERIES_LABELS), [safeLogs, SERIES_LABELS]);
  const avgDuration = useMemo(() => getAvgDuration(safeLogs), [safeLogs]);

  const sorted = useMemo(() =>
    [...safeLogs].sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()),
    [safeLogs]
  );
  const grouped = useMemo(() => groupByMonth(sorted), [sorted]);

  const now = new Date();
  const calYear = now.getFullYear();
  const calMonth = now.getMonth();
  const thisMonthLogs = sorted.filter(l => {
    const d = new Date(l.loggedAt);
    return d.getFullYear() === calYear && d.getMonth() === calMonth;
  });
  const thisMonthMin = thisMonthLogs.reduce((s, l) => s + l.durationMin, 0);

  const fetchLogs = async () => {
    if (!user) return;
    const { data } = await getPracticeLogs(user.id);
    if (data && Array.isArray(data)) {
      setPracticeLogs(
        data.map((row: any) => ({
          id: row.id, userId: row.user_id, loggedAt: row.logged_at,
          series: row.series, durationMin: row.duration_min,
          feeling: row.feeling || undefined,
          notes: row.notes || undefined,
        }))
      );
    }
  };

  useEffect(() => { fetchLogs(); }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  };

  const toggleExpand = (id: string) => setExpandedId(prev => prev === id ? null : id);

  const handleEditOpen = useCallback((log: PracticeLog) => {
    setEditingLog(log);
    setEditSeries(log.series);
    setEditDuration(log.durationMin);
    setEditFeeling(log.feeling || null);
    setEditNotes(log.notes || '');
  }, []);

  const handleEditSave = useCallback(async () => {
    if (!editingLog) return;
    setEditSaving(true);
    try {
      const { error } = await updatePracticeLog(editingLog.id, {
        series: editSeries,
        duration_min: editDuration,
        feeling: editFeeling || undefined,
        notes: editNotes.trim() || undefined,
      });
      if (!error) {
        updateLogInStore(editingLog.id, {
          series: editSeries, durationMin: editDuration,
          feeling: editFeeling || undefined, notes: editNotes.trim() || undefined,
        });
      }
    } catch (e) { console.log('edit error', e); }
    setEditSaving(false);
    setEditingLog(null);
  }, [editingLog, editSeries, editDuration, editFeeling, editNotes]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      const { error } = await deletePracticeLog(deletingId);
      if (!error) {
        removePracticeLog(deletingId);
      }
    } catch (e) { console.log('delete error', e); }
    setDeleteLoading(false);
    setDeletingId(null);
    setExpandedId(null);
  }, [deletingId]);

  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      <AppHeader />
      {/* Stats row */}
      <View style={[st.statsRowTop, isRTL && { justifyContent: 'flex-start' }]}>
        <View style={[st.statsPill, isRTL && { flexDirection: 'row-reverse' }]}>
          <Text style={st.statsPillText}>{t('myLog.sessions', { count: totalPractices })}</Text>
          <View style={st.statsPillDot} />
          <Text style={st.statsPillText}>{t('myLog.hours', { hours: totalHours })}</Text>
        </View>
      </View>

      <ScrollView
        style={st.scroll}
        contentContainerStyle={st.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={warm.accent} />}
      >
        {/* ââ Stats Row ââ */}
        <View style={[st.statsRow, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={st.statCard}>
            <View style={[st.statIcon, { backgroundColor: warm.orangeLight }]}>
              <Ionicons name="flame" size={18} color={warm.orange} />
            </View>
            <Text style={st.statNumber}>{streak}</Text>
            <Text style={st.statLabel}>{t('myLog.dayStreak')}</Text>
          </View>
          <View style={st.statCard}>
            <View style={[st.statIcon, { backgroundColor: warm.sageBg }]}>
              <Ionicons name="time-outline" size={18} color={warm.sage} />
            </View>
            <Text style={st.statNumber}>{avgDuration}m</Text>
            <Text style={st.statLabel}>{t('myLog.avgDuration')}</Text>
          </View>
          <View style={st.statCard}>
            <View style={[st.statIcon, { backgroundColor: warm.blueBg }]}>
              <Ionicons name="heart-outline" size={18} color={warm.blue} />
            </View>
            <Text style={st.statNumber2}>{favSeries}</Text>
            <Text style={st.statLabel}>{t('myLog.favorite')}</Text>
          </View>
        </View>

        {/* ââ Calendar ââ */}
        <PracticeCalendar logs={safeLogs} year={calYear} month={calMonth} />

        {/* ââ This Month Summary ââ */}
        <View style={[st.monthBanner, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={[st.monthBannerLeft, isRTL && { flexDirection: 'row-reverse' }]}>
            <Ionicons name="calendar" size={18} color={warm.accent} />
            <Text style={st.monthBannerText}>
              <Text style={st.monthBannerBold}>{thisMonthLogs.length}</Text> {t('myLog.practicesLabel')}
            </Text>
          </View>
          <Text style={st.monthBannerRight}>{Math.round(thisMonthMin / 60)}h {thisMonthMin % 60}m {t('myLog.thisMonth')}</Text>
        </View>

        {/* ââ Log Entries ââ */}
        {sorted.length === 0 ? (
          <View style={st.emptyState}>
            <Ionicons name="journal-outline" size={48} color={warm.mutedLight} />
            <Text style={st.emptyTitle}>{t('myLog.noPractices')}</Text>
            <Text style={st.emptySubtitle}>
              {t('myLog.noLogSubtitle')}
            </Text>
          </View>
        ) : (
          grouped.map((group) => (
            <View key={group.month} style={st.monthGroup}>
              <View style={st.monthHeaderRow}>
                <View style={st.monthHeaderLine} />
                <Text style={st.monthHeader}>{group.month}</Text>
                <View style={st.monthHeaderLine} />
              </View>
              {group.logs.map((log) => {
                const isExpanded = expandedId === log.id;
                const sc = SERIES_COLORS[log.series] || { bg: warm.orangeLight, fg: warm.orange };
                return (
                  <TouchableOpacity
                    key={log.id}
                    style={[st.logCard, isExpanded && st.logCardExpanded]}
                    activeOpacity={0.7}
                    onPress={() => toggleExpand(log.id)}
                  >
                    <View style={[st.logRow, isRTL && { flexDirection: 'row-reverse' }]}>
                      <View style={[st.logIconWrap, { backgroundColor: sc.bg }]}>
                        <Ionicons
                          name={(SERIES_ICONS[log.series] || 'fitness-outline') as any}
                          size={22}
                          color={sc.fg}
                        />
                      </View>
                      <View style={[st.logInfo, isRTL && { alignItems: 'flex-end' }]}>
                        <Text style={[st.logSeries, isRTL && { textAlign: 'right' }]}>{SERIES_LABELS[log.series] || log.series}</Text>
                        <Text style={st.logMeta}>{formatDate(log.loggedAt)} · {formatTime(log.loggedAt)}</Text>
                      </View>
                      <View style={st.logDurationBadge}>
                        <Text style={st.logDurationText}>{log.durationMin}m</Text>
                      </View>
                      <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={warm.mutedLight} />
                    </View>
                    {isExpanded && (
                      <View style={st.logExpanded}>
                        <View style={[st.logDetailRow, isRTL && { flexDirection: "row-reverse" }]}>
                          <Ionicons name="time-outline" size={16} color={warm.muted} />
                          <Text style={st.logDetailLabel}>{t('myLog.duration')}</Text>
                          <Text style={st.logDetailValue}>{t('myLog.minutes', { count: log.durationMin })}</Text>
                        </View>
                        <View style={[st.logDetailRow, isRTL && { flexDirection: "row-reverse" }]}>
                          <Ionicons name="barbell-outline" size={16} color={warm.muted} />
                          <Text style={st.logDetailLabel}>{t('practiceLog.series')}</Text>
                          <Text style={st.logDetailValue}>{SERIES_LABELS[log.series] || log.series}</Text>
                        </View>
                        <View style={[st.logDetailRow, isRTL && { flexDirection: "row-reverse" }]}>
                          <Ionicons name="calendar-outline" size={16} color={warm.muted} />
                          <Text style={st.logDetailLabel}>{t('myLog.logged')}</Text>
                          <Text style={st.logDetailValue}>
                            {new Date(log.loggedAt).toLocaleDateString(isRTL ? 'he-IL' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                          </Text>
                        </View>
                        {/* ââ Edit / Delete Actions ââ */}
                        {log.feeling && (
                          <View style={[st.logDetailRow, isRTL && { flexDirection: "row-reverse" }]}>
                            <Ionicons name={FEELING_ICONS[log.feeling] || 'leaf'} size={18} color={FEELING_COLORS[log.feeling] || warm.primary} />
                            <Text style={st.logDetailLabel}>{t('myLog.feeling')}</Text>
                            <Text style={st.logDetailValue}>{FEELING_LABELS[log.feeling] || log.feeling}</Text>
                          </View>
                        )}
                        {log.notes && (
                          <View style={[st.logNotesWrap, isRTL && { flexDirection: "row-reverse" }]}>
                            <Ionicons name="document-text-outline" size={16} color={warm.muted} />
                            <Text style={[st.logNotesText, isRTL && { textAlign: "right" }]}>{log.notes}</Text>
                          </View>
                        )}
<View style={[st.logActions, isRTL && { flexDirection: "row-reverse" }]}>
                          <TouchableOpacity style={[st.editBtn, isRTL && { flexDirection: "row-reverse" }]} onPress={() => handleEditOpen(log)}>
                            <Ionicons name="pencil-outline" size={15} color={warm.blue} />
                            <Text style={st.editBtnText}>{t('myLog.edit')}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[st.deleteBtn, isRTL && { flexDirection: "row-reverse" }]} onPress={() => setDeletingId(log.id)}>
                            <Ionicons name="trash-outline" size={15} color={warm.red} />
                            <Text style={st.deleteBtnText}>{t('myLog.delete')}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ââ Delete Confirmation Modal ââ */}
      <Modal visible={!!deletingId} transparent animationType="fade" onRequestClose={() => setDeletingId(null)}>
        <Pressable style={st.modalOverlay} onPress={() => setDeletingId(null)}>
          <View style={st.modalCard}>
            <View style={st.modalIconWrap}>
              <Ionicons name="trash" size={28} color={warm.red} />
            </View>
            <Text style={st.modalTitle}>{t('myLog.deletePractice')}</Text>
            <Text style={st.modalBody}>{t('myLog.deleteConfirm')}</Text>
            <View style={st.modalBtns}>
              <TouchableOpacity style={st.modalCancelBtn} onPress={() => setDeletingId(null)}>
                <Text style={st.modalCancelText}>{t('myLog.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[st.modalDeleteBtn, deleteLoading && { opacity: 0.6 }]}
                onPress={handleDeleteConfirm}
                disabled={deleteLoading}
              >
                <Text style={st.modalDeleteText}>{deleteLoading ? t('myLog.deleting') : t('myLog.delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* ââ Edit Modal ââ */}
      <Modal visible={!!editingLog} transparent animationType="slide" onRequestClose={() => setEditingLog(null)}>
        <Pressable style={st.modalOverlay} onPress={() => setEditingLog(null)}>
          <Pressable style={[st.editModalCard, { maxHeight: '85%' }]} onPress={() => {}}>
            <View style={st.editModalHeader}>
              <Text style={st.editModalTitle}>{t('myLog.editPractice')}</Text>
              <TouchableOpacity onPress={() => setEditingLog(null)}>
                <Ionicons name="close" size={22} color={warm.muted} />
              </TouchableOpacity>
            </View>

            {/* Series Picker */}
            <Text style={st.editLabel}>{t('practiceLog.series')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.editSeriesScroll} contentContainerStyle={st.editSeriesRow}>
              {SERIES_OPTIONS.map((s) => (
                <TouchableOpacity
                  key={s.key}
                  style={[st.editSeriesChip, editSeries === s.key && st.editSeriesChipActive]}
                  onPress={() => setEditSeries(s.key)}
                >
                  <Ionicons name={(SERIES_ICONS[s.key] || 'fitness-outline') as any} size={14} color={editSeries === s.key ? warm.white : warm.inkMid} />
                  <Text style={[st.editSeriesChipText, editSeries === s.key && st.editSeriesChipTextActive]}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Duration Picker */}
            <Text style={st.editLabel}>{t('myLog.durationMinutes')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.editDurationScroll} contentContainerStyle={st.editDurationRow}>
              {DURATION_OPTIONS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[st.editDurationChip, editDuration === d && st.editDurationChipActive]}
                  onPress={() => setEditDuration(d)}
                >
                  <Text style={[st.editDurationChipText, editDuration === d && st.editDurationChipTextActive]}>{d}m</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Custom duration row */}
            <View style={st.customDurRow}>
              <TouchableOpacity
                style={st.durAdjustBtn}
                onPress={() => setEditDuration(Math.max(1, editDuration - 5))}
              >
                <Ionicons name="remove" size={18} color={warm.ink} />
              </TouchableOpacity>
              <Text style={st.customDurText}>{editDuration} min</Text>
              <TouchableOpacity
                style={st.durAdjustBtn}
                onPress={() => setEditDuration(editDuration + 5)}
              >
                <Ionicons name="add" size={18} color={warm.ink} />
              </TouchableOpacity>
            </View>

            {/* Feeling Picker */}
            <Text style={st.editLabel}>{t('logModal.feelingLabel')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.editSeriesScroll} contentContainerStyle={st.editSeriesRow}>
              {(['strong', 'steady', 'challenging', 'low_energy', 'blissful'] as const).map((key) => {
                const active = editFeeling === key;
                const fc = FEELING_COLORS[key];
                return (
                  <TouchableOpacity
                    key={key}
                    style={[st.editSeriesChip, active && { backgroundColor: fc, borderColor: fc }]}
                    onPress={() => setEditFeeling(active ? null : key)}
                  >
                    <Ionicons name={FEELING_ICONS[key]} size={18} color={active ? '#fff' : fc} />
                    <Text style={[st.editSeriesChipText, active && st.editSeriesChipTextActive]}>
                      {FEELING_LABELS[key]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Notes */}
            <Text style={st.editLabel}>{t('logModal.notesLabel')}</Text>
            <TextInput
              style={st.editNotesInput}
              placeholder={t('logModal.notesPlaceholder')}
              placeholderTextColor={warm.mutedLight}
              multiline
              numberOfLines={3}
              value={editNotes}
              onChangeText={setEditNotes}
            />

            {/* Save Button */}
            <TouchableOpacity
              style={[st.editSaveBtn, editSaving && { opacity: 0.6 }]}
              onPress={handleEditSave}
              disabled={editSaving}
            >
              <Text style={st.editSaveBtnText}>{editSaving ? t('myLog.savingDots') : t('myLog.saveChanges')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
}

/* ââ Styles ââ */
const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: warm.bg },

  /* Top bar (matches homepage / community) */
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: warm.headerBg,
    borderBottomWidth: 1, borderBottomColor: warm.divider,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandText: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18, color: warm.ink },
  statsRowTop: {
    flexDirection: 'row', justifyContent: 'flex-end',
    paddingHorizontal: 20, paddingBottom: 8,
  },
  statsPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: warm.orangeLight, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  statsPillText: { fontSize: 14, fontWeight: '600', color: warm.orange },
  statsPillDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: warm.orange, opacity: 0.5 },
  topAvatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: '#8A9E78', overflow: 'hidden' },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 12, paddingBottom: 120 },

  /* Stats */
  statsRow: {
    flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 16,
  },
  statCard: {
    flex: 1, backgroundColor: warm.cardBg, borderRadius: 16,
    padding: 14, alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: warm.divider,
  },
  statIcon: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  statNumber: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 24, color: warm.ink },
  statNumber2: { fontSize: 14, fontWeight: '600', color: warm.ink, textAlign: 'center' },
  statLabel: { fontSize: 14, color: warm.muted },

  /* Calendar */
  calWrap: {
    backgroundColor: warm.cardBg, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: warm.divider, marginHorizontal: 16, marginBottom: 16,
  },
  calTitle: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 16, color: warm.ink, marginBottom: 12, textAlign: 'center' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: '14.28%', alignItems: 'center', marginBottom: 6 },
  calDayLabel: { fontSize: 14, fontWeight: '600', color: warm.muted, marginBottom: 4 },
  calDay: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  calDayPracticed: { backgroundColor: warm.orange },
  calDayMulti: { backgroundColor: warm.accent },
  calDayToday: { borderWidth: 2, borderColor: warm.accent },
  calDayText: { fontSize: 14, color: warm.inkMid },
  calDayTextPracticed: { color: '#FFFFFF', fontWeight: '700' },
  calDayTextToday: { color: warm.accent, fontWeight: '700' },

  /* Month banner */
  monthBanner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: warm.orangeLight, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  monthBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  monthBannerText: { fontSize: 14, color: warm.ink },
  monthBannerBold: { fontWeight: '700' },
  monthBannerRight: { fontSize: 14, color: warm.muted },

  /* Empty state */
  emptyState: { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 40 },
  emptyTitle: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 20, color: warm.ink, marginTop: 16, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: warm.muted, textAlign: 'center', lineHeight: 20 },

  /* Month groups */
  monthGroup: { marginBottom: 12 },
  monthHeaderRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10, gap: 12,
  },
  monthHeaderLine: { flex: 1, height: 1, backgroundColor: warm.divider },
  monthHeader: { fontSize: 14, fontWeight: '600', color: warm.muted, textTransform: 'uppercase', letterSpacing: 1.2 },

  /* Log cards */
  logCard: {
    backgroundColor: warm.cardBg, marginHorizontal: 16, marginBottom: 8,
    borderRadius: 16, borderWidth: 1, borderColor: warm.divider, overflow: 'hidden',
  },
  logCardExpanded: { borderColor: warm.accent, borderWidth: 1.5 },
  logRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  logIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  logInfo: { flex: 1 },
  logSeries: { fontSize: 15, fontWeight: '600', color: warm.ink, marginBottom: 2 },
  logMeta: { fontSize: 14, color: warm.muted },
  logDurationBadge: {
    backgroundColor: warm.sageBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  logDurationText: { fontSize: 14, fontWeight: '700', color: warm.sage },

  /* Expanded detail */
  logExpanded: {
    borderTopWidth: 1, borderTopColor: warm.divider,
    paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#FDFCFA', gap: 8,
  },
  logDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logDetailLabel: { fontSize: 14, color: warm.muted, width: 70 },
  logDetailValue: { fontSize: 14, fontWeight: '600', color: warm.ink, flex: 1 },

  /* Notes display */
  logNotesWrap: {
    flexDirection: 'row' as any, alignItems: 'flex-start' as any, gap: 8,
    marginTop: 6, padding: 10, backgroundColor: '#FAF8F5',
    borderRadius: 8, borderWidth: 1, borderColor: warm.divider,
  },
  logNotesText: {
    fontSize: 14, color: warm.ink, flex: 1, lineHeight: 19,
    fontFamily: 'DMSans_400Regular',
  },

  /* Log action buttons */
  logActions: {
    flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 6, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: warm.divider,
  },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: warm.blueBg, borderRadius: 20,
  },
  editBtnText: { fontSize: 14, fontWeight: '600', color: warm.blue },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: warm.redBg, borderRadius: 20,
  },
  deleteBtnText: { fontSize: 14, fontWeight: '600', color: warm.red },

  /* Shared modal styles */
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalCard: {
    backgroundColor: warm.white, borderRadius: 20, padding: 24,
    width: '100%', maxWidth: 340, alignItems: 'center',
  },
  modalIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: warm.redBg, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 20, color: warm.ink, marginBottom: 8 },
  modalBody: { fontSize: 14, color: warm.muted, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  modalBtns: { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 14,
    borderWidth: 1.5, borderColor: warm.divider, alignItems: 'center',
  },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: warm.inkMid },
  modalDeleteBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 14,
    backgroundColor: warm.red, alignItems: 'center',
  },
  modalDeleteText: { fontSize: 15, fontWeight: '600', color: '#fff' },

  /* Edit modal */
  editModalCard: {
    backgroundColor: warm.white, borderRadius: 20, padding: 20,
    width: '100%', maxWidth: 400,
  },
  editModalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  editModalTitle: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 20, color: warm.ink },
  editLabel: { fontSize: 14, fontWeight: '600', color: warm.muted, marginBottom: 8, marginTop: 4 },
  editSeriesScroll: { marginBottom: 12 },
  editSeriesRow: { gap: 8 },
  editSeriesChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 24, borderWidth: 1.5, borderColor: warm.divider,
    backgroundColor: warm.cardBg,
  },
  editSeriesChipActive: { backgroundColor: warm.orange, borderColor: warm.orange },
  editSeriesChipText: { fontSize: 14, color: warm.inkMid, fontWeight: '500' },
  editSeriesChipTextActive: { color: '#fff', fontWeight: '600' },
  editDurationScroll: { marginBottom: 4 },
  editDurationRow: { gap: 8 },
  editDurationChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: warm.divider,
    backgroundColor: warm.cardBg,
  },
  editDurationChipActive: { backgroundColor: warm.sage, borderColor: warm.sage },
  editDurationChipText: { fontSize: 14, fontWeight: '600', color: warm.inkMid },
  editDurationChipTextActive: { color: '#fff' },
  customDurRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 20, marginVertical: 6,
  },
  durAdjustBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: warm.divider, alignItems: 'center', justifyContent: 'center',
  },
  customDurText: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, color: warm.ink, minWidth: 70, textAlign: 'center' },
  editNotesInput: {
    borderWidth: 1, borderColor: warm.divider, borderRadius: 12,
    padding: 12, minHeight: 70, fontSize: 14, color: warm.ink,
    fontFamily: 'DMSans_400Regular', textAlignVertical: 'top' as any,
    backgroundColor: '#FAF8F5', marginBottom: 8,
  },
  editSaveBtn: {
    backgroundColor: warm.orange, borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  editSaveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
