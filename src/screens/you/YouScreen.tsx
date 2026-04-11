// src/screens/you/YouScreen.tsx
import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';

const clay = {
  bg:        '#F5EFE6',
  card:      '#FFFFFF',
  ink:       '#2A2420',
  sub:       '#6B5E52',
  muted:     '#8A7A68',
  mutedLight:'#B5A793',
  border:    '#E8DFD0',
  clay:      '#C26B4D',
  clayDark:  '#A5502F',
  sage:      '#A8B59B',
  sageBg:    '#EEF3E8',
  warm:      '#F9F4ED',
  amber:     '#C4956A',
  amberBg:   '#FFF5EC',
};

const SERIES_LABELS: Record<string, string> = {
  primary: 'Primary Series',
  intermediate: 'Intermediate',
  advanced_a: 'Advanced A',
  advanced_b: 'Advanced B',
  sun_sals: 'Sun Salutations',
  short: 'Short Practice',
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  regular: 'Regular',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  teacher: 'Teacher',
};

export default function YouScreen() {
  const router = useRouter();
  const { user, practiceLogs, currentStreak, userPosts, isPracticing, setIsPracticing } = useAppStore();

  const name = user?.name ?? 'Practitioner';
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  const series = SERIES_LABELS[user?.series ?? ''] ?? 'Primary Series';
  const level = LEVEL_LABELS[user?.level ?? ''] ?? 'Beginner';

  // Stats
  const totalSessions = practiceLogs.length;
  const totalMinutes = practiceLogs.reduce((sum, l) => sum + (l.durationMin ?? 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const streak = currentStreak;

  // Recent logs (last 5)
  const recentLogs = practiceLogs.slice(0, 5);

  // Week rhythm (last 7 days)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const rhythm = weekDays.map((label, i) => {
    const dayDate = new Date(today);
    dayDate.setDate(today.getDate() - dayOfWeek + i);
    const dateStr = dayDate.toISOString().slice(0, 10);
    const practiced = practiceLogs.some((l) => (l.loggedAt ?? '').slice(0, 10) === dateStr);
    const isSaturday = i === 6;
    return { label, practiced, isSaturday, isToday: i === dayOfWeek };
  });

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Profile header */}
        <View style={s.profileHeader}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={s.avatar} />
          ) : (
            <LinearGradient colors={[clay.clay, clay.clayDark]} style={s.avatar}>
              <Text style={s.avatarInitials}>{initials}</Text>
            </LinearGradient>
          )}
          <Text style={s.name}>{name}</Text>
          {user?.bio ? <Text style={s.bio}>{user.bio}</Text> : null}

          <View style={s.badgeRow}>
            <View style={[s.badge, { backgroundColor: clay.sageBg }]}>
              <Ionicons name="leaf-outline" size={13} color={clay.sage} />
              <Text style={[s.badgeText, { color: '#5A6F4E' }]}>{series}</Text>
            </View>
            <View style={[s.badge, { backgroundColor: clay.warm }]}>
              <Ionicons name="star-outline" size={13} color={clay.amber} />
              <Text style={[s.badgeText, { color: clay.amber }]}>{level}</Text>
            </View>
            {user?.practicingSince && (
              <View style={[s.badge, { backgroundColor: clay.warm }]}>
                <Ionicons name="time-outline" size={13} color={clay.muted} />
                <Text style={[s.badgeText, { color: clay.muted }]}>Since {user.practicingSince}</Text>
              </View>
            )}
          </View>

          {user?.location && (
            <View style={s.locationRow}>
              <Ionicons name="location-outline" size={14} color={clay.muted} />
              <Text style={s.locationText}>{user.location}</Text>
            </View>
          )}
          {user?.teacher && (
            <View style={s.locationRow}>
              <Ionicons name="school-outline" size={14} color={clay.muted} />
              <Text style={s.locationText}>Teacher: {user.teacher}</Text>
            </View>
          )}
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statNum}>{streak}</Text>
            <Text style={s.statLabel}>Day Streak</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNum}>{totalSessions}</Text>
            <Text style={s.statLabel}>Sessions</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNum}>{totalHours}h</Text>
            <Text style={s.statLabel}>On the Mat</Text>
          </View>
        </View>

        {/* Week rhythm */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>This Week</Text>
          <View style={s.rhythmRow}>
            {rhythm.map((d, i) => (
              <View key={i} style={s.rhythmCol}>
                <View style={[
                  s.rhythmDot,
                  d.practiced && s.rhythmDotDone,
                  d.isSaturday && !d.practiced && s.rhythmDotRest,
                  d.isToday && !d.practiced && s.rhythmDotToday,
                ]}>
                  {d.practiced && <Ionicons name="checkmark" size={12} color="#fff" />}
                  {d.isSaturday && !d.practiced && <Text style={s.rhythmRestText}>R</Text>}
                </View>
                <Text style={[s.rhythmLabel, d.isToday && { color: clay.ink, fontWeight: '700' }]}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent practice */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Recent Practice</Text>
          {recentLogs.length === 0 ? (
            <View style={s.emptyBox}>
              <Ionicons name="leaf-outline" size={28} color={clay.mutedLight} />
              <Text style={s.emptyText}>No practice logged yet</Text>
            </View>
          ) : (
            recentLogs.map((log) => {
              const seriesLabel = SERIES_LABELS[log.series ?? ''] ?? log.series ?? 'Practice';
              const logDate = new Date(log.loggedAt ?? '');
              const dayStr = logDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              return (
                <View key={log.id} style={s.logRow}>
                  <View style={s.logDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.logSeries}>{seriesLabel}</Text>
                    <Text style={s.logMeta}>{dayStr} · {log.durationMin ?? 0}m{log.feeling ? ` · ${log.feeling}` : ''}</Text>
                    {log.notes ? <Text style={s.logNote} numberOfLines={2}>"{log.notes}"</Text> : null}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Quick links */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Settings</Text>
          {[
            { icon: 'settings-outline' as const, label: 'Edit Profile' },
            { icon: 'notifications-outline' as const, label: 'Notifications' },
            { icon: 'moon-outline' as const, label: 'Moon Day Alerts' },
            { icon: 'help-circle-outline' as const, label: 'Help & Feedback' },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={s.linkRow} activeOpacity={0.7}>
              <Ionicons name={item.icon} size={20} color={clay.muted} />
              <Text style={s.linkText}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={clay.border} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: clay.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  /* profile header */
  profileHeader: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: clay.border,
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: clay.ink,
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: clay.sub,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: { fontSize: 13, color: clay.muted },

  /* stats */
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: clay.card,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: clay.border,
  },
  statNum: {
    fontSize: 22,
    fontWeight: '800',
    color: clay.ink,
  },
  statLabel: {
    fontSize: 11,
    color: clay.muted,
    marginTop: 2,
    fontWeight: '600',
  },

  /* section */
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: clay.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: clay.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: clay.ink,
    marginBottom: 12,
  },

  /* rhythm */
  rhythmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rhythmCol: { alignItems: 'center', gap: 4 },
  rhythmDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: clay.warm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: clay.border,
  },
  rhythmDotDone: {
    backgroundColor: clay.sage,
    borderColor: clay.sage,
  },
  rhythmDotRest: {
    backgroundColor: clay.warm,
    borderColor: clay.border,
  },
  rhythmDotToday: {
    borderColor: clay.clay,
    borderWidth: 2,
  },
  rhythmRestText: {
    fontSize: 10,
    fontWeight: '700',
    color: clay.muted,
  },
  rhythmLabel: {
    fontSize: 11,
    color: clay.muted,
    fontWeight: '500',
  },

  /* logs */
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyText: { fontSize: 13, color: clay.mutedLight },
  logRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  logDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: clay.sage,
    marginTop: 6,
  },
  logSeries: { fontSize: 14, fontWeight: '700', color: clay.ink },
  logMeta: { fontSize: 12, color: clay.muted, marginTop: 1 },
  logNote: { fontSize: 12, color: clay.sub, fontStyle: 'italic', marginTop: 2 },

  /* links */
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: clay.border,
  },
  linkText: { fontSize: 14, color: clay.ink, flex: 1 },
});
