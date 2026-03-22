// src/screens/home/HomeScreen.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Pressable, Modal,
  StyleSheet, Image, RefreshControl, Dimensions, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';
import { useAppStore } from '@/store/useAppStore';
import { getWeeklyRhythm, calculateStreak } from '@/utils/practiceStreak';
import { isMoonDay, daysUntilNextMoonDay } from '@/utils/moonDay';
import { getPracticeLogs, setPracticingNow, logPractice, getPracticingNow, getFeed, signOut } from '@/lib/supabase';
import AppLogo from '@/components/AppLogo';
import { Ionicons } from '@expo/vector-icons';

/* ââ Interfaces ââ */
interface PracticingUser {
  id: string; name: string; avatar_url: string | null;
  series: string; level: string; streak: number; practicing_since: string;
}

interface FeedPost {
  id: string; user_id: string; caption: string; image_url: string | null;
  location: string | null; likes_count: number; comments_count?: number;
  created_at: string;
  profiles: { name: string; avatar_url: string | null } | null;
}

/* ââ Warm palette ââ */
const warm = {
  bg: '#FAF8F5', cardBg: '#FFFFFF', headerBg: '#FFFFFF',
  ink: '#3D3229', inkMid: '#5C4F42', muted: '#8B7D6E', mutedLight: '#B5A899',
  accent: '#C47B3F', accentLight: '#F0E0CC',
  sage: '#7A8B5E', sageBg: '#E8EDDF',
  gold: '#B8944A', goldBg: '#F5EDD8',
  amber: '#C4874D', amberBg: '#F8E8D4', terra: '#A0704C',
  divider: '#EDE5D8', orange: '#E8834A', orangeLight: '#FFF0E6',
  white: '#FFFFFF', ring: '#D4A76A', heartRed: '#E05555',
  blue: '#5B8DB8', blueBg: '#E8F0F8',
};

const SCREEN_WIDTH = Dimensions.get('window').width;

/* ââ Data ââ */
const GURU_WISDOM = [
  { quote: 'Yoga is 99% practice, 1% theory.', guru: 'Sri K. Pattabhi Jois' },
  { quote: 'Do your practice and all is coming.', guru: 'Sri K. Pattabhi Jois' },
  { quote: 'The body is your temple. Keep it pure and clean for the soul to reside in.', guru: 'B.K.S. Iyengar' },
  { quote: 'Breath is the king of mind.', guru: 'B.K.S. Iyengar' },
  { quote: 'Anyone can practice. Young man can practice, old man can practice.', guru: 'Sri K. Pattabhi Jois' },
  { quote: 'When the breath wanders the mind also is unsteady.', guru: 'Hatha Yoga Pradipika' },
  { quote: 'The rhythm of the body, the melody of the mind, and the harmony of the soul create the symphony of life.', guru: 'B.K.S. Iyengar' },
];

const FAKE_AVATARS = [
  'https://i.pravatar.cc/80?img=11',
  'https://i.pravatar.cc/80?img=12',
  'https://i.pravatar.cc/80?img=14',
  'https://i.pravatar.cc/80?img=32',
  'https://i.pravatar.cc/80?img=44',
  'https://i.pravatar.cc/80?img=52',
  'https://i.pravatar.cc/80?img=59',
  'https://i.pravatar.cc/80?img=68',
];

const PRACTICING_NOW_MOCK: { name: string; series: string; avatar: string; min: number }[] = [
  { name: 'Maya', series: 'Primary Series', avatar: 'https://i.pravatar.cc/80?img=5', min: 42 },
  { name: 'Arjun', series: 'Half Primary', avatar: 'https://i.pravatar.cc/80?img=33', min: 18 },
  { name: 'Liat', series: 'Intermediate', avatar: 'https://i.pravatar.cc/80?img=23', min: 55 },
];

const FEED_MOCK: { name: string; avatar: string; series: string; time: string; hearts: number }[] = [
  { name: 'David', avatar: 'https://i.pravatar.cc/80?img=11', series: 'Primary Series', time: '12 min ago', hearts: 4 },
  { name: 'Sarah', avatar: 'https://i.pravatar.cc/80?img=9', series: 'Sun Salutations', time: '28 min ago', hearts: 2 },
  { name: 'Kobi', avatar: 'https://i.pravatar.cc/80?img=60', series: 'Short Practice', time: '1h ago', hearts: 6 },
];

