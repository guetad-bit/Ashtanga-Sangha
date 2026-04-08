// src/screens/home/HomeScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Pressable, Modal, TextInput,
  StyleSheet, Image, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { getWeeklyRhythm, calculateStreak } from '@/utils/practiceStreak';
import { daysUntilNextMoonDay } from '@/utils/moonDay';
import { getPracticeLogs, getPracticingNow, setPracticingNow, getFeed, logPractice, supabase } from '@/lib/supabase';

interface PracticingUser {
  id: string;
  name: string;
  avatar_url: string | null;
  series: string;
  level: string;
  streak: number;
  practicing_started_at: string;
}

interface FeedPost {
  id: string;
  user_id: string;
  caption: string;
  image_url: string | null;
  location: string | null;
  likes_count: number;
  comments_count?: number;
  created_at: string;
  profiles: { name: string; avatar_url: string | null; series?: string | null } | null;
}

/* ── Clay & Terracotta palette ───────────────────────────────────── */
const clay = {
  bg: '#F5EFE6',
  sand: '#F7F1E7',
  sandDark: '#EFE3D3',
  card: '#FFFFFF',
  ink: '#2A2420',
  inkMid: '#4A3F36',
  muted: '#8A7A68',
  mutedLight: '#B5A793',
  border: '#E8DFD0',
  clay: '#C26B4D',
  clayDark: '#A5502F',
  claySoft: '#E8B8A0',
  gold: '#C4956A',
  sage: '#A8B59B',
  success: '#6E7F5C',
  heart: '#C26B4D',
};

const GURU_WISDOM = [
  { guru: 'Sri K. Pattabhi Jois', quote: 'Practice, and all is coming.' },
  { guru: 'Sri K. Pattabhi Jois', quote: 'Yoga is 99% practice, 1% theory.' },
  { guru: 'B.K.S. Iyengar', quote: 'Yoga does not just change the way we see things, it transforms the person who sees.' },
  { guru: 'B.K.S. Iyengar', quote: 'The body is your temple. Keep it pure and clean for the soul to reside in.' },
  { guru: 'T. Krishnamacharya', quote: 'Inhale, and God approaches you. Hold the inhalation, and God remains with you.' },
  { guru: 'Patanjali', quote: 'Yoga is the stilling of the fluctuations of the mind.' },
  { guru: 'Sharath Jois', quote: 'Without a strong foundation, the building will not stand. Same with yoga practice.' },
  { guru: 'Sri K. Pattabhi Jois', quote: 'Body is not stiff, mind is stiff.' },
  { guru: 'B.K.S. Iyengar', quote: 'Change is not something we should fear. Rather, it is something we should welcome.' },
  { guru: 'Anonymous', quote: 'We practice not to perform, but to belong — to ourselves, and to each other.' },
];

const SERIES_LABELS: Record<string, string> = {
  sun_sals: 'Sun Salutations',
  primary: 'Primary Series',
  intermediate: 'Intermediate',
  advanced_a: 'Advanced A',
  advanced_b: 'Advanced B',
  short: 'Short Practice',
  led_class: 'Led Class',
  half_primary: 'Half Primary',
  full_primary: 'Full Primary',
};

