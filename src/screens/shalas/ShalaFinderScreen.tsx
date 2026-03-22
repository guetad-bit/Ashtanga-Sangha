// src/screens/shalas/ShalaFinderScreen.tsx â "My Log" redesigned
import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'expo-router';
import { getPracticeLogs } from '@/lib/supabase';
import { calculateStreak } from '@/utils/practiceStreak';
import type { PracticeLog } from '@/utils/practiceStreak';

/* ââ Warm palette (shared with HomeScreen / CommunityScreen) ââ */
const warm = {
  bg: '#FAF8F5', cardBg: '#FFFFFF', headerBg: '#FFFFFF',
  ink: '#3D3229', inkMid: '#5C4F42', muted: '#8B7D6E', mutedLight: '#B5A899',
  accent: '#C47B3F', accentLight: '#F0E0CC',
  orange: '#E8834A', orangeLight: '#FFF0E6',
  sage: '#7A8B5E', sageBg: '#E8EDDF',
  gold: '#B8944A', goldBg: '#F5EDD8',
  blue: '#5B8DB8', blueBg: '#E8F0F8',
  red: '#D46B5E', redBg: '#FDEAE7',
  divider: '#EDE5D8', white: '#FFFFFF',
};

const SERIES_LABELS: Record<string, string> = {
  sun_sals: 'Sun Salutations', primary: 'Primary Series',
  intermediate: 'Intermediate', advanced_a: 'Advanced A',
  advanced_b: 'Advanced B', short: 'Short Practice',
};

const SERIES_ICONS: Record<string, string> = {
  sun_sals: 'sunny-outline', primary: 'fitness-outline',
  intermediate: 'flash-outline', advanced_a: 'rocket-outline',
  advanced_b: 'star-outline', short: 'timer-outline',
};

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
  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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
