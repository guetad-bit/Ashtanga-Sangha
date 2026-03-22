// src/screens/shalas/ShalaFinderScreen.tsx — "My Log" (enhanced)
import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';
import { useAppStore } from '@/store/useAppStore';
import { getPracticeLogs } from '@/lib/supabase';
import { calculateStreak } from '@/utils/practiceStreak';
import type { PracticeLog } from '@/utils/practiceStreak';

/* ── Warm palette ── */
const warm = {
  bg:          '#FAF8F5',
  cardBg:      '#FFFFFF',
  ink:         '#3D3229',
  inkMid:      '#5C4F42',
  muted:       '#8B7D6E',
  mutedLight:  '#B5A899',
  accent:      '#C47B3F',
  orange:      '#E8834A',
  orangeLight: '#FFF0E6',
  divider:     '#EDE5D8',
  sage:        '#7A8B5E',
  sageBg:      '#E8EDDF',
  blue:        '#5B8DB8',
  blueBg:      '#E8F0F8',
  red:         '#D46B5E',
  redBg:       '#FDEAE7',
};

const SERIES_LABELS: Record<string,string> = {
  sun_sals: 'Sun Salutations',
  primary: 'Primary Series',
  intermediate: 'Intermediate Series',
  advanced_a: 'Advanced A',
  advanced_b: 'Advanced B',
  short: 'Short Practice',
};

const SERIES_ICONS: Record<string,string> = {
  sun_sals: 'sunny-outline',
  primary: 'fitness-outline',
  intermediate: 'flash-outline',
  advanced_a: 'rocket-outline',
  advanced_b: 'star-outline',
  short: 'timer-outline',
};

const SERIES_COLORS: Record<string,{bg:string,fg:string}> = {
  sun_sals:     { bg: '#FFF8E1', fg: '#F9A825' },
  primary:      { bg: warm.orangeLight, fg: warm.orange },
  intermediate: { bg: warm.blueBg, fg: warm.blue },
  advanced_a:   { bg: warm.redBg, fg: warm.red },
  advanced_b:   { bg: '#F3E5F5', fg: '#8E24AA' },
  short:        { bg: warm.sageBg, fg: warm.sage },
};

/* ── Helpers ── */
function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  const y = new Date(now.getTime() - 86400000);
  if (d.toDateString() === y.toDateString()) return 'Yesterday';
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

function getFavoriteSeries(logs: PracticeLog[]): string {
  if (logs.length === 0) return '-';
  const freq: Record<string, number> = {};
  logs.forEach(l => { freq[l.series] = (freq[l.series] || 0) + 1; });
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
  return SERIES_LABELS[top[0]] || top[0];
}

function getAvgDuration(logs: PracticeLog[]): number {
  if (logs.length === 0) return 0;
  return Math.round(logs.reduce((s, l) => s + l.durationMin, 0) / logs.length);
}

