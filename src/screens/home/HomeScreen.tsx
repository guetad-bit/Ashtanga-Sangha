// src/screens/home/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Pressable, Modal,
  StyleSheet, Image, RefreshControl, ImageBackground, Linking, Dimensions,
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

/* ââ Warm palette (matching Community page redesign) ââââââââââââââââââââââââ */
const warm = {
  bg:          '#FAF8F5',
  cardBg:      '#FFFFFF',
  headerBg:    '#FFFFFF',
  ink:         '#3D3229',
  inkMid:      '#5C4F42',
  muted:       '#8B7D6E',
  mutedLight:  '#B5A899',
  accent:      '#C47B3F',
  accentLight: '#F0E0CC',
  sage:        '#7A8B5E',
  sageBg:      '#E8EDDF',
  gold:        '#B8944A',
  goldBg:      '#F5EDD8',
  amber:       '#C4874D',
  amberBg:     '#F8E8D4',
  terra:       '#A0704C',
  divider:     '#EDE5D8',
  orange:      '#E8834A',
  orangeLight: '#FFF0E6',
  white:       '#FFFFFF',
  ring:        '#D4A76A',
  heartRed:    '#E05555',
  blue:        '#5B8DB8',
  blueBg:      '#E8F0F8',
};

const SCREEN_WIDTH = Dimensions.get('window').width;

