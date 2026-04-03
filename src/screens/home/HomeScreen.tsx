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
import { getPracticeLogs, getPracticingNow, setPracticingNow, getFeed, signOut, logPractice, supabase } from '@/lib/supabase';
import AppLogo from '@/components/AppLogo';
import AppHeader from '@/components/AppHeader';
import { Ionicons } from '@expo/vector-icons';
import { getAsanaOfTheDay, getSeriesColor, type AsanaPose } from '@/data/asanaPoses';
import he from '@/i18n/locales/he';

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
}[] = [
  { id: 'fake-noa', name: 'נועה לוי', avatarUrl: 'https://i.pravatar.cc/150?img=1', series: 'primary', streak: 142, practicedToday: true, bio: 'מורה ליוגה ומתרגלת אשטנגה 6 שנים. מתרגלת בשאלה בפלורנטין.', badge: 'streak', badgeText: '142 days', feedCaption: 'תרגול בוקר מושלם 🌅 הסדרה הראשונה זרמה היום בצורה מדהימה', feedImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop', feedTime: new Date(Date.now() - 2 * 3600000).toISOString(), feedLikes: 12, feedComments: 3 },
  { id: 'fake-ori', name: 'אורי כהן', avatarUrl: 'https://i.pravatar.cc/150?img=3', series: 'primary', streak: 8, practicedToday: true, bio: 'מתכנת שהתחיל אשטנגה לפני 8 חודשים. עדיין נאבק עם תנוחות הישיבה.', badge: 'practiced', badgeText: 'Today', feedCaption: 'סוף סוף הצלחתי לתפוס את האצבעות בג׳אנו שירשאסנה! 🎉', feedImage: '', feedTime: new Date(Date.now() - 5 * 3600000).toISOString(), feedLikes: 18, feedComments: 7 },
  { id: 'fake-michal', name: 'מיכל אברהם', avatarUrl: 'https://i.pravatar.cc/150?img=5', series: 'intermediate', streak: 365, practicedToday: true, bio: 'פסיכולוגית, אמא לשלושה. מתרגלת 12 שנה. התחילה אצל פטבי ג׳ויס.', badge: 'streak', badgeText: '1 year', feedCaption: 'קאפוטאסנה — כל יום מחדש. הנשימה היא המפתח 🙏', feedImage: '', feedTime: new Date(Date.now() - 8 * 3600000).toISOString(), feedLikes: 24, feedComments: 5 },
  { id: 'fake-yotam', name: 'יותם ברק', avatarUrl: 'https://i.pravatar.cc/150?img=8', series: 'sun_sals', streak: 21, practicedToday: false, bio: 'מדריך צלילה באילת. מתרגל על החוף בזריחה.', badge: 'practiced', badgeText: 'Yesterday', feedCaption: 'ברכות שמש על חוף אלמוג 🌊☀️ אין כמו להתרגל עם רגליים בחול', feedImage: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600&h=400&fit=crop', feedTime: new Date(Date.now() - 18 * 3600000).toISOString(), feedLikes: 31, feedComments: 9 },
  { id: 'fake-rinat', name: 'רינת שמעוני', avatarUrl: 'https://i.pravatar.cc/150?img=9', series: 'primary', streak: 56, practicedToday: true, bio: 'ארכיטקטית מחיפה. מתרגלת 4 שנים בבית.', badge: 'streak', badgeText: '56 days', feedCaption: 'גיליתי שכשמיישרים את הירכיים בטריקונאסנה הכל משתנה', feedImage: '', feedTime: new Date(Date.now() - 3 * 3600000).toISOString(), feedLikes: 8, feedComments: 2 },
  { id: 'fake-daniel', name: 'דניאל פרידמן', avatarUrl: 'https://i.pravatar.cc/150?img=11', series: 'primary', streak: 34, practicedToday: false, bio: 'שף ובעל מסעדה. מתרגל ב-10 בבוקר אחרי משמרות לילה.', badge: 'practiced', badgeText: 'Yesterday', feedCaption: 'תרגול מאוחר + ארוחת בוקר בריאה = יום מושלם 🍳🧘‍♂️', feedImage: '', feedTime: new Date(Date.now() - 26 * 3600000).toISOString(), feedLikes: 15, feedComments: 4 },
  { id: 'fake-talia', name: 'טליה וולף', avatarUrl: 'https://i.pravatar.cc/150?img=10', series: 'short', streak: 89, practicedToday: true, bio: 'חקלאית אורגנית בגליל. אמא ל-4. מתאימה את התרגול לקצב החיים.', badge: 'streak', badgeText: '89 days', feedCaption: 'תרגול של 40 דקות בין הגן לרפת. לא צריך יותר 🌿', feedImage: '', feedTime: new Date(Date.now() - 4 * 3600000).toISOString(), feedLikes: 22, feedComments: 6 },
  { id: 'fake-ido', name: 'עידו נחום', avatarUrl: 'https://i.pravatar.cc/150?img=12', series: 'primary', streak: 512, practicedToday: true, bio: 'רופא משפחה, מתרגל 18 שנה. נוסע למייסור כל שנתיים.', badge: 'streak', badgeText: '512 days', feedCaption: 'אחרי 18 שנה של תרגול, סופטה קורמאסנה עדיין מלמדת אותי משהו חדש', feedImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop', feedTime: new Date(Date.now() - 6 * 3600000).toISOString(), feedLikes: 35, feedComments: 11 },
  { id: 'fake-shira', name: 'שירה מזרחי', avatarUrl: 'https://i.pravatar.cc/150?img=16', series: 'sun_sals', streak: 3, practicedToday: false, bio: 'סטודנטית לאמנות, 3 חודשים של אשטנגה. מציירת תנוחות.', badge: 'practiced', badgeText: '3 days ago', feedCaption: 'ציירתי את ויראבהדראסנה B 🎨 מי רוצה לראות?', feedImage: '', feedTime: new Date(Date.now() - 48 * 3600000).toISOString(), feedLikes: 27, feedComments: 8 },
  { id: 'fake-amir', name: 'אמיר חדד', avatarUrl: 'https://i.pravatar.cc/150?img=13', series: 'primary', streak: 12, practicedToday: true, bio: 'עורך דין ואב טרי. מנסה לשמור על הקביעות עם תינוק בבית.', badge: 'practiced', badgeText: 'Today', feedCaption: 'התינוקת התעוררה באמצע נאוואסנה. עשיתי אותה עם תינוקת על הבטן 😂', feedImage: '', feedTime: new Date(Date.now() - 1 * 3600000).toISOString(), feedLikes: 42, feedComments: 14 },
  { id: 'fake-sarah', name: 'Sarah Mitchell', avatarUrl: 'https://i.pravatar.cc/150?img=20', series: 'primary', streak: 204, practicedToday: true, bio: 'Yoga teacher in London. Spent 3 months in Mysore with Sharath.', badge: 'streak', badgeText: '204 days', feedCaption: 'Morning Mysore at the shala. Nothing beats the energy of practicing together 🕉️', feedImage: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&h=400&fit=crop', feedTime: new Date(Date.now() - 7 * 3600000).toISOString(), feedLikes: 19, feedComments: 4 },
  { id: 'fake-david', name: 'David Stern', avatarUrl: 'https://i.pravatar.cc/150?img=14', series: 'intermediate', streak: 730, practicedToday: true, bio: 'Former Wall Street trader, now full-time yoga teacher in Brooklyn. 15 years of practice.', badge: 'streak', badgeText: '2 years', feedCaption: 'Kapo day. The backbend that changed everything. Trust the breath. 🔥', feedImage: '', feedTime: new Date(Date.now() - 10 * 3600000).toISOString(), feedLikes: 28, feedComments: 6 },
];

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
  const [logFeeling, setLogFeeling] = useState<string | null>(null);
  const [profileCard, setProfileCard] = useState<{ name: string; avatarUrl: string; series: string; streak: number; bio: string } | null>(null);
  const [realMembers, setRealMembers] = useState<{ id: string; name: string; avatar_url: string | null; series: string; streak: number; bio: string | null }[]>([]);

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
  const heHome = (he as any)?.home ?? {};
  const asana = {
    name: todaysAsana.sanskrit,
    subtitle: isRTL ? (heHome.poseEnglish?.[todaysAsana.id] ?? todaysAsana.english) : todaysAsana.english,
    series: isRTL ? (heHome.series?.[todaysAsana.series] ?? todaysAsana.series) : todaysAsana.series,
    image: todaysAsana.image,
    benefits: isRTL ? todaysAsana.benefits.map((b: string) => heHome.benefits?.[b] ?? b) : todaysAsana.benefits,
    tips: isRTL ? (heHome.poseTips?.[todaysAsana.id] ?? todaysAsana.tips) : todaysAsana.tips,
    breaths: todaysAsana.breaths,
    sides: isRTL ? (heHome.sides?.[todaysAsana.sides] ?? todaysAsana.sides) : todaysAsana.sides,
    difficulty: isRTL ? (heHome.difficulty?.[todaysAsana.difficulty] ?? todaysAsana.difficulty) : todaysAsana.difficulty,
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

  // Merged feed for Home: real posts + all fake posts, sorted newest first, limit 2
  const homeFeed = [
    ...feedPosts.map((p) => ({
      id: p.id,
      userName: p.profiles?.name ?? 'Practitioner',
      userAvatar: p.profiles?.avatar_url ?? null,
      caption: p.caption ?? '',
      imageUrl: p.image_url,
      likesCount: p.likes_count ?? 0,
      commentsCount: (p as any).comments_count ?? 0,
      createdAt: p.created_at,
    })),
    ...FAKE_USERS.map((u) => ({
      id: u.id,
      userName: u.name,
      userAvatar: u.avatarUrl,
      caption: u.feedCaption,
      imageUrl: u.feedImage || null,
      likesCount: u.feedLikes,
      commentsCount: u.feedComments,
      createdAt: u.feedTime,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
   .slice(0, 2);

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


  // ── Data fetching ──
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
      // Don't force isPracticing — user should land in idle state,
      // ready to start a new session. The social circle still shows
      // them as "practiced today" via loggedSeries / practicedToday.
    }
  }, [practiceLogs]);

  // Refetch data every time screen gains focus
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

        {/* ═══ 1. QUOTE STRIP + ACTION CARD (C4) ═══ */}
        {practiceState === 'onMat' ? (
          /* On-mat state: green card with timer */
          <View style={s.onMatCard}>
            <Ionicons name="leaf" size={28} color="rgba(255,255,255,0.85)" />
            <Text style={s.onMatTitle}>I'm on the mat!</Text>
            <Text style={s.onMatSub}>
              {elapsedMin < 1 ? 'Just started' : `${elapsedMin} min in`}
            </Text>
            <TouchableOpacity
              style={s.onMatBtn}
              onPress={handlePracticeButton}
              activeOpacity={0.85}
            >
              <Text style={s.onMatBtnText}>I'M DONE — LOG IT</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Quote strip */}
            <View style={s.quoteStrip}>
              <Text style={s.quoteMark}>"</Text>
              <View style={s.quoteBody}>
                <Text style={s.quoteText}>{guruWisdom.quote}</Text>
                <Text style={s.quoteAuthor}>— {guruWisdom.guru}</Text>
              </View>
            </View>

            {/* Action card — outlined */}
            <TouchableOpacity
              style={s.actionCard}
              onPress={handlePracticeButton}
              activeOpacity={0.85}
            >
              <View style={s.actionIconWrap}>
                <Ionicons name="play" size={22} color={moss.accent} />
              </View>
              <View style={s.actionTextWrap}>
                <Text style={s.actionTitle}>Start Your Practice</Text>
                <Text style={s.actionSub}>Tap to begin tracking your session</Text>
              </View>
              <Text style={s.actionArrow}>›</Text>
            </TouchableOpacity>
          </>
        )}

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
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(tabs)/community')}>
              <Text style={s.circleViewAll}>{t('home.viewAll')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.circleScroll, isRTL && { flexDirection: 'row-reverse' }]}>
            {/* Real members from Supabase */}
            {realMembers.map((rm) => (
              <TouchableOpacity key={rm.id} style={s.circleMember} activeOpacity={0.7} onPress={() => setProfileCard({ name: rm.name, avatarUrl: rm.avatar_url ?? 'https://i.pravatar.cc/150', series: rm.series, streak: rm.streak, bio: rm.bio ?? '' })}>
                <View style={s.circleMemberAvatarWrap}>
                  <View style={[s.circleMemberRing, { borderColor: rm.streak > 30 ? moss.amber : moss.accent }]}>
                    {rm.avatar_url ? (
                      <Image source={{ uri: rm.avatar_url }} style={s.circleMemberAvatar} />
                    ) : (
                      <View style={[s.circleMemberAvatar, { backgroundColor: moss.accent, alignItems: 'center', justifyContent: 'center' }]}>
                        <Text style={{ fontSize: 22, color: '#fff', fontWeight: '600' }}>{rm.name.charAt(0)}</Text>
                      </View>
                    )}
                  </View>
                  {rm.streak > 0 && (
                    <View style={[s.circleBadge, { backgroundColor: '#FFF5EC' }]}>
                      <Ionicons name="flame-outline" size={10} color={moss.amber} />
                      <Text style={[s.circleBadgeText, { color: moss.amber }]}>{rm.streak}d</Text>
                    </View>
                  )}
                </View>
                <Text style={s.circleMemberName}>{rm.name.split(' ')[0]}</Text>
              </TouchableOpacity>
            ))}
            {/* Fake demo users */}
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

        {/* ═══ 4. SANGHA FEED (2 most recent) ═══ */}
        <View style={s.feedSection}>
          {homeFeed.map((post) => {
            const timeAgo = getTimeAgo(post.createdAt);
            return (
              <TouchableOpacity
                key={post.id}
                style={s.feedCard}
                activeOpacity={0.85}
                onPress={() => router.push('/(tabs)/community')}
              >
                {/* Header */}
                <View style={[s.feedUserRow, isRTL && { flexDirection: 'row-reverse' }]}>
                  {post.userAvatar ? (
                    <Image source={{ uri: post.userAvatar }} style={s.feedAvatar} />
                  ) : (
                    <View style={[s.feedAvatar, { backgroundColor: moss.accent, alignItems: 'center', justifyContent: 'center' }]}>
                      <Text style={{ fontSize: 16, color: '#fff', fontWeight: '600' }}>{post.userName.charAt(0)}</Text>
                    </View>
                  )}
                  <View style={[{ flex: 1 }, isRTL && { alignItems: 'flex-end' }]}>
                    <Text style={s.feedUserName}>{post.userName}</Text>
                    <Text style={s.feedTimeAgo}>{timeAgo}</Text>
                  </View>
                </View>
                {/* Caption */}
                <Text style={[s.feedCaption, isRTL && { textAlign: 'right' }]} numberOfLines={3}>{post.caption}</Text>
                {/* Image */}
                {post.imageUrl ? (
                  <Image source={{ uri: post.imageUrl }} style={s.feedPostImage} resizeMode="cover" />
                ) : null}
                {/* Footer */}
                <View style={[s.feedStats, isRTL && { flexDirection: 'row-reverse' }]}>
                  <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6 }, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Ionicons name="heart-outline" size={18} color="#C4956A" />
                    <Text style={s.feedHeart}>{post.likesCount}</Text>
                  </View>
                  {post.commentsCount > 0 && (
                    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6 }, isRTL && { flexDirection: 'row-reverse' }]}>
                      <Ionicons name="chatbubble-outline" size={16} color="#7A6E60" />
                      <Text style={s.feedHeart}>{post.commentsCount}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
          {homeFeed.length === 0 && (
            <Text style={{ color: '#4A3F36', fontSize: 15, textAlign: 'center', paddingVertical: 20 }}>
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
              <Text style={[s.asanaTipsTitle, isRTL && { textAlign: 'right' }]}>{t('home.keyTips')}</Text>
              <Text style={[s.asanaTipsBody, isRTL && { textAlign: 'right' }]}>{asana.tips}</Text>
            </View>

            {/* Stats row */}
            <View style={s.asanaStatsRow}>
              <View style={s.asanaStat}>
                <Text style={s.asanaStatNum}>{asana.breaths}</Text>
                <Text style={s.asanaStatLabel}>{t('home.breathsLabel')}</Text>
              </View>
              <View style={s.asanaStat}>
                <Text style={s.asanaStatNum}>{asana.sides}</Text>
                <Text style={s.asanaStatLabel}>{t('home.sidesLabel')}</Text>
              </View>
              <View style={[s.asanaStat, { backgroundColor: moss.amberBg }]}>
                <Text style={[s.asanaStatNum, { color: moss.amber }]}>{asana.difficulty}</Text>
                <Text style={s.asanaStatLabel}>{t('home.difficultyLabel')}</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* ═══ PRACTICE LOG MODAL ═══ */}
      <Modal visible={showLogModal} transparent animationType="slide" onRequestClose={() => setShowLogModal(false)}>
        <Pressable style={s.logBackdrop} onPress={() => setShowLogModal(false)}>
          <Pressable style={s.logSheet} onPress={() => {}}>
            {/* Header with title + close */}
            <View style={s.logHeader}>
              <Text style={s.logTitle}>{t('logModal.howWasPractice')}</Text>
              <TouchableOpacity onPress={() => setShowLogModal(false)}>
                <Ionicons name="close" size={22} color={moss.muted} />
              </TouchableOpacity>
            </View>

            {/* Series picker */}
            <Text style={s.logLabel}>{t('logModal.seriesLabel')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={s.logChipsRow}>
                {(['primary', 'intermediate', 'advanced_a', 'led_class', 'half_primary'] as const).map((key) => (
                  <TouchableOpacity
                    key={key}
                    style={[s.logChip, logSeries === key && s.logChipActive]}
                    onPress={() => setLogSeries(key)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={({primary:'fitness-outline',intermediate:'flash-outline',advanced_a:'rocket-outline',led_class:'people-outline',half_primary:'timer-outline'} as any)[key] || 'fitness-outline'}
                      size={14}
                      color={logSeries === key ? '#fff' : moss.inkMid}
                    />
                    <Text style={[s.logChipText, logSeries === key && s.logChipTextActive]}>
                      {t(`series.${({advanced_a:'advanced_a',led_class:'ledClass',half_primary:'halfPrimary'} as Record<string,string>)[key] || key}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Duration */}
            <Text style={s.logLabel}>{t('logModal.durationLabel')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
              <View style={s.logChipsRow}>
                {[30, 45, 60, 75, 90, 120].map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[s.logDurChip, logDuration === d && s.logDurChipActive]}
                    onPress={() => setLogDuration(d)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.logDurChipText, logDuration === d && s.logDurChipTextActive]}>{d}m</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            {/* +/- fine-tune */}
            <View style={s.logDurAdjust}>
              <TouchableOpacity style={s.logDurBtn} onPress={() => setLogDuration(Math.max(5, logDuration - 5))}>
                <Ionicons name="remove" size={18} color={moss.ink} />
              </TouchableOpacity>
              <Text style={s.logDurValue}>{logDuration} min</Text>
              <TouchableOpacity style={s.logDurBtn} onPress={() => setLogDuration(logDuration + 5)}>
                <Ionicons name="add" size={18} color={moss.ink} />
              </TouchableOpacity>
            </View>

            {/* Feeling */}
            <Text style={s.logLabel}>{t('logModal.feelingLabel')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={s.logChipsRow}>
                {(['strong', 'steady', 'challenging', 'low_energy', 'blissful'] as const).map((key) => {
                  const feelingIcons: Record<string, keyof typeof Ionicons.glyphMap> = { strong: 'flash', steady: 'leaf', challenging: 'flame', low_energy: 'moon', blissful: 'sunny' };
                  const feelingColors: Record<string, string> = { strong: '#E07A3A', steady: '#6B9E6B', challenging: '#D05555', low_energy: '#7B8EC2', blissful: '#E6A817' };
                  const active = logFeeling === key;
                  const fc = feelingColors[key];
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[s.logChip, active && { backgroundColor: fc, borderColor: fc }]}
                      onPress={() => setLogFeeling(active ? null : key)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={feelingIcons[key]} size={18} color={active ? '#fff' : fc} />
                      <Text style={[s.logChipText, active && s.logChipTextActive]}>
                        {t(`logModal.mood${key.charAt(0).toUpperCase() + key.slice(1).replace(/_([a-z])/g, (_, c) => c.toUpperCase())}`)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
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
  /* ── C4: Quote strip ── */
  quoteStrip: {
    marginHorizontal: spacing.lg, marginBottom: 10,
    backgroundColor: 'rgba(138,158,120,0.06)',
    borderRadius: 14,
    padding: 14,
    paddingLeft: 16,
    flexDirection: 'row' as any,
    gap: 10,
    alignItems: 'flex-start' as any,
  },
  quoteMark: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 30, color: moss.accent, lineHeight: 30, marginTop: -2,
  },
  quoteBody: { flex: 1 },
  quoteText: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 15, color: moss.inkMid, lineHeight: 22, fontStyle: 'italic' as any,
  },
  quoteAuthor: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13, color: moss.muted, marginTop: 4,
  },

  /* ── C4: Outlined action card ── */
  actionCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    backgroundColor: moss.cardBg,
    borderWidth: 2, borderColor: moss.accent,
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row' as any,
    alignItems: 'center' as any,
    gap: 14,
  },
  actionIconWrap: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(138,158,120,0.12)',
    alignItems: 'center' as any, justifyContent: 'center' as any,
  },
  actionTextWrap: { flex: 1 },
  actionTitle: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 17, color: moss.ink, marginBottom: 2,
  },
  actionSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13, color: moss.muted,
  },
  actionArrow: {
    fontSize: 22, color: moss.accent,
  },

  /* ── On-mat state card ── */
  onMatCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    backgroundColor: 'rgba(59,50,40,0.88)',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center' as any,
  },
  onMatTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 26, color: '#fff', marginTop: 8, marginBottom: 4,
  },
  onMatSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 20,
  },
  onMatBtn: {
    backgroundColor: moss.cardBg, borderRadius: 28,
    paddingVertical: 14, paddingHorizontal: 44,
    alignItems: 'center' as any,
    shadowColor: 'rgba(0,0,0,0.15)',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12,
  },
  onMatBtnText: {
    fontFamily: 'DMSans_700Bold', fontSize: 16, color: moss.ink,
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
  weekDayLabel: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: moss.muted },
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
  goalHint: { fontFamily: 'DMSans_400Regular', fontSize: 15, color: moss.muted },
  moonBadge: {
    marginTop: 14,
    backgroundColor: moss.orangeLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start' as any,
  },
  moonBadgeText: {
    fontFamily: 'DMSans_500Medium', fontSize: 14, color: moss.amber,
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
  circleSubtitle: { fontFamily: 'DMSans_400Regular', fontSize: 15, color: moss.muted, marginTop: 2 },
  circleViewAll: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: moss.muted, marginTop: 4 },
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
  circleMemberName: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: moss.ink },

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
    marginBottom: 14, overflow: 'hidden' as any,
  },
  feedUserRow: {
    flexDirection: 'row' as any, alignItems: 'center' as any, gap: 12,
    padding: 14, paddingBottom: 10,
  },
  feedAvatar: { width: 42, height: 42, borderRadius: 21 },
  feedUserName: { fontFamily: 'DMSans_600SemiBold', fontSize: 16, color: '#2A2420' },
  feedTimeAgo: { fontFamily: 'DMSans_400Regular', fontSize: 15, color: '#7A6E60' },
  feedCaption: {
    fontFamily: 'DMSans_400Regular', fontSize: 16, color: '#2A2420',
    lineHeight: 24, paddingHorizontal: 14, paddingBottom: 10,
  },
  feedPostImage: { width: '100%' as any, height: 200, backgroundColor: moss.divider },
  feedStats: {
    flexDirection: 'row' as any, alignItems: 'center' as any,
    padding: 12, gap: 16,
  },
  feedHeart: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: '#4A3F36' },
  feedSeeAll: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: moss.accent, marginTop: 12, marginBottom: 4 },

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
  asanaSeriesText: { fontSize: 15, fontWeight: '600' as any, color: moss.accent },
  asanaHint: { fontFamily: 'DMSans_400Regular', fontSize: 16, color: moss.muted },
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
    fontFamily: 'DMSans_400Regular', fontSize: 16, color: moss.inkMid,
  },
  asanaDetails: { padding: 16, paddingTop: 14 },
  asanaTags: { flexDirection: 'row' as any, flexWrap: 'wrap' as any, gap: 8, marginBottom: 14 },
  asanaTag: {
    backgroundColor: moss.beige, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  asanaTagText: { fontSize: 16, fontWeight: '500' as any, color: moss.ink },
  asanaTips: {
    backgroundColor: moss.accentFaint, borderRadius: 12,
    padding: 16, marginBottom: 14,
  },
  asanaTipsTitle: { fontSize: 16, fontWeight: '600' as any, color: moss.accent, marginBottom: 6 },
  asanaTipsBody: { fontFamily: 'DMSans_400Regular', fontSize: 16, color: moss.ink, lineHeight: 24 },
  asanaStatsRow: { flexDirection: 'row' as any, gap: 12 },
  asanaStat: {
    flex: 1, backgroundColor: moss.beige, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center' as any,
  },
  asanaStatNum: { fontSize: 22, fontWeight: '700' as any, color: moss.ink },
  asanaStatLabel: { fontSize: 15, color: moss.inkMid, fontWeight: '500' as any },

  /* (hero state variants removed — now in onMat styles above) */

  /* ── Practice Log Modal (matches journal edit modal) ── */
  logBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center' as any, alignItems: 'center' as any,
  },
  logSheet: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20,
    width: '92%' as any, maxWidth: 400, maxHeight: '85%' as any,
  },
  logHeader: {
    flexDirection: 'row' as any, justifyContent: 'space-between' as any,
    alignItems: 'center' as any, marginBottom: 20,
  },
  logTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 20, color: moss.ink,
  },
  logLabel: {
    fontSize: 14, fontWeight: '600' as any, color: moss.muted,
    marginBottom: 8, marginTop: 4,
  },
  logChipsRow: {
    flexDirection: 'row' as any, gap: 8,
  },
  logChip: {
    flexDirection: 'row' as any, alignItems: 'center' as any, gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 24,
    borderWidth: 1.5, borderColor: '#EDE5D8', backgroundColor: '#FAF8F5',
  },
  logChipActive: {
    backgroundColor: moss.accent, borderColor: moss.accent,
  },
  logChipText: {
    fontFamily: 'DMSans_500Medium', fontSize: 14, color: moss.inkMid,
  },
  logChipTextActive: {
    color: '#fff', fontWeight: '600' as any,
  },
  logDurChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 24,
    borderWidth: 1.5, borderColor: '#EDE5D8', backgroundColor: '#FAF8F5',
  },
  logDurChipActive: {
    backgroundColor: moss.accent, borderColor: moss.accent,
  },
  logDurChipText: {
    fontFamily: 'DMSans_500Medium', fontSize: 14, color: moss.inkMid,
  },
  logDurChipTextActive: {
    color: '#fff', fontWeight: '600' as any,
  },
  logDurAdjust: {
    flexDirection: 'row' as any, alignItems: 'center' as any,
    justifyContent: 'center' as any, gap: 16, marginVertical: 6,
  },
  logDurBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#EDE5D8',
    alignItems: 'center' as any, justifyContent: 'center' as any,
  },
  logDurValue: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, color: moss.ink,
    minWidth: 70, textAlign: 'center' as any,
  },
  logInput: {
    borderWidth: 1, borderColor: '#EDE5D8', borderRadius: 12,
    padding: 12, minHeight: 70, fontSize: 14, color: moss.ink,
    fontFamily: 'DMSans_400Regular', textAlignVertical: 'top' as any,
    backgroundColor: '#FAF8F5', marginBottom: 12,
  },
  logSaveBtn: {
    backgroundColor: moss.accent, borderRadius: 14, paddingVertical: 14,
    alignItems: 'center' as any, marginTop: 4,
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
    fontFamily: 'DMSans_600SemiBold', fontSize: 16, color: moss.accent,
  },
  profileBio: {
    fontFamily: 'DMSans_400Regular', fontSize: 16, color: '#2A2420',
    textAlign: 'center' as any, lineHeight: 24, marginBottom: 18,
  },
  profileCloseBtn: {
    backgroundColor: moss.accent, borderRadius: 14,
    paddingHorizontal: 28, paddingVertical: 10,
  },
  profileCloseBtnText: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 16, color: '#fff',
  },
});
