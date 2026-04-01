// src/screens/home/HomeScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Pressable, Modal, TextInput,
  StyleSheet, Image, RefreshControl, ImageBackground, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';
import { useAppStore } from '@/store/useAppStore';
import { getWeeklyRhythm, calculateStreak } from '@/utils/practiceStreak';
import { daysUntilNextMoonDay, isMoonDay } from '@/utils/moonDay';
import { getPracticeLogs, getPracticingNow, setPracticingNow, getFeed, signOut, logPractice } from '@/lib/supabase';
import AppLogo from '@/components/AppLogo';
import AppHeader from '@/components/AppHeader';
import { Ionicons } from '@expo/vector-icons';
import { getAsanaOfTheDay, getSeriesColor, type AsanaPose } from '@/data/asanaPoses';

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

// Practice hero images (local illustrated assets)
const PRACTICE_IMAGES = [
  require('@/../assets/hero/hero_1.png'),
  require('@/../assets/hero/hero_2.png'),
  require('@/../assets/hero/hero_3.png'),
  require('@/../assets/hero/hero_4.png'),
];

// On-mat hero images (warmer amber tones)
const ONMAT_IMAGES = [
  require('@/../assets/hero/hero_onmat_1.png'),
  require('@/../assets/hero/hero_onmat_2.png'),
  require('@/../assets/hero/hero_onmat_3.png'),
  require('@/../assets/hero/hero_onmat_4.png'),
];

// ── Circle members, on-mat yogis, feed authors (populated from real data) ──
const FAKE_USERS: {
  id: string; name: string; avatarUrl: string;
  series: string; streak: number; practicedToday: boolean; bio: string;
  badge: 'practiced' | 'streak' | 'series'; badgeText: string;
  feedCaption: string; feedImage: string; feedTime: string; feedLikes: number; feedComments: number;
}[] = [];

// Time-ago helper
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