// ââ Data ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Asana of the Day â Ashtanga Primary Series
const ASANAS = [
  { sanskrit: 'Padangusthasana', english: 'Big Toe Pose', tip: 'Grip your big toes, fold from the hips. Let gravity do the work.', youtube: 'https://www.youtube.com/watch?v=8QTLriT8mwA' },
  { sanskrit: 'Utthita Trikonasana', english: 'Extended Triangle', tip: 'Extend through both arms equally. Keep the chest open to the sky.', youtube: 'https://www.youtube.com/watch?v=KaTv00w1hqk' },
  { sanskrit: 'Parivrtta Parsvakonasana', english: 'Revolved Side Angle', tip: 'Ground the back heel. Twist from your core, not your shoulders.', youtube: 'https://www.youtube.com/watch?v=HKucylP9I3s' },
  { sanskrit: 'Prasarita Padottanasana', english: 'Wide-Legged Forward Fold', tip: 'Feet parallel, crown of head reaching to the floor.', youtube: 'https://www.youtube.com/watch?v=n5AQZO4P6h0' },
  { sanskrit: 'Utthita Hasta Padangusthasana', english: 'Hand-to-Big-Toe Pose', tip: 'Drishti is forward. The standing leg is your foundation.', youtube: 'https://www.youtube.com/watch?v=3MSbUSseP_E' },
  { sanskrit: 'Ardha Baddha Padmottanasana', english: 'Half Bound Lotus Forward Fold', tip: 'If the bind doesn\'t come, hold the knee instead.', youtube: 'https://www.youtube.com/watch?v=sm75URCiOhI' },
  { sanskrit: 'Utkatasana', english: 'Chair Pose', tip: 'Sit deep into the pose. Root down through the heels, reach up through the arms.', youtube: 'https://www.youtube.com/watch?v=KaTv00w1hqk' },
  { sanskrit: 'Marichyasana A', english: 'Sage Marichi\'s Pose A', tip: 'Heel close to the sit bone. Lengthen first, then fold.', youtube: 'https://www.youtube.com/watch?v=GsRLDgwqFnY' },
  { sanskrit: 'Marichyasana C', english: 'Sage Marichi\'s Twist C', tip: 'Inhale to grow tall, exhale to twist deeper.', youtube: 'https://www.youtube.com/watch?v=K3D_3XL_UmM' },
  { sanskrit: 'Navasana', english: 'Boat Pose', tip: 'Five rounds, five breaths. Engage your bandhas between each one.', youtube: 'https://www.youtube.com/watch?v=5dUOD0LeU3k' },
  { sanskrit: 'Bhujapidasana', english: 'Shoulder Pressing Pose', tip: 'The lift comes from bandha, not brute strength.', youtube: 'https://www.youtube.com/watch?v=KMTkPAihuSw' },
  { sanskrit: 'Kurmasana', english: 'Tortoise Pose', tip: 'Surrender into the fold. This posture teaches patience.', youtube: 'https://www.youtube.com/watch?v=mz8V56B6tC8' },
  { sanskrit: 'Urdhva Dhanurasana', english: 'Upward Bow', tip: 'Push evenly through hands and feet. Let the heart open skyward.', youtube: 'https://www.youtube.com/watch?v=gxyekLi3oS8' },
  { sanskrit: 'Sirsasana', english: 'Headstand', tip: 'Foundation in the forearms, not the head. Stay for 25 breaths.', youtube: 'https://www.youtube.com/watch?v=EDXgOM_I8qY' },
  { sanskrit: 'Surya Namaskara A', english: 'Sun Salutation A', tip: 'Nine vinyasas. Let each breath guide the movement â never rush.', youtube: 'https://www.youtube.com/watch?v=aUgtMaAZzW0' },
  { sanskrit: 'Paschimottanasana', english: 'Seated Forward Fold', tip: 'Inhale to lengthen the spine, exhale to fold deeper. Surrender, don\'t force.', youtube: 'https://www.youtube.com/watch?v=5dUOD0LeU3k' },
  { sanskrit: 'Janu Sirsasana A', english: 'Head-to-Knee Pose A', tip: 'Rotate the bent knee slightly back. Square the hips as much as possible.', youtube: 'https://www.youtube.com/watch?v=GsRLDgwqFnY' },
  { sanskrit: 'Marichyasana B', english: 'Sage Marichi\'s Pose B', tip: 'Set the lotus first. Then wrap and bind. Patience opens the hip.', youtube: 'https://www.youtube.com/watch?v=GsRLDgwqFnY' },
  { sanskrit: 'Marichyasana D', english: 'Sage Marichi\'s Twist D', tip: 'Half lotus and twist together. The gateway posture of the primary series.', youtube: 'https://www.youtube.com/watch?v=K3D_3XL_UmM' },
  { sanskrit: 'Baddha Konasana', english: 'Bound Angle Pose', tip: 'Bring the soles together, fold the torso forward. Let the inner thighs soften.', youtube: 'https://www.youtube.com/watch?v=sm75URCiOhI' },
  { sanskrit: 'Salamba Sarvangasana', english: 'Shoulderstand', tip: 'The queen of asanas. Stack hips over shoulders. Chin draws to chest.', youtube: 'https://www.youtube.com/watch?v=EDXgOM_I8qY' },
  { sanskrit: 'Utthita Parsvakonasana', english: 'Extended Side Angle', tip: 'Create one long diagonal line from the back heel to the fingertips.', youtube: 'https://www.youtube.com/watch?v=HKucylP9I3s' },
  { sanskrit: 'Parsvottanasana', english: 'Intense Side Stretch', tip: 'Reverse prayer opens the chest. Fold completely over the front leg.', youtube: 'https://www.youtube.com/watch?v=KaTv00w1hqk' },
  { sanskrit: 'Dandasana', english: 'Staff Pose', tip: 'The foundation of all seated postures. Sit tall, legs active, breath steady.', youtube: 'https://www.youtube.com/watch?v=5dUOD0LeU3k' },
  { sanskrit: 'Purvottanasana', english: 'Upward Plank', tip: 'Press through all four limbs equally. Open the chest fully to the sky.', youtube: 'https://www.youtube.com/watch?v=gxyekLi3oS8' },
  { sanskrit: 'Garbha Pindasana', english: 'Embryo in the Womb', tip: 'Thread the arms through lotus. Roll in a circle â nine rotations for nine months.', youtube: 'https://www.youtube.com/watch?v=mz8V56B6tC8' },
  { sanskrit: 'Supta Kurmasana', english: 'Sleeping Tortoise', tip: 'Complete pratyahara â withdrawal of the senses. Rest here. Listen inward.', youtube: 'https://www.youtube.com/watch?v=mz8V56B6tC8' },
  { sanskrit: 'Halasana', english: 'Plow Pose', tip: 'From shoulderstand, lower the feet overhead. Keep the legs straight and active.', youtube: 'https://www.youtube.com/watch?v=EDXgOM_I8qY' },
  { sanskrit: 'Padmasana', english: 'Lotus Pose', tip: 'The classical seat. Spine tall, breath steady, gaze softened. Simply be.', youtube: 'https://www.youtube.com/watch?v=sm75URCiOhI' },
  { sanskrit: 'Ardha Matsyendrasana', english: 'Half Lord of the Fishes', tip: 'Sit tall before twisting. Use your breath to go deeper each exhale.', youtube: 'https://www.youtube.com/watch?v=o7SBH0zd16o' },
];

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

