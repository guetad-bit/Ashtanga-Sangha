// src/screens/you/YouScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Platform, Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { signOut } from '@/lib/supabase';

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
  sageDark:  '#7D9A6E',
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
  const { user, practiceLogs, currentStreak, bookedGatherings, clearUser } = useAppStore();

  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const name = user?.name ?? 'Practitioner';
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  const series = SERIES_LABELS[user?.series ?? ''] ?? 'Primary Series';
  const level = LEVEL_LABELS[user?.level ?? ''] ?? 'Beginner';

  // Stats
  const totalSessions = practiceLogs.length;
  const totalMinutes = practiceLogs.reduce((sum, l) => sum + (l.durationMin ?? 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const streak = currentStreak;

  // Recent logs (last 3)
  const recentLogs = practiceLogs.slice(0, 3);

  // Week rhythm
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

  const handleSignOut = async () => {
    setShowSignOutConfirm(false);
    await signOut();
    clearUser();
  };

  const settingsItems = [
    {
      icon: 'person-outline' as const,
      label: 'Edit Profile',
      onPress: () => router.push('/(tabs)/profile' as any),
    },
    {
      icon: 'globe-outline' as const,
      label: 'Language',
      onPress: () => router.push('/(tabs)/profile' as any),
    },
    {
      icon: 'notifications-outline' as const,
      label: 'Notifications',
      subtitle: 'Coming soon',
      onPress: () => {},
    },
    {
      icon: 'moon-outline' as const,
      label: 'Moon Day Alerts',
      subtitle: 'Coming soon',
      onPress: () => {},
    },
    {
      icon: 'help-circle-outline' as const,
      label: 'Help & Feedback',
      onPress: () => {
        if (Platform.OS === 'web') {
          window.open('mailto:support@ashtangasangha.com?subject=Sangha%20Feedback', '_blank');
        }
      },
    },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Top brand bar */}
        <View style={s.topBar}>
          <Text style={s.brandWord}>sangha</Text>
          <TouchableOpacity
            style={s.settingsBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/profile' as any)}
          >
            <Ionicons name="settings-outline" size={20} color={clay.muted} />
          </TouchableOpacity>
        </View>

        {/* Profile card */}
        <TouchableOpacity
          style={s.profileCard}
          activeOpacity={0.85}
          onPress={() => router.push('/(tabs)/profile' as any)}
        >
          <View style={s.profileRow}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={s.avatar} />
            ) : (
              <LinearGradient colors={[clay.clay, clay.clayDark]} style={s.avatar}>
                <Text style={s.avatarInitials}>{initials}</Text>
              </LinearGradient>
            )}
            <View style={s.profileInfo}>
              <Text style={s.name}>{name}</Text>
              {user?.bio ? <Text style={s.bio} numberOfLines={2}>{user.bio}</Text> : null}
              <View style={s.badgeRow}>
                <View style={[s.badge, { backgroundColor: clay.sageBg }]}>
                  <Ionicons name="leaf-outline" size={11} color={clay.sage} />
                  <Text style={[s.badgeText, { color: '#5A6F4E' }]}>{series}</Text>
                </View>
                <View style={[s.badge, { backgroundColor: clay.warm }]}>
                  <Ionicons name="star-outline" size={11} color={clay.amber} />
                  <Text style={[s.badgeText, { color: clay.amber }]}>{level}</Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={clay.border} />
          </View>

          {user?.location && (
            <View style={s.locationRow}>
              <Ionicons name="location-outline" size={13} color={clay.muted} />
              <Text style={s.locationText}>{user.location}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Stats row */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <View style={s.statIconWrap}>
              <Ionicons name="flame-outline" size={16} color={clay.clay} />
            </View>
            <Text style={s.statNum}>{streak}</Text>
            <Text style={s.statLabel}>Day Streak</Text>
          </View>
          <View style={s.statCard}>
            <View style={[s.statIconWrap, { backgroundColor: clay.sageBg }]}>
              <Ionicons name="fitness-outline" size={16} color={clay.sageDark} />
            </View>
            <Text style={s.statNum}>{totalSessions}</Text>
            <Text style={s.statLabel}>Sessions</Text>
          </View>
          <View style={s.statCard}>
            <View style={[s.statIconWrap, { backgroundColor: clay.amberBg }]}>
              <Ionicons name="time-outline" size={16} color={clay.amber} />
            </View>
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

        {/* Upcoming gatherings */}
        {bookedGatherings.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>My Upcoming</Text>
            {bookedGatherings.map((b) => (
              <TouchableOpacity key={b.gatheringId} style={s.upcomingCard} activeOpacity={0.85} onPress={() => router.push('/(tabs)/shalas' as any)}>
                <View style={s.upcomingIcon}>
                  <Ionicons
                    name={b.type === 'retreat' ? 'sunny-outline' : b.type === 'led_class' ? 'body-outline' : b.type === 'workshop' ? 'school-outline' : 'fitness-outline'}
                    size={18}
                    color={clay.clay}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.upcomingTitle}>{b.title}</Text>
                  <Text style={s.upcomingMeta}>{b.date} · {b.location}</Text>
                  <Text style={s.upcomingGuide}>with {b.guideName}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={clay.muted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

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

        {/* Settings */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Settings</Text>
          {settingsItems.map((item, idx) => (
            <TouchableOpacity
              key={item.label}
              style={[s.linkRow, idx === settingsItems.length - 1 && { borderBottomWidth: 0 }]}
              activeOpacity={0.7}
              onPress={item.onPress}
            >
              <View style={s.linkIconWrap}>
                <Ionicons name={item.icon} size={18} color={clay.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.linkText}>{item.label}</Text>
                {item.subtitle ? <Text style={s.linkSubtitle}>{item.subtitle}</Text> : null}
              </View>
              <Ionicons name="chevron-forward" size={16} color={clay.border} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={s.signOutBtn}
          activeOpacity={0.7}
          onPress={() => setShowSignOutConfirm(true)}
        >
          <Ionicons name="log-out-outline" size={18} color={clay.clay} />
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={s.versionText}>Sangha v1.0.0</Text>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Sign-out confirmation modal */}
      <Modal visible={showSignOutConfirm} transparent animationType="fade" onRequestClose={() => setShowSignOutConfirm(false)}>
        <Pressable style={s.modalBackdrop} onPress={() => setShowSignOutConfirm(false)}>
          <View style={s.modalBox}>
            <Ionicons name="log-out-outline" size={28} color={clay.clay} style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text style={s.modalTitle}>Sign Out</Text>
            <Text style={s.modalBody}>Are you sure you want to sign out of Sangha?</Text>
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.modalCancelBtn} onPress={() => setShowSignOutConfirm(false)} activeOpacity={0.7}>
                <Text style={s.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalConfirmBtn} onPress={handleSignOut} activeOpacity={0.7}>
                <Text style={s.modalConfirmText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: clay.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  /* top brand bar */
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4,
  },
  brandWord: {
    fontFamily: 'Georgia', fontSize: 24, fontWeight: '300',
    letterSpacing: 7, color: clay.clay, paddingLeft: 7,
  },
  settingsBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: clay.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: clay.border,
  },

  /* profile card */
  profileCard: {
    marginHorizontal: 16, marginTop: 16, marginBottom: 16,
    backgroundColor: clay.card, borderRadius: 20,
    padding: 18, borderWidth: 1, borderColor: clay.border,
  },
  profileRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: clay.border,
  },
  avatarInitials: {
    fontSize: 22, fontWeight: '800', color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20, fontWeight: '800', color: clay.ink, marginBottom: 3,
  },
  bio: {
    fontSize: 13, color: clay.sub, lineHeight: 18, marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 5,
  },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  locationRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: clay.border,
  },
  locationText: { fontSize: 12, color: clay.muted },

  /* stats */
  statsRow: {
    flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 16,
  },
  statCard: {
    flex: 1, backgroundColor: clay.card, borderRadius: 16,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: clay.border,
  },
  statIconWrap: {
    width: 30, height: 30, borderRadius: 10,
    backgroundColor: '#FFF4EF', alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  statNum: {
    fontSize: 20, fontWeight: '800', color: clay.ink,
  },
  statLabel: {
    fontSize: 10, color: clay.muted, marginTop: 2, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  /* section */
  section: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: clay.card, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: clay.border,
  },
  sectionTitle: {
    fontSize: 15, fontWeight: '700', color: clay.ink, marginBottom: 12,
  },

  /* rhythm */
  rhythmRow: { flexDirection: 'row', justifyContent: 'space-between' },
  rhythmCol: { alignItems: 'center', gap: 4 },
  rhythmDot: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: clay.warm, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: clay.border,
  },
  rhythmDotDone: { backgroundColor: clay.sage, borderColor: clay.sage },
  rhythmDotRest: { backgroundColor: clay.warm, borderColor: clay.border },
  rhythmDotToday: { borderColor: clay.clay, borderWidth: 2 },
  rhythmRestText: { fontSize: 10, fontWeight: '700', color: clay.muted },
  rhythmLabel: { fontSize: 11, color: clay.muted, fontWeight: '500' },

  /* upcoming gatherings */
  upcomingCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 14, gap: 12, marginBottom: 8,
    borderWidth: 1, borderColor: clay.border,
  },
  upcomingIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF4EF',
    alignItems: 'center', justifyContent: 'center',
  },
  upcomingTitle: { fontSize: 14, fontWeight: '700', color: clay.ink },
  upcomingMeta: { fontSize: 12, color: clay.muted, marginTop: 2 },
  upcomingGuide: { fontSize: 11, color: clay.sage, fontWeight: '600', marginTop: 1 },

  /* logs */
  emptyBox: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  emptyText: { fontSize: 13, color: clay.mutedLight },
  logRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10,
  },
  logDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: clay.sage, marginTop: 6,
  },
  logSeries: { fontSize: 14, fontWeight: '700', color: clay.ink },
  logMeta: { fontSize: 12, color: clay.muted, marginTop: 1 },
  logNote: { fontSize: 12, color: clay.sub, fontStyle: 'italic', marginTop: 2 },

  /* settings links */
  linkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: clay.border,
  },
  linkIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: clay.warm, alignItems: 'center', justifyContent: 'center',
  },
  linkText: { fontSize: 14, fontWeight: '600', color: clay.ink },
  linkSubtitle: { fontSize: 11, color: clay.mutedLight, marginTop: 1 },

  /* sign out */
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 4, marginBottom: 4,
    paddingVertical: 14, backgroundColor: clay.card,
    borderRadius: 16, borderWidth: 1, borderColor: clay.border,
  },
  signOutText: {
    fontSize: 14, fontWeight: '600', color: clay.clay,
  },

  /* version */
  versionText: {
    fontSize: 11, color: clay.mutedLight, textAlign: 'center',
    marginTop: 16, letterSpacing: 0.5,
  },

  /* sign-out modal */
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28, width: 300,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 8,
  },
  modalTitle: {
    fontFamily: 'Georgia', fontSize: 20, color: clay.ink,
    textAlign: 'center', marginBottom: 8,
  },
  modalBody: {
    fontSize: 14, color: clay.sub, textAlign: 'center',
    lineHeight: 20, marginBottom: 24,
  },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalCancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: clay.border, alignItems: 'center',
  },
  modalCancelText: { fontSize: 14, fontWeight: '600', color: clay.sub },
  modalConfirmBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: clay.clay, alignItems: 'center',
  },
  modalConfirmText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