export default function MyLogScreen() {
  const router = useRouter();
  const { user, practiceLogs, setPracticeLogs } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const safeLogs = practiceLogs && Array.isArray(practiceLogs) ? practiceLogs : [];
  const streak = calculateStreak(safeLogs);
  const totalPractices = safeLogs.length;
  const totalMinutes = safeLogs.reduce((sum, l) => sum + l.durationMin, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const favSeries = useMemo(() => getFavoriteSeries(safeLogs), [safeLogs]);
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

  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      {/* ââ Top Bar (matches homepage / community) ââ */}
      <View style={st.topBar}>
        <View style={st.topBarLeft}>
          <Ionicons name="journal" size={22} color={warm.orange} />
          <Text style={st.brandText}>My Log</Text>
        </View>
        <View style={st.topBarRight}>
          <View style={st.statsPill}>
            <Text style={st.statsPillText}>{totalPractices} sessions</Text>
            <View style={st.statsPillDot} />
            <Text style={st.statsPillText}>{totalHours}h</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={st.topAvatar} />
            ) : (
              <View style={[st.topAvatar, { backgroundColor: warm.accentLight, alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="person" size={18} color={warm.accent} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={st.scroll}
        contentContainerStyle={st.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={warm.accent} />}
      >
        {/* ââ Stats Row ââ */}
        <View style={st.statsRow}>
          <View style={st.statCard}>
            <View style={[st.statIcon, { backgroundColor: warm.orangeLight }]}>
              <Ionicons name="flame" size={18} color={warm.orange} />
            </View>
            <Text style={st.statNumber}>{streak}</Text>
            <Text style={st.statLabel}>Day Streak</Text>
          </View>
          <View style={st.statCard}>
            <View style={[st.statIcon, { backgroundColor: warm.sageBg }]}>
              <Ionicons name="time-outline" size={18} color={warm.sage} />
            </View>
            <Text style={st.statNumber}>{avgDuration}m</Text>
            <Text style={st.statLabel}>Avg Duration</Text>
          </View>
          <View style={st.statCard}>
            <View style={[st.statIcon, { backgroundColor: warm.blueBg }]}>
              <Ionicons name="heart-outline" size={18} color={warm.blue} />
            </View>
            <Text style={st.statNumber2}>{favSeries}</Text>
            <Text style={st.statLabel}>Favorite</Text>
          </View>
        </View>

        {/* ââ Calendar ââ */}
        <PracticeCalendar logs={safeLogs} year={calYear} month={calMonth} />

        {/* ââ This Month Summary ââ */}
        <View style={st.monthBanner}>
          <View style={st.monthBannerLeft}>
            <Ionicons name="calendar" size={18} color={warm.accent} />
            <Text style={st.monthBannerText}>
              <Text style={st.monthBannerBold}>{thisMonthLogs.length}</Text> practices
            </Text>
          </View>
          <Text style={st.monthBannerRight}>{Math.round(thisMonthMin / 60)}h {thisMonthMin % 60}m this month</Text>
        </View>

        {/* ââ Log Entries ââ */}
        {sorted.length === 0 ? (
          <View style={st.emptyState}>
            <Ionicons name="journal-outline" size={48} color={warm.mutedLight} />
            <Text style={st.emptyTitle}>No practices logged yet</Text>
            <Text style={st.emptySubtitle}>
              Tap "I'm Practicing Now" on the Home tab to start your journey.
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
                    <View style={st.logRow}>
                      <View style={[st.logIconWrap, { backgroundColor: sc.bg }]}>
                        <Ionicons
                          name={(SERIES_ICONS[log.series] || 'fitness-outline') as any}
                          size={22}
                          color={sc.fg}
                        />
                      </View>
                      <View style={st.logInfo}>
                        <Text style={st.logSeries}>{SERIES_LABELS[log.series] || log.series}</Text>
                        <Text style={st.logMeta}>{formatDate(log.loggedAt)} Â· {formatTime(log.loggedAt)}</Text>
                      </View>
                      <View style={st.logDurationBadge}>
                        <Text style={st.logDurationText}>{log.durationMin}m</Text>
                      </View>
                      <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={warm.mutedLight} />
                    </View>
                    {isExpanded && (
                      <View style={st.logExpanded}>
                        <View style={st.logDetailRow}>
                          <Ionicons name="time-outline" size={16} color={warm.muted} />
                          <Text style={st.logDetailLabel}>Duration</Text>
                          <Text style={st.logDetailValue}>{log.durationMin} minutes</Text>
                        </View>
                        <View style={st.logDetailRow}>
                          <Ionicons name="barbell-outline" size={16} color={warm.muted} />
                          <Text style={st.logDetailLabel}>Series</Text>
                          <Text style={st.logDetailValue}>{SERIES_LABELS[log.series] || log.series}</Text>
                        </View>
                        <View style={st.logDetailRow}>
                          <Ionicons name="calendar-outline" size={16} color={warm.muted} />
                          <Text style={st.logDetailLabel}>Logged</Text>
                          <Text style={st.logDetailValue}>
                            {new Date(log.loggedAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                          </Text>
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
  statsPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: warm.orangeLight, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  statsPillText: { fontSize: 12, fontWeight: '600', color: warm.orange },
  statsPillDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: warm.orange, opacity: 0.5 },
  topAvatar: { width: 34, height: 34, borderRadius: 17, overflow: 'hidden' },

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
  statNumber2: { fontSize: 12, fontWeight: '600', color: warm.ink, textAlign: 'center' },
  statLabel: { fontSize: 11, color: warm.muted },

  /* Calendar */
  calWrap: {
    backgroundColor: warm.cardBg, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: warm.divider, marginHorizontal: 16, marginBottom: 16,
  },
  calTitle: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 16, color: warm.ink, marginBottom: 12, textAlign: 'center' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCell: { width: '14.28%', alignItems: 'center', marginBottom: 6 },
  calDayLabel: { fontSize: 11, fontWeight: '600', color: warm.muted, marginBottom: 4 },
  calDay: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  calDayPracticed: { backgroundColor: warm.orange },
  calDayMulti: { backgroundColor: warm.accent },
  calDayToday: { borderWidth: 2, borderColor: warm.accent },
  calDayText: { fontSize: 13, color: warm.inkMid },
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
  monthBannerRight: { fontSize: 12, color: warm.muted },

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
  monthHeader: { fontSize: 12, fontWeight: '600', color: warm.muted, textTransform: 'uppercase', letterSpacing: 1.2 },

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
  logMeta: { fontSize: 12, color: warm.muted },
  logDurationBadge: {
    backgroundColor: warm.sageBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  logDurationText: { fontSize: 13, fontWeight: '700', color: warm.sage },

  /* Expanded detail */
  logExpanded: {
    borderTopWidth: 1, borderTopColor: warm.divider,
    paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#FDFCFA', gap: 8,
  },
  logDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logDetailLabel: { fontSize: 13, color: warm.muted, width: 70 },
  logDetailValue: { fontSize: 13, fontWeight: '600', color: warm.ink, flex: 1 },
});
