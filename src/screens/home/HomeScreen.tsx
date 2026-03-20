// src/screens/home/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Pressable, Modal,
  StyleSheet, Image, RefreshControl, ImageBackground, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';
import { useAppStore } from '@/store/useAppStore';
import { getWeeklyRhythm, calculateStreak } from '@/utils/practiceStreak';
import { isMoonDay, daysUntilNextMoonDay } from '@/utils/moonDay';
import { getPracticeLogs, setPracticingNow, logPractice, getPracticingNow, signOut } from '@/lib/supabase';

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

// ── Data ──────────────────────────────────────────────────────────────────────

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Asana of the Day — Ashtanga Primary Series
const ASANAS = [
  // Week 1
  { sanskrit: 'Padangusthasana', english: 'Big Toe Pose', tip: 'Grip your big toes, fold from the hips. Let gravity do the work.', youtube: 'https://www.youtube.com/watch?v=8QTLriT8mwA' },
  { sanskrit: 'Utthita Trikonasana', english: 'Extended Triangle', tip: 'Extend through both arms equally. Keep the chest open to the sky.', youtube: 'https://www.youtube.com/watch?v=KaTv00w1hqk' },
  { sanskrit: 'Parivrtta Parsvakonasana', english: 'Revolved Side Angle', tip: 'Ground the back heel. Twist from your core, not your shoulders.', youtube: 'https://www.youtube.com/watch?v=HKucylP9I3s' },
  { sanskrit: 'Prasarita Padottanasana', english: 'Wide-Legged Forward Fold', tip: 'Feet parallel, crown of head reaching to the floor.', youtube: 'https://www.youtube.com/watch?v=n5AQZO4P6h0' },
  { sanskrit: 'Utthita Hasta Padangusthasana', english: 'Hand-to-Big-Toe Pose', tip: 'Drishti is forward. The standing leg is your foundation.', youtube: 'https://www.youtube.com/watch?v=3MSbUSseP_E' },
  { sanskrit: 'Ardha Baddha Padmottanasana', english: 'Half Bound Lotus Forward Fold', tip: 'If the bind doesn\'t come, hold the knee instead.', youtube: 'https://www.youtube.com/watch?v=sm75URCiOhI' },
  { sanskrit: 'Utkatasana', english: 'Chair Pose', tip: 'Sit deep into the pose. Root down through the heels, reach up through the arms.', youtube: 'https://www.youtube.com/watch?v=KaTv00w1hqk' },
  // Week 2
  { sanskrit: 'Marichyasana A', english: 'Sage Marichi\'s Pose A', tip: 'Heel close to the sit bone. Lengthen first, then fold.', youtube: 'https://www.youtube.com/watch?v=GsRLDgwqFnY' },
  { sanskrit: 'Marichyasana C', english: 'Sage Marichi\'s Twist C', tip: 'Inhale to grow tall, exhale to twist deeper.', youtube: 'https://www.youtube.com/watch?v=K3D_3XL_UmM' },
  { sanskrit: 'Navasana', english: 'Boat Pose', tip: 'Five rounds, five breaths. Engage your bandhas between each one.', youtube: 'https://www.youtube.com/watch?v=5dUOD0LeU3k' },
  { sanskrit: 'Bhujapidasana', english: 'Shoulder Pressing Pose', tip: 'The lift comes from bandha, not brute strength.', youtube: 'https://www.youtube.com/watch?v=KMTkPAihuSw' },
  { sanskrit: 'Kurmasana', english: 'Tortoise Pose', tip: 'Surrender into the fold. This posture teaches patience.', youtube: 'https://www.youtube.com/watch?v=mz8V56B6tC8' },
  { sanskrit: 'Urdhva Dhanurasana', english: 'Upward Bow', tip: 'Push evenly through hands and feet. Let the heart open skyward.', youtube: 'https://www.youtube.com/watch?v=gxyekLi3oS8' },
  { sanskrit: 'Sirsasana', english: 'Headstand', tip: 'Foundation in the forearms, not the head. Stay for 25 breaths.', youtube: 'https://www.youtube.com/watch?v=EDXgOM_I8qY' },
  // Week 3
  { sanskrit: 'Surya Namaskara A', english: 'Sun Salutation A', tip: 'Nine vinyasas. Let each breath guide the movement — never rush.', youtube: 'https://www.youtube.com/watch?v=aUgtMaAZzW0' },
  { sanskrit: 'Paschimottanasana', english: 'Seated Forward Fold', tip: 'Inhale to lengthen the spine, exhale to fold deeper. Surrender, don\'t force.', youtube: 'https://www.youtube.com/watch?v=5dUOD0LeU3k' },
  { sanskrit: 'Janu Sirsasana A', english: 'Head-to-Knee Pose A', tip: 'Rotate the bent knee slightly back. Square the hips as much as possible.', youtube: 'https://www.youtube.com/watch?v=GsRLDgwqFnY' },
  { sanskrit: 'Marichyasana B', english: 'Sage Marichi\'s Pose B', tip: 'Set the lotus first. Then wrap and bind. Patience opens the hip.', youtube: 'https://www.youtube.com/watch?v=GsRLDgwqFnY' },
  { sanskrit: 'Marichyasana D', english: 'Sage Marichi\'s Twist D', tip: 'Half lotus and twist together. The gateway posture of the primary series.', youtube: 'https://www.youtube.com/watch?v=K3D_3XL_UmM' },
  { sanskrit: 'Baddha Konasana', english: 'Bound Angle Pose', tip: 'Bring the soles together, fold the torso forward. Let the inner thighs soften.', youtube: 'https://www.youtube.com/watch?v=sm75URCiOhI' },
  { sanskrit: 'Salamba Sarvangasana', english: 'Shoulderstand', tip: 'The queen of asanas. Stack hips over shoulders. Chin draws to chest.', youtube: 'https://www.youtube.com/watch?v=EDXgOM_I8qY' },
  // Week 4
  { sanskrit: 'Utthita Parsvakonasana', english: 'Extended Side Angle', tip: 'Create one long diagonal line from the back heel to the fingertips.', youtube: 'https://www.youtube.com/watch?v=HKucylP9I3s' },
  { sanskrit: 'Parsvottanasana', english: 'Intense Side Stretch', tip: 'Reverse prayer opens the chest. Fold completely over the front leg.', youtube: 'https://www.youtube.com/watch?v=KaTv00w1hqk' },
  { sanskrit: 'Dandasana', english: 'Staff Pose', tip: 'The foundation of all seated postures. Sit tall, legs active, breath steady.', youtube: 'https://www.youtube.com/watch?v=5dUOD0LeU3k' },
  { sanskrit: 'Purvottanasana', english: 'Upward Plank', tip: 'Press through all four limbs equally. Open the chest fully to the sky.', youtube: 'https://www.youtube.com/watch?v=gxyekLi3oS8' },
  { sanskrit: 'Garbha Pindasana', english: 'Embryo in the Womb', tip: 'Thread the arms through lotus. Roll in a circle — nine rotations for nine months.', youtube: 'https://www.youtube.com/watch?v=mz8V56B6tC8' },
  { sanskrit: 'Supta Kurmasana', english: 'Sleeping Tortoise', tip: 'Complete pratyahara — withdrawal of the senses. Rest here. Listen inward.', youtube: 'https://www.youtube.com/watch?v=mz8V56B6tC8' },
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

// Practice hero images — before practice
const PRACTICE_IMAGES = [
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80',
  'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&q=80',
];

// Practice hero images — after practice (serene/accomplished feel)
const COMPLETED_IMAGES = [
  'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=800&q=80', // sunrise calm
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', // ocean peace
  'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80', // golden light
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80', // misty mountains
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
    isPracticing, setIsPracticing, addPracticeLog,
    userPosts,
  } = useAppStore();

  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [livePractitioners, setLivePractitioners] = useState<PracticingUser[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState(user?.series ?? 'primary');
  const [loggedSeries, setLoggedSeries] = useState<string | null>(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const existing = practiceLogs.find(
      (log) => new Date(log.loggedAt).toISOString().split('T')[0] === todayStr
    );
    return existing?.series ?? null;
  });
  const [loggedDuration, setLoggedDuration] = useState<number | null>(null);
  const [editingSeries, setEditingSeries] = useState(false);
  const [heroReady, setHeroReady] = useState(false);



  // Computed
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const asanaOfDay = ASANAS[dayOfYear % ASANAS.length];
  const guruWisdom = GURU_WISDOM[dayOfYear % GURU_WISDOM.length];
  const practicedToday = isPracticing || loggedSeries !== null;
  const practiceImage = practicedToday
    ? COMPLETED_IMAGES[dayOfYear % COMPLETED_IMAGES.length]
    : PRACTICE_IMAGES[dayOfYear % PRACTICE_IMAGES.length];
  const rhythm = getWeeklyRhythm(practiceLogs);
  const streak = calculateStreak(practiceLogs);
  const moonDay = isMoonDay();
  const moonDaysUntil = daysUntilNextMoonDay();
  const practicesThisWeek = rhythm.filter((d) => d.status === 'done').length;

  // Community: who's on the mat (real data only)
  const othersOnMat = livePractitioners
    .filter((p) => p.id !== user?.id)
    .map((p) => ({ id: p.id, name: p.name ?? 'Practitioner', avatarUrl: p.avatar_url }));
  const meOnMat = (isPracticing || practicedToday) && user
    ? [{ id: user.id, name: 'You', avatarUrl: user.avatarUrl ?? null }]
    : [];
  const sanghaOnMat = [...meOnMat, ...othersOnMat];

  // Featured community post would come from Supabase
  const featuredPost = userPosts.find((p) => p.imageUri);

  // ── Actions ──
  const handleLogPractice = (seriesKey?: string) => {
    if (!user) return;
    const series = seriesKey ?? selectedSeries;
    // Update local state immediately for instant UI change
    setLoggedSeries(series);
    setLoggedDuration(90);
    setIsPracticing(true);
    setEditingSeries(false);
    // Also update store
    addPracticeLog({
      id: Date.now().toString(),
      userId: user.id,
      loggedAt: new Date().toISOString(),
      series,
      durationMin: 90,
    });
    // Persist in background
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
    // signOut() triggers the SIGNED_OUT auth event → clearUser() in useAuthListener
    // which sets isAuthenticated: false → root layout redirects to /(auth)/welcome.
    // Do NOT call setUser(null) here — setUser always sets isAuthenticated: true,
    // which would immediately override clearUser and loop the user back to tabs.
    await signOut();
  };

  // ── Data fetching ──
  const fetchLogs = async () => {
    if (!user) return;
    const { data } = await getPracticeLogs(user.id);
    if (data) {
      const logs = data.map((row: any) => ({
          id: row.id, userId: row.user_id, loggedAt: row.logged_at,
          series: row.series, durationMin: row.duration_min,
        }));
      setPracticeLogs(logs);
      const todayStr = new Date().toISOString().split('T')[0];
      const todayLog = logs.find(
        (log) => new Date(log.loggedAt).toISOString().split('T')[0] === todayStr
      );
      if (todayLog) {
        setLoggedSeries(todayLog.series);
        setLoggedDuration(todayLog.durationMin);
        setIsPracticing(true);
      }
    }
    setHeroReady(true);
  };

  const fetchPracticing = async () => {
    const { data } = await getPracticingNow();
    if (data) setLivePractitioners(data as PracticingUser[]);
  };

  // Sync local hero state from existing practice logs
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const existing = practiceLogs.find(
      (log) => new Date(log.loggedAt).toISOString().split('T')[0] === todayStr
    );
    if (existing && !loggedSeries) {
      setLoggedSeries(existing.series);
      setLoggedDuration(existing.durationMin);
      // Restore "on the mat" state — store resets on reload, so we re-hydrate it
      setIsPracticing(true);
    }
  }, [practiceLogs]);

  useEffect(() => { fetchLogs(); fetchPracticing(); }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchLogs(), fetchPracticing()]);
    setRefreshing(false);
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

      {/* ── Avatar dropdown menu ── */}
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={s.menuBackdrop} onPress={() => setMenuOpen(false)}>
          <View style={s.menuContainer}>
            {/* User info header */}
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

            {/* My Profile */}
            <TouchableOpacity
              style={s.menuItem}
              onPress={() => { setMenuOpen(false); router.push('/(tabs)/profile'); }}
              activeOpacity={0.7}
            >
              <Text style={s.menuIcon}>👤</Text>
              <Text style={s.menuItemText}>My Profile</Text>
            </TouchableOpacity>

            <View style={s.menuDivider} />

            {/* Sign Out */}
            <TouchableOpacity style={s.menuItem} onPress={handleSignOut} activeOpacity={0.7}>
              <Text style={s.menuIcon}>🚪</Text>
              <Text style={[s.menuItemText, { color: '#C0392B' }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* ── Welcome ── */}
        <Text style={s.welcome}>Welcome back, {user?.name?.split(' ')[0] ?? 'Yogi'}</Text>

        {/* ═══ 1. HERO — Today's Practice ═══ */}
        <View style={[s.heroCard, { opacity: heroReady ? 1 : 0 }]}>
          <ImageBackground
            source={{ uri: practiceImage }}
            style={s.heroImage}
            imageStyle={s.heroImageInner}
          >
            <View style={s.heroGradientTop} />

            {/* ── Main overlay — never changes height ── */}
            <View style={s.heroOverlay}>
              {/* Status pill */}
              <View style={[s.heroPill, practicedToday && s.heroPillDone]}>
                <Text style={s.heroPillText}>
                  {practicedToday ? '✓  Practiced' : '◦  Today'}
                </Text>
              </View>

              {/* Series title + pencil */}
              <View style={s.heroTitleRow}>
                <Text style={s.heroTitle}>
                  {practicedToday
                    ? (SERIES_LABELS[loggedSeries!] ?? loggedSeries)
                    : (SERIES_LABELS[selectedSeries] ?? 'Primary Series')}
                </Text>
                {practicedToday && (
                  <TouchableOpacity
                    style={s.heroEditBtn}
                    onPress={() => setEditingSeries(true)}
                    activeOpacity={0.7}
                    hitSlop={10}
                  >
                    <Ionicons name="pencil" size={13} color="rgba(255,255,255,0.9)" />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={s.heroSubtitle}>Mysore Style</Text>

              {/* Moon badge */}
              {moonDay ? (
                <View style={s.heroMoonBadge}>
                  <Text style={s.heroMoonText}>🌑 Moon Day</Text>
                </View>
              ) : moonDaysUntil <= 3 && moonDaysUntil > 0 ? (
                <View style={[s.heroMoonBadge, s.heroMoonSoon]}>
                  <Text style={s.heroMoonText}>🌘 Moon {(() => {
                    const d = new Date();
                    d.setDate(d.getDate() + moonDaysUntil);
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  })()}</Text>
                </View>
              ) : null}

              {/* Series chips — only shown before first log of the day (in-flow) */}
              {!practicedToday && (
                <>
                  <Text style={s.heroChipsLabel}>What are you practicing?</Text>
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
                </>
              )}

              {/* Action button */}
              {!practicedToday ? (
                <TouchableOpacity
                  style={[s.heroBtn, s.heroBtnOnMat]}
                  onPress={() => handleLogPractice()}
                  activeOpacity={0.85}
                >
                  <Text style={s.heroBtnText}>Log Practice</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[s.heroBtn, isPracticing ? s.heroBtnOnMat : s.heroBtnOffMat2]}
                  onPress={handleToggleMat}
                  activeOpacity={0.85}
                >
                  {isPracticing && <View style={s.heroBtnLive} />}
                  <Text style={[s.heroBtnText, !isPracticing && s.heroBtnTextOff]}>
                    {isPracticing ? 'On the mat' : 'Off the mat'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Practice Rhythm strip */}
              <View style={s.heroRhythmDivider} />
              <View style={s.heroRhythmRow}>
                {rhythm.map((day, i) => (
                  <View key={i} style={s.heroRhythmCol}>
                    <Text style={s.heroRhythmLabel}>{day.label}</Text>
                    <View style={[
                      s.heroRhythmDot,
                      day.status === 'done'   && s.hrDotDone,
                      day.status === 'today'  && s.hrDotToday,
                      day.status === 'rest'   && s.hrDotRest,
                      day.status === 'future' && s.hrDotFuture,
                    ]} />
                  </View>
                ))}
                {streak > 0 && (
                  <View style={s.heroStreakBadge}>
                    <Text style={s.heroStreakText}>🔥 {streak}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* ── Series edit overlay — absolute, never affects card height ── */}
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


        {/* ═══ 3. FRIENDS PRACTICING TODAY ═══ */}
        {sanghaOnMat.length > 0 && (
          <View style={s.friendsSection}>
            <View style={s.friendsHeader}>
              <Text style={s.friendsEmoji}>👥</Text>
              <Text style={s.sectionTitle}>Friends Practicing Today</Text>
            </View>
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
          </View>
        )}

        {/* ═══ 4. SANGHA POST ═══ */}
        {featuredPost && (
          <TouchableOpacity style={s.communityCard} onPress={() => router.push('/(tabs)/community')} activeOpacity={0.8}>
            <View style={s.communityHeader}>
              <Text style={s.communityEmoji}>💬</Text>
              <Text style={s.sectionTitle}>Community</Text>
              <Text style={s.sectionArrow}>›</Text>
            </View>
            <View style={s.postCard}>
              {featuredPost.imageUrl && (
                <Image source={{ uri: featuredPost.imageUrl }} style={s.postImage} />
              )}
              <View style={s.postBody}>
                {/* Author row */}
                <View style={s.postAuthorRow}>
                  {featuredPost.userAvatar ? (
                    <Image source={{ uri: featuredPost.userAvatar }} style={s.postAuthorAvatar} />
                  ) : (
                    <View style={[s.postAuthorAvatar, s.avatarPlaceholder]}>
                      <Text style={{ fontSize: 10, color: '#fff', fontWeight: '600' }}>
                        {featuredPost.userName?.charAt(0) ?? '?'}
                      </Text>
                    </View>
                  )}
                  <Text style={s.postAuthorName}>{featuredPost.userName}</Text>
                </View>
                <Text style={s.postCaption} numberOfLines={3}>{featuredPost.caption}</Text>
                <View style={s.postStats}>
                  <Text style={s.postStat}>❤️ {featuredPost.likesCount}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* ═══ 5. POSE OF THE DAY ═══ */}
        <View style={s.poseCard}>
          <View style={s.poseBadge}>
            <Text style={s.poseBadgeText}>Pose of the Day</Text>
          </View>
          <Text style={s.poseSanskrit}>{asanaOfDay.sanskrit}</Text>
          <Text style={s.poseEnglish}>{asanaOfDay.english}</Text>
          <Text style={s.poseTip}>{asanaOfDay.tip}</Text>

          {/* YouTube clip */}
          {asanaOfDay.youtube && (
            <TouchableOpacity
              style={s.ytButton}
              onPress={() => Linking.openURL(asanaOfDay.youtube)}
              activeOpacity={0.8}
            >
              <View style={s.ytThumb}>
                <Image
                  source={{ uri: `https://img.youtube.com/vi/${asanaOfDay.youtube.split('v=')[1]}/mqdefault.jpg` }}
                  style={s.ytThumbImg}
                />
                <View style={s.ytPlayOverlay}>
                  <Text style={s.ytPlayIcon}>▶</Text>
                </View>
              </View>
              <Text style={s.ytLabel}>Watch tutorial</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ═══ 7. GURU WISDOM ═══ */}
        <View style={s.guruStrip}>
          <Text style={s.guruQuote}>"{guruWisdom.quote}"</Text>
          <Text style={s.guruName}>— {guruWisdom.guru}</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF8F5' },

  // ── Top bar ──
  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
  },
  topbarLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  appTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18,
    color: colors.ink, lineHeight: 22,
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarPlaceholder: {
    backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center',
  },
  avatarLetter: { fontSize: 16, color: '#fff', fontWeight: '600' },
  avatarLetterSm: { fontSize: 14, color: '#fff', fontWeight: '600' },

  // ── Avatar dropdown menu ──
  menuBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-start', alignItems: 'flex-end',
    paddingTop: 95, paddingRight: spacing.lg,
  },
  menuContainer: {
    backgroundColor: '#fff', borderRadius: radius.xl,
    width: 240, ...shadows.lg,
    overflow: 'hidden',
  },
  menuHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.lg,
  },
  menuAvatar: { width: 40, height: 40, borderRadius: 20 },
  menuName: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 16, lineHeight: 20,
    color: colors.ink,
  },
  menuEmail: { ...typography.bodyXs, color: colors.muted, marginTop: 1 },
  menuDivider: { height: 1, backgroundColor: '#F0EDE8' },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  menuIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  menuItemText: { ...typography.bodyMd, color: colors.ink },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing['4xl'] },

  // ── Welcome ──
  welcome: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, lineHeight: 28,
    color: colors.ink, textAlign: 'center',
    paddingVertical: spacing.md,
  },

  // ── Hero card ──
  heroCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    borderRadius: 24, overflow: 'hidden',
    ...shadows.lg,
  },
  heroImage: { justifyContent: 'flex-end', height: 220 },
  heroImageInner: { borderRadius: 24 },
  heroGradientTop: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 80,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  heroOverlay: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 18, paddingTop: 12, paddingBottom: 14,
  },

  // Edit overlay — absolute, covers the overlay area, never changes card height
  heroEditOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(10,20,30,0.96)',
    paddingHorizontal: 18, paddingTop: 16, paddingBottom: 14,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
  },

  // Status pill
  heroPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 3,
    marginBottom: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  heroPillDone: {
    backgroundColor: 'rgba(123,158,127,0.6)',
    borderColor: 'rgba(123,158,127,0.4)',
  },
  heroPillText: {
    ...typography.labelSm, color: '#fff', letterSpacing: 0.5,
  },

  // Title
  heroTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 24, lineHeight: 30,
    color: '#fff', marginBottom: 1,
  },
  heroSubtitle: {
    ...typography.bodySm, color: 'rgba(255,255,255,0.65)',
    marginBottom: 8, letterSpacing: 0.3,
  },

  // Completed row
  heroCompletedRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16,
  },
  heroStatChip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  heroStatText: { ...typography.labelSm, color: '#fff' },
  heroEditChip: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  heroEditText: { ...typography.labelSm, color: 'rgba(255,255,255,0.7)' },
  heroEncourage: {
    ...typography.bodyXs, color: 'rgba(255,255,255,0.55)',
    fontStyle: 'italic', marginBottom: 8, lineHeight: 17,
  },

  // Moon badge on hero
  heroMoonBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
    marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  heroMoonSoon: {
    backgroundColor: 'rgba(255,200,100,0.25)',
    borderColor: 'rgba(255,200,100,0.3)',
  },
  heroMoonText: { ...typography.labelSm, color: '#fff', fontSize: 11 },

  // Series title row
  heroTitleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2,
  },
  // Pencil edit button — small pill
  heroEditBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 4,
    flexDirection: 'row', alignItems: 'center',
  },

  // Chips block — always in layout, opacity toggled
  heroChipsBlock: {
    // no fixed height — content determines it, opacity hides/shows
  },
  heroChipsVisible: { opacity: 1 },
  heroChipsHidden: { opacity: 0 },

  // Chips label
  heroChipsLabel: {
    ...typography.labelSm,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.3,
    marginBottom: 8,
  },

  // Cancel edit link
  heroCancelEdit: {
    alignSelf: 'flex-start', marginBottom: 4, marginTop: -4,
  },
  heroCancelEditText: {
    ...typography.labelSm, color: 'rgba(255,255,255,0.5)',
    textDecorationLine: 'underline',
  },

  // Series chips
  heroChipsWrap: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 12,
  },
  heroChip: {
    paddingHorizontal: 13, paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  heroChipActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  heroChipText: { ...typography.labelSm, color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  heroChipTextActive: { color: colors.ink },

  // Buttons
  heroBtn: {
    borderRadius: 14,
    paddingHorizontal: 22, paddingVertical: 11,
    alignSelf: 'stretch',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  heroBtnOnMat: {
    backgroundColor: colors.sage,
  },
  heroBtnOffMat2: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  heroBtnText: { ...typography.headingSm, color: '#fff', fontSize: 17 },
  heroBtnTextOff: { color: 'rgba(255,255,255,0.75)' },
  heroBtnLive: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff',
  },
  heroBtnLog: {
    backgroundColor: colors.sage, borderRadius: 16,
    paddingHorizontal: 24, paddingVertical: 14,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  heroBtnLogText: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18,
    color: '#fff',
  },
  heroBtnLogSub: {
    ...typography.bodyXs, color: 'rgba(255,255,255,0.7)', marginTop: 2,
  },

  // ── Section title ──
  sectionTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18, lineHeight: 24,
    color: colors.ink,
  },

  // ── Rhythm strip (inside hero) ──
  heroRhythmDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 10,
    marginBottom: 10,
  },
  heroRhythmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 2,
  },
  heroRhythmCol: { alignItems: 'center', gap: 5, flex: 1 },
  heroRhythmLabel: {
    fontSize: 10,
    fontFamily: 'DMSans_500Medium',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'capitalize',
  },
  heroRhythmDot: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  hrDotDone:   { backgroundColor: colors.orange },
  hrDotToday:  { backgroundColor: colors.sage },
  hrDotRest:   { backgroundColor: 'rgba(255,200,100,0.4)' },
  hrDotFuture: { backgroundColor: 'rgba(255,255,255,0.08)' },
  heroStreakBadge: {
    backgroundColor: 'rgba(232,131,74,0.25)',
    borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(232,131,74,0.4)',
    marginLeft: 6,
  },
  heroStreakText: {
    fontSize: 12, fontFamily: 'DMSans_500Medium', color: '#fff',
  },
  streakBadge: {
    backgroundColor: colors.orangePale, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 3,
  },
  streakText: { ...typography.headingSm, color: colors.orange },
  moonBanner: {
    backgroundColor: colors.sagePale, borderRadius: radius.lg,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  moonText: { ...typography.labelMd, color: colors.sage, textAlign: 'center' },

  // ── Community ──
  communityCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
  },
  communityHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginBottom: spacing.md,
  },
  communityEmoji: { fontSize: 18 },
  sectionArrow: {
    fontSize: 22, color: colors.muted, marginLeft: 'auto' as any,
  },
  postCard: {
    backgroundColor: '#fff', borderRadius: radius['2xl'],
    overflow: 'hidden', ...shadows.sm,
  },
  postImage: { width: '100%' as any, height: 160 },
  postBody: {
    padding: spacing.lg,
  },
  postAuthorRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  postAuthorAvatar: { width: 28, height: 28, borderRadius: 14 },
  postAuthorName: { ...typography.headingSm, color: colors.ink },
  postCaption: { ...typography.bodyMd, color: colors.inkMid, lineHeight: 21 },
  postStats: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md },
  postStat: { ...typography.labelSm, color: colors.muted },

  // ── Friends ──
  friendsSection: {
    marginBottom: spacing.lg,
  },
  friendsHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.xl, marginBottom: spacing.md,
  },
  friendsEmoji: { fontSize: 18 },
  friendsScroll: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  friendBubble: { alignItems: 'center', width: 60 },
  friendRing: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 2, borderColor: colors.sage,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  friendAvatar: { width: 44, height: 44, borderRadius: 22 },
  friendName: { ...typography.bodyXs, color: colors.ink, textAlign: 'center' },

  // ── Pose of the Day ──
  poseCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    backgroundColor: '#fff', borderRadius: radius['2xl'],
    padding: spacing.xl,
    borderLeftWidth: 4, borderLeftColor: colors.sage,
    ...shadows.sm,
  },
  poseBadge: {
    backgroundColor: colors.sagePale, borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 3,
    alignSelf: 'flex-start', marginBottom: spacing.sm,
  },
  poseBadgeText: {
    ...typography.labelSm, color: colors.sage, textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  poseSanskrit: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 20, lineHeight: 26,
    color: colors.ink, marginBottom: 2,
  },
  poseEnglish: { ...typography.bodySm, color: colors.muted, marginBottom: spacing.sm },
  poseTip: {
    ...typography.bodyMd, color: colors.inkMid, lineHeight: 21,
    fontStyle: 'italic',
  },
  ytButton: {
    marginTop: spacing.md, borderRadius: radius.lg, overflow: 'hidden',
    backgroundColor: '#000',
  },
  ytThumb: {
    width: '100%' as any, height: 160, position: 'relative',
  },
  ytThumbImg: {
    width: '100%' as any, height: '100%' as any, resizeMode: 'cover',
  },
  ytPlayOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  ytPlayIcon: {
    fontSize: 32, color: '#fff',
    backgroundColor: 'rgba(255,0,0,0.85)',
    width: 52, height: 38, textAlign: 'center', lineHeight: 38,
    borderRadius: 8, overflow: 'hidden',
  },
  ytLabel: {
    ...typography.headingSm, color: '#fff', textAlign: 'center',
    paddingVertical: 10,
  },

  // ── Guru Wisdom ──
  guruStrip: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    backgroundColor: colors.sand, borderRadius: radius['2xl'],
    padding: spacing.xl, alignItems: 'center',
  },
  guruQuote: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 16, lineHeight: 24,
    color: colors.ink, textAlign: 'center', marginBottom: spacing.xs,
  },
  guruName: {
    ...typography.labelSm, color: colors.muted, textAlign: 'center',
  },
});