const SERIES_LABELS: Record<string, string> = {
  primary: 'Primary Series',
  intermediate: 'Intermediate',
  advanced_a: 'Advanced A',
  advanced_b: 'Advanced B',
  sun_sals: 'Sun Salutations',
  short: 'Short Practice',
};

const MOODS: { ionicon: string; label: string; key: string }[] = [
  { ionicon: 'flame', label: 'Strong', key: 'strong' },
  { ionicon: 'water', label: 'Challenging', key: 'challenging' },
  { ionicon: 'moon', label: 'Low energy', key: 'low' },
];

/* ââ Component ââ */
export default function HomeScreen() {
  const router = useRouter();
  const {
    user, practiceLogs, setPracticeLogs, addPracticeLog,
    isPracticing, setIsPracticing, practicingStartedAt,
    setLogModalOpen, setActiveTab,
  } = useAppStore();

  const [refreshing, setRefreshing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mood, setMood] = useState<string | null>(null);
  const [feedTab, setFeedTab] = useState<'live' | 'recent'>('live');
  const [practicingUsers, setPracticingUsers] = useState<PracticingUser[]>([]);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [elapsedSec, setElapsedSec] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Derived
  const streak = calculateStreak(practiceLogs);
  const weekDays = getWeeklyRhythm(practiceLogs);
  const practiceCount = weekDays.filter(d => d.status === 'done').length;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const guruWisdom = GURU_WISDOM[dayOfYear % GURU_WISDOM.length];
  const practicingCount = practicingUsers.length || 13;

  /* ââ Timer ââ */
  useEffect(() => {
    if (!isPracticing) { setElapsedSec(0); return; }
    const start = practicingStartedAt ? new Date(practicingStartedAt).getTime() : Date.now();
    const tick = () => setElapsedSec(Math.floor((Date.now() - start) / 1000));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [isPracticing, practicingStartedAt]);

  /* ââ Pulse animation ââ */
  useEffect(() => {
    if (!isPracticing) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 750, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 750, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isPracticing]);

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  /* ââ Data fetching ââ */
  const fetchAll = useCallback(async () => {
    if (!user) return;
    try {
      const [logs, practicing, feed] = await Promise.all([
        getPracticeLogs(user.id),
        getPracticingNow(),
        getFeed(),
      ]);
      if (logs) setPracticeLogs(logs);
      if (practicing) setPracticingUsers(practicing);
      if (feed) setFeedPosts(feed);
    } catch (e) {
      console.log('fetch error', e);
    }
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  /* ââ Actions ââ */
  const handleToggleMat = async () => {
    if (isPracticing) {
      // Finish
      const durationMin = Math.max(1, Math.round(elapsedSec / 60));
      setIsPracticing(false);
      if (user) {
        try {
          const result = await logPractice(user.id, user.series || 'primary', durationMin);
          if (result) addPracticeLog(result);
        } catch (e) { console.log('log error', e); }
      }
    } else {
      // Start
      setIsPracticing(true);
      if (user) {
        try { await setPracticingNow(user.id); } catch (e) { console.log('set practicing error', e); }
      }
    }
  };

  const handleSignOut = async () => {
    setMenuOpen(false);
    try { await signOut(); } catch (e) {}
    useAppStore.getState().clearUser();
  };

  /* ââ Render ââ */
  return (
    <SafeAreaView style={st.safe}>
      {/* ââ Top Bar ââ */}
      <View style={st.topBar}>
        <View style={st.topBarLeft}>
          <AppLogo size={30} />
          <Text style={st.brandText}>Ashtanga Sangha</Text>
        </View>
        <View style={st.topBarRight}>
          <TouchableOpacity style={st.chatBubble}>
            <Ionicons name="chatbubble-ellipses" size={18} color={warm.white} />
            <View style={st.badge}><Text style={st.badgeText}>3</Text></View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuOpen(true)}>
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

      {/* ââ Menu Modal ââ */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={st.modalOverlay} onPress={() => setMenuOpen(false)}>
          <View style={st.menuCard}>
            <TouchableOpacity style={st.menuItem} onPress={() => { setMenuOpen(false); router.push('/(tabs)/profile'); }}>
              <Ionicons name="person-outline" size={20} color={warm.ink} />
              <Text style={st.menuText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.menuItem} onPress={() => { setMenuOpen(false); router.push('/(tabs)/shalas'); }}>
              <Ionicons name="journal-outline" size={20} color={warm.ink} />
              <Text style={st.menuText}>My Log</Text>
            </TouchableOpacity>
            <View style={st.menuDivider} />
            <TouchableOpacity style={st.menuItem} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={20} color={warm.heartRed} />
              <Text style={[st.menuText, { color: warm.heartRed }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <ScrollView
        style={st.scroll}
        contentContainerStyle={st.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={warm.accent} />}
      >
        {/* ââ Welcome ââ */}
        <View style={st.welcomeWrap}>
          <Text style={st.welcomeTitle}>Welcome back, {user?.name?.split(' ')[0] || 'Yogi'}</Text>
          <Text style={st.welcomeSub}>
            <Text style={st.blueAccent}>{practicingCount} yogis</Text> are practicing right now
          </Text>
        </View>

        {/* ââ Live Avatars ââ */}
        <View style={st.avatarRow}>
          {FAKE_AVATARS.map((uri, i) => (
            <View key={i} style={[
              st.avatarCircle,
              { marginLeft: i > 0 ? -6 : 0 },
              i < 3 && st.avatarActive,
            ]}>
              <Image source={{ uri }} style={st.avatarImg} />
            </View>
          ))}
        </View>

        {/* ââ Guru Quote Banner ââ */}
        <View style={st.guruBanner}>
          <Text style={st.guruQuote}>&ldquo;{guruWisdom.quote}&rdquo;</Text>
          <Text style={st.guruAttrib}>&#x2014; {guruWisdom.guru}</Text>
        </View>

        {/* ââ CTA / Timer ââ */}
        {!isPracticing ? (
          <TouchableOpacity style={st.ctaButton} onPress={handleToggleMat} activeOpacity={0.85}>
            <Text style={st.ctaText}>I'M PRACTICING NOW</Text>
            <Text style={st.ctaSub}>Join {practicingCount} yogis on the mat</Text>
          </TouchableOpacity>
        ) : (
          <View style={st.timerCard}>
            <View style={st.timerHeader}>
              <Animated.View style={[st.pulseDot, { opacity: pulseAnim }]} />
              <Text style={st.timerLabel}>You're on the mat</Text>
            </View>
            <Text style={st.timerText}>{fmtTime(elapsedSec)}</Text>
            <TouchableOpacity style={st.finishBtn} onPress={handleToggleMat}>
              <Text style={st.finishBtnText}>Finish Practice</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ââ Practice Rhythm ââ */}
        <View style={st.card}>
          <View style={st.cardHeader}>
            <Text style={st.cardTitle}>Practice Rhythm</Text>
            <Text style={st.cardMeta}>{practiceCount} of {weekDays.length} this week</Text>
          </View>
          <View style={st.weekRow}>
            {weekDays.map((d, i) => {
              const done = d.status === 'done';
              const isToday = d.status === 'today';
              const isRest = d.status === 'rest';
              return (
                <View key={i} style={st.dayCol}>
                  <Text style={[st.dayLabel, isToday && st.dayLabelToday]}>{d.label}</Text>
                  <View style={[
                    st.dayDot,
                    done && st.dayDotDone,
                    isToday && !done && st.dayDotToday,
                    isRest && st.dayDotRest,
                  ]}>
                    {done && <Ionicons name="checkmark" size={14} color={warm.white} />}
                    {isRest && <Ionicons name="moon-outline" size={12} color={warm.muted} />}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* ââ Mood Check ââ */}
        <View style={st.card}>
          <Text style={st.moodTitle}>How was your practice today?</Text>
          <View style={st.moodRow}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.key}
                style={[st.moodBtn, mood === m.key && st.moodBtnActive]}
                onPress={() => setMood(m.key)}
              >
                <Ionicons
                  name={m.ionicon as any}
                  size={16}
                  color={mood === m.key ? warm.accent : warm.inkMid}
                />
                <Text style={[st.moodLabel, mood === m.key && st.moodLabelActive]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ââ Practice Feed ââ */}
        <View style={st.feedSection}>
          <View style={st.feedHeader}>
            <Text style={st.cardTitle}>Practice Feed</Text>
            <View style={st.feedTabs}>
              <TouchableOpacity
                style={[st.feedTab, feedTab === 'live' && st.feedTabActive]}
                onPress={() => setFeedTab('live')}
              >
                <Text style={[st.feedTabText, feedTab === 'live' && st.feedTabTextActive]}>
                  {'\u25CF'} Live
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[st.feedTab, feedTab === 'recent' && st.feedTabActive]}
                onPress={() => setFeedTab('recent')}
              >
                <Text style={[st.feedTabText, feedTab === 'recent' && st.feedTabTextActive]}>Recent</Text>
              </TouchableOpacity>
            </View>
          </View>

          {feedTab === 'live' ? (
            <View>
              {PRACTICING_NOW_MOCK.map((p, i) => (
                <View key={i} style={st.feedItem}>
                  <View style={st.feedAvatarWrap}>
                    <Image source={{ uri: p.avatar }} style={st.feedAvatar} />
                    <View style={st.greenDot} />
                  </View>
                  <View style={st.feedInfo}>
                    <Text style={st.feedName}>{p.name} <Text style={st.feedAction}>is on the mat</Text></Text>
                    <Text style={st.feedMeta}>{p.series} {'\u00B7'} {p.min}m</Text>
                  </View>
                  <TouchableOpacity style={st.praySendBtn}>
                    <Text style={st.praySendText}>Namaste</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View style={st.friendsBanner}>
                <Text style={st.friendsBannerText}>6 friends practiced today</Text>
              </View>
            </View>
          ) : (
            <View>
              {FEED_MOCK.map((f, i) => (
                <View key={i} style={st.feedItem}>
                  <Image source={{ uri: f.avatar }} style={st.feedAvatar} />
                  <View style={st.feedInfo}>
                    <Text style={st.feedName}>
                      {f.name} <Text style={st.feedAction}>finished {f.series}</Text>
                    </Text>
                    <Text style={st.feedMeta}>{f.time}</Text>
                  </View>
                  <View style={st.heartWrap}>
                    <Ionicons name="heart-outline" size={16} color={warm.muted} />
                    <Text style={st.heartCount}>{f.hearts}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ââ Styles ââ */
const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: warm.bg },

  /* Top bar */
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: warm.headerBg,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandText: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18, color: warm.ink },
  chatBubble: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: warm.orange,
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: -2, right: -2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#d44', borderWidth: 2, borderColor: warm.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontSize: 9, color: '#fff', fontWeight: '700' },
  topAvatar: { width: 34, height: 34, borderRadius: 17, overflow: 'hidden' },

  /* Menu */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 60, paddingRight: 16 },
  menuCard: { backgroundColor: warm.white, borderRadius: 16, padding: 8, width: 200, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  menuText: { fontSize: 15, color: warm.ink, fontWeight: '500' },
  menuDivider: { height: 1, backgroundColor: warm.divider, marginHorizontal: 8 },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  /* Welcome */
  welcomeWrap: { alignItems: 'center', paddingTop: 12, paddingBottom: 8 },
  welcomeTitle: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 24, color: warm.ink, marginBottom: 4 },
  welcomeSub: { fontSize: 14, color: warm.muted },
  blueAccent: { color: warm.blue, fontWeight: '600' },

  /* Avatar row */
  avatarRow: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 4, paddingBottom: 12 },
  avatarCircle: {
    width: 38, height: 38, borderRadius: 19, overflow: 'hidden',
    borderWidth: 2, borderColor: warm.divider,
  },
  avatarActive: { borderColor: warm.sage },
  avatarImg: { width: 34, height: 34, borderRadius: 17 },

  /* Guru banner */
  guruBanner: {
    marginHorizontal: 16, marginBottom: 12, paddingVertical: 14, paddingHorizontal: 18,
    backgroundColor: warm.ink, borderRadius: 16, alignItems: 'center',
  },
  guruQuote: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 17, color: '#FFF5EB',
    fontStyle: 'italic', textAlign: 'center', lineHeight: 23, marginBottom: 4,
  },
  guruAttrib: { fontSize: 12, color: warm.mutedLight },

  /* CTA button */
  ctaButton: {
    marginHorizontal: 16, marginBottom: 6, paddingVertical: 16,
    backgroundColor: warm.orange, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: warm.orange, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 16, elevation: 6,
  },
  ctaText: { fontSize: 17, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  ctaSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  /* Timer card */
  timerCard: {
    marginHorizontal: 16, marginBottom: 6, padding: 18,
    backgroundColor: warm.cardBg, borderRadius: 16,
    borderWidth: 2, borderColor: warm.sage, alignItems: 'center',
  },
  timerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  pulseDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: warm.sage },
  timerLabel: { fontSize: 14, fontWeight: '600', color: warm.sage },
  timerText: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 36, color: warm.ink, marginBottom: 12 },
  finishBtn: { paddingHorizontal: 28, paddingVertical: 10, backgroundColor: warm.ink, borderRadius: 12 },
  finishBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },

  /* Card (shared) */
  card: {
    marginHorizontal: 16, marginTop: 8, marginBottom: 6, padding: 14,
    backgroundColor: warm.cardBg, borderRadius: 16, borderWidth: 1, borderColor: warm.divider,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 16, color: warm.ink },
  cardMeta: { fontSize: 12, color: warm.muted },

  /* Week rhythm */
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', flex: 1 },
  dayLabel: { fontSize: 11, color: warm.muted, marginBottom: 6 },
  dayLabelToday: { fontWeight: '700', color: warm.ink },
  dayDot: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1, borderColor: warm.divider,
    alignItems: 'center', justifyContent: 'center',
  },
  dayDotDone: { backgroundColor: warm.orange, borderWidth: 0 },
  dayDotToday: { borderWidth: 2, borderColor: warm.orange, backgroundColor: warm.orangeLight },
  dayDotRest: { backgroundColor: warm.divider, borderWidth: 0 },

  /* Mood */
  moodTitle: { fontSize: 14, fontWeight: '600', color: warm.ink, textAlign: 'center', marginBottom: 10 },
  moodRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  moodBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1.5, borderColor: warm.divider, borderRadius: 24,
    backgroundColor: warm.cardBg,
  },
  moodBtnActive: { borderColor: warm.orange, backgroundColor: warm.orangeLight },
  moodLabel: { fontSize: 13, color: warm.inkMid },
  moodLabelActive: { color: warm.accent, fontWeight: '600' },

  /* Feed */
  feedSection: { marginHorizontal: 16, marginTop: 6 },
  feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  feedTabs: { flexDirection: 'row', backgroundColor: warm.divider, borderRadius: 10, padding: 2 },
  feedTab: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 8 },
  feedTabActive: { backgroundColor: warm.cardBg, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  feedTabText: { fontSize: 12, fontWeight: '600', color: warm.muted },
  feedTabTextActive: { color: warm.ink },
  feedItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, backgroundColor: warm.cardBg, borderRadius: 14,
    borderWidth: 1, borderColor: warm.divider, marginBottom: 8,
  },
  feedAvatarWrap: { position: 'relative' },
  feedAvatar: { width: 40, height: 40, borderRadius: 20 },
  greenDot: {
    position: 'absolute', bottom: -1, right: -1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: warm.sage, borderWidth: 2, borderColor: warm.cardBg,
  },
  feedInfo: { flex: 1 },
  feedName: { fontSize: 14, fontWeight: '600', color: warm.ink },
  feedAction: { fontWeight: '400', color: warm.muted },
  feedMeta: { fontSize: 12, color: warm.muted, marginTop: 2 },
  praySendBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: warm.sageBg, borderRadius: 20,
  },
  praySendText: { fontSize: 12, fontWeight: '600', color: warm.sage },
  friendsBanner: {
    alignItems: 'center', padding: 10,
    backgroundColor: warm.orangeLight, borderRadius: 12, marginTop: 4,
  },
  friendsBannerText: { fontSize: 13, color: warm.accent, fontWeight: '500' },
  heartWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heartCount: { fontSize: 13, color: warm.muted },
});
