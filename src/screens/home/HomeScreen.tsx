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
import { MOCK_SANGHA_POSTS, MOCK_PRACTICING_NOW, MOCK_NEAR_YOU } from '@/data/mockSanghaUsers';

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

  const sortedFeed = feedPosts
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const homeFeed = sortedFeed.slice(0, 1);
  const moreCount = Math.max(0, sortedFeed.length - 1);

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
    const real = (data ?? []) as PracticingUser[];
    setLivePractitioners([...real, ...(MOCK_PRACTICING_NOW as any as PracticingUser[])]);
  };

  const fetchFeed = async () => {
    const { data } = await getFeed(user?.id ?? '');
    const real = (data ?? []) as FeedPost[];
    setFeedPosts([...real, ...(MOCK_SANGHA_POSTS as any as FeedPost[])]);
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

        {/* On the mat right now */}
        <View style={s.nowBanner}>
          <View style={s.nowDotWrap}>
            <View style={s.nowDot} />
          </View>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={s.nowTitle} numberOfLines={1}>
              {livePractitioners.length > 0 ? `${livePractitioners.length} are on the mat right now` : 'No one on the mat now'}
            </Text>
            <Text style={s.nowSub} numberOfLines={1}>Silent presence. Shared energy</Text>
          </View>
          <View style={s.nowAvatars}>
            {livePractitioners.slice(0, 3).map((p, i) => (
              <LinearGradient
                key={p.id}
                colors={i % 2 === 0 ? ['#D4B896', '#8B6B4A'] : ['#A8B59B', '#6E7F5C']}
                style={[s.nowAv, { marginLeft: i === 0 ? 0 : -10 }]}
              />
            ))}
            {livePractitioners.length > 3 && (
              <View style={[s.nowAv, s.nowAvMore, { marginLeft: -10 }]}>
                <Text style={s.nowAvMoreTxt}>+{livePractitioners.length - 3}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={s.joinBtn} onPress={handlePracticeButton} activeOpacity={0.8}>
            <Text style={s.joinBtnTxt}>Join Practice</Text>
            <Ionicons name="chevron-forward" size={14} color={clay.inkMid} />
          </TouchableOpacity>
        </View>

        {/* 2 card row: Streak / Begin Practice */}
        <View style={s.row3}>
          <View style={[s.card3, { flex: 1 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <LinearGradient colors={['#D8DCC9', '#A8B59B']} style={s.leaf}>
                <Ionicons name="leaf" size={13} color="#fff" />
              </LinearGradient>
              <Text style={s.streakLbl}>Current Streak</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 8, gap: 5 }}>
              <Text style={s.streakBig}>{streak}</Text>
              <Text style={s.streakUnit}>DAYS</Text>
            </View>
            <Text style={s.streakMicro}>{formatDuration(weekMinutes) || '0:00'} this week</Text>
          </View>

          <TouchableOpacity style={{ flex: 1.2 }} activeOpacity={0.88} onPress={handlePracticeButton}>
            <LinearGradient colors={[clay.clay, clay.clayDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.beginCard}>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" style={s.beginChev} />
              <View style={s.beginIcn}>
                <Text style={{ fontSize: 20 }}>🧘</Text>
              </View>
              <Text style={s.beginTitle}>{practiceState === 'onMat' ? 'Finish' : 'Begin'} Practice</Text>
              <Text style={s.beginSub}>{practiceState === 'onMat' ? 'Save your session' : 'Step on the mat'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Compact quote */}
        <LinearGradient
          colors={['#D8C3A8', '#A68868', '#7A6855']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.quoteCompact}
        >
          <Text style={s.quoteText} numberOfLines={2}>"{guruWisdom.quote}"</Text>
          <Text style={s.quoteGuruCompact}>— {guruWisdom.guru}</Text>
        </LinearGradient>

        {/* Feed */}
        {homeFeed.length === 0 ? (
          <View style={s.emptyFeed}>
            <Ionicons name="leaf-outline" size={32} color={clay.mutedLight} />
            <Text style={s.emptyText}>No practices shared yet.</Text>
            <Text style={s.emptySub}>Be the first to log your practice.</Text>
          </View>
        ) : (
          homeFeed.map((post: any) => {
            const seriesKey = (post.profiles as any)?.series ?? 'primary';
            const chip = SERIES_CHIPS[seriesKey] ?? SERIES_CHIPS.primary;
            const seriesName = SERIES_LABELS[seriesKey] ?? 'Practice';
            const hasStats = typeof post.duration_min === 'number';
            const complete = post.status === 'complete';
            const pct = post.poses_total ? Math.round(((post.poses_done ?? 0) / post.poses_total) * 100) : 0;
            const durTxt = post.duration_min
              ? post.duration_min >= 60
                ? `${Math.floor(post.duration_min / 60)}h ${post.duration_min % 60}m`
                : `${post.duration_min}m`
              : '';
            const likers: { name: string; avatar_url: string }[] = post.likers ?? [];
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
                      {post.shala ? `${post.shala} · ` : ''}{post.location ? `${post.location} · ` : ''}{getTimeAgo(post.created_at)}
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

                {hasStats && (
                  <View style={s.statsGrid}>
                    <View style={s.statCell}>
                      <Ionicons name="time-outline" size={16} color={clay.muted} />
                      <Text style={s.statNum}>{durTxt}</Text>
                      <Text style={s.statLbl}>Duration</Text>
                    </View>
                    <View style={s.statDivider} />
                    <View style={s.statCell}>
                      <Ionicons name="flower-outline" size={16} color={clay.muted} />
                      <Text style={s.statNum}>{post.poses_done} / {post.poses_total}</Text>
                      <Text style={s.statLbl}>Poses Completed</Text>
                    </View>
                    <View style={s.statDivider} />
                    <View style={s.statCell}>
                      <Ionicons name="pulse-outline" size={16} color={clay.muted} />
                      <Text style={s.statNum}>{post.breath_per_pose?.toFixed(1)}</Text>
                      <Text style={s.statLbl}>Avg Breath / Pose</Text>
                    </View>
                    <View style={s.statDivider} />
                    <View style={[s.statCell, { flex: 1.1 }]}>
                      {complete ? (
                        <>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="checkmark-circle" size={16} color={clay.success} />
                            <Text style={[s.statNum, { color: clay.success }]}>Complete</Text>
                          </View>
                          <Text style={s.statLbl}>{post.progress_label ?? 'Great Practice'}</Text>
                        </>
                      ) : (
                        <>
                          <Text style={[s.statNum, { color: clay.clayDark }]}>{pct}%</Text>
                          <View style={s.progTrack}>
                            <View style={[s.progFill, { width: `${pct}%` }]} />
                          </View>
                          <Text style={s.statLbl}>{post.progress_label ?? 'Keep going'}</Text>
                        </>
                      )}
                    </View>
                  </View>
                )}

                {post.image_url ? (
                  <Image source={{ uri: post.image_url }} style={s.fcImage} />
                ) : null}

                {post.caption ? (
                  <Text style={s.fcNote}>"{post.caption}"</Text>
                ) : null}

                <View style={s.fcActions}>
                  <TouchableOpacity style={s.fcAct}>
                    <Ionicons name={(post.likes_count ?? 0) > 0 ? 'flower' : 'flower-outline'} size={18} color={clay.heart} />
                    <Text style={[s.fcActText, { color: clay.heart, marginLeft: 5, fontWeight: '700' }]}>
                      {post.likes_count ?? 0}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.fcAct}>
                    <Ionicons name="chatbubble-outline" size={17} color={clay.muted} />
                    <Text style={[s.fcActText, { marginLeft: 5 }]}>{post.comments_count ?? 0}</Text>
                  </TouchableOpacity>

                  {likers.length > 0 && (
                    <View style={s.likersRow}>
                      <View style={{ flexDirection: 'row' }}>
                        {likers.slice(0, 3).map((lk, i) => (
                          <Image
                            key={i}
                            source={{ uri: lk.avatar_url }}
                            style={[s.likerAv, { marginLeft: i === 0 ? 0 : -8, zIndex: 3 - i }]}
                          />
                        ))}
                      </View>
                      <Text style={s.likersTxt} numberOfLines={1}>
                        You, {likers[0].name.split(' ')[0]}
                        {(post.likes_count ?? 0) > 2 ? ` +${(post.likes_count ?? 0) - 2}` : ''}
                      </Text>
                    </View>
                  )}

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

        {moreCount > 0 && (
          <TouchableOpacity
            style={s.seeMore}
            activeOpacity={0.7}
            onPress={() => router.push('/community' as any)}
          >
            <Text style={s.seeMoreTxt}>See {moreCount} more posts</Text>
            <Ionicons name="chevron-forward" size={15} color={clay.clay} />
          </TouchableOpacity>
        )}

        {/* Practitioners Near You */}
        <View style={s.nearSection}>
          <View style={s.nearHead}>
            <Text style={s.nearTitle}>Practitioners Near You</Text>
            <TouchableOpacity onPress={() => router.push('/community' as any)}>
              <Text style={s.nearView}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
            {MOCK_NEAR_YOU.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={s.nearCard}
                activeOpacity={0.85}
                onPress={() => openProfile(m.name)}
              >
                <Image source={{ uri: m.avatar_url }} style={s.nearImg} />
                <Text style={s.nearName} numberOfLines={1}>{m.name}</Text>
                <Text style={s.nearSub} numberOfLines={1}>
                  {(SERIES_LABELS[m.series] ?? m.series).replace(' Series', '')} · {m.distance_km} km
                </Text>
                <View style={s.nearStreakRow}>
                  <Text style={s.nearFlame}>🔥</Text>
                  <Text style={s.nearStreak}>{m.streak} day streak</Text>
                </View>
                <View style={s.nearConnect}>
                  <Text style={s.nearConnectText}>Connect</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.nearFind} activeOpacity={0.8} onPress={() => router.push('/community' as any)}>
              <Ionicons name="people-outline" size={22} color={clay.muted} />
              <Text style={s.nearFindTxt}>Find more{'\n'}practitioners{'\n'}in your area</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

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

  // On the mat banner
  nowBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 12,
    borderRadius: 14, borderWidth: 1, borderColor: clay.border,
    paddingVertical: 12, paddingHorizontal: 14,
  },
  nowDotWrap: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#E8F0DE', alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  nowDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#6E7F5C' },
  nowTitle: { fontSize: 13, fontWeight: '700', color: clay.ink },
  nowSub: { fontSize: 10, color: clay.muted, marginTop: 2 },
  nowAvatars: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  nowAv: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: '#fff' },
  nowAvMore: { backgroundColor: clay.sandDark, alignItems: 'center', justifyContent: 'center' },
  nowAvMoreTxt: { fontSize: 9, fontWeight: '700', color: clay.inkMid },
  joinBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: clay.sand, borderRadius: 20,
    paddingVertical: 7, paddingHorizontal: 11,
  },
  joinBtnTxt: { fontSize: 11, fontWeight: '700', color: clay.inkMid },

  // 3-card row
  row3: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 14, gap: 10 },
  card3: {
    backgroundColor: '#fff', borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: clay.border, minHeight: 108,
  },
  leaf: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  streakLbl: { fontSize: 9, fontWeight: '700', color: clay.muted, letterSpacing: 0.5, textTransform: 'uppercase' },
  streakBig: { fontSize: 30, fontWeight: '800', color: clay.ink, lineHeight: 32 },
  streakUnit: { fontSize: 9, fontWeight: '700', color: clay.muted, letterSpacing: 1 },
  streakMicro: { fontSize: 9, color: clay.muted, marginTop: 6, lineHeight: 12 },
  wTitle: { fontSize: 10, fontWeight: '700', color: clay.muted, letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'center' },
  wIcn: { width: 18, height: 18, borderRadius: 9, backgroundColor: clay.sand, alignItems: 'center', justifyContent: 'center' },
  wBig: { fontSize: 18, fontWeight: '800', color: clay.ink },
  wMini: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  wMiniTxt: { fontSize: 7.5, color: clay.muted, fontWeight: '600' },
  beginCard: {
    flex: 1, borderRadius: 16, padding: 12, minHeight: 108,
    justifyContent: 'flex-end',
    shadowColor: clay.clay, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 3,
  },
  beginChev: { position: 'absolute', top: 10, right: 10 },
  beginIcn: { marginBottom: 4 },
  beginTitle: { fontSize: 13, fontWeight: '800', color: '#fff' },
  beginSub: { fontSize: 10, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

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
  quoteCompact: {
    marginHorizontal: 20, marginBottom: 14, borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 18,
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
  },
  quoteText: { fontStyle: 'italic', fontSize: 12, color: '#fff', lineHeight: 18, flex: 1, textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  quoteDivider: { width: 30, height: 1, backgroundColor: 'rgba(255,255,255,0.6)', marginTop: 8, marginBottom: 6 },
  quoteGuru: { fontSize: 10, color: 'rgba(255,255,255,0.85)', fontStyle: 'italic' },
  quoteGuruCompact: { fontSize: 9, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', marginLeft: 10, alignSelf: 'flex-end' },

  seeMore: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, marginBottom: 14, paddingVertical: 12,
    borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: clay.border,
  },
  seeMoreTxt: { fontSize: 13, fontWeight: '700', color: clay.clay, marginRight: 4 },

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

  statsGrid: {
    flexDirection: 'row', alignItems: 'stretch',
    marginTop: 12, paddingVertical: 10, paddingHorizontal: 4,
    backgroundColor: clay.sand, borderRadius: 12,
  },
  statCell: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  statDivider: { width: 1, backgroundColor: clay.border, marginVertical: 4 },
  statNum: { fontSize: 13, fontWeight: '800', color: clay.ink, marginTop: 3 },
  statLbl: { fontSize: 8.5, color: clay.muted, marginTop: 2, textAlign: 'center', fontWeight: '600' },
  progTrack: { width: '80%', height: 4, borderRadius: 2, backgroundColor: clay.border, marginTop: 4, overflow: 'hidden' },
  progFill: { height: '100%', backgroundColor: clay.clay, borderRadius: 2 },

  likersRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  likerAv: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#fff' },
  likersTxt: { fontSize: 10, color: clay.muted, marginLeft: 6, maxWidth: 120 },

  fcActions: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: clay.border },
  fcAct: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  fcActText: { fontSize: 12, color: clay.muted, fontWeight: '600' },

  nearSection: { paddingLeft: 20, marginBottom: 14 },
  nearHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingRight: 20 },
  nearTitle: { fontSize: 15, fontWeight: '800', color: clay.ink },
  nearView: { fontSize: 12, color: clay.clay, fontWeight: '600' },
  nearCard: { width: 140, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: clay.border, padding: 10, marginRight: 10 },
  nearImg: { width: '100%', height: 110, borderRadius: 12, backgroundColor: clay.sand },
  nearName: { fontSize: 13, fontWeight: '800', color: clay.ink, marginTop: 8 },
  nearSub: { fontSize: 10, color: clay.muted, marginTop: 2 },
  nearStreakRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  nearFlame: { fontSize: 10 },
  nearStreak: { fontSize: 10, color: clay.clayDark, fontWeight: '700', marginLeft: 3 },
  nearConnect: { marginTop: 8, backgroundColor: clay.sand, borderRadius: 8, paddingVertical: 6, alignItems: 'center', borderWidth: 1, borderColor: clay.border },
  nearConnectText: { fontSize: 11, fontWeight: '700', color: clay.clayDark },
  nearFind: { width: 130, backgroundColor: clay.sand, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: clay.claySoft, padding: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10, minHeight: 210 },
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