const SERIES_CHIPS: Record<string, { label: string; bg: string; fg: string }> = {
  primary: { label: 'Primary', bg: '#F0E8D8', fg: '#8A5A3A' },
  full_primary: { label: 'Mysore', bg: '#F5EFE6', fg: '#8A5A3A' },
  half_primary: { label: 'Primary', bg: '#F0E8D8', fg: '#8A5A3A' },
  intermediate: { label: 'Intermediate', bg: '#E8B8A0', fg: '#5C3620' },
  advanced_a: { label: 'Advanced A', bg: '#E8B8A0', fg: '#5C3620' },
  advanced_b: { label: 'Advanced B', bg: '#E8B8A0', fg: '#5C3620' },
  led_class: { label: 'Led Class', bg: '#F7F1E7', fg: '#4A3F36' },
  sun_sals: { label: 'Sun Sals', bg: '#F5EFE6', fg: '#8A7A68' },
  short: { label: 'Short', bg: '#F7F1E7', fg: '#4A3F36' },
};

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatDuration(mins: number) {
  if (!mins || mins <= 0) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const {
    user, practiceLogs, setPracticeLogs,
    isPracticing, setIsPracticing,
    addPracticeLog,
  } = useAppStore();

  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [livePractitioners, setLivePractitioners] = useState<PracticingUser[]>([]);
  const [loggedSeries, setLoggedSeries] = useState<string | null>(null);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logSeries, setLogSeries] = useState('primary');
  const [logDuration, setLogDuration] = useState(75);
  const [logNotes, setLogNotes] = useState('');
  const [logFeeling, setLogFeeling] = useState<string | null>(null);
  const [profileCard, setProfileCard] = useState<{ name: string; avatarUrl: string; series: string; streak: number; bio: string } | null>(null);
  const [realMembers, setRealMembers] = useState<{ id: string; name: string; avatar_url: string | null; series: string; streak: number; bio: string | null }[]>([]);
  const [activeTab, setActiveTab] = useState<'following' | 'moon' | 'mine'>('following');

  const openProfile = (name: string) => {
    const member = realMembers.find((m) => m.name === name);
    if (member) {
      const seriesLabel = SERIES_LABELS[member.series] ?? member.series;
      setProfileCard({ name: member.name, avatarUrl: member.avatar_url ?? '', series: seriesLabel, streak: member.streak, bio: member.bio ?? '' });
    }
  };

  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const guruWisdom = GURU_WISDOM[dayOfYear % GURU_WISDOM.length];
  const practicedToday = loggedSeries !== null;
  const streak = calculateStreak(practiceLogs);
  const rhythm = getWeeklyRhythm(practiceLogs);
  const practicesThisWeek = rhythm.filter((d) => d.status === 'done').length;

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekLogs = practiceLogs.filter((log) => new Date(log.loggedAt ?? '') >= weekStart);
  const weekMinutes = weekLogs.reduce((sum, l) => sum + (l.durationMin ?? 0), 0);
  const weekPoses = weekLogs.length * 30;

  const daysToMoon = daysUntilNextMoonDay(now);
  const moonDate = new Date(now);
  moonDate.setDate(moonDate.getDate() + daysToMoon);
  const moonLabel = moonDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const friendsThisWeek = realMembers.length + livePractitioners.length;

  const homeFeed = feedPosts
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  const practiceState = isPracticing ? 'onMat' : 'idle';

  const handlePracticeButton = () => {
    if (practiceState === 'idle') {
      setIsPracticing(true);
      if (user) setPracticingNow(user.id, true).catch(console.error);
    } else {
      const startedAt = useAppStore.getState().practicingStartedAt;
      if (startedAt) {
        const mins = Math.round((Date.now() - new Date(startedAt).getTime()) / 60000);
        setLogDuration(mins > 0 ? mins : 75);
      }
      setShowLogModal(true);
    }
  };

  const handleSaveLog = async () => {
    if (!user) return;
    const fullNotes = logNotes.trim();
    const { error } = await logPractice(user.id, logSeries, logDuration, fullNotes || undefined, logFeeling || undefined);
    if (!error) {
      addPracticeLog({
        id: Date.now().toString(),
        userId: user.id,
        loggedAt: new Date().toISOString(),
        series: logSeries,
        durationMin: logDuration,
        feeling: logFeeling || undefined,
        notes: fullNotes || undefined,
      });
      setLoggedSeries(logSeries);
    }
    setIsPracticing(false);
    setShowLogModal(false);
    setLogNotes('');
    setLogFeeling(null);
  };

  const fetchLogs = async () => {
    if (!user) return;
    const { data } = await getPracticeLogs(user.id);
    if (data) {
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

  const fetchPracticing = async () => {
    const { data } = await getPracticingNow();
    if (data) setLivePractitioners(data as PracticingUser[]);
  };

  const fetchFeed = async () => {
    const { data } = await getFeed(user?.id ?? '');
    if (data) setFeedPosts(data as FeedPost[]);
  };

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, series, streak, bio')
      .neq('id', user?.id ?? '')
      .order('streak', { ascending: false })
      .limit(20);
    if (data) setRealMembers(data as any);
  };

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const existing = practiceLogs.find(
      (log) => new Date(log.loggedAt).toISOString().split('T')[0] === todayStr
    );
    if (existing && !loggedSeries) {
      setLoggedSeries(existing.series);
    }
  }, [practiceLogs]);

  useFocusEffect(
    useCallback(() => {
      fetchLogs(); fetchPracticing(); fetchFeed(); fetchMembers();
    }, [user?.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchLogs(), fetchPracticing(), fetchFeed(), fetchMembers()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={clay.clay} />}
      >
        {/* Top brand bar */}
        <View style={s.topBar}>
          <View style={s.brand}>
            <LinearGradient colors={[clay.clay, clay.clayDark]} style={s.logo}>
              <Text style={s.logoIcon}>🪷</Text>
            </LinearGradient>
            <View>
              <Text style={s.brandName}>Sangha</Text>
              <Text style={s.brandTag}>ASHTANGA · COMMUNITY · GROWTH</Text>
            </View>
          </View>
          <View style={s.topRight}>
            <TouchableOpacity style={s.bellBtn} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={18} color={clay.ink} />
              <View style={s.bellDot} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/profile' as any)}>
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={s.avatarSm} />
              ) : (
                <LinearGradient colors={['#C9A384', '#8B6B4A']} style={s.avatarSm} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={s.tabs}>
          {[
            { key: 'following', label: 'Following' },
            { key: 'moon', label: 'Moon Days' },
            { key: 'mine', label: 'My Practice' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[s.tab, activeTab === tab.key && s.tabActive]}
              onPress={() => setActiveTab(tab.key as any)}
              activeOpacity={0.7}
            >
              <Text style={[s.tabText, activeTab === tab.key && s.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          <LinearGradient colors={[clay.claySoft, clay.gold]} style={s.streakCard}>
            <Text style={s.streakFlame}>🔥</Text>
            <Text style={s.streakLabel}>{streak > 0 ? `${streak} Day Streak` : 'Start a streak'}</Text>
            <Text style={s.streakNum}>{streak > 0 ? `${streak} ${streak === 1 ? 'Day' : 'Days'}` : '0 Days'}</Text>
            <Text style={s.streakSub}>Keep the fire alive ›</Text>
          </LinearGradient>

          <View style={s.weeklyCard}>
            <Text style={s.weeklyTitle}>Weekly Summary</Text>
            <View style={s.weeklyStats}>
              <View style={s.wItem}>
                <Text style={s.wNum}>{practicesThisWeek}</Text>
                <Text style={s.wLbl}>Practices</Text>
              </View>
              <View style={s.wItem}>
                <Text style={s.wNum}>{formatDuration(weekMinutes)}</Text>
                <Text style={s.wLbl}>Total Time</Text>
              </View>
              <View style={s.wItem}>
                <Text style={s.wNum}>{weekPoses}</Text>
                <Text style={s.wLbl}>Poses</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Log practice CTA */}
        <TouchableOpacity activeOpacity={0.85} onPress={handlePracticeButton} style={{ marginHorizontal: 20, marginBottom: 10 }}>
          <LinearGradient colors={[clay.clay, clay.clayDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.logCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name={practiceState === 'onMat' ? 'checkmark-circle' : 'book-outline'} size={28} color="#fff" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={s.logTitleTxt}>{practiceState === 'onMat' ? 'Finish Practice' : 'Log Practice'}</Text>
                <Text style={s.logSubTxt}>{practiceState === 'onMat' ? 'Save your session' : 'Start your journey'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Practice Mode entry */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/practice-mode' as any)}
          style={{
            marginHorizontal: 20, marginBottom: 14, paddingVertical: 14, paddingHorizontal: 18,
            borderRadius: 16, borderWidth: 1, borderColor: clay.border, backgroundColor: clay.card,
            flexDirection: 'row', alignItems: 'center',
          }}>
          <Ionicons name="leaf-outline" size={22} color={clay.clayDark} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: clay.ink }}>Practice Mode</Text>
            <Text style={{ fontSize: 12, color: clay.muted, marginTop: 2 }}>Distraction-free guided sequence</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={clay.muted} />
        </TouchableOpacity>

        {/* Moon + friends row */}
        <View style={s.row2}>
          <View style={[s.infoCard, { flex: 1.6 }]}>
            <LinearGradient colors={['#E8DFD0', '#8A7A68']} style={s.moonIcon} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={s.moonTitle}>New Moon · {moonLabel}</Text>
              <Text style={s.moonSub}>Rest, reflect, allow. {daysToMoon === 0 ? 'Today' : `${daysToMoon} days`}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={clay.clay} />
          </View>

          <View style={[s.infoCard, { flex: 1 }]}>
            <View style={s.friendsAvatars}>
              {realMembers.slice(0, 3).map((m, i) => (
                <View key={m.id} style={[s.friendsDot, { marginLeft: i === 0 ? 0 : -8, zIndex: 3 - i }]}>
                  {m.avatar_url ? (
                    <Image source={{ uri: m.avatar_url }} style={s.friendsDotImg} />
                  ) : (
                    <LinearGradient colors={['#D4A584', '#8B6B4A']} style={s.friendsDotImg} />
                  )}
                </View>
              ))}
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={s.friendsTitle}>{friendsThisWeek} practicing</Text>
              <Text style={s.friendsSub}>this week</Text>
            </View>
          </View>
        </View>

        {/* Quote banner */}
        <LinearGradient
          colors={['#D8C3A8', '#A68868', '#7A6855']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.quoteBanner}
        >
          <Text style={s.quoteText}>"{guruWisdom.quote}"</Text>
          <View style={s.quoteDivider} />
          <Text style={s.quoteGuru}>— {guruWisdom.guru}</Text>
        </LinearGradient>

        {/* Feed */}
        {homeFeed.length === 0 ? (
          <View style={s.emptyFeed}>
            <Ionicons name="leaf-outline" size={32} color={clay.mutedLight} />
            <Text style={s.emptyText}>No practices shared yet.</Text>
            <Text style={s.emptySub}>Be the first to log your practice.</Text>
          </View>
        ) : (
          homeFeed.map((post) => {
            const seriesKey = (post.profiles as any)?.series ?? 'primary';
            const chip = SERIES_CHIPS[seriesKey] ?? SERIES_CHIPS.primary;
            const seriesName = SERIES_LABELS[seriesKey] ?? 'Practice';
            return (
              <View key={post.id} style={s.feedCard}>
                <View style={s.fcHead}>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => openProfile(post.profiles?.name ?? '')}>
                    {post.profiles?.avatar_url ? (
                      <Image source={{ uri: post.profiles.avatar_url }} style={s.fcAvatar} />
                    ) : (
                      <LinearGradient colors={['#C9A384', '#7A5540']} style={s.fcAvatar} />
                    )}
                    <View style={[s.fcDot, { backgroundColor: clay.success }]} />
                  </TouchableOpacity>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={s.fcName}>{post.profiles?.name ?? 'Practitioner'}</Text>
                    <Text style={s.fcSub} numberOfLines={1}>
                      {post.location ? `${post.location} · ` : ''}{getTimeAgo(post.created_at)}
                    </Text>
                  </View>
                  <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={18} color={clay.muted} />
                  </TouchableOpacity>
                </View>

                <View style={s.fcSeriesRow}>
                  <Text style={s.fcSeries}>{seriesName}</Text>
                  <View style={[s.fcChip, { backgroundColor: chip.bg }]}>
                    <Text style={[s.fcChipText, { color: chip.fg }]}>{chip.label}</Text>
                  </View>
                </View>

                {post.image_url ? (
                  <Image source={{ uri: post.image_url }} style={s.fcImage} />
                ) : null}

                {post.caption ? (
                  <Text style={s.fcNote}>"{post.caption}"</Text>
                ) : null}

                <View style={s.fcActions}>
                  <TouchableOpacity style={s.fcAct}>
                    <Ionicons name={(post.likes_count ?? 0) > 0 ? "flower" : "flower-outline"} size={18} color={clay.heart} />
                    <Text style={[s.fcActText, { color: clay.heart, marginLeft: 6 }]}>
                      {(post.likes_count ?? 0) === 0 ? 'Offer gratitude' : 'Received with gratitude'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.fcAct}>
                    <Ionicons name="chatbubble-outline" size={17} color={clay.muted} />
                    <Text style={[s.fcActText, { marginLeft: 5 }]}>{post.comments_count ?? 0}</Text>
                  </TouchableOpacity>
                  <View style={{ flex: 1 }} />
                  <TouchableOpacity>
                    <Ionicons name="share-outline" size={18} color={clay.muted} style={{ marginRight: 14 }} />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Ionicons name="bookmark-outline" size={17} color={clay.muted} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}

        {/* Practitioners Near You */}
        {realMembers.length > 0 && (
          <View style={s.nearSection}>
            <View style={s.nearHead}>
              <Text style={s.nearTitle}>Practitioners Near You</Text>
              <TouchableOpacity onPress={() => router.push('/community' as any)}>
                <Text style={s.nearView}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
              {realMembers.slice(0, 6).map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={s.nearCard}
                  activeOpacity={0.8}
                  onPress={() => openProfile(m.name)}
                >
                  {m.avatar_url ? (
                    <Image source={{ uri: m.avatar_url }} style={s.nearImg} />
                  ) : (
                    <LinearGradient colors={['#D4B896', '#8B6B4A']} style={s.nearImg} />
                  )}
                  <Text style={s.nearName} numberOfLines={1}>{m.name}</Text>
                  <Text style={s.nearSub} numberOfLines={1}>{SERIES_LABELS[m.series] ?? m.series}</Text>
                  {m.streak > 0 && (
                    <Text style={s.nearStreak}>🔥 {m.streak} day streak</Text>
                  )}
                  <View style={s.nearConnect}>
                    <Text style={s.nearConnectText}>Connect</Text>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={s.nearFind} activeOpacity={0.8} onPress={() => router.push('/community' as any)}>
                <Ionicons name="people-outline" size={24} color={clay.muted} />
                <Text style={s.nearFindTxt}>Find more practitioners</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Log Modal */}
      <Modal visible={showLogModal} transparent animationType="slide" onRequestClose={() => setShowLogModal(false)}>
        <Pressable style={s.logBackdrop} onPress={() => setShowLogModal(false)}>
          <Pressable style={s.logSheet} onPress={() => {}}>
            <View style={s.logHeader}>
              <Text style={s.logSheetTitle}>How was your practice?</Text>
              <TouchableOpacity onPress={() => setShowLogModal(false)}>
                <Ionicons name="close" size={22} color={clay.muted} />
              </TouchableOpacity>
            </View>

            <Text style={s.logLabel}>Series</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={s.logChipsRow}>
                {(['primary', 'intermediate', 'advanced_a', 'led_class', 'half_primary'] as const).map((key) => (
                  <TouchableOpacity
                    key={key}
                    style={[s.logChip, logSeries === key && s.logChipActive]}
                    onPress={() => setLogSeries(key)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.logChipText, logSeries === key && s.logChipTextActive]}>
                      {SERIES_LABELS[key]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={s.logLabel}>Duration</Text>
            <View style={s.logDurAdjust}>
              <TouchableOpacity style={s.logDurBtn} onPress={() => setLogDuration(Math.max(5, logDuration - 5))}>
                <Ionicons name="remove" size={18} color={clay.ink} />
              </TouchableOpacity>
              <Text style={s.logDurValue}>{logDuration} min</Text>
              <TouchableOpacity style={s.logDurBtn} onPress={() => setLogDuration(logDuration + 5)}>
                <Ionicons name="add" size={18} color={clay.ink} />
              </TouchableOpacity>
            </View>

            <Text style={s.logLabel}>Feeling</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={s.logChipsRow}>
                {(['strong', 'steady', 'challenging', 'low_energy', 'blissful'] as const).map((key) => {
                  const active = logFeeling === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[s.logChip, active && s.logChipActive]}
                      onPress={() => setLogFeeling(active ? null : key)}
                      activeOpacity={0.7}
                    >
                      <Text style={[s.logChipText, active && s.logChipTextActive]}>
                        {key.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <Text style={s.logLabel}>Notes</Text>
            <TextInput
              style={s.logInput}
              placeholder="How did it feel?"
              placeholderTextColor={clay.mutedLight}
              multiline
              numberOfLines={3}
              value={logNotes}
              onChangeText={setLogNotes}
            />

            <TouchableOpacity style={s.logSaveBtn} onPress={handleSaveLog} activeOpacity={0.85}>
              <Text style={s.logSaveBtnText}>Save Practice</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Profile card modal */}
      <Modal visible={!!profileCard} transparent animationType="fade" onRequestClose={() => setProfileCard(null)}>
        <Pressable style={s.profileBackdrop} onPress={() => setProfileCard(null)}>
          <View style={s.profileCard}>
            {profileCard && (
              <>
                {profileCard.avatarUrl ? (
                  <Image source={{ uri: profileCard.avatarUrl }} style={s.profileAvatar} />
                ) : (
                  <LinearGradient colors={['#D4A584', '#8B6B4A']} style={s.profileAvatar} />
                )}
                <Text style={s.profileName}>{profileCard.name}</Text>
                <View style={s.profileBadgeRow}>
                  <View style={s.profileBadge}>
                    <Ionicons name="leaf-outline" size={13} color={clay.sage} />
                    <Text style={s.profileBadgeText}>{profileCard.series}</Text>
                  </View>
                  {profileCard.streak > 0 && (
                    <View style={[s.profileBadge, { backgroundColor: '#F0E8D8' }]}>
                      <Ionicons name="flame-outline" size={13} color={clay.clay} />
                      <Text style={[s.profileBadgeText, { color: clay.clay }]}>{profileCard.streak}-day streak</Text>
                    </View>
                  )}
                </View>
                {profileCard.bio ? <Text style={s.profileBio}>{profileCard.bio}</Text> : null}
                <TouchableOpacity style={s.profileCloseBtn} onPress={() => setProfileCard(null)} activeOpacity={0.7}>
                  <Text style={s.profileCloseBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: clay.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12 },
  brand: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  logoIcon: { fontSize: 22 },
  brandName: { fontSize: 24, fontWeight: '700', color: clay.ink, lineHeight: 26 },
  brandTag: { fontSize: 8.5, letterSpacing: 1.8, color: clay.muted, marginTop: 3 },
  topRight: { flexDirection: 'row', alignItems: 'center' },
  bellBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 },
  bellDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: clay.clay, borderWidth: 1.5, borderColor: '#fff' },
  avatarSm: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: '#fff' },

  tabs: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 14, backgroundColor: clay.sandDark, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 9 },
  tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 },
  tabText: { fontSize: 13, fontWeight: '600', color: clay.muted },
  tabTextActive: { color: clay.ink },

  statsRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 14 },
  streakCard: { flex: 1, borderRadius: 16, padding: 14, marginRight: 10 },
  streakFlame: { fontSize: 22 },
  streakLabel: { fontSize: 10, fontWeight: '600', color: '#7A4B2E', marginTop: 4 },
  streakNum: { fontSize: 22, fontWeight: '800', color: '#5C3620', marginTop: 2 },
  streakSub: { fontSize: 9, color: '#7A4B2E', marginTop: 4 },
  weeklyCard: { flex: 1.3, backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: clay.border },
  weeklyTitle: { fontSize: 11, color: clay.muted, marginBottom: 8 },
  weeklyStats: { flexDirection: 'row', justifyContent: 'space-between' },
  wItem: { flex: 1, alignItems: 'center' },
  wNum: { fontSize: 16, fontWeight: '800', color: clay.ink },
  wLbl: { fontSize: 9, color: clay.muted, marginTop: 3 },

  logCard: { borderRadius: 16, padding: 16, shadowColor: clay.clay, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4 },
  logTitleTxt: { fontSize: 16, fontWeight: '700', color: '#fff' },
  logSubTxt: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  row2: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 14 },
  infoCard: { backgroundColor: '#fff', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: clay.border, flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  moonIcon: { width: 34, height: 34, borderRadius: 17 },
  moonTitle: { fontSize: 12, fontWeight: '700', color: clay.ink },
  moonSub: { fontSize: 10, color: clay.muted, marginTop: 1 },
  friendsAvatars: { flexDirection: 'row' },
  friendsDot: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: '#fff', overflow: 'hidden' },
  friendsDotImg: { width: '100%', height: '100%' },
  friendsTitle: { fontSize: 11, fontWeight: '700', color: clay.ink },
  friendsSub: { fontSize: 9, color: clay.muted },

  quoteBanner: { marginHorizontal: 20, marginBottom: 16, borderRadius: 16, padding: 20, minHeight: 110, alignItems: 'center', justifyContent: 'center' },
  quoteText: { fontStyle: 'italic', fontSize: 13, color: '#fff', textAlign: 'center', lineHeight: 20, textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  quoteDivider: { width: 30, height: 1, backgroundColor: 'rgba(255,255,255,0.6)', marginTop: 8, marginBottom: 6 },
  quoteGuru: { fontSize: 10, color: 'rgba(255,255,255,0.85)', fontStyle: 'italic' },

  emptyFeed: { marginHorizontal: 20, padding: 32, alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: clay.border, marginBottom: 14 },
  emptyText: { fontSize: 13, fontWeight: '600', color: clay.inkMid, marginTop: 8 },
  emptySub: { fontSize: 11, color: clay.muted, marginTop: 3 },

  feedCard: { backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 14, borderRadius: 18, borderWidth: 1, borderColor: clay.border, padding: 16 },
  fcHead: { flexDirection: 'row', alignItems: 'flex-start' },
  fcAvatar: { width: 44, height: 44, borderRadius: 22 },
  fcDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#fff' },
  fcName: { fontSize: 15, fontWeight: '700', color: clay.ink },
  fcSub: { fontSize: 11, color: clay.muted, marginTop: 2 },

  fcSeriesRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  fcSeries: { fontSize: 17, fontWeight: '800', color: clay.ink, marginRight: 8 },
  fcChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  fcChipText: { fontSize: 10, fontWeight: '600' },

  fcImage: { width: '100%', height: 180, borderRadius: 12, marginTop: 12, backgroundColor: clay.sand },
  fcNote: { fontSize: 12, fontStyle: 'italic', color: clay.inkMid, lineHeight: 18, marginTop: 12 },

  fcActions: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: clay.border },
  fcAct: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  fcActText: { fontSize: 12, color: clay.muted, fontWeight: '600' },

  nearSection: { paddingLeft: 20, marginBottom: 14 },
  nearHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingRight: 20 },
  nearTitle: { fontSize: 15, fontWeight: '800', color: clay.ink },
  nearView: { fontSize: 12, color: clay.clay, fontWeight: '600' },
  nearCard: { width: 130, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: clay.border, padding: 10, marginRight: 10 },
  nearImg: { width: '100%', height: 80, borderRadius: 10, backgroundColor: clay.sand },
  nearName: { fontSize: 12, fontWeight: '700', color: clay.ink, marginTop: 8 },
  nearSub: { fontSize: 9, color: clay.muted, marginTop: 2 },
  nearStreak: { fontSize: 9, color: clay.clay, fontWeight: '600', marginTop: 3 },
  nearConnect: { marginTop: 6, backgroundColor: clay.sand, borderRadius: 7, paddingVertical: 5, alignItems: 'center' },
  nearConnectText: { fontSize: 10, fontWeight: '700', color: clay.clayDark },
  nearFind: { width: 130, backgroundColor: clay.sand, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: clay.claySoft, padding: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10, minHeight: 160 },
  nearFindTxt: { fontSize: 10, color: clay.muted, fontWeight: '600', textAlign: 'center', marginTop: 6, lineHeight: 14 },

  logBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  logSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  logSheetTitle: { fontSize: 17, fontWeight: '800', color: clay.ink },
  logLabel: { fontSize: 11, fontWeight: '600', color: clay.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  logChipsRow: { flexDirection: 'row' },
  logChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: clay.sand, borderWidth: 1, borderColor: clay.border, marginRight: 8 },
  logChipActive: { backgroundColor: clay.clay, borderColor: clay.clay },
  logChipText: { fontSize: 12, fontWeight: '600', color: clay.inkMid, textTransform: 'capitalize' },
  logChipTextActive: { color: '#fff' },
  logDurAdjust: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16, marginTop: 4 },
  logDurBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: clay.sand, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20 },
  logDurValue: { fontSize: 18, fontWeight: '800', color: clay.ink, minWidth: 80, textAlign: 'center' },
  logInput: { backgroundColor: clay.sand, borderRadius: 12, padding: 12, fontSize: 13, color: clay.ink, minHeight: 70, textAlignVertical: 'top', marginBottom: 16 },
  logSaveBtn: { backgroundColor: clay.clay, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  logSaveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  profileBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  profileCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center', width: '100%', maxWidth: 340 },
  profileAvatar: { width: 84, height: 84, borderRadius: 42, marginBottom: 12 },
  profileName: { fontSize: 18, fontWeight: '800', color: clay.ink, marginBottom: 10 },
  profileBadgeRow: { flexDirection: 'row', marginBottom: 12, flexWrap: 'wrap', justifyContent: 'center' },
  profileBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, backgroundColor: '#F5EFE6', marginHorizontal: 4, marginBottom: 4 },
  profileBadgeText: { fontSize: 11, fontWeight: '600', color: clay.sage, marginLeft: 5 },
  profileBio: { fontSize: 12, color: clay.inkMid, textAlign: 'center', lineHeight: 18, marginBottom: 16 },
  profileCloseBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12, backgroundColor: clay.sand },
  profileCloseBtnText: { fontSize: 13, fontWeight: '700', color: clay.inkMid },
});
