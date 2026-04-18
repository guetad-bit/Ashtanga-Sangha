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
import { daysUntilNextMoonDay, isMoonDay, getMoonDayType, nextMoonDay } from '@/utils/moonDay';
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
      return;
    }
    // fallback: check live practitioners (mock users)
    const lp = livePractitioners.find((p) => p.name === name);
    if (lp) {
      const seriesLabel = SERIES_LABELS[lp.series] ?? lp.series;
      setProfileCard({ name: lp.name, avatarUrl: lp.avatar_url ?? '', series: seriesLabel, streak: (lp as any).streak ?? 0, bio: (lp as any).bio ?? '' });
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
  const todayIsMoon = isMoonDay(now);
  const todayMoonType = getMoonDayType(now);

  // Build upcoming moon days list (next 6)
  const upcomingMoons: { date: Date; type: 'full' | 'new' | null; label: string; daysAway: number }[] = [];
  {
    let cursor = new Date(now);
    for (let i = 0; i < 6; i++) {
      const nd = nextMoonDay(cursor);
      if (!nd) break;
      const da = Math.ceil((nd.getTime() - now.getTime()) / 86400000);
      upcomingMoons.push({
        date: nd,
        type: getMoonDayType(nd),
        label: nd.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        daysAway: da,
      });
      cursor = new Date(nd);
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  // My Practice — recent logs sorted newest first
  const recentLogs = [...practiceLogs]
    .sort((a, b) => new Date(b.loggedAt ?? '').getTime() - new Date(a.loggedAt ?? '').getTime())
    .slice(0, 10);

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
            <Text style={s.brandWord}>sangha</Text>
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

        {/* ═══════════════ TAB: Following ═══════════════ */}
        {activeTab === 'following' && (
          <>
            {/* On the mat right now */}
            {livePractitioners.length > 0 && (
              <View style={s.nowBar}>
                <View style={s.nowDotWrap}><View style={s.nowDot} /></View>
                <Text style={s.nowLabel}>{livePractitioners.length} on the mat</Text>
              </View>
            )}
            {livePractitioners.length > 0 && (
              <View style={s.nowFaces}>
                {livePractitioners.slice(0, 6).map((p, i) => (
                  <TouchableOpacity key={p.id} activeOpacity={0.8} onPress={() => openProfile(p.name)} style={[s.nowFaceWrap, i > 0 && { marginLeft: -10 }]}>
                    {p.avatar_url ? (
                      <Image source={{ uri: p.avatar_url }} style={s.nowFace} />
                    ) : (
                      <LinearGradient colors={['#D4B896', '#8B6B4A']} style={s.nowFace} />
                    )}
                  </TouchableOpacity>
                ))}
                {livePractitioners.length > 6 && (
                  <View style={[s.nowFaceWrap, s.nowFaceMore, { marginLeft: -10 }]}>
                    <Text style={s.nowFaceMoreTxt}>+{livePractitioners.length - 6}</Text>
                  </View>
                )}
              </View>
            )}

            {/* 2 card row */}
            <View style={s.row3}>
              <TouchableOpacity style={{ flex: 1.2 }} activeOpacity={0.88} onPress={handlePracticeButton}>
                <LinearGradient colors={[clay.clay, clay.clayDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.beginCard}>
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" style={s.beginChev} />
                  <View style={s.beginIcnRow}>
                    <View style={s.beginCircle}>
                      <Ionicons name={practiceState === 'onMat' ? 'stop' : 'play'} size={16} color={clay.clay} style={practiceState !== 'onMat' ? { marginLeft: 2 } : undefined} />
                    </View>
                    <View style={s.beginPulseRing} />
                  </View>
                  <Text style={s.beginTitle}>{practiceState === 'onMat' ? 'Finish' : 'Begin'} Practice</Text>
                  <Text style={s.beginSub}>{practiceState === 'onMat' ? 'Save your session' : 'Step on the mat'}</Text>
                </LinearGradient>
              </TouchableOpacity>
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
            </View>

            {/* Compact quote */}
            <View style={s.quoteCompact}>
              <Text style={s.quoteText}>"{guruWisdom.quote}"</Text>
              <Text style={s.quoteGuruCompact}>— {guruWisdom.guru}</Text>
            </View>

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
                const durTxt = post.duration_min ? (post.duration_min >= 60 ? `${Math.floor(post.duration_min / 60)}h ${post.duration_min % 60}m` : `${post.duration_min}m`) : '';
                const likers: { name: string; avatar_url: string }[] = post.likers ?? [];
                return (
                  <View key={post.id} style={s.feedCard}>
                    <View style={s.fcHead}>
                      <TouchableOpacity activeOpacity={0.7} onPress={() => openProfile(post.profiles?.name ?? '')}>
                        {post.profiles?.avatar_url ? <Image source={{ uri: post.profiles.avatar_url }} style={s.fcAvatar} /> : <LinearGradient colors={['#C9A384', '#7A5540']} style={s.fcAvatar} />}
                        <View style={[s.fcDot, { backgroundColor: clay.success }]} />
                      </TouchableOpacity>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={s.fcName}>{post.profiles?.name ?? 'Practitioner'}</Text>
                        <Text style={s.fcSub} numberOfLines={1}>{post.shala ? `${post.shala} · ` : ''}{post.location ? `${post.location} · ` : ''}{getTimeAgo(post.created_at)}</Text>
                      </View>
                      <TouchableOpacity><Ionicons name="ellipsis-horizontal" size={18} color={clay.muted} /></TouchableOpacity>
                    </View>
                    <View style={s.fcSeriesRow}>
                      <Text style={s.fcSeries}>{seriesName}</Text>
                      <View style={[s.fcChip, { backgroundColor: chip.bg }]}><Text style={[s.fcChipText, { color: chip.fg }]}>{chip.label}</Text></View>
                    </View>
                    {hasStats && (
                      <View style={s.statsGrid}>
                        <View style={s.statCell}><Ionicons name="time-outline" size={16} color={clay.muted} /><Text style={s.statNum}>{durTxt}</Text><Text style={s.statLbl}>Duration</Text></View>
                        <View style={s.statDivider} />
                        <View style={s.statCell}><Ionicons name="flower-outline" size={16} color={clay.muted} /><Text style={s.statNum}>{post.poses_done} / {post.poses_total}</Text><Text style={s.statLbl}>Poses</Text></View>
                        <View style={s.statDivider} />
                        <View style={s.statCell}><Ionicons name="pulse-outline" size={16} color={clay.muted} /><Text style={s.statNum}>{post.breath_per_pose?.toFixed(1)}</Text><Text style={s.statLbl}>Breath/Pose</Text></View>
                        <View style={s.statDivider} />
                        <View style={[s.statCell, { flex: 1.1 }]}>
                          {complete ? (<><View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Ionicons name="checkmark-circle" size={16} color={clay.success} /><Text style={[s.statNum, { color: clay.success }]}>Complete</Text></View><Text style={s.statLbl}>{post.progress_label ?? 'Great Practice'}</Text></>) : (<><Text style={[s.statNum, { color: clay.clayDark }]}>{pct}%</Text><View style={s.progTrack}><View style={[s.progFill, { width: `${pct}%` }]} /></View><Text style={s.statLbl}>{post.progress_label ?? 'Keep going'}</Text></>)}
                        </View>
                      </View>
                    )}
                    {post.image_url ? <Image source={{ uri: post.image_url }} style={s.fcImage} /> : null}
                    {post.caption ? <Text style={s.fcNote}>"{post.caption}"</Text> : null}
                    <View style={s.fcActions}>
                      <TouchableOpacity style={s.fcAct}><Ionicons name={(post.likes_count ?? 0) > 0 ? 'flower' : 'flower-outline'} size={18} color={clay.heart} /><Text style={[s.fcActText, { color: clay.heart, marginLeft: 5, fontWeight: '700' }]}>{post.likes_count ?? 0}</Text></TouchableOpacity>
                      <TouchableOpacity style={s.fcAct}><Ionicons name="chatbubble-outline" size={17} color={clay.muted} /><Text style={[s.fcActText, { marginLeft: 5 }]}>{post.comments_count ?? 0}</Text></TouchableOpacity>
                      {likers.length > 0 && (<View style={s.likersRow}><View style={{ flexDirection: 'row' }}>{likers.slice(0, 3).map((lk, i) => (<Image key={i} source={{ uri: lk.avatar_url }} style={[s.likerAv, { marginLeft: i === 0 ? 0 : -8, zIndex: 3 - i }]} />))}</View><Text style={s.likersTxt} numberOfLines={1}>You, {likers[0].name.split(' ')[0]}{(post.likes_count ?? 0) > 2 ? ` +${(post.likes_count ?? 0) - 2}` : ''}</Text></View>)}
                      <View style={{ flex: 1 }} />
                      <TouchableOpacity><Ionicons name="share-outline" size={18} color={clay.muted} style={{ marginRight: 14 }} /></TouchableOpacity>
                      <TouchableOpacity><Ionicons name="bookmark-outline" size={17} color={clay.muted} /></TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}

            {moreCount > 0 && (
              <TouchableOpacity style={s.seeMore} activeOpacity={0.7} onPress={() => router.push('/community' as any)}>
                <Text style={s.seeMoreTxt}>See {moreCount} more posts</Text>
                <Ionicons name="chevron-forward" size={15} color={clay.clay} />
              </TouchableOpacity>
            )}

            {/* Practitioners Near You */}
            <View style={s.nearSection}>
              <View style={s.nearHead}>
                <Text style={s.nearTitle}>Practitioners Near You</Text>
                <TouchableOpacity onPress={() => router.push('/community' as any)}><Text style={s.nearView}>View All</Text></TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                {MOCK_NEAR_YOU.map((m) => (
                  <TouchableOpacity key={m.id} style={s.nearCard} activeOpacity={0.85} onPress={() => openProfile(m.name)}>
                    <Image source={{ uri: m.avatar_url }} style={s.nearImg} />
                    <Text style={s.nearName} numberOfLines={1}>{m.name}</Text>
                    <Text style={s.nearSub} numberOfLines={1}>{(SERIES_LABELS[m.series] ?? m.series).replace(' Series', '')} · {m.distance_km} km</Text>
                    <View style={s.nearStreakRow}><Text style={s.nearFlame}>🔥</Text><Text style={s.nearStreak}>{m.streak} day streak</Text></View>
                    <View style={s.nearConnect}><Text style={s.nearConnectText}>Connect</Text></View>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={s.nearFind} activeOpacity={0.8} onPress={() => router.push('/community' as any)}>
                  <Ionicons name="people-outline" size={22} color={clay.muted} />
                  <Text style={s.nearFindTxt}>Find more{'\n'}practitioners{'\n'}in your area</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </>
        )}

        {/* ═══════════════ TAB: Moon Days ═══════════════ */}
        {activeTab === 'moon' && (
          <>
            {/* Today status */}
            <View style={s.moonHero}>
              <LinearGradient colors={['#E8DFD0', '#C4A882']} style={s.moonHeroIcon}>
                <Text style={{ fontSize: 32 }}>{todayIsMoon ? '🌑' : '🌙'}</Text>
              </LinearGradient>
              <Text style={s.moonHeroTitle}>
                {todayIsMoon ? `${todayMoonType === 'full' ? 'Full' : 'New'} Moon — Rest Day` : `Next Moon Day in ${daysToMoon} day${daysToMoon !== 1 ? 's' : ''}`}
              </Text>
              <Text style={s.moonHeroSub}>
                {todayIsMoon
                  ? 'Ashtanga practitioners honor the rhythm of nature. Rest, reflect, allow.'
                  : `${moonLabel} · Saturdays are also rest days. Honor the rhythm.`}
              </Text>
            </View>

            {/* Weekly rhythm dots */}
            <View style={s.moonRhythm}>
              <Text style={s.moonRhythmTitle}>This Week</Text>
              <View style={s.moonDots}>
                {rhythm.map((d, i) => {
                  const dayLabel = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][i];
                  const isMoon = d.status === 'rest';
                  const isSat = i === 6;
                  return (
                    <View key={i} style={s.moonDotCol}>
                      <View style={[s.moonDotCircle, d.status === 'done' ? s.moonDotDone : isMoon || isSat ? s.moonDotRest : s.moonDotEmpty]}>
                        {d.status === 'done' && <Ionicons name="checkmark" size={12} color="#fff" />}
                        {(isMoon && d.status !== 'done') && <Text style={{ fontSize: 8 }}>🌙</Text>}
                        {(isSat && d.status !== 'done' && !isMoon) && <Text style={{ fontSize: 8 }}>🙏</Text>}
                      </View>
                      <Text style={s.moonDotLabel}>{dayLabel}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Upcoming moon days */}
            <View style={s.moonList}>
              <Text style={s.moonListTitle}>Upcoming Moon Days</Text>
              {upcomingMoons.map((m, i) => (
                <View key={i} style={s.moonListItem}>
                  <View style={s.moonListIcon}>
                    <Text style={{ fontSize: 16 }}>{m.type === 'full' ? '🌕' : '🌑'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.moonListDate}>{m.label}</Text>
                    <Text style={s.moonListType}>{m.type === 'full' ? 'Full Moon' : 'New Moon'} · Rest Day</Text>
                  </View>
                  <Text style={s.moonListDays}>
                    {m.daysAway === 0 ? 'Today' : m.daysAway === 1 ? 'Tomorrow' : `${m.daysAway} days`}
                  </Text>
                </View>
              ))}
            </View>

            {/* Ashtanga rest day info */}
            <View style={s.moonInfo}>
              <Ionicons name="information-circle-outline" size={18} color={clay.muted} />
              <Text style={s.moonInfoTxt}>
                In the Ashtanga tradition, practitioners rest on Full Moon, New Moon, and Saturdays. Your streak is never broken by rest days.
              </Text>
            </View>
          </>
        )}

        {/* ═══════════════ TAB: My Practice ═══════════════ */}
        {activeTab === 'mine' && (
          <>
            {/* Stats overview */}
            <View style={s.mpStats}>
              <View style={s.mpStatCard}>
                <LinearGradient colors={['#D8DCC9', '#A8B59B']} style={s.mpStatIcon}>
                  <Ionicons name="leaf" size={16} color="#fff" />
                </LinearGradient>
                <Text style={s.mpStatNum}>{streak}</Text>
                <Text style={s.mpStatLbl}>Day Streak</Text>
              </View>
              <View style={s.mpStatCard}>
                <View style={[s.mpStatIcon, { backgroundColor: clay.sand }]}>
                  <Ionicons name="time-outline" size={16} color={clay.clayDark} />
                </View>
                <Text style={s.mpStatNum}>{formatDuration(weekMinutes) || '0:00'}</Text>
                <Text style={s.mpStatLbl}>This Week</Text>
              </View>
              <View style={s.mpStatCard}>
                <View style={[s.mpStatIcon, { backgroundColor: '#FFF5EC' }]}>
                  <Ionicons name="calendar-outline" size={16} color={clay.clay} />
                </View>
                <Text style={s.mpStatNum}>{practicesThisWeek}</Text>
                <Text style={s.mpStatLbl}>Sessions</Text>
              </View>
            </View>

            {/* Weekly rhythm */}
            <View style={s.mpRhythm}>
              <Text style={s.mpRhythmTitle}>Weekly Rhythm</Text>
              <View style={s.mpDots}>
                {rhythm.map((d, i) => {
                  const dayLabel = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][i];
                  return (
                    <View key={i} style={s.mpDotCol}>
                      <View style={[s.mpDot, d.status === 'done' ? s.mpDotDone : d.status === 'rest' ? s.mpDotRest : s.mpDotEmpty]}>
                        {d.status === 'done' && <Ionicons name="checkmark" size={11} color="#fff" />}
                      </View>
                      <Text style={[s.mpDotLabel, d.status === 'done' && { color: clay.ink, fontWeight: '700' }]}>{dayLabel}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Begin Practice CTA */}
            <TouchableOpacity activeOpacity={0.88} onPress={handlePracticeButton} style={{ marginHorizontal: 20, marginBottom: 14 }}>
              <LinearGradient colors={[clay.clay, clay.clayDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>{practiceState === 'onMat' ? 'Finish Practice' : 'Begin Practice'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Recent practice logs */}
            <View style={s.mpLogs}>
              <Text style={s.mpLogsTitle}>Recent Practice</Text>
              {recentLogs.length === 0 ? (
                <View style={s.mpLogsEmpty}>
                  <Ionicons name="leaf-outline" size={28} color={clay.mutedLight} />
                  <Text style={s.mpLogsEmptyTxt}>No practice logs yet. Step on the mat!</Text>
                </View>
              ) : (
                recentLogs.map((log) => {
                  const seriesLabel = SERIES_LABELS[log.series ?? ''] ?? log.series ?? 'Practice';
                  const logDate = new Date(log.loggedAt ?? '');
                  const dayStr = logDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                  return (
                    <View key={log.id} style={s.mpLogRow}>
                      <View style={s.mpLogDot} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.mpLogSeries}>{seriesLabel}</Text>
                        <Text style={s.mpLogMeta}>{dayStr} · {log.durationMin ?? 0}m{log.feeling ? ` · ${log.feeling}` : ''}</Text>
                        {log.notes ? <Text style={s.mpLogNote} numberOfLines={2}>"{log.notes}"</Text> : null}
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* Practice Mode link */}
            <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/practice-mode' as any)} style={s.mpPracticeMode}>
              <Ionicons name="leaf-outline" size={20} color={clay.clayDark} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: clay.ink }}>Practice Mode</Text>
                <Text style={{ fontSize: 11, color: clay.muted, marginTop: 1 }}>Distraction-free guided sequence</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={clay.muted} />
            </TouchableOpacity>
          </>
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
  brandWord: { fontFamily: 'Georgia', fontSize: 24, fontWeight: '300', letterSpacing: 7, color: clay.clay, textTransform: 'lowercase' as const, paddingLeft: 7 },
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

  // On the mat bar
  nowBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 6, gap: 8 } as any,
  nowDotWrap: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#E8F0DE', alignItems: 'center', justifyContent: 'center',
  },
  nowDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6E7F5C' },
  nowFaces: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 14, flexWrap: 'nowrap' as const },
  nowFaceWrap: { width: 44, height: 44, borderRadius: 22, borderWidth: 2.5, borderColor: clay.bg },
  nowFace: { width: 39, height: 39, borderRadius: 20 },
  nowFaceMore: { backgroundColor: clay.sand, alignItems: 'center', justifyContent: 'center' },
  nowFaceMoreTxt: { fontSize: 11, fontWeight: '700', color: clay.inkMid },
  nowLabel: { fontSize: 13, fontWeight: '600', color: clay.muted },

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
  beginIcnRow: { marginBottom: 8, alignItems: 'center', justifyContent: 'center', width: 40, height: 40 },
  beginCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  beginPulseRing: { position: 'absolute', width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)' },
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
    marginHorizontal: 20, marginBottom: 14, borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 16,
    backgroundColor: '#fff', borderWidth: 1, borderColor: clay.border,
  },
  quoteText: { fontStyle: 'italic', fontSize: 13, color: clay.sub, lineHeight: 20, fontWeight: '700' },
  quoteDivider: { width: 30, height: 1, backgroundColor: 'rgba(196,168,130,0.3)', marginTop: 10, marginBottom: 6 },
  quoteGuru: { fontSize: 11, color: clay.muted, fontStyle: 'italic' },
  quoteGuruCompact: { fontSize: 11, color: clay.muted, fontStyle: 'italic', marginTop: 8 },

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

  // ═══ Moon Days tab ═══
  moonHero: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 24, marginHorizontal: 20, marginBottom: 14, backgroundColor: '#fff', borderRadius: 18, borderWidth: 1, borderColor: clay.border },
  moonHeroIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  moonHeroTitle: { fontSize: 17, fontWeight: '800', color: clay.ink, textAlign: 'center' },
  moonHeroSub: { fontSize: 12, color: clay.muted, textAlign: 'center', marginTop: 6, lineHeight: 18, paddingHorizontal: 10 },

  moonRhythm: { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: clay.border, padding: 16 },
  moonRhythmTitle: { fontSize: 11, fontWeight: '700', color: clay.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  moonDots: { flexDirection: 'row', justifyContent: 'space-between' },
  moonDotCol: { alignItems: 'center' },
  moonDotCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  moonDotDone: { backgroundColor: clay.success },
  moonDotRest: { backgroundColor: clay.sand, borderWidth: 1, borderColor: clay.border },
  moonDotEmpty: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: clay.border },
  moonDotLabel: { fontSize: 9, color: clay.muted, fontWeight: '600' },

  moonList: { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: clay.border, padding: 16 },
  moonListTitle: { fontSize: 11, fontWeight: '700', color: clay.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  moonListItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: clay.border },
  moonListIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: clay.sand, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  moonListDate: { fontSize: 14, fontWeight: '700', color: clay.ink },
  moonListType: { fontSize: 11, color: clay.muted, marginTop: 2 },
  moonListDays: { fontSize: 12, fontWeight: '700', color: clay.clay },

  moonInfo: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 14, padding: 14, backgroundColor: clay.sand, borderRadius: 12, gap: 10, alignItems: 'flex-start' },
  moonInfoTxt: { flex: 1, fontSize: 11, color: clay.muted, lineHeight: 16 },

  // ═══ My Practice tab ═══
  mpStats: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 14, gap: 10 },
  mpStatCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: clay.border, padding: 14, alignItems: 'center' },
  mpStatIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  mpStatNum: { fontSize: 20, fontWeight: '800', color: clay.ink },
  mpStatLbl: { fontSize: 9, color: clay.muted, fontWeight: '600', marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.3 },

  mpRhythm: { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: clay.border, padding: 16 },
  mpRhythmTitle: { fontSize: 11, fontWeight: '700', color: clay.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  mpDots: { flexDirection: 'row', justifyContent: 'space-between' },
  mpDotCol: { alignItems: 'center' },
  mpDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  mpDotDone: { backgroundColor: clay.success },
  mpDotRest: { backgroundColor: clay.sand, borderWidth: 1, borderColor: clay.border },
  mpDotEmpty: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: clay.border },
  mpDotLabel: { fontSize: 9, color: clay.muted, fontWeight: '600' },

  mpLogs: { marginHorizontal: 20, marginBottom: 14, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: clay.border, padding: 16 },
  mpLogsTitle: { fontSize: 11, fontWeight: '700', color: clay.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  mpLogsEmpty: { alignItems: 'center', paddingVertical: 20 },
  mpLogsEmptyTxt: { fontSize: 12, color: clay.muted, marginTop: 8 },
  mpLogRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: clay.border },
  mpLogDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: clay.clay, marginTop: 5, marginRight: 12 },
  mpLogSeries: { fontSize: 14, fontWeight: '700', color: clay.ink },
  mpLogMeta: { fontSize: 11, color: clay.muted, marginTop: 2 },
  mpLogNote: { fontSize: 11, fontStyle: 'italic', color: clay.inkMid, marginTop: 4, lineHeight: 16 },

  mpPracticeMode: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 14, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: clay.border, backgroundColor: '#fff' },
});