// Week day checkmarks
const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const {
    user, practiceLogs, setPracticeLogs,
    isPracticing, setIsPracticing,
    userPosts, setLogModalOpen, clearUser, addPracticeLog,
  } = useAppStore();

  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [livePractitioners, setLivePractitioners] = useState<PracticingUser[]>([]);
  const [loggedSeries, setLoggedSeries] = useState<string | null>(null);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logSeries, setLogSeries] = useState('primary'); // DB key, not display label
  const [logDuration, setLogDuration] = useState(75);
  const [logNotes, setLogNotes] = useState('');
  const [profileCard, setProfileCard] = useState<{ name: string; avatarUrl: string; series: string; streak: number; bio: string } | null>(null);

  // Localized week day labels
  const WEEK_DAYS_I18N = t('home.dayLabels', { returnObjects: true }) as string[];

  const openProfile = (name: string) => {
    const fakeUser = FAKE_USERS.find((u) => u.name === name);
    if (fakeUser) {
      const seriesLabel = SERIES_LABELS[fakeUser.series] ?? fakeUser.series;
      setProfileCard({ name: fakeUser.name, avatarUrl: fakeUser.avatarUrl, series: seriesLabel, streak: fakeUser.streak, bio: fakeUser.bio });
    }
  };

  // Computed
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const todayDow = now.getDay(); // 0=Sun
  const guruWisdom = GURU_WISDOM[dayOfYear % GURU_WISDOM.length];
  const practicedToday = loggedSeries !== null;
  const practiceImage = PRACTICE_IMAGES[dayOfYear % PRACTICE_IMAGES.length];
  const onMatImage = ONMAT_IMAGES[dayOfYear % ONMAT_IMAGES.length];
  const rhythm = getWeeklyRhythm(practiceLogs);
  const streak = calculateStreak(practiceLogs);
  const practicesThisWeek = rhythm.filter((d) => d.status === 'done').length;
  const weeklyGoal = 6;
  const todaysAsana = getAsanaOfTheDay();
  const seriesColor = getSeriesColor(todaysAsana.series);
  const asana = {
    name: todaysAsana.sanskrit, subtitle: todaysAsana.english,
    series: todaysAsana.series, image: todaysAsana.image,
    benefits: todaysAsana.benefits, tips: todaysAsana.tips,
    breaths: todaysAsana.breaths, sides: todaysAsana.sides, difficulty: todaysAsana.difficulty,
  };

  // Build week checkmarks from rhythm data
  const weekChecks = rhythm.map((d) => d.status === 'done');

  // Yogis on mat — combine real + fake
  const othersOnMat = livePractitioners
    .filter((p) => p.id !== user?.id)
    .map((p) => ({ id: p.id, name: p.name ?? 'Practitioner', avatarUrl: p.avatar_url }));
  const meOnMat = (isPracticing || practicedToday) && user
    ? [{ id: user.id, name: 'You', avatarUrl: user.avatarUrl ?? null }]
    : [];
  const fakeOnMat = FAKE_USERS.filter(u => u.practicedToday).map(u => ({ id: u.id, name: u.name, avatarUrl: u.avatarUrl }));
  const sanghaOnMat = [...meOnMat, ...othersOnMat, ...fakeOnMat];

  // ── Practice state: 'idle' | 'onMat' ──
  // After logging, isPracticing resets → back to 'idle' so user can practice again
  // practicedToday only affects the social circle (shows user as "practiced today")
  const practiceState = isPracticing ? 'onMat' : 'idle';

  // Elapsed time on mat
  const [elapsedMin, setElapsedMin] = useState(0);
  useEffect(() => {
    if (!isPracticing) return;
    const startedAt = useAppStore.getState().practicingStartedAt;
    if (!startedAt) return;
    const tick = () => {
      const mins = Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000);
      setElapsedMin(mins);
    };
    tick();
    const iv = setInterval(tick, 30000);
    return () => clearInterval(iv);
  }, [isPracticing]);

  // ── Actions ──
  const handlePracticeButton = () => {
    if (practiceState === 'idle') {
      // Start practice → go on the mat
      setIsPracticing(true);
      if (user) setPracticingNow(user.id, true).catch(console.error);
    } else if (practiceState === 'onMat') {
      // Finish practice → open log modal
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
    const { error } = await logPractice(user.id, logSeries, logDuration, fullNotes);
    if (!error) {
      addPracticeLog({
        id: Date.now().toString(),
        userId: user.id,
        loggedAt: new Date().toISOString(),
        series: logSeries,
        durationMin: logDuration,
      });
      setLoggedSeries(logSeries);
    }
    setIsPracticing(false);
    setShowLogModal(false);
    setLogNotes('');
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
      // Don't force isPracticing — user should land in idle state,
      // ready to start a new session. The social circle still shows
      // them as "practiced today" via loggedSeries / practicedToday.
    }
  }, [practiceLogs]);

  // Refetch data every time screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchLogs(); fetchPracticing(); fetchFeed();
    }, [user?.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchLogs(), fetchPracticing(), fetchFeed()]);
    setRefreshing(false);
  };

  // Badge color helper
  const badgeColor = (badge: string) => {
    if (badge === 'practiced') return { bg: moss.accentLight, text: moss.accent, ring: moss.accent };
    if (badge === 'streak') return { bg: moss.amberBg, text: moss.amber, ring: moss.amber };
    return { bg: moss.blueBg, text: moss.inkMid, ring: moss.wood };
  };

  // ── Render ──
  return (
    <SafeAreaView style={s.safe}>
      <AppHeader />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={moss.accent} />}
      >
        {/* ── Welcome ── */}
        <Text style={s.welcome}>{t('home.welcomeBack', { name: user?.name?.split(' ')[0] ?? 'Yogi' })}</Text>

        {/* ── Yogis on the mat ── */}
        <View style={s.yogisOnMat}>
          <Text style={s.yogisCountText}>
            <Text style={s.yogisCountBold}>{sanghaOnMat.length}</Text> {t('home.yogisOnMat')}
          </Text>
          <View style={s.yogisAvatarRow}>
            {sanghaOnMat.slice(0, 7).map((u, i) => (
              <TouchableOpacity key={u.id} style={[s.yogisAvatarWrap, { marginLeft: i === 0 ? 0 : -10, zIndex: 7 - i }]} activeOpacity={0.7} onPress={() => openProfile(u.name)}>
                {u.avatarUrl ? (
                  <Image source={{ uri: u.avatarUrl }} style={s.yogisAvatar} />
                ) : (
                  <View style={[s.yogisAvatar, s.avatarPlaceholder]}>
                    <Text style={s.avatarLetterSm}>{u.name.charAt(0)}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ═══ 1. HERO CARD ═══ */}
        <View style={s.heroCard}>
          <ImageBackground
            source={practiceState === 'onMat' ? onMatImage : practiceImage}
            style={s.heroImage}
            imageStyle={s.heroImageInner}
          >
            <View style={s.heroGradient} />
            <View style={[
              s.heroContent,
              practiceState === 'onMat' && s.heroContentOnMat,
            ]}>
              {practiceState === 'onMat' ? (
                <>
                  <Ionicons name="leaf" size={32} color="rgba(255,255,255,0.85)" />
                  <Text style={s.heroTitle}>{t('home.onTheMat')}</Text>
                  <Text style={s.heroSubtitle}>
                    {elapsedMin < 1 ? t('home.justStarted') : t('home.minIn', { min: elapsedMin })}
                  </Text>
                  <TouchableOpacity
                    style={[s.heroBtn, s.heroBtnFinish]}
                    onPress={handlePracticeButton}
                    activeOpacity={0.85}
                  >
                    <Text style={[s.heroBtnText, { color: moss.ink }]}>{t('home.doneLogIt')}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={[s.heroTitle, guruWisdom.quote.length > 80 && s.heroTitleSmall]}>{guruWisdom.quote}</Text>
                  <Text style={s.heroSubtitle}>— {guruWisdom.guru}</Text>
                  <TouchableOpacity
                    style={[s.heroBtn, s.heroBtnDefault]}
                    onPress={handlePracticeButton}
                    activeOpacity={0.85}
                  >
                    <Text style={s.heroBtnText}>{t('home.startPractice')}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ImageBackground>
        </View>

        {/* ═══ 2. THIS WEEK + GOAL ═══ */}
        <View style={s.weekCard}>
          {/* Top: This Week title and day circles */}
          <View>
            <Text style={[s.weekTitle, isRTL && { textAlign: 'right' }]}>{t('home.thisWeek')}</Text>
            <View style={s.weekDays}>
              {WEEK_DAYS_I18N.map((label, i) => {
                const isDone = weekChecks[i];
                const isToday = rhythm[i]?.status === 'today';
                const isMoon = rhythm[i] && isMoonDay(rhythm[i].date);
                return (
                  <View key={i} style={s.weekDayCol}>
                    <Text style={s.weekDayLabel}>{label}</Text>
                    <View style={[
                      s.weekDayCircle,
                      { backgroundColor: isDone ? moss.accent : isToday ? moss.accentLight : moss.beige },
                      isToday && !isDone && { borderWidth: 2, borderColor: moss.accent },
                    ]}>
                      {isDone ? (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      ) : isMoon ? (
                        <Text style={{ fontSize: 14 }}>🌙</Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
          {/* Bottom: Goal progress */}
          <View style={s.weekGoalSection}>
            <View style={[s.goalNumbers, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={s.goalBig}>{practicesThisWeek}</Text>
              <Text style={s.goalSlash}> / </Text>
              <Text style={s.goalSmall}>{weeklyGoal}</Text>
              <Text style={s.goalLabel}> {t('home.practices')}</Text>
            </View>
            <View style={s.progressBar}>
              <View style={[s.progressFill, { width: `${Math.min(100, (practicesThisWeek / weeklyGoal) * 100)}%` as any }]} />
            </View>
            <Text style={[s.goalHint, isRTL && { textAlign: 'right' }]}>
              {practicesThisWeek >= weeklyGoal
                ? t('home.goalReached')
                : t('home.goalAway', { count: weeklyGoal - practicesThisWeek })}
            </Text>
          </View>
          {/* Moon day info */}
          {daysUntilNextMoonDay() >= 0 && daysUntilNextMoonDay() <= 7 && (
            <View style={s.moonBadge}>
              <Text style={s.moonBadgeText}>
                🌙 {daysUntilNextMoonDay() === 0
                  ? t('home.moonToday')
                  : daysUntilNextMoonDay() === 1
                    ? t('home.moonTomorrow')
                    : t('home.moonInDays', { count: daysUntilNextMoonDay() })}
              </Text>
            </View>
          )}
        </View>

        {/* ═══ 3. YOUR CIRCLE ═══ */}
        <View style={s.circleSection}>
          <View style={[s.circleHeader, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={isRTL ? { alignItems: 'flex-end' } : undefined}>
              <Text style={s.circleTitle}>{t('home.yourCircle')}</Text>
              <Text style={[s.circleSubtitle, isRTL && { textAlign: 'right' }]}>{t('home.circleSubtitle')}</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={s.circleViewAll}>{t('home.viewAll')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.circleScroll}>
            {FAKE_USERS.map((m) => {
              const bc = badgeColor(m.badge);
              return (
                <TouchableOpacity key={m.id} style={s.circleMember} activeOpacity={0.7} onPress={() => openProfile(m.name)}>
                  <View style={s.circleMemberAvatarWrap}>
                    <View style={[s.circleMemberRing, { borderColor: bc.ring }]}>
                      <Image source={{ uri: m.avatarUrl }} style={s.circleMemberAvatar} />
                    </View>
                    <View style={[s.circleBadge, { backgroundColor: bc.bg }]}>
                      {m.badge === 'practiced' && <Ionicons name="checkmark" size={9} color={moss.accent} />}
                      {m.badge === 'streak' && <Ionicons name="flame-outline" size={10} color={moss.amber} />}
                      {m.badge === 'series' && <Ionicons name="leaf-outline" size={10} color={moss.accent} />}
                      <Text style={[s.circleBadgeText, { color: bc.text }]}>{m.badgeText}</Text>
                    </View>
                  </View>
                  <Text style={s.circleMemberName}>{m.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ═══ 4. SANGHA FEED ═══ */}
        <View style={s.feedSection}>
          {feedPosts.slice(0, 3).map((post) => {
            const authorName = post.profiles?.name ?? 'Practitioner';
            const authorAvatar = post.profiles?.avatar_url;
            const timeAgo = getTimeAgo(post.created_at);
            return (
              <View key={post.id} style={s.feedCard}>
                <View style={s.feedCardInner}>
                  <View style={s.feedCardLeft}>
                    <View style={s.feedUserRow}>
                      {authorAvatar ? (
                        <Image source={{ uri: authorAvatar }} style={s.feedAvatar} />
                      ) : (
                        <View style={[s.feedAvatar, { backgroundColor: moss.accent, alignItems: 'center', justifyContent: 'center' }]}>
                          <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>{authorName.charAt(0)}</Text>
                        </View>
                      )}
                      <View>
                        <Text style={s.feedUserName}>{authorName}</Text>
                        <Text style={s.feedTimeAgo}>{timeAgo}</Text>
                      </View>
                    </View>
                    <Text style={s.feedCaption}>{post.caption}</Text>
                    <View style={s.feedStats}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="heart-outline" size={14} color={moss.amber} />
                        <Text style={s.feedHeart}>{post.likes_count ?? 0}</Text>
                      </View>
                    </View>
                  </View>
                  {post.image_url && (
                    <Image source={{ uri: post.image_url }} style={s.feedCardImage} />
                  )}
                </View>
              </View>
            );
          })}
          {feedPosts.length === 0 && (
            <Text style={{ color: moss.muted, fontSize: 14, textAlign: 'center', paddingVertical: 20 }}>
              {t('home.noPostsYet')}
            </Text>
          )}
          <TouchableOpacity onPress={() => router.push('/(tabs)/community')} activeOpacity={0.7}>
            <Text style={s.feedSeeAll}>{t('home.seeAllCommunity')}</Text>
          </TouchableOpacity>
        </View>

        {/* ═══ 5. ASANA OF THE DAY ═══ */}
        <View style={s.asanaCard}>
          <View style={s.asanaHeader}>
            <View style={[s.asanaHeaderTop, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={s.asanaTitle}>{t('home.asanaOfTheDay')}</Text>
              <View style={s.asanaSeriesBadge}>
                <Text style={s.asanaSeriesText}>{asana.series}</Text>
              </View>
            </View>
            <Text style={[s.asanaHint, isRTL && { textAlign: 'right' }]}>{t('home.asanaFocus')}</Text>
          </View>

          {/* Asana image */}
          <View style={s.asanaImageWrap}>
            <Image source={asana.image} style={s.asanaImage} resizeMode="contain" />
            <View style={s.asanaImageOverlay} />
            <View style={s.asanaImageText}>
              <Text style={s.asanaName}>{asana.name}</Text>
              <Text style={s.asanaSubtitle}>{asana.subtitle}</Text>
            </View>
          </View>

          {/* Details */}
          <View style={s.asanaDetails}>
            {/* Benefit tags */}
            <View style={s.asanaTags}>
              {asana.benefits.map((tag) => (
                <View key={tag} style={s.asanaTag}>
                  <Text style={s.asanaTagText}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* Key tips */}
            <View style={s.asanaTips}>
              <Text style={s.asanaTipsTitle}>{t('home.keyTips')}</Text>
              <Text style={s.asanaTipsBody}>{asana.tips}</Text>
            </View>

            {/* Stats row */}
            <View style={s.asanaStatsRow}>
              <View style={s.asanaStat}>
                <Text style={s.asanaStatNum}>{asana.breaths}</Text>
                <Text style={s.asanaStatLabel}>breaths</Text>
              </View>
              <View style={s.asanaStat}>
                <Text style={s.asanaStatNum}>{asana.sides}</Text>
                <Text style={s.asanaStatLabel}>sides</Text>
              </View>
              <View style={[s.asanaStat, { backgroundColor: moss.amberBg }]}>
                <Text style={[s.asanaStatNum, { color: moss.amber }]}>{asana.difficulty}</Text>
                <Text style={s.asanaStatLabel}>difficulty</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* ═══ PRACTICE LOG MODAL ═══ */}
      <Modal visible={showLogModal} transparent animationType="slide" onRequestClose={() => setShowLogModal(false)}>
        <Pressable style={s.logBackdrop} onPress={() => setShowLogModal(false)}>
          <Pressable style={s.logSheet} onPress={() => {}}>
            <View style={s.logHandle} />
            <Text style={s.logTitle}>{t('logModal.howWasPractice')}</Text>

            {/* Series picker */}
            <Text style={s.logLabel}>{t('logModal.seriesLabel')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={s.logChipsRow}>
                {(['primary', 'intermediate', 'advanced_a', 'led_class', 'half_primary'] as const).map((key) => (
                  <TouchableOpacity
                    key={key}
                    style={[s.logChip, logSeries === key && s.logChipActive]}
                    onPress={() => setLogSeries(key)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.logChipText, logSeries === key && s.logChipTextActive]}>
                      {t(`series.${({advanced_a:'advanced_a',led_class:'ledClass',half_primary:'halfPrimary'} as Record<string,string>)[key] || key}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Duration */}
            <Text style={s.logLabel}>{t('logModal.durationLabel')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={s.logChipsRow}>
                {[30, 45, 60, 75, 90, 120].map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[s.logChip, logDuration === d && s.logChipActive]}
                    onPress={() => setLogDuration(d)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.logChipText, logDuration === d && s.logChipTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Notes */}
            <Text style={s.logLabel}>{t('logModal.notesLabel')}</Text>
            <TextInput
              style={s.logInput}
              placeholder={t('logModal.notesPlaceholder')}
              placeholderTextColor={moss.mutedLight}
              multiline
              numberOfLines={3}
              value={logNotes}
              onChangeText={setLogNotes}
            />

            {/* Save */}
            <TouchableOpacity style={s.logSaveBtn} onPress={handleSaveLog} activeOpacity={0.85}>
              <Text style={s.logSaveBtnText}>{t('logModal.savePractice')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Profile card modal ── */}
      <Modal visible={!!profileCard} transparent animationType="fade" onRequestClose={() => setProfileCard(null)}>
        <Pressable style={s.profileBackdrop} onPress={() => setProfileCard(null)}>
          <View style={s.profileCard}>
            {profileCard && (
              <>
                <Image source={{ uri: profileCard.avatarUrl }} style={s.profileAvatar} />
                <Text style={s.profileName}>{profileCard.name}</Text>
                <View style={s.profileBadgeRow}>
                  <View style={s.profileBadge}>
                    <Ionicons name="leaf-outline" size={13} color={moss.accent} />
                    <Text style={s.profileBadgeText}>{profileCard.series}</Text>
                  </View>
                  {profileCard.streak > 0 && (
                    <View style={[s.profileBadge, { backgroundColor: moss.amberBg }]}>
                      <Ionicons name="flame-outline" size={13} color={moss.amber} />
                      <Text style={[s.profileBadgeText, { color: moss.amber }]}>{profileCard.streak}-day streak</Text>
                    </View>
                  )}
                </View>
                <Text style={s.profileBio}>{profileCard.bio}</Text>
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

/* ═══════════════════════════════════════════════════════════════════════════════ */
/* STYLES                                                                        */
/* ═══════════════════════════════════════════════════════════════════════════════ */

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: moss.bg },

  /* ── Top bar ── */
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
  avatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: moss.ring },
  avatarPlaceholder: {
    backgroundColor: moss.accent, alignItems: 'center' as any, justifyContent: 'center' as any,
  },
  avatarLetter: { fontSize: 16, color: '#fff', fontWeight: '600' as any },
  avatarLetterSm: { fontSize: 14, color: '#fff', fontWeight: '600' as any },

  /* ── Menu ── */
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
  menuAvatar: { width: 46, height: 46, borderRadius: 23 },
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

  /* ── Welcome ── */
  welcome: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, lineHeight: 28,
    color: moss.ink, textAlign: 'center' as any,
    paddingVertical: spacing.md,
  },

  /* ── Yogis on mat ── */
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

  /* ── Hero card (10% shorter = 288) ── */
  heroCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    borderRadius: 20, overflow: 'hidden' as any,
    height: 288,
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
    justifyContent: 'flex-end' as any,
    alignItems: 'center' as any,
    paddingHorizontal: 24,
    paddingBottom: 28,
    backgroundColor: 'rgba(138,158,120,0.55)',
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
  heroTitleSmall: {
    fontSize: 24, lineHeight: 30,
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
    backgroundColor: '#C4956A',
    shadowColor: 'rgba(196,149,106,0.45)',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 16,
  },
  heroBtnOnMat: {
    backgroundColor: '#C4956A',
    shadowColor: 'rgba(196,149,106,0.45)',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 16,
  },
  heroBtnText: {
    fontFamily: 'DMSans_700Bold', fontSize: 16, color: '#fff',
    letterSpacing: 1.5, textTransform: 'uppercase' as any,
  },

  /* ── This Week + Goal card ── */
  weekCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    backgroundColor: moss.cardBg, borderRadius: 20,
    padding: spacing.xl,
    ...shadows.sm,
    borderWidth: 1, borderColor: moss.divider,
  },
  weekTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18,
    color: moss.ink, marginBottom: 16,
  },
  weekDays: { flexDirection: 'row' as any, justifyContent: 'space-around' as any, marginBottom: 24 },
  weekDayCol: { alignItems: 'center' as any, gap: 8 },
  weekDayLabel: { fontFamily: 'DMSans_500Medium', fontSize: 12, color: moss.muted },
  weekDayCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center' as any, justifyContent: 'center' as any,
  },
  weekGoalSection: {},
  goalNumbers: { flexDirection: 'row' as any, alignItems: 'baseline' as any, marginBottom: 12 },
  goalBig: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 28,
    fontWeight: '700' as any, color: moss.ink, lineHeight: 32,
  },
  goalSlash: { fontSize: 16, color: moss.muted },
  goalSmall: { fontSize: 16, color: moss.muted },
  goalLabel: { fontSize: 15, color: moss.ink, fontWeight: '500' as any },
  progressBar: {
    width: '100%' as any, height: 8, borderRadius: 4,
    backgroundColor: moss.beige, overflow: 'hidden' as any, marginBottom: 10,
  },
  progressFill: {
    height: '100%' as any, borderRadius: 4,
    backgroundColor: moss.accent,
  },
  goalHint: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: moss.muted },
  moonBadge: {
    marginTop: 14,
    backgroundColor: moss.orangeLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start' as any,
  },
  moonBadgeText: {
    fontFamily: 'DMSans_500Medium', fontSize: 13, color: moss.amber,
  },

  /* ── Your Circle ── */
  circleSection: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
  },
  circleHeader: {
    flexDirection: 'row' as any, justifyContent: 'space-between' as any,
    alignItems: 'flex-start' as any, marginBottom: 4,
  },
  circleTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 20,
    color: moss.ink, lineHeight: 26,
  },
  circleSubtitle: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: moss.muted, marginTop: 2 },
  circleViewAll: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: moss.muted, marginTop: 4 },
  circleScroll: { paddingTop: 12, paddingBottom: 4, gap: 6 },
  circleMember: {
    alignItems: 'center' as any,
    width: 76,
  },
  circleMemberAvatarWrap: { position: 'relative' as any, marginBottom: 4 },
  circleMemberRing: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 2.5, overflow: 'hidden' as any,
  },
  circleMemberAvatar: { width: '100%' as any, height: '100%' as any, borderRadius: 32 },
  circleBadge: {
    position: 'absolute' as any, bottom: -4,
    alignSelf: 'center' as any, left: '50%' as any,
    transform: [{ translateX: -30 }],
    borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2,
    flexDirection: 'row' as any, alignItems: 'center' as any, gap: 2,
    borderWidth: 1, borderColor: moss.cardBg,
    minWidth: 60, justifyContent: 'center' as any,
  },
  circleBadgeText: { fontSize: 8, fontWeight: '600' as any },
  circleMemberName: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: moss.ink },

  /* ── Sangha Feed ── */
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
  feedCardInner: { flexDirection: 'row' as any },
  feedCardLeft: { flex: 1, padding: 16 },
  feedUserRow: {
    flexDirection: 'row' as any, alignItems: 'center' as any, gap: 10, marginBottom: 8,
  },
  feedAvatar: { width: 40, height: 40, borderRadius: 20 },
  feedUserName: { fontFamily: 'DMSans_700Bold', fontSize: 15, color: moss.ink },
  feedTimeAgo: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: moss.muted },
  feedCaption: { fontFamily: 'DMSans_400Regular', fontSize: 15, color: moss.ink, marginBottom: 10 },
  feedStats: { flexDirection: 'row' as any, gap: 14, alignItems: 'center' as any },
  feedHeart: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: moss.heartRed },
  feedComment: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: moss.muted },
  feedCardImage: { width: 130, height: 'auto' as any, minHeight: 120 },
  feedSeeAll: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: moss.muted, marginTop: 12, marginBottom: 4 },

  /* ── Asana of the Day ── */
  asanaCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    backgroundColor: moss.cardBg, borderRadius: 20,
    overflow: 'hidden' as any,
    borderWidth: 1, borderColor: moss.divider,
    ...shadows.sm,
  },
  asanaHeader: { padding: 18, paddingBottom: 14 },
  asanaHeaderTop: {
    flexDirection: 'row' as any, justifyContent: 'space-between' as any,
    alignItems: 'center' as any, marginBottom: 4,
  },
  asanaTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18, color: moss.ink,
  },
  asanaSeriesBadge: {
    backgroundColor: moss.accentFaint, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  asanaSeriesText: { fontSize: 11, fontWeight: '600' as any, color: moss.accent },
  asanaHint: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: moss.muted },
  asanaImageWrap: { position: 'relative' as any, height: 200, backgroundColor: moss.bg },
  asanaImage: { width: '100%' as any, height: '100%' as any },
  asanaImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  asanaImageText: {
    position: 'absolute' as any, bottom: 14, left: 20, right: 20,
  },
  asanaName: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, color: moss.ink,
    lineHeight: 26,
  },
  asanaSubtitle: {
    fontFamily: 'DMSans_400Regular', fontSize: 13, color: moss.muted,
  },
  asanaDetails: { padding: 16, paddingTop: 14 },
  asanaTags: { flexDirection: 'row' as any, flexWrap: 'wrap' as any, gap: 8, marginBottom: 14 },
  asanaTag: {
    backgroundColor: moss.beige, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  asanaTagText: { fontSize: 11, fontWeight: '500' as any, color: moss.inkMid },
  asanaTips: {
    backgroundColor: moss.accentFaint, borderRadius: 12,
    padding: 14, marginBottom: 14,
  },
  asanaTipsTitle: { fontSize: 12, fontWeight: '600' as any, color: moss.accent, marginBottom: 6 },
  asanaTipsBody: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: moss.inkMid, lineHeight: 18 },
  asanaStatsRow: { flexDirection: 'row' as any, gap: 12 },
  asanaStat: {
    flex: 1, backgroundColor: moss.beige, borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center' as any,
  },
  asanaStatNum: { fontSize: 20, fontWeight: '700' as any, color: moss.ink },
  asanaStatLabel: { fontSize: 11, color: moss.muted, fontWeight: '500' as any },

  /* ── Hero state variants ── */
  heroContentOnMat: {
    backgroundColor: 'rgba(59,50,40,0.55)',
    justifyContent: 'center' as any,
    paddingBottom: 0,
  },
  heroContentDone: {
    backgroundColor: 'rgba(138,158,120,0.85)',
  },
  heroOnMatEmoji: {
    fontSize: 48, marginBottom: 8,
  },
  heroBtnFinish: {
    backgroundColor: moss.cardBg,
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12,
  },

  /* ── Practice Log Modal ── */
  logBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end' as any,
  },
  logSheet: {
    backgroundColor: moss.cardBg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingBottom: 40, paddingTop: 12,
    maxHeight: '80%' as any,
  },
  logHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: moss.mutedLight,
    alignSelf: 'center' as any, marginBottom: 16,
  },
  logTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, color: moss.ink,
    marginBottom: 20, textAlign: 'center' as any,
  },
  logLabel: {
    fontFamily: 'DMSans_500Medium', fontSize: 13, color: moss.muted,
    marginBottom: 8, textTransform: 'uppercase' as any, letterSpacing: 0.5,
  },
  logChipsRow: {
    flexDirection: 'row' as any, gap: 8,
  },
  logChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: moss.beige, borderWidth: 1.5, borderColor: 'transparent',
  },
  logChipActive: {
    backgroundColor: moss.accentLight, borderColor: moss.accent,
  },
  logChipText: {
    fontFamily: 'DMSans_500Medium', fontSize: 14, color: moss.inkMid,
  },
  logChipTextActive: {
    color: moss.accent, fontWeight: '600' as any,
  },
  logInput: {
    backgroundColor: moss.beige, borderRadius: 14, padding: 14,
    fontFamily: 'DMSans_400Regular', fontSize: 15, color: moss.ink,
    minHeight: 80, textAlignVertical: 'top' as any, marginBottom: 20,
  },
  logSaveBtn: {
    backgroundColor: moss.accent, borderRadius: 28, paddingVertical: 16,
    alignItems: 'center' as any,
    shadowColor: 'rgba(138,158,120,0.4)',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12,
  },
  logSaveBtnText: {
    fontFamily: 'DMSans_700Bold', fontSize: 17, color: '#fff',
    letterSpacing: 0.5,
  },

  /* ── Profile card modal ── */
  profileBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center' as any,
    alignItems: 'center' as any,
    padding: 24,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center' as any,
    width: '100%' as any,
    maxWidth: 320,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24,
    elevation: 8,
  },
  profileAvatar: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, borderColor: moss.accent,
    marginBottom: 14,
  },
  profileName: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 22, color: moss.ink, marginBottom: 10,
  },
  profileBadgeRow: {
    flexDirection: 'row' as any, gap: 8, marginBottom: 14,
  },
  profileBadge: {
    flexDirection: 'row' as any, alignItems: 'center' as any, gap: 5,
    backgroundColor: moss.accentLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14,
  },
  profileBadgeText: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: moss.accent,
  },
  profileBio: {
    fontFamily: 'DMSans_400Regular', fontSize: 14, color: moss.inkMid,
    textAlign: 'center' as any, lineHeight: 20, marginBottom: 18,
  },
  profileCloseBtn: {
    backgroundColor: moss.accent, borderRadius: 14,
    paddingHorizontal: 28, paddingVertical: 10,
  },
  profileCloseBtnText: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: '#fff',
  },
});
