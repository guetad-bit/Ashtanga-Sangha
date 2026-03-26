// src/screens/home/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Pressable, Modal,
  StyleSheet, Image, RefreshControl, ImageBackground, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';
import { useAppStore } from '@/store/useAppStore';
import { getWeeklyRhythm, calculateStreak } from '@/utils/practiceStreak';
import { daysUntilNextMoonDay } from '@/utils/moonDay';
import { getPracticeLogs, getPracticingNow, getFeed, signOut } from '@/lib/supabase';
import AppLogo from '@/components/AppLogo';
import { Ionicons } from '@expo/vector-icons';

interface PracticingUser {
  id: string;
  name: string;
  avatar_url: string | null;
  series: string;
  level: string;
  streak: number;
  practicing_since: string;
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
  profiles: { name: string; avatar_url: string | null } | null;
}

/* ── Stone & Moss palette ─────────────────────────────────────────── */
const moss = {
  bg: '#F6F2EC',
  cardBg: '#FFFFFF',
  cardWarm: '#FBF8F3',
  headerBg: '#FFFFFF',
  ink: '#3B3228',
  inkMid: '#5E5245',
  muted: '#9B8E7E',
  mutedLight: '#C4B8A8',
  accent: '#8A9E78',
  accentLight: '#DCE8D3',
  accentFaint: 'rgba(138,158,120,0.08)',
  sage: '#8A9E78',
  sageBg: '#DCE8D3',
  wood: '#D4C4AB',
  woodLight: '#EDE6DA',
  woodMid: '#B8A88E',
  beige: '#F0EAE0',
  beigeDark: '#E4DACE',
  olive: '#8A9E78',
  oliveMid: '#6E8A5C',
  oliveLight: '#DCE8D3',
  amber: '#C4956A',
  amberBg: '#FFF5EC',
  terra: '#8B7355',
  divider: '#E8E0D4',
  orange: '#C4956A',
  orangeLight: '#FFF5EC',
  white: '#FFFFFF',
  ring: '#8A9E78',
  heartRed: '#C4956A',
  blue: '#8A9E78',
  blueBg: '#DCE8D3',
  gold: '#D4C4AB',
  goldBg: '#EDE6DA',
};

const SCREEN_WIDTH = Dimensions.get('window').width;

// ── Data ──────────────────────────────────────────────────────────────────────

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


// Guru wisdom
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
  { guru: 'T. Krishnamacharya', quote: 'Where is the delusion when truth is known?' },
];

// Practice hero images — before practice
const PRACTICE_IMAGES = [
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80',
  'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&q=80',
];