/* ── Calendar helpers ── */
function getMonthCalendar(year: number, month: number) {
  const first = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const startDow = first.getDay(); // 0=Sun
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= lastDay; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/* ── Mini Calendar Component ── */
function PracticeCalendar({ logs, year, month }: { logs: PracticeLog[]; year: number; month: number }) {
  const cells = getMonthCalendar(year, month);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // Build set of practiced days in this month
  const practicedDays = new Set<number>();
  logs.forEach(l => {
    const d = new Date(l.loggedAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      practicedDays.add(d.getDate());
    }
  });

  // Count practices per day for intensity
  const dayCount: Record<number, number> = {};
  logs.forEach(l => {
    const d = new Date(l.loggedAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      dayCount[d.getDate()] = (dayCount[d.getDate()] || 0) + 1;
    }
  });

  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <View style={cs.calWrap}>
      <Text style={cs.calTitle}>{monthName}</Text>
      <View style={cs.calGrid}>
        {dayLabels.map((d, i) => (
          <View key={'lbl'+i} style={cs.calCell}>
            <Text style={cs.calDayLabel}>{d}</Text>
          </View>
        ))}
        {cells.map((day, i) => {
          const practiced = day ? practicedDays.has(day) : false;
          const isToday = isCurrentMonth && day === today.getDate();
          const count = day ? (dayCount[day] || 0) : 0;
          return (
            <View key={i} style={cs.calCell}>
              {day ? (
                <View style={[
                  cs.calDay,
                  practiced && cs.calDayPracticed,
                  count > 1 && cs.calDayMulti,
                  isToday && cs.calDayToday,
                ]}>
                  <Text style={[
                    cs.calDayText,
                    practiced && cs.calDayTextPracticed,
                    isToday && !practiced && cs.calDayTextToday,
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

const cs = StyleSheet.create({
  calWrap: { backgroundColor: warm.cardBg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: warm.divider, marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  calTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, color: warm.ink, marginBottom: 12, textAlign: 'center' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: '14.28%', alignItems: 'center', marginBottom: 6 },
  calDayLabel: { fontFamily: 'DMSans_600SemiBold', fontSize: 11, color: warm.muted, marginBottom: 4 },
  calDay: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  calDayPracticed: { backgroundColor: warm.orange },
  calDayMulti: { backgroundColor: warm.accent },
  calDayToday: { borderWidth: 2, borderColor: warm.accent },
  calDayText: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: warm.inkMid },
  calDayTextPracticed: { color: '#FFFFFF', fontFamily: 'DMSans_700Bold' },
  calDayTextToday: { color: warm.accent, fontFamily: 'DMSans_700Bold' },
});

/* ── Main Component ── */
export default function MyLogScreen() {
  const { user, practiceLogs, setPracticeLogs } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const streak = calculateStreak(practiceLogs);
  const totalPractices = practiceLogs.length;
  const totalMinutes = practiceLogs.reduce((sum, l) => sum + l.durationMin, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const favSeries = useMemo(() => getFavoriteSeries(practiceLogs), [practiceLogs]);
  const avgDuration = useMemo(() => getAvgDuration(practiceLogs), [practiceLogs]);

  // Sort logs newest first
  const sorted = useMemo(() =>
    [...practiceLogs].sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()),
    [practiceLogs]
  );
  const grouped = useMemo(() => groupByMonth(sorted), [sorted]);

  // Calendar month
  const now = new Date();
  const calYear = now.getFullYear();
  const calMonth = now.getMonth();

  // This month stats
  const thisMonthLogs = sorted.filter(l => {
    const d = new Date(l.loggedAt);
    return d.getFullYear() === calYear && d.getMonth() === calMonth;
  });
  const thisMonthMin = thisMonthLogs.reduce((s, l) => s + l.durationMin, 0);

  const fetchLogs = async () => {
    if (!user) return;
    const { data } = await getPracticeLogs(user.id);
    if (data) {
      setPracticeLogs(
        data.map((row: any) => ({
          id: row.id, userId: row.user_id, loggedAt: row.logged_at,
          series: row.series, durationMin: row.duration_min,
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

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.headerTitle}>My Practice Log</Text>
        <Text style={s.headerSub}>{totalPractices} sessions · {totalHours}h on the mat</Text>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={warm.accent} />}
      >
        {/* ── Stats Row ── */}
        <View style={s.statsRow}>
          <View style={[s.statCard, { borderLeftColor: warm.orange }]}>
            <Ionicons name="flame" size={20} color={warm.orange} />
            <Text style={s.statNumber}>{streak}</Text>
            <Text style={s.statLabel}>Day Streak</Text>
          </View>
          <View style={[s.statCard, { borderLeftColor: warm.sage }]}>
            <Ionicons name="time-outline" size={20} color={warm.sage} />
            <Text style={s.statNumber}>{avgDuration}m</Text>
            <Text style={s.statLabel}>Avg Duration</Text>
          </View>
          <View style={[s.statCard, { borderLeftColor: warm.blue }]}>
            <Ionicons name="heart-outline" size={20} color={warm.blue} />
            <Text style={s.statNumber2}>{favSeries}</Text>
            <Text style={s.statLabel}>Favorite</Text>
          </View>
        </View>

        {/* ── Calendar ── */}
        <PracticeCalendar logs={practiceLogs} year={calYear} month={calMonth} />

        {/* ── This Month Summary ── */}
        <View style={s.monthBanner}>
          <View style={s.monthBannerLeft}>
            <Ionicons name="calendar" size={18} color={warm.accent} />
            <Text style={s.monthBannerText}>
              <Text style={s.monthBannerBold}>{thisMonthLogs.length}</Text> practices
            </Text>
          </View>
          <Text style={s.monthBannerRight}>{Math.round(thisMonthMin / 60)}h {thisMonthMin % 60}m this month</Text>
        </View>

        {/* ── Log Entries ── */}
        {sorted.length === 0 ? (
          <View style={s.emptyState}>
            <Ionicons name="journal-outline" size={52} color={warm.mutedLight} />
            <Text style={s.emptyTitle}>No practices logged yet</Text>
            <Text style={s.emptySubtitle}>
              Head to the Home tab and tap{' '}
              <Text style={{ fontFamily: 'DMSans_700Bold', color: warm.accent }}>"Log My Practice"</Text>{" "}
              to start your journey.
            </Text>
          </View>
        ) : (
          grouped.map((group) => (
            <View key={group.month} style={s.monthGroup}>
              <View style={s.monthHeaderRow}>
                <View style={s.monthHeaderLine} />
                <Text style={s.monthHeader}>{group.month}</Text>
                <View style={s.monthHeaderLine} />
              </View>
              {group.logs.map((log) => {
                const isExpanded = expandedId === log.id;
                const sc = SERIES_COLORS[log.series] || { bg: warm.orangeLight, fg: warm.orange };
                return (
                  <TouchableOpacity
                    key={log.id}
                    style={[s.logCard, isExpanded && s.logCardExpanded]}
                    activeOpacity={0.7}
                    onPress={() => toggleExpand(log.id)}
                  >
                    <View style={s.logRow}>
                      <View style={[s.logIconWrap, { backgroundColor: sc.bg }]}>
                        <Ionicons
                          name={(SERIES_ICONS[log.series] || 'fitness-outline') as any}
                          size={22}
                          color={sc.fg}
                        />
                      </View>
                      <View style={s.logInfo}>
                        <Text style={s.logSeries}>{SERIES_LABELS[log.series] || log.series}</Text>
                        <Text style={s.logMeta}>{formatDate(log.loggedAt)} · {formatTime(log.loggedAt)}</Text>
                      </View>
                      <View style={s.logDurationBadge}>
                        <Text style={s.logDurationText}>{log.durationMin}m</Text>
                      </View>
                      <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color={warm.mutedLight} />
                    </View>
                    {isExpanded && (
                      <View style={s.logExpanded}>
                        <View style={s.logDetailRow}>
                          <Ionicons name="time-outline" size={16} color={warm.muted} />
                          <Text style={s.logDetailLabel}>Duration</Text>
                          <Text style={s.logDetailValue}>{log.durationMin} minutes</Text>
                        </View>
                        <View style={s.logDetailRow}>
                          <Ionicons name="barbell-outline" size={16} color={warm.muted} />
                          <Text style={s.logDetailLabel}>Series</Text>
                          <Text style={s.logDetailValue}>{SERIES_LABELS[log.series] || log.series}</Text>
                        </View>
                        <View style={s.logDetailRow}>
                          <Ionicons name="calendar-outline" size={16} color={warm.muted} />
                          <Text style={s.logDetailLabel}>Logged</Text>
                          <Text style={s.logDetailValue}>
                            {new Date(log.loggedAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                          </Text>
                        </View>
                        <View style={s.logDetailRow}>
                          <Ionicons name="alarm-outline" size={16} color={warm.muted} />
                          <Text style={s.logDetailLabel}>Time</Text>
                          <Text style={s.logDetailValue}>{formatTime(log.loggedAt)}</Text>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── Styles ── */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: warm.bg },

  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28, color: warm.ink,
  },
  headerSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14, color: warm.muted, marginTop: 2,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingTop: spacing.md, paddingBottom: 120 },

  /* Stats */
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: 10,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: warm.cardBg,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: warm.divider,
    borderLeftWidth: 3,
    gap: 4,
  },
  statNumber: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 24, color: warm.ink,
  },
  statNumber2: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11, color: warm.ink, textAlign: 'center',
  },
  statLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11, color: warm.muted,
  },

  /* Month banner */
  monthBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: warm.orangeLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  monthBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  monthBannerText: { fontFamily: 'DMSans_400Regular', fontSize: 14, color: warm.ink },
  monthBannerBold: { fontFamily: 'DMSans_700Bold' },
  monthBannerRight: { fontFamily: 'DMSans_400Regular', fontSize: 12, color: warm.muted },

  /* Empty state */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 20, color: warm.ink,
    marginTop: 16, marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14, color: warm.muted,
    textAlign: 'center', lineHeight: 20,
  },

  /* Month groups */
  monthGroup: {
    marginBottom: spacing.md,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: 10,
    gap: 12,
  },
  monthHeaderLine: { flex: 1, height: 1, backgroundColor: warm.divider },
  monthHeader: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12, color: warm.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },

  /* Log cards */
  logCard: {
    backgroundColor: warm.cardBg,
    marginHorizontal: spacing.lg,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: warm.divider,
    overflow: 'hidden',
  },
  logCardExpanded: {
    borderColor: warm.accent,
    borderWidth: 1.5,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  logIconWrap: {
    width: 44, height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logInfo: { flex: 1 },
  logSeries: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15, color: warm.ink,
    marginBottom: 2,
  },
  logMeta: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12, color: warm.muted,
  },
  logDurationBadge: {
    backgroundColor: warm.sageBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  logDurationText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13, color: warm.sage,
  },

  /* Expanded detail */
  logExpanded: {
    borderTopWidth: 1,
    borderTopColor: warm.divider,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FDFCFA',
    gap: 8,
  },
  logDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logDetailLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13, color: warm.muted,
    width: 70,
  },
  logDetailValue: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13, color: warm.ink,
    flex: 1,
  },
});