// Practice hero images â before practice
const PRACTICE_IMAGES = [
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80',
  'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&q=80',
];

// Practice hero images â after practice
const COMPLETED_IMAGES = [
  'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80',
];

// Retreat / beach images for Pose of the Day
const RETREAT_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80',
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

// ââ Component âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export default function HomeScreen() {
  const {
    user, practiceLogs, setPracticeLogs,
    isPracticing, setIsPracticing, addPracticeLog,
    userPosts,
  } = useAppStore();

  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [livePractitioners, setLivePractitioners] = useState<PracticingUser[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState(user?.series ?? 'primary');
  const [loggedSeries, setLoggedSeries] = useState<string | null>(null);
  const [loggedDuration, setLoggedDuration] = useState<number | null>(null);
  const [editingSeries, setEditingSeries] = useState(false);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);

  // Computed
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const asanaOfDay = ASANAS[dayOfYear % ASANAS.length];
  const guruWisdom = GURU_WISDOM[dayOfYear % GURU_WISDOM.length];
  const practicedToday = loggedSeries !== null;
  const practiceImage = practicedToday
    ? COMPLETED_IMAGES[dayOfYear % COMPLETED_IMAGES.length]
    : PRACTICE_IMAGES[dayOfYear % PRACTICE_IMAGES.length];
  const retreatImage = RETREAT_IMAGES[dayOfYear % RETREAT_IMAGES.length];
  const rhythm = getWeeklyRhythm(practiceLogs);
  const streak = calculateStreak(practiceLogs);
  const moonDay = isMoonDay();
  const moonDaysUntil = daysUntilNextMoonDay();
  const practicesThisWeek = rhythm.filter((d) => d.status === 'done').length;

  // Next moon day date string
  const nextMoonDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + moonDaysUntil);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  })();

  // Friends on mat
  const othersOnMat = livePractitioners
    .filter((p) => p.id !== user?.id)
    .map((p) => ({ id: p.id, name: p.name ?? 'Practitioner', avatarUrl: p.avatar_url }));
  const meOnMat = (isPracticing || practicedToday) && user
    ? [{ id: user.id, name: 'You', avatarUrl: user.avatarUrl ?? null }]
    : [];
  const sanghaOnMat = [...meOnMat, ...othersOnMat];

  // Featured community post
  const featuredPost = feedPosts.length > 0 ? feedPosts[0] : userPosts.find((p) => p.imageUri);

  // ââ Actions ââ
  const handleLogPractice = (seriesKey?: string) => {
    if (!user) return;
    const series = seriesKey ?? selectedSeries;
    setLoggedSeries(series);
    setLoggedDuration(90);
    setIsPracticing(true);
    setEditingSeries(false);
    addPracticeLog({
      id: Date.now().toString(),
      userId: user.id,
      loggedAt: new Date().toISOString(),
      series,
      durationMin: 90,
    });
    setPracticingNow(user.id, true).catch(() => {});
    logPractice(user.id, series, 90).catch(() => {});
  };

  const handleToggleMat = () => {
    if (!user) return;
    const goingOn = !isPracticing;
    setIsPracticing(goingOn);
    setPracticingNow(user.id, goingOn).catch(() => {});
  };

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
  };

  // ââ Data fetching ââ
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
      setLoggedDuration(existing.durationMin);
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
    if (status === 'done') return warm.orange;
    if (status === 'today') return warm.blue;
    if (status === 'rest') return warm.mutedLight;
    return '#D9D3CA';
  };

  // ââ Render ââ
  return (
    <SafeAreaView style={s.safe}>
      {/* ââ Top bar ââ */}
      <View style={s.topbar}>
        <View style={s.topbarLeft}>
          <AppLogo size={36} />
          <Text style={s.appTitle}>Ashtanga Sangha</Text>
        </View>
        <View style={s.topbarRight}>
          <TouchableOpacity style={s.notifBtn} activeOpacity={0.7}>
            <Ionicons name="chatbubble-ellipses" size={22} color={warm.accent} />
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

      {/* ââ Avatar dropdown menu ââ */}
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
              <Ionicons name="person-outline" size={18} color={warm.ink} />
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={warm.accent} />}
      >
        {/* ââ Welcome ââ */}
        <Text style={s.welcome}>Welcome back, {user?.name?.split(' ')[0] ?? 'Yogi'}</Text>

        {/* âââ 1. TODAY'S PRACTICE â Hero Card âââ */}
        <View style={s.heroCard}>
          <ImageBackground
            source={{ uri: practiceImage }}
            style={s.heroImage}
            imageStyle={s.heroImageInner}
          >
            <View style={s.heroOverlay}>
              <Text style={s.heroLabel}>Today's Practice</Text>
              <Text style={s.heroTitle}>
                {practicedToday
                  ? (SERIES_LABELS[loggedSeries!] ?? loggedSeries)
                  : (SERIES_LABELS[selectedSeries] ?? 'Primary Series')} â Mysore Style
              </Text>
              <Text style={s.heroDuration}>
                Duration: {loggedDuration ?? 75} min
              </Text>

              {/* Series chips â only shown before first log */}
              {!practicedToday && (
                <View style={s.heroChipsWrap}>
                  {Object.entries(SERIES_LABELS).map(([key, label]) => (
                    <TouchableOpacity
                      key={key}
                      style={[s.heroChip, selectedSeries === key && s.heroChipActive]}
                      onPress={() => setSelectedSeries(key)}
                      activeOpacity={0.7}
                    >
                      <Text style={[s.heroChipText, selectedSeries === key && s.heroChipTextActive]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Action button */}
              {!practicedToday ? (
                <TouchableOpacity
                  style={s.heroBtn}
                  onPress={() => handleLogPractice()}
                  activeOpacity={0.85}
                >
                  <Text style={s.heroBtnText}>Log Practice</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[s.heroBtn, isPracticing ? s.heroBtnActive : s.heroBtnOff]}
                  onPress={handleToggleMat}
                  activeOpacity={0.85}
                >
                  {isPracticing && <View style={s.heroBtnLive} />}
                  <Text style={[s.heroBtnText, !isPracticing && s.heroBtnTextOff]}>
                    {isPracticing ? 'On the mat' : 'Off the mat'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Edit overlay */}
            {editingSeries && (
              <View style={s.heroEditOverlay}>
                <Text style={s.heroChipsLabel}>Change practice:</Text>
                <View style={s.heroChipsWrap}>
                  {Object.entries(SERIES_LABELS).map(([key, label]) => (
                    <TouchableOpacity
                      key={key}
                      style={[s.heroChip, loggedSeries === key && s.heroChipActive]}
                      onPress={() => { setSelectedSeries(key); handleLogPractice(key); }}
                      activeOpacity={0.7}
                    >
                      <Text style={[s.heroChipText, loggedSeries === key && s.heroChipTextActive]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity onPress={() => setEditingSeries(false)} style={s.heroCancelEdit}>
                  <Text style={s.heroCancelEditText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </ImageBackground>
        </View>


        {/* âââ 2. PRACTICE RHYTHM â Separate Card âââ */}
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
          <View style={s.rhythmStats}>
            <Text style={s.rhythmStatText}>
              {practicesThisWeek} of 6 practices completed this week
            </Text>
            {streak > 0 && (
              <View style={s.streakBadge}>
                <Text style={s.streakText}>ð¥ {streak}</Text>
              </View>
            )}
          </View>

          {/* Moon day info */}
          <View style={s.moonRow}>
            <Text style={s.moonIcon}>ð</Text>
            <Text style={s.moonText}>Next Moon Day: {nextMoonDate}</Text>
          </View>
        </View>


        {/* âââ 3. COMMUNITY â Preview Card âââ */}
        <TouchableOpacity
          style={s.communityCard}
          onPress={() => router.push('/(tabs)/community')}
          activeOpacity={0.8}
        >
          <View style={s.communityHeader}>
            <Ionicons name="chatbubble-ellipses" size={18} color={warm.blue} />
            <Text style={s.sectionTitle}>Community</Text>
            <Ionicons name="chevron-forward" size={16} color={warm.mutedLight} style={{ marginLeft: 'auto' as any }} />
          </View>

          {featuredPost && (
            <View style={s.postRow}>
              {/* Post image */}
              {(('image_url' in featuredPost && featuredPost.image_url) || ('imageUri' in featuredPost && (featuredPost as any).imageUri)) && (
                <Image
                  source={{ uri: ('image_url' in featuredPost ? featuredPost.image_url : (featuredPost as any).imageUri) ?? '' }}
                  style={s.postImage}
                />
              )}
              <View style={s.postBody}>
                <Text style={s.postCaption} numberOfLines={3}>
                  {('caption' in featuredPost ? featuredPost.caption : (featuredPost as any).caption) ?? ''}
                </Text>
                <View style={s.postStats}>
                  <Text style={s.postStat}>â¤ï¸ {('likes_count' in featuredPost ? featuredPost.likes_count : (featuredPost as any).likesCount) ?? 0}</Text>
                  <Text style={s.postStat}>ð¬ {('comments_count' in featuredPost ? (featuredPost as any).comments_count : 0) ?? 0}</Text>
                </View>
              </View>
            </View>
          )}

          {!featuredPost && (
            <View style={s.postEmpty}>
              <Ionicons name="chatbubbles-outline" size={32} color={warm.mutedLight} />
              <Text style={s.postEmptyText}>No posts yet â be the first!</Text>
            </View>
          )}
        </TouchableOpacity>


        {/* âââ 4. FRIENDS PRACTICING TODAY âââ */}
        <View style={s.friendsSection}>
          <View style={s.friendsHeader}>
            <Ionicons name="people" size={18} color={warm.accent} />
            <Text style={s.sectionTitle}>Friends Practicing Today</Text>
          </View>
          {sanghaOnMat.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.friendsScroll}
            >
              {sanghaOnMat.map((u) => (
                <View key={u.id} style={s.friendBubble}>
                  <View style={s.friendRing}>
                    {u.avatarUrl ? (
                      <Image source={{ uri: u.avatarUrl }} style={s.friendAvatar} />
                    ) : (
                      <View style={[s.friendAvatar, s.avatarPlaceholder]}>
                        <Text style={s.avatarLetterSm}>{u.name.charAt(0)}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={s.friendName} numberOfLines={1}>{u.name.split(' ')[0]}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={s.friendsEmpty}>
              <Text style={s.friendsEmptyText}>No one on the mat yet today</Text>
            </View>
          )}
        </View>


        {/* âââ 5. POSE OF THE DAY â Beach Card âââ */}
        <View style={s.poseCard}>
          <ImageBackground
            source={{ uri: retreatImage }}
            style={s.poseImageBg}
            imageStyle={s.poseImageBgInner}
          >
            <View style={s.poseOverlay}>
              <View style={s.poseContent}>
                {/* YouTube thumbnail */}
                {asanaOfDay.youtube && (
                  <TouchableOpacity
                    style={s.poseThumb}
                    onPress={() => Linking.openURL(asanaOfDay.youtube)}
                    activeOpacity={0.85}
                  >
                    <Image
                      source={{ uri: `https://img.youtube.com/vi/${asanaOfDay.youtube.split('v=')[1]}/mqdefault.jpg` }}
                      style={s.poseThumbImg}
                    />
                    <View style={s.posePlayBtn}>
                      <Ionicons name="play" size={18} color="#fff" />
                    </View>
                  </TouchableOpacity>
                )}
                <View style={s.poseInfo}>
                  <Text style={s.poseBadgeText}>Pose of the Day</Text>
                  <Text style={s.poseSanskrit}>{asanaOfDay.sanskrit}</Text>
                  <Text style={s.poseEnglish}>{asanaOfDay.english}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={s.retreatBtn}
                onPress={() => router.push('/(tabs)/library')}
                activeOpacity={0.85}
              >
                <Text style={s.retreatBtnText}>View Library</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>


        {/* âââ 6. GURU WISDOM âââ */}
        <View style={s.guruStrip}>
          <Text style={s.guruQuote}>"{guruWisdom.quote}"</Text>
          <Text style={s.guruName}>â {guruWisdom.guru}</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

/* âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
/* STYLES                                                                        */
/* âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: warm.bg },

  /* ââ Top bar âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    backgroundColor: warm.bg,
  },
  topbarLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  topbarRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  appTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18,
    color: warm.ink, lineHeight: 22,
  },
  notifBtn: { position: 'relative' as any },
  notifBadge: {
    position: 'absolute' as any, top: -4, right: -6,
    backgroundColor: warm.orange, borderRadius: 8,
    width: 16, height: 16, alignItems: 'center' as any, justifyContent: 'center' as any,
    borderWidth: 1.5, borderColor: warm.bg,
  },
  notifBadgeText: { fontSize: 9, fontWeight: '700' as any, color: '#fff' },
  avatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: warm.ring },
  avatarPlaceholder: {
    backgroundColor: warm.accent, alignItems: 'center' as any, justifyContent: 'center' as any,
  },
  avatarLetter: { fontSize: 16, color: '#fff', fontWeight: '600' as any },
  avatarLetterSm: { fontSize: 14, color: '#fff', fontWeight: '600' as any },

  /* ââ Menu âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
  menuBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-start' as any, alignItems: 'flex-end' as any,
    paddingTop: 95, paddingRight: spacing.lg,
  },
  menuContainer: {
    backgroundColor: '#fff', borderRadius: radius.xl,
    width: 240, ...shadows.lg, overflow: 'hidden' as any,
  },
  menuHeader: {
    flexDirection: 'row' as any, alignItems: 'center' as any, gap: spacing.md,
    padding: spacing.lg,
  },
  menuAvatar: { width: 40, height: 40, borderRadius: 20 },
  menuName: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 16, lineHeight: 20,
    color: warm.ink,
  },
  menuEmail: { ...typography.bodyXs, color: warm.muted, marginTop: 1 },
  menuDivider: { height: 1, backgroundColor: warm.divider },
  menuItem: {
    flexDirection: 'row' as any, alignItems: 'center' as any, gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  menuItemText: { ...typography.bodyMd, color: warm.ink },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  /* ââ Welcome âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
  welcome: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, lineHeight: 28,
    color: warm.ink, textAlign: 'center' as any,
    paddingVertical: spacing.md,
  },

  /* ââ Hero card âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
  heroCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    borderRadius: 20, overflow: 'hidden' as any,
    ...shadows.lg,
  },
  heroImage: { minHeight: 220, justifyContent: 'flex-end' as any },
  heroImageInner: { borderRadius: 20 },
  heroOverlay: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 18,
  },
  heroLabel: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 12,
    color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5,
    textTransform: 'uppercase' as any, marginBottom: 4,
  },
  heroTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, lineHeight: 28,
    color: '#fff', marginBottom: 4,
  },
  heroDuration: {
    fontFamily: 'DMSans_400Regular', fontSize: 13,
    color: 'rgba(255,255,255,0.65)', marginBottom: 14,
  },
  heroChipsLabel: {
    fontFamily: 'DMSans_500Medium', fontSize: 12,
    color: 'rgba(255,255,255,0.55)', letterSpacing: 0.3, marginBottom: 8,
  },
  heroChipsWrap: {
    flexDirection: 'row' as any, flexWrap: 'wrap' as any, gap: 7, marginBottom: 14,
  },
  heroChip: {
    paddingHorizontal: 13, paddingVertical: 6, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  heroChipActive: { backgroundColor: '#fff', borderColor: '#fff' },
  heroChipText: {
    fontFamily: 'DMSans_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.7)',
  },
  heroChipTextActive: { color: warm.ink },
  heroBtn: {
    borderRadius: 14, paddingVertical: 12, alignSelf: 'stretch' as any,
    alignItems: 'center' as any, justifyContent: 'center' as any,
    flexDirection: 'row' as any, gap: 8,
    backgroundColor: warm.orange,
  },
  heroBtnActive: { backgroundColor: warm.sage },
  heroBtnOff: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  heroBtnText: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 16, color: '#fff',
  },
  heroBtnTextOff: { color: 'rgba(255,255,255,0.75)' },
  heroBtnLive: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  heroEditOverlay: {
    position: 'absolute' as any, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(10,20,30,0.96)',
    paddingHorizontal: 18, paddingTop: 16, paddingBottom: 14,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
  },
  heroCancelEdit: { alignSelf: 'flex-start' as any, marginBottom: 4, marginTop: -4 },
  heroCancelEditText: {
    fontFamily: 'DMSans_500Medium', fontSize: 12,
    color: 'rgba(255,255,255,0.5)', textDecorationLine: 'underline' as any,
  },

  /* ââ Rhythm card âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
  rhythmCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    backgroundColor: warm.cardBg, borderRadius: 20,
    padding: spacing.xl,
    ...shadows.sm,
    borderWidth: 1, borderColor: warm.divider,
  },
  rhythmTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18,
    color: warm.ink, marginBottom: spacing.lg,
  },
  rhythmRow: {
    flexDirection: 'row' as any, justifyContent: 'space-between' as any,
    alignItems: 'center' as any,
  },
  rhythmCol: { alignItems: 'center' as any, gap: 6 },
  rhythmLabel: {
    fontFamily: 'DMSans_500Medium', fontSize: 12, color: warm.muted,
  },
  rhythmDot: { width: 10, height: 10, borderRadius: 5 },
  rhythmDivider: {
    height: 1, backgroundColor: warm.divider, marginVertical: spacing.md,
  },
  rhythmStats: {
    flexDirection: 'row' as any, alignItems: 'center' as any,
    justifyContent: 'center' as any, gap: spacing.md,
  },
  rhythmStatText: {
    fontFamily: 'DMSans_500Medium', fontSize: 13, color: warm.inkMid,
    textAlign: 'center' as any,
  },
  streakBadge: {
    backgroundColor: warm.orangeLight, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 3,
  },
  streakText: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: warm.orange,
  },
  moonRow: {
    flexDirection: 'row' as any, alignItems: 'center' as any,
    justifyContent: 'center' as any, gap: 6, marginTop: spacing.md,
  },
  moonIcon: { fontSize: 16 },
  moonText: {
    fontFamily: 'DMSans_400Regular', fontSize: 13, color: warm.muted,
  },

  /* ââ Community card ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
  communityCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    backgroundColor: warm.cardBg, borderRadius: 20,
    padding: spacing.xl,
    ...shadows.sm,
    borderWidth: 1, borderColor: warm.divider,
  },
  communityHeader: {
    flexDirection: 'row' as any, alignItems: 'center' as any, gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18, lineHeight: 24,
    color: warm.ink,
  },
  postRow: {
    flexDirection: 'row' as any, gap: spacing.md,
    borderRadius: radius.lg, overflow: 'hidden' as any,
    backgroundColor: warm.bg,
  },
  postImage: { width: 110, height: 100, borderRadius: radius.md },
  postBody: { flex: 1, padding: spacing.md, justifyContent: 'center' as any },
  postCaption: {
    fontFamily: 'DMSans_400Regular', fontSize: 13, lineHeight: 19,
    color: warm.inkMid,
  },
  postStats: { flexDirection: 'row' as any, gap: spacing.lg, marginTop: spacing.sm },
  postStat: {
    fontFamily: 'DMSans_500Medium', fontSize: 12, color: warm.muted,
  },
  postEmpty: {
    alignItems: 'center' as any, paddingVertical: spacing.xl, gap: spacing.sm,
  },
  postEmptyText: {
    fontFamily: 'DMSans_400Regular', fontSize: 13, color: warm.mutedLight,
  },

  /* ââ Friends âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
  friendsSection: { marginBottom: spacing.lg },
  friendsHeader: {
    flexDirection: 'row' as any, alignItems: 'center' as any, gap: spacing.sm,
    paddingHorizontal: spacing.xl, marginBottom: spacing.md,
  },
  friendsScroll: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  friendBubble: { alignItems: 'center' as any, width: 64 },
  friendRing: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 2.5, borderColor: warm.ring,
    alignItems: 'center' as any, justifyContent: 'center' as any,
    marginBottom: spacing.xs,
  },
  friendAvatar: { width: 48, height: 48, borderRadius: 24 },
  friendName: {
    fontFamily: 'DMSans_500Medium', fontSize: 11, color: warm.ink,
    textAlign: 'center' as any,
  },
  friendsEmpty: {
    paddingHorizontal: spacing.xl, paddingVertical: spacing.lg,
  },
  friendsEmptyText: {
    fontFamily: 'DMSans_400Regular', fontSize: 13, color: warm.mutedLight,
  },

  /* ââ Pose of the Day (beach card) ââââââââââââââââââââââââââââââââââââââââââââ */
  poseCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    borderRadius: 20, overflow: 'hidden' as any,
    ...shadows.lg,
  },
  poseImageBg: { minHeight: 180 },
  poseImageBgInner: { borderRadius: 20 },
  poseOverlay: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.85)',
    padding: spacing.xl,
    justifyContent: 'space-between' as any,
  },
  poseContent: { flexDirection: 'row' as any, gap: spacing.lg },
  poseThumb: {
    width: 100, height: 80, borderRadius: radius.md,
    overflow: 'hidden' as any, position: 'relative' as any,
  },
  poseThumbImg: { width: '100%' as any, height: '100%' as any },
  posePlayBtn: {
    position: 'absolute' as any, top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center' as any, justifyContent: 'center' as any,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  poseInfo: { flex: 1 },
  poseBadgeText: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 16,
    color: warm.ink, marginBottom: 4,
  },
  poseSanskrit: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 14,
    color: warm.inkMid, marginBottom: 2,
  },
  poseEnglish: {
    fontFamily: 'DMSans_400Regular', fontSize: 12, color: warm.muted,
  },
  retreatBtn: {
    backgroundColor: warm.accent, borderRadius: 14,
    paddingVertical: 10, alignItems: 'center' as any,
    marginTop: spacing.md,
  },
  retreatBtnText: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: '#fff',
  },

  /* ââ Guru wisdom âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
  guruStrip: {
    marginHorizontal: spacing.lg, marginBottom: spacing.xl,
    backgroundColor: warm.cardBg, borderRadius: 16,
    padding: spacing.xl,
    borderWidth: 1, borderColor: warm.divider,
  },
  guruQuote: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 16, lineHeight: 24,
    color: warm.ink, fontStyle: 'italic' as any, textAlign: 'center' as any,
    marginBottom: spacing.sm,
  },
  guruName: {
    fontFamily: 'DMSans_500Medium', fontSize: 12, color: warm.muted,
    textAlign: 'center' as any,
  },
});
