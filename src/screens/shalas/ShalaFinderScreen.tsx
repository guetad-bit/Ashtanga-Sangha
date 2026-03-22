// src/screens/shalas/ShalaFinderScreen.tsx  — repurposed as "My Log"
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity,
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
};

const SERIES_LABELS = {
  sun_sals: 'Sun Salutations',
  primary: 'Primary Series',
  intermediate: 'Intermediate Series',
  advanced_a: 'Advanced A',
  advanced_b: 'Advanced B',
  short: 'Short Practice',
};

const SERIES_ICONS = {
  sun_sals: 'sunny-outline',
  primary: 'fitness-outline',
  intermediate: 'flash-outline',
  advanced_a: 'rocket-outline',
  advanced_b: 'star-outline',
  short: 'timer-outline',
};

/* ── Helpers ── */
function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString();
  if (d.toDateString() === today) return 'Today';
  if (d.toDateString() === yesterday) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function groupByMonth(logs) {
  const map = new Map();
  for (const log of logs) {
    const d = new Date(log.loggedAt);
    const key = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(log);
  }
  return Array.from(map.entries()).map(([month, logs]) => ({ month, logs }));
}

/* ── Component ── */
export default function MyLogScreen() {
  const { user, practiceLogs, setPracticeLogs } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  const streak = calculateStreak(practiceLogs);
  const totalPractices = practiceLogs.length;
  const totalMinutes = practiceLogs.reduce((sum, l) => sum + l.durationMin, 0);
  const totalHours = Math.round(totalMinutes / 60);

  // Sort logs newest first
  const sorted = [...practiceLogs].sort(
    (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
  );
  const grouped = groupByMonth(sorted);

  // This month's count
  const now = new Date();
  const thisMonthKey = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  const thisMonthCount = sorted.filter(
    (l) => new Date(l.loggedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) === thisMonthKey
  ).length;

  const fetchLogs = async () => {
    if (!user) return;
    const { data } = await getPracticeLogs(user.id);
    if (data) {
      setPracticeLogs(
        data.map((row) => ({
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

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>My Practice Log</Text>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={warm.accent} />}
      >
        {/* Stats Overview */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Ionicons name="flame" size={22} color={warm.orange} />
            <Text style={s.statNumber}>{streak}</Text>
            <Text style={s.statLabel}>Day Streak</Text>
          </View>
          <View style={s.statCard}>
            <Ionicons name="calendar-outline" size={22} color={warm.blue} />
            <Text style={s.statNumber}>{totalPractices}</Text>
            <Text style={s.statLabel}>Total Sessions</Text>
          </View>
          <View style={s.statCard}>
            <Ionicons name="time-outline" size={22} color={warm.sage} />
            <Text style={s.statNumber}>{totalHours}h</Text>
            <Text style={s.statLabel}>On the Mat</Text>
          </View>
        </View>

        {/* This Month Summary */}
        <View style={s.monthSummary}>
          <Text style={s.monthSummaryText}>
            <Text style={s.monthSummaryBold}>{thisMonthCount} practices</Text> this month
          </Text>
        </View>

        {/* Log Entries */}
        {sorted.length === 0 ? (
          <View style={s.emptyState}>
            <Ionicons name="journal-outline" size={48} color={warm.mutedLight} />
            <Text style={s.emptyTitle}>No practices logged yet</Text>
            <Text style={s.emptySubtitle}>
              Go to the Home tab and tap "Log My Practice" to start tracking your journey.
            </Text>
          </View>
        ) : (
          grouped.map((group) => (
            <View key={group.month} style={s.monthGroup}>
              <Text style={s.monthHeader}>{group.month}</Text>
              {group.logs.map((log) => (
                <View key={log.id} style={s.logCard}>
                  <View style={s.logIconWrap}>
                    <Ionicons
                      name={(SERIES_ICONS[log.series] || 'fitness-outline')}
                      size={22}
                      color={warm.accent}
                    />
                  </View>
                  <View style={s.logInfo}>
                    <Text style={s.logSeries}>
                      {SERIES_LABELS[log.series] || log.series}
                    </Text>
                    <Text style={s.logMeta}>
                      {formatDate(log.loggedAt)} · {formatTime(log.loggedAt)} · {log.durationMin} min
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={warm.mutedLight} />
                </View>
              ))}
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
    paddingVertical: spacing.lg,
    backgroundColor: warm.bg,
  },
  headerTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 26, color: warm.ink,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 120 },

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
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: warm.divider,
    gap: 4,
  },
  statNumber: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 22, color: warm.ink,
  },
  statLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11, color: warm.muted,
  },

  /* Month summary */
  monthSummary: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  monthSummaryText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15, color: warm.inkMid,
  },
  monthSummaryBold: {
    fontFamily: 'DMSans_700Bold',
    color: warm.ink,
  },

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
    marginBottom: spacing.lg,
  },
  monthHeader: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13, color: warm.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.xl,
    marginBottom: 8,
  },

  /* Log cards */
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: warm.cardBg,
    marginHorizontal: spacing.lg,
    marginBottom: 8,
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: warm.divider,
    gap: 12,
  },
  logIconWrap: {
    width: 42, height: 42,
    borderRadius: 12,
    backgroundColor: warm.orangeLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logInfo: {
    flex: 1,
  },
  logSeries: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15, color: warm.ink,
    marginBottom: 2,
  },
  logMeta: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12, color: warm.muted,
  },
});