// Fake yogis for Yogis on the mat
const FAKE_YOGIS = [
  { id: 'f1', name: 'Priya Sharma', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80' },
  { id: 'f2', name: 'Marco Rossi', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
  { id: 'f3', name: 'Yuki Tanaka', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80' },
  { id: 'f4', name: 'Amit Patel', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
  { id: 'f5', name: 'Sofia Costa', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
  { id: 'f6', name: 'Daniel Kim', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
  { id: 'f7', name: 'Lena Weber', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80' },
  { id: 'f8', name: 'Ravi Kumar', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80' },
  { id: 'f9', name: 'Mia Chen', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80' },
  { id: 'f10', name: 'Lucas Silva', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80' },
  { id: 'f11', name: 'Anika Berg', avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80' },
  { id: 'f12', name: 'Omar Hassan', avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&q=80' },
];

// Series display names
const SERIES_LABELS: Record<string, string> = {
  sun_sals: 'Sun Salutations',
  primary: 'Primary Series',
  intermediate: 'Intermediate Series',
  advanced_a: 'Advanced A',
  advanced_b: 'Advanced B',
  short: 'Short Practice',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const {
    user, practiceLogs, setPracticeLogs,
    isPracticing, setIsPracticing,
    userPosts, setLogModalOpen,
  } = useAppStore();

  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [livePractitioners, setLivePractitioners] = useState<PracticingUser[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggedSeries, setLoggedSeries] = useState<string | null>(null);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);

  // Computed
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const guruWisdom = GURU_WISDOM[dayOfYear % GURU_WISDOM.length];
  const practicedToday = loggedSeries !== null;
  const practiceImage = PRACTICE_IMAGES[dayOfYear % PRACTICE_IMAGES.length];
  const rhythm = getWeeklyRhythm(practiceLogs);
  const streak = calculateStreak(practiceLogs);
  const moonDaysUntil = daysUntilNextMoonDay();
  const practicesThisWeek = rhythm.filter((d) => d.status === 'done').length;

  // Next moon day date string
  const nextMoonDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + moonDaysUntil);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  })();

  // Yogis on mat
  const othersOnMat = livePractitioners
    .filter((p) => p.id !== user?.id)
    .map((p) => ({ id: p.id, name: p.name ?? 'Practitioner', avatarUrl: p.avatar_url }));
  const meOnMat = (isPracticing || practicedToday) && user
    ? [{ id: user.id, name: 'You', avatarUrl: user.avatarUrl ?? null }]
    : [];
  const sanghaOnMat = [...meOnMat, ...othersOnMat, ...FAKE_YOGIS];


  // ── Actions ──
  const handlePracticeButton = () => {
    // Always open the modal — it handles the step logic internally
    setLogModalOpen(true);
  };

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
  };

  // ── Data fetching ──
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

  const fetchPracticing = async () => {
    const { data } = await getPracticingNow();
    if (data) setLivePractitioners(data as PracticingUser[]);
  };

  const fetchFeed = async () => {
    const { data } = await getFeed(user?.id ?? '');
    if (data) setFeedPosts(data as FeedPost[]);
  };

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const existing = practiceLogs.find(
      (log) => new Date(log.loggedAt).toISOString().split('T')[0] === todayStr
    );
    if (existing && !loggedSeries) {
      setLoggedSeries(existing.series);
      setIsPracticing(true);
    }
  }, [practiceLogs]);

  useEffect(() => { fetchLogs(); fetchPracticing(); fetchFeed(); }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchLogs(), fetchPracticing(), fetchFeed()]);
    setRefreshing(false);
  };

  // Dot color for rhythm
  const dotColor = (status: string) => {
    if (status === 'done') return moss.olive;
    if (status === 'today') return moss.orange;
    if (status === 'rest') return moss.divider;
    return moss.divider;
  };

  // ── Render ──
  return (
    <SafeAreaView style={s.safe}>
      {/* ── Top bar ── */}
      <View style={s.topbar}>
        <View style={s.topbarLeft}>
          <AppLogo size={36} />
          <Text style={s.appTitle}>Ashtanga Sangha</Text>
        </View>
        <View style={s.topbarRight}>
          <TouchableOpacity style={s.notifBtn} activeOpacity={0.7}>
            <Ionicons name="chatbubble-ellipses" size={22} color={moss.accent} />
            <View style={s.notifBadge}>
              <Text style={s.notifBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenuOpen(true)} activeOpacity={0.75}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={s.avatar} />
            ) : (
              <View style={[s.avatar, s.avatarPlaceholder]}>
                <Text style={s.avatarLetter}>{user?.name?.charAt(0) ?? '?'}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Avatar dropdown menu ── */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={s.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <View style={s.menuContainer}>
            <View style={s.menuHeader}>
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={s.menuAvatar} />
              ) : (
                <View style={[s.menuAvatar, s.avatarPlaceholder]}>
                  <Text style={s.avatarLetter}>{user?.name?.charAt(0) ?? '?'}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={s.menuName}>{user?.name ?? 'Yogi'}</Text>
                <Text style={s.menuEmail}>{user?.email ?? ''}</Text>
              </View>
            </View>
            <View style={s.menuDivider} />
            <TouchableOpacity
              style={s.menuItem}
              onPress={() => { setMenuOpen(false); router.push('/(tabs)/profile'); }}
              activeOpacity={0.7}
            >
              <Ionicons name="person-outline" size={18} color={moss.ink} />
              <Text style={s.menuItemText}>My Profile</Text>
            </TouchableOpacity>
            <View style={s.menuDivider} />
            <TouchableOpacity style={s.menuItem} onPress={handleSignOut} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={18} color="#C0392B" />
              <Text style={[s.menuItemText, { color: '#C0392B' }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={moss.accent} />}
      >
        {/* ── Welcome ── */}
        <Text style={s.welcome}>Welcome back, {user?.name?.split(' ')[0] ?? 'Yogi'}</Text>

        {/* ── Yogis on the mat ── */}
        <View style={s.yogisOnMat}>
          <Text style={s.yogisCountText}>
            <Text style={s.yogisCountBold}>{sanghaOnMat.length} yogis</Text> on the mat today
          </Text>
          <View style={s.yogisAvatarRow}>
            {sanghaOnMat.slice(0, 7).map((u, i) => (
              <View key={u.id} style={[s.yogisAvatarWrap, { marginLeft: i === 0 ? 0 : -10, zIndex: 7 - i }]}>
                {u.avatarUrl ? (
                  <Image source={{ uri: u.avatarUrl }} style={s.yogisAvatar} />
                ) : (
                  <View style={[s.yogisAvatar, s.avatarPlaceholder]}>
                    <Text style={s.avatarLetterSm}>{u.name.charAt(0)}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* ═══ 1. HERO CARD ═══ */}
        <View style={s.heroCard}>
          <ImageBackground
            source={{ uri: practiceImage }}
            style={s.heroImage}
            imageStyle={s.heroImageInner}
          >
            <View style={s.heroGradient} />
            <View style={s.heroContent}>
              <Text style={s.heroTitle}>{guruWisdom.quote}</Text>
              <Text style={s.heroSubtitle}>— {guruWisdom.guru}</Text>
              <TouchableOpacity
                style={[s.heroBtn, isPracticing ? s.heroBtnOnMat : s.heroBtnDefault]}
                onPress={handlePracticeButton}
                activeOpacity={0.85}
              >
                <Text style={s.heroBtnText}>
                  {isPracticing ? "You're on the mat!" : "I'm on the mat 🧘"}
                </Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>


        {/* ═══ 2. PRACTICE RHYTHM — Separate Card ═══ */}
        <View style={s.rhythmCard}>
          <Text style={s.rhythmTitle}>Practice Rhythm</Text>

          {/* Day dots */}
          <View style={s.rhythmRow}>
            {rhythm.map((day, i) => (
              <View key={i} style={s.rhythmCol}>
                <Text style={s.rhythmLabel}>{day.label}</Text>
                <View style={[s.rhythmDot, { backgroundColor: dotColor(day.status) }]} />
              </View>
            ))}
          </View>

          {/* Stats row */}
          <View style={s.rhythmDivider} />

        </View>

        {/* ═══ 3. SANGHA FEED ═══ */}
        <View style={s.feedSection}>
          <Text style={s.feedTitle}>Sangha Feed</Text>

          {/* Feed Card - example 1 */}
          <View style={s.feedCard}>
            <View style={s.feedCardInner}>
              <View style={s.feedCardLeft}>
                <View style={s.feedUserRow}>
                  <Image source={{ uri: 'https://i.pravatar.cc/100?img=5' }} style={s.feedAvatar} />
                  <View>
                    <Text style={s.feedUserName}>Liat</Text>
                    <Text style={s.feedTimeAgo}>4 min ago</Text>
                  </View>
                </View>
                <Text style={s.feedCaption}>Just finished practice 🙏</Text>
                <View style={s.feedStats}>
                  <Text style={s.feedHeart}>🙏 1</Text>
                  <Text style={s.feedComment}>💬 1</Text>
                </View>
              </View>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&q=80' }} style={s.feedCardImage} />
            </View>
          </View>

          {/* Feed Card - example 2 */}
          <View style={s.feedCard}>
            <View style={s.feedCardInner}>
              <View style={s.feedCardLeft}>
                <View style={s.feedUserRow}>
                  <Image source={{ uri: 'https://i.pravatar.cc/100?img=11' }} style={s.feedAvatar} />
                  <View>
                    <Text style={s.feedUserName}>David</Text>
                    <Text style={s.feedTimeAgo}>15 min ago</Text>
                  </View>
                </View>
                <Text style={s.feedCaption}>Working on my dropbacks!</Text>
                <View style={s.feedStats}>
                  <Text style={s.feedHeart}>🙏 1</Text>
                  <Text style={s.feedComment}>💬 1</Text>
                </View>
              </View>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&q=80' }} style={s.feedCardImage} />
            </View>
          </View>
        </View>



      </ScrollView>
    </SafeAreaView>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════ */
/* STYLES                                                                        */
/* ═══════════════════════════════════════════════════════════════════════════════ */

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: moss.bg },

  /* ── Top bar ───────────────────────────────────────────────────────────────── */
  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    backgroundColor: moss.bg,
  },
  topbarLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  topbarRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  appTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18,
    color: moss.ink, lineHeight: 22,
  },
  notifBtn: { position: 'relative' as any },
  notifBadge: {
    position: 'absolute' as any, top: -4, right: -6,
    backgroundColor: moss.orange, borderRadius: 8,
    width: 16, height: 16, alignItems: 'center' as any, justifyContent: 'center' as any,
    borderWidth: 1.5, borderColor: moss.bg,
  },
  notifBadgeText: { fontSize: 9, fontWeight: '700' as any, color: '#fff' },
  avatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: moss.ring },
  avatarPlaceholder: {
    backgroundColor: moss.accent, alignItems: 'center' as any, justifyContent: 'center' as any,
  },
  avatarLetter: { fontSize: 16, color: '#fff', fontWeight: '600' as any },
  avatarLetterSm: { fontSize: 14, color: '#fff', fontWeight: '600' as any },

  /* ── Menu ───────────────────────────────────────────────────────────────────── */
  menuBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-start' as any, alignItems: 'flex-end' as any,
    paddingTop: 95, paddingRight: spacing.lg,
  },
  menuContainer: {
    backgroundColor: moss.cardBg, borderRadius: radius.xl,
    width: 240, ...shadows.lg, overflow: 'hidden' as any,
    borderWidth: 1, borderColor: moss.divider,
  },
  menuHeader: {
    flexDirection: 'row' as any, alignItems: 'center' as any, gap: spacing.md,
    padding: spacing.lg,
  },
  menuAvatar: { width: 40, height: 40, borderRadius: 20 },
  menuName: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 16, lineHeight: 20,
    color: moss.ink,
  },
  menuEmail: { ...typography.bodyXs, color: moss.muted, marginTop: 1 },
  menuDivider: { height: 1, backgroundColor: moss.divider },
  menuItem: {
    flexDirection: 'row' as any, alignItems: 'center' as any, gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  menuItemText: { ...typography.bodyMd, color: moss.ink },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  /* ── Welcome ───────────────────────────────────────────────────────────────── */
  welcome: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, lineHeight: 28,
    color: moss.ink, textAlign: 'center' as any,
    paddingVertical: spacing.md,
  },

  /* ── Yogis on mat ──────────────────────────────────────────────────────────── */
  yogisOnMat: {
    alignItems: 'center' as any,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  yogisCountText: {
    fontFamily: 'DMSans_400Regular', fontSize: 15, color: moss.ink,
    marginBottom: 10,
  },
  yogisCountBold: {
    fontFamily: 'DMSans_700Bold', fontSize: 15, color: moss.accent,
  },
  yogisAvatarRow: {
    flexDirection: 'row' as any, justifyContent: 'center' as any,
  },
  yogisAvatarWrap: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2.5, borderColor: moss.cardBg,
    overflow: 'hidden' as any,
    shadowColor: moss.accent, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 4,
    elevation: 3,
  },
  yogisAvatar: {
    width: '100%' as any, height: '100%' as any, borderRadius: 22,
  },

  /* ── Hero card ────────────────────────────────────────────────────────────── */
  heroCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    borderRadius: 20, overflow: 'hidden' as any,
    height: 320,
    ...shadows.lg,
  },
  heroImage: { flex: 1, justifyContent: 'center' as any, alignItems: 'center' as any },
  heroImageInner: { borderRadius: 20 },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  heroContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(138,158,120,0.75)',
    borderRadius: 20,
  },
  heroTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 32, lineHeight: 38,
    color: '#fff', fontStyle: 'italic' as any,
    textAlign: 'center' as any,
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  heroSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16, color: 'rgba(255,255,255,0.9)',
    textAlign: 'center' as any,
    marginBottom: 24,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  heroBtn: {
    borderRadius: 28, paddingVertical: 14, paddingHorizontal: 44,
    alignItems: 'center' as any, justifyContent: 'center' as any,
  },
  heroBtnDefault: {
    backgroundColor: '#8A9E78',
    shadowColor: 'rgba(138,158,120,0.4)',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 16,
  },
  heroBtnOnMat: {
    backgroundColor: '#C4956A',
    shadowColor: 'rgba(196,149,106,0.4)',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 16,
  },
  heroBtnText: {
    fontFamily: 'DMSans_700Bold', fontSize: 16, color: '#fff',
    letterSpacing: 1.5, textTransform: 'uppercase' as any,
  },

  /* ── Rhythm card ───────────────────────────────────────────────────────────── */
  rhythmCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    backgroundColor: moss.cardBg, borderRadius: 20,
    padding: spacing.xl,
    ...shadows.sm,
    borderWidth: 1, borderColor: moss.divider,
  },
  rhythmTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18,
    color: moss.ink, marginBottom: spacing.lg,
  },
  rhythmRow: {
    flexDirection: 'row' as any, justifyContent: 'space-between' as any,
    alignItems: 'center' as any,
  },
  rhythmCol: { alignItems: 'center' as any, gap: 6 },
  rhythmLabel: {
    fontFamily: 'DMSans_500Medium', fontSize: 12, color: moss.muted,
  },
  rhythmDot: { width: 10, height: 10, borderRadius: 5 },
  rhythmDivider: {
    height: 1, backgroundColor: moss.divider, marginVertical: spacing.md,
  },
  rhythmStats: {
    flexDirection: 'row' as any, alignItems: 'center' as any,
    justifyContent: 'center' as any, gap: spacing.md,
  },
  rhythmStatText: {
    fontFamily: 'DMSans_500Medium', fontSize: 13, color: moss.inkMid,
    textAlign: 'center' as any,
  },
  streakBadge: {
    backgroundColor: moss.amberBg, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 3,
  },
  streakText: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: moss.orange,
  },
  moonRow: {
    flexDirection: 'row' as any, alignItems: 'center' as any,
    justifyContent: 'center' as any, gap: 6, marginTop: spacing.md,
  },
  moonIcon: { fontSize: 16 },
  moonText: {
    fontFamily: 'DMSans_400Regular', fontSize: 13, color: moss.muted,
  },

  /* ── Live Practice Feed ───────────────────────────────────────────────────── */
  feedSection: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
  },
  feedTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 20,
    color: moss.ink, marginBottom: 14,
  },
  feedCard: {
    backgroundColor: moss.cardBg, borderRadius: 16,
    borderWidth: 1, borderColor: moss.divider,
    marginBottom: 12, overflow: 'hidden' as any,
  },
  feedCardInner: {
    flexDirection: 'row' as any,
  },
  feedCardLeft: {
    flex: 1, padding: 16,
  },
  feedUserRow: {
    flexDirection: 'row' as any, alignItems: 'center' as any, gap: 10, marginBottom: 8,
  },
  feedAvatar: {
    width: 40, height: 40, borderRadius: 20,
  },
  feedUserName: {
    fontFamily: 'DMSans_700Bold', fontSize: 15, color: moss.ink,
  },
  feedTimeAgo: {
    fontFamily: 'DMSans_400Regular', fontSize: 13, color: moss.muted,
  },
  feedCaption: {
    fontFamily: 'DMSans_400Regular', fontSize: 15, color: moss.ink, marginBottom: 10,
  },
  feedStats: {
    flexDirection: 'row' as any, gap: 14, alignItems: 'center' as any,
  },
  feedHeart: {
    fontFamily: 'DMSans_500Medium', fontSize: 14, color: moss.heartRed,
  },
  feedComment: {
    fontFamily: 'DMSans_500Medium', fontSize: 14, color: moss.muted,
  },
  feedCardImage: {
    width: 130, height: 'auto' as any, minHeight: 120,
  },

});
