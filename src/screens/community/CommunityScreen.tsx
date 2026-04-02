import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, RefreshControl, TextInput, Dimensions, Modal, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import PostCard from '@/components/community/PostCard';
import AppHeader from '@/components/AppHeader';
import { getPracticingNow, getFeed, deletePost, followUser, unfollowUser, getFollowing, getUserLikes, supabase } from '@/lib/supabase';

/* ── Stone & Moss light palette ──────────────────────────────────────── */
const moss = {
  headerBg:    '#FFFFFF',
  headerText:  '#3B3228',
  pageBg:      '#F6F2EC',
  cardBg:      '#FFFFFF',
  searchBg:    '#EDE6DA',
  searchBorder:'#E8E0D4',
  searchText:  '#9B8E7E',
  ink:         '#3B3228',
  inkMid:      '#5E5245',
  muted:       '#9B8E7E',
  mutedLight:  '#C4B8A8',
  accent:      '#8A9E78',
  accentLight: '#DCE8D3',
  sage:        '#8A9E78',
  sageBg:      '#DCE8D3',
  gold:        '#D4C4AB',
  goldBg:      '#EDE6DA',
  amber:       '#C4956A',
  amberBg:     '#FFF5EC',
  terra:       '#8B7355',
  terraBg:     '#F5EDE3',
  divider:     '#E8E0D4',
  greenBadge:  '#8A9E78',
  heartRed:    '#C4956A',
  white:       '#FFFFFF',
  ring:        '#8A9E78',
};

const SCREEN_WIDTH = Dimensions.get('window').width;

type Tab = 'latest' | 'people';

interface PracticingUser {
  id: string;
  name: string;
  avatar_url: string | null;
  series: string;
  level: string;
  streak: number;
  practicing_started_at: string;
  location?: string;
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

interface Member {
  id: string;
  name: string;
  avatar_url: string | null;
  series: string;
  level: string;
  streak: number;
  location: string | null;
  bio: string | null;
}

// Fake users for demo feed
const FAKE_USERS_FEED: {
  id: string; name: string; avatarUrl: string; series: string; streak: number; bio: string;
  feedCaption: string; feedImage: string; feedTime: string; feedLikes: number; feedComments: number;
}[] = [
  { id: 'fake-noa', name: 'נועה לוי', avatarUrl: 'https://i.pravatar.cc/150?img=1', series: 'primary', streak: 142, bio: 'מורה ליוגה ומתרגלת אשטנגה 6 שנים. מתרגלת בשאלה בפלורנטין.', feedCaption: 'תרגול בוקר מושלם 🌅 הסדרה הראשונה זרמה היום בצורה מדהימה', feedImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop', feedTime: new Date(Date.now() - 2 * 3600000).toISOString(), feedLikes: 12, feedComments: 3 },
  { id: 'fake-ori', name: 'אורי כהן', avatarUrl: 'https://i.pravatar.cc/150?img=3', series: 'primary', streak: 8, bio: 'מתכנת שהתחיל אשטנגה לפני 8 חודשים.', feedCaption: 'סוף סוף הצלחתי לתפוס את האצבעות בג׳אנו שירשאסנה! 🎉', feedImage: '', feedTime: new Date(Date.now() - 5 * 3600000).toISOString(), feedLikes: 18, feedComments: 7 },
  { id: 'fake-michal', name: 'מיכל אברהם', avatarUrl: 'https://i.pravatar.cc/150?img=5', series: 'intermediate', streak: 365, bio: 'פסיכולוגית, אמא לשלושה. מתרגלת 12 שנה.', feedCaption: 'קאפוטאסנה — כל יום מחדש. הנשימה היא המפתח 🙏', feedImage: '', feedTime: new Date(Date.now() - 8 * 3600000).toISOString(), feedLikes: 24, feedComments: 5 },
  { id: 'fake-yotam', name: 'יותם ברק', avatarUrl: 'https://i.pravatar.cc/150?img=8', series: 'sun_sals', streak: 21, bio: 'מדריך צלילה באילת. מתרגל על החוף בזריחה.', feedCaption: 'ברכות שמש על חוף אלמוג 🌊☀️ אין כמו להתרגל עם רגליים בחול', feedImage: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600&h=400&fit=crop', feedTime: new Date(Date.now() - 18 * 3600000).toISOString(), feedLikes: 31, feedComments: 9 },
  { id: 'fake-rinat', name: 'רינת שמעוני', avatarUrl: 'https://i.pravatar.cc/150?img=9', series: 'primary', streak: 56, bio: 'ארכיטקטית מחיפה. מתרגלת 4 שנים בבית.', feedCaption: 'גיליתי שכשמיישרים את הירכיים בטריקונאסנה הכל משתנה', feedImage: '', feedTime: new Date(Date.now() - 3 * 3600000).toISOString(), feedLikes: 8, feedComments: 2 },
  { id: 'fake-daniel', name: 'דניאל פרידמן', avatarUrl: 'https://i.pravatar.cc/150?img=11', series: 'primary', streak: 34, bio: 'שף ובעל מסעדה. מתרגל ב-10 בבוקר.', feedCaption: 'תרגול מאוחר + ארוחת בוקר בריאה = יום מושלם 🍳🧘‍♂️', feedImage: '', feedTime: new Date(Date.now() - 26 * 3600000).toISOString(), feedLikes: 15, feedComments: 4 },
  { id: 'fake-talia', name: 'טליה וולף', avatarUrl: 'https://i.pravatar.cc/150?img=10', series: 'short', streak: 89, bio: 'חקלאית אורגנית בגליל. אמא ל-4.', feedCaption: 'תרגול של 40 דקות בין הגן לרפת. לא צריך יותר 🌿', feedImage: '', feedTime: new Date(Date.now() - 4 * 3600000).toISOString(), feedLikes: 22, feedComments: 6 },
  { id: 'fake-ido', name: 'עידו נחום', avatarUrl: 'https://i.pravatar.cc/150?img=12', series: 'primary', streak: 512, bio: 'רופא משפחה, מתרגל 18 שנה. נוסע למייסור כל שנתיים.', feedCaption: 'אחרי 18 שנה, סופטה קורמאסנה עדיין מלמדת אותי משהו חדש', feedImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop', feedTime: new Date(Date.now() - 6 * 3600000).toISOString(), feedLikes: 35, feedComments: 11 },
  { id: 'fake-shira', name: 'שירה מזרחי', avatarUrl: 'https://i.pravatar.cc/150?img=16', series: 'sun_sals', streak: 3, bio: 'סטודנטית לאמנות, 3 חודשים של אשטנגה.', feedCaption: 'ציירתי את ויראבהדראסנה B 🎨 מי רוצה לראות?', feedImage: '', feedTime: new Date(Date.now() - 48 * 3600000).toISOString(), feedLikes: 27, feedComments: 8 },
  { id: 'fake-amir', name: 'אמיר חדד', avatarUrl: 'https://i.pravatar.cc/150?img=13', series: 'primary', streak: 12, bio: 'עורך דין ואב טרי מכפר סבא.', feedCaption: 'התינוקת התעוררה באמצע נאוואסנה. עשיתי אותה עם תינוקת על הבטן 😂', feedImage: '', feedTime: new Date(Date.now() - 1 * 3600000).toISOString(), feedLikes: 42, feedComments: 14 },
  { id: 'fake-sarah', name: 'Sarah Mitchell', avatarUrl: 'https://i.pravatar.cc/150?img=20', series: 'primary', streak: 204, bio: 'Yoga teacher in London. 3 months in Mysore with Sharath.', feedCaption: 'Morning Mysore at the shala. Nothing beats practicing together 🕉️', feedImage: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&h=400&fit=crop', feedTime: new Date(Date.now() - 7 * 3600000).toISOString(), feedLikes: 19, feedComments: 4 },
  { id: 'fake-david', name: 'David Stern', avatarUrl: 'https://i.pravatar.cc/150?img=14', series: 'intermediate', streak: 730, bio: 'Former Wall Street, now yoga teacher in Brooklyn. 15 years.', feedCaption: 'Kapo day. The backbend that changed everything. Trust the breath. 🔥', feedImage: '', feedTime: new Date(Date.now() - 10 * 3600000).toISOString(), feedLikes: 28, feedComments: 6 },
];

/* Only show fake posts that have images */
const FAKE_POSTS_WITH_IMAGES = FAKE_USERS_FEED.filter((u) => !!u.feedImage);

function fakeTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 5) return 'Just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

export default function CommunityScreen() {
  const router = useRouter();
  const { user, userPosts, isPracticing, practiceLogs } = useAppStore();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const [activeTab, setActiveTab] = useState<Tab>('latest');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [livePractitioners, setLivePractitioners] = useState<PracticingUser[]>([]);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [profileCard, setProfileCard] = useState<{ name: string; avatarUrl: string; series: string; streak: number; bio: string } | null>(null);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());

  // Load who the current user follows
  const fetchFollowing = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await getFollowing(user.id);
    if (data) {
      setFollowingIds(new Set(data.map((f: any) => f.following_id)));
    }
  }, [user?.id]);

  const toggleFollow = useCallback(async (memberId: string) => {
    if (!user?.id) return;
    if (followingIds.has(memberId)) {
      await unfollowUser(user.id, memberId);
      setFollowingIds((prev) => { const next = new Set(prev); next.delete(memberId); return next; });
    } else {
      await followUser(user.id, memberId);
      setFollowingIds((prev) => new Set(prev).add(memberId));
    }
  }, [user?.id, followingIds]);

  const openProfile = useCallback((name: string) => {
    const fakeUser = FAKE_USERS_FEED.find((u) => u.name === name);
    if (fakeUser) {
      setProfileCard({ name: fakeUser.name, avatarUrl: fakeUser.avatarUrl, series: fakeUser.series, streak: fakeUser.streak, bio: fakeUser.bio });
    }
  }, []);

  const fetchPracticing = useCallback(async () => {
    const { data } = await getPracticingNow();
    if (data) setLivePractitioners(data as PracticingUser[]);
  }, []);

  const fetchFeed = useCallback(async () => {
    const { data } = await getFeed(user?.id ?? '');
    if (data) setFeedPosts(data as FeedPost[]);
  }, [user?.id]);

  const fetchLikes = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await getUserLikes(user.id);
    if (data) setLikedPostIds(new Set(data.map((l: any) => l.post_id)));
  }, [user?.id]);

  const fetchMembers = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, series, level, streak, location, bio')
      .neq('id', user?.id ?? '')
      .order('streak', { ascending: false })
      .limit(50);
    if (data) setMembers(data as Member[]);
  }, [user?.id]);

  // Refetch feed every time screen gains focus (e.g. returning from NewPostScreen)
  useFocusEffect(
    useCallback(() => {
      fetchPracticing();
      fetchFeed();
      fetchMembers();
      fetchFollowing();
      fetchLikes();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchPracticing(), fetchFeed(), fetchMembers(), fetchLikes()]);
    setRefreshing(false);
  }, []);

  // Check if current user practiced today (from local state)
  const todayStr = new Date().toISOString().slice(0, 10);
  const practicedToday = practiceLogs.some((log) => log.loggedAt?.slice(0, 10) === todayStr);

  // Current user on mat (from local state — same logic as HomeScreen)
  const meOnMat = (isPracticing || practicedToday) && user
    ? [{ id: user.id, name: user.name, avatarUrl: user.avatarUrl ?? null, location: null, series: user.series ?? 'primary', streak: 0 }]
    : [];

  // Combine current user + real practitioners from DB + fake demo users
  const fakeOnMat = FAKE_USERS_FEED.map((u) => ({
    id: u.id, name: u.name, avatarUrl: u.avatarUrl,
    location: null, series: 'primary', streak: 0,
  }));
  const dbPractitioners = livePractitioners
    .filter((p) => p.id !== user?.id); // exclude current user (already in meOnMat)
  const allPeople = [
    ...meOnMat,
    ...dbPractitioners.map((p) => ({
      id: p.id,
      name: p.name ?? 'Practitioner',
      avatarUrl: p.avatar_url,
      location: p.location ?? null,
      series: p.series,
      streak: p.streak ?? 0,
    })),
    ...fakeOnMat,
  ];

  /* ── Render helpers ───────────────────────────────────────────────────── */

  const renderPartnerAvatar = (p: typeof allPeople[0], index: number) => (
    <TouchableOpacity key={p.id + index} style={s.partnerItem} activeOpacity={0.7} onPress={() => openProfile(p.name)}>
      <View style={s.partnerAvatarRing}>
        {p.avatarUrl ? (
          <Image source={{ uri: p.avatarUrl }} style={s.partnerAvatar} />
        ) : (
          <View style={[s.partnerAvatar, { backgroundColor: moss.accent, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ fontSize: 22, color: moss.white, fontWeight: '600' }}>
              {p.name.charAt(0)}
            </Text>
          </View>
        )}
      </View>
      <Text style={s.partnerName} numberOfLines={1}>{p.name.split(' ')[0]}</Text>
      {p.location && <Text style={s.partnerLocation} numberOfLines={1}>{p.location}</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <AppHeader />

      {/* ── Search bar ── */}
      <View style={s.searchWrap}>
        <View style={[s.searchBar, isRTL && { flexDirection: 'row-reverse' }]}>
          <Ionicons name="search-outline" size={18} color={moss.muted} />
          <TextInput
            style={[s.searchInput, isRTL && { textAlign: 'right', writingDirection: 'rtl' }]}
            placeholder={t('community.searchMembers')}
            placeholderTextColor={moss.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* ── Underline tabs ── */}
      <View style={s.tabRow}>
        {(['people', 'latest'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab === 'latest' ? t('community.latest') : t('community.people')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={moss.accent} />}
      >

        {/* ═══════════ LATEST TAB ═══════════ */}
        {activeTab === 'latest' && (
          <>
            {/* On the mat right now */}
            <View style={[s.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={[s.sectionTitle, isRTL && { textAlign: 'right' }]}>{t('community.onTheMatNow')}</Text>
            </View>
            <View style={s.partnersCard}>
              {allPeople.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.partnersScroll}
                >
                  {allPeople.slice(0, 4).map((p, i) => renderPartnerAvatar(p, i))}
                  {allPeople.length > 4 && (
                    <TouchableOpacity style={s.partnerItem} activeOpacity={0.7}>
                      <View style={[s.partnerAvatarRing, { borderColor: moss.greenBadge }]}>
                        <View style={[s.partnerAvatar, { backgroundColor: moss.greenBadge, alignItems: 'center', justifyContent: 'center' }]}>
                          <Text style={{ color: moss.white, fontFamily: 'DMSans_600SemiBold', fontSize: 14 }}>More</Text>
                        </View>
                      </View>
                      <Text style={s.partnerName}>{t('community.more')}</Text>
                    </TouchableOpacity>
                  )}
                  {allPeople.length > 3 && (
                    <View style={s.arrowWrap}>
                      <Ionicons name="chevron-forward" size={20} color={moss.mutedLight} />
                    </View>
                  )}
                </ScrollView>
              ) : (
                <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.xl }}>
                  <Text style={{ color: moss.muted, fontSize: 14, textAlign: isRTL ? 'right' : 'left' }}>{t('community.noPractitioners')}</Text>
                </View>
              )}
            </View>

            {/* Sangha Feed */}
            <View style={[s.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={[s.sectionTitle, isRTL && { textAlign: 'right' }]}>{t('community.sanghaFeed')}</Text>
              <TouchableOpacity onPress={() => router.push('/new-post')} activeOpacity={0.7}>
                <Text style={s.sectionLink}>{t('community.newPost')}</Text>
              </TouchableOpacity>
            </View>

            {/* Real posts from Supabase */}
            {feedPosts.map((post) => (
              <PostCard
                key={post.id}
                postId={post.id}
                userId={user?.id}
                userName={post.profiles?.name ?? 'Practitioner'}
                userAvatar={post.profiles?.avatar_url ?? 'https://via.placeholder.com/120'}
                imageUrl={post.image_url ?? undefined}
                caption={post.caption ?? ''}
                location={post.location ?? undefined}
                likesCount={post.likes_count ?? 0}
                commentsCount={post.comments_count ?? 0}
                isLiked={likedPostIds.has(post.id)}
                createdAt={post.created_at}
                tags={[]}
                isOwner={post.user_id === user?.id}
                onUserPress={() => openProfile(post.profiles?.name ?? '')}
                onDelete={async (id) => {
                  await deletePost(id);
                  setFeedPosts((prev) => prev.filter((p) => p.id !== id));
                }}
                onEdit={async (id, newCaption) => {
                  await supabase.from('posts').update({ caption: newCaption }).eq('id', id);
                  setFeedPosts((prev) => prev.map((p) => p.id === id ? { ...p, caption: newCaption } : p));
                }}
              />
            ))}
            {/* Local posts */}
            {userPosts.map((post) => (
              <PostCard
                key={post.id}
                postId={post.id}
                userId={user?.id}
                userName={post.userName}
                userAvatar={post.userAvatar ?? 'https://via.placeholder.com/120'}
                imageUrl={post.imageUri}
                caption={post.caption}
                location={post.location}
                likesCount={post.likesCount}
                isLiked={post.isLiked}
                createdAt={post.createdAt}
                tags={post.tags}
                isOwner={true}
                onUserPress={() => openProfile(post.userName)}
                onDelete={async (id) => {
                  await deletePost(id);
                  setFeedPosts((prev) => prev.filter((p) => p.id !== id));
                }}
              />
            ))}
            {/* Demo posts — always visible, lightweight cards */}
            {FAKE_POSTS_WITH_IMAGES.map((u) => (
              <TouchableOpacity key={u.id} activeOpacity={0.85} onPress={() => openProfile(u.name)}
                style={{ backgroundColor: moss.cardBg, borderRadius: 16, borderWidth: 1, borderColor: moss.divider, marginHorizontal: spacing.lg, marginBottom: 14, overflow: 'hidden', ...shadows.md }}>
                {/* Header */}
                <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingBottom: 10 }, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Image source={{ uri: u.avatarUrl }} style={{ width: 42, height: 42, borderRadius: 21 }} />
                  <View style={[{ flex: 1 }, isRTL && { alignItems: 'flex-end' }]}>
                    <Text style={{ fontFamily: 'DMSans_600SemiBold', fontSize: 16, color: '#2A2420' }}>{u.name}</Text>
                    <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 15, color: '#7A6E60' }}>{fakeTimeAgo(u.feedTime)}</Text>
                  </View>
                </View>
                {/* Caption */}
                <Text style={[{ fontFamily: 'DMSans_400Regular', fontSize: 16, color: '#2A2420', lineHeight: 24, paddingHorizontal: 14, paddingBottom: 10 }, isRTL && { textAlign: 'right' }]}>
                  {u.feedCaption}
                </Text>
                {/* Image */}
                <Image source={{ uri: u.feedImage }} style={{ width: '100%', height: 260, backgroundColor: moss.divider }} resizeMode="cover" />
                {/* Footer */}
                <View style={[{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 16 }, isRTL && { flexDirection: 'row-reverse' }]}>
                  <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6 }, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Ionicons name="heart-outline" size={18} color="#C4956A" />
                    <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 15, color: '#4A3F36' }}>{u.feedLikes}</Text>
                  </View>
                  <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6 }, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Ionicons name="chatbubble-outline" size={16} color="#7A6E60" />
                    <Text style={{ fontFamily: 'DMSans_500Medium', fontSize: 15, color: '#4A3F36' }}>{u.feedComments}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ═══════════ PEOPLE TAB ═══════════ */}
        {activeTab === 'people' && (
          <>
            {/* Community Members */}
            <View style={[s.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={[s.sectionTitle, isRTL && { textAlign: 'right' }]}>{t('community.communityMembers')}</Text>
            </View>
            <View style={s.peopleCard}>
              {/* Real members from Supabase */}
              {members.map((m) => (
                <TouchableOpacity key={m.id} style={s.personRow} activeOpacity={0.7} onPress={() => openProfile(m.name)}>
                  <View style={s.personAvatarWrap}>
                    {m.avatar_url ? (
                      <Image source={{ uri: m.avatar_url }} style={s.personAvatar} />
                    ) : (
                      <View style={[s.personAvatar, { backgroundColor: moss.terra, alignItems: 'center', justifyContent: 'center' }]}>
                        <Text style={{ fontSize: 16, color: moss.white, fontWeight: '600' }}>{m.name.charAt(0)}</Text>
                      </View>
                    )}
                  </View>
                  <View style={s.personInfo}>
                    <Text style={s.personName}>{m.name}</Text>
                    <Text style={s.personMeta}>
                      {m.series} {m.location ? `· ${m.location}` : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={followingIds.has(m.id) ? s.followBtnActive : s.followBtn}
                    activeOpacity={0.7}
                    onPress={() => toggleFollow(m.id)}
                  >
                    <Text style={followingIds.has(m.id) ? s.followTextActive : s.followText}>
                      {followingIds.has(m.id) ? t('community.following') : t('community.follow')}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
              {/* Demo users */}
              {FAKE_USERS_FEED.map((u) => (
                <TouchableOpacity key={u.id} style={s.personRow} activeOpacity={0.7} onPress={() => openProfile(u.name)}>
                  <View style={s.personAvatarWrap}>
                    <Image source={{ uri: u.avatarUrl }} style={s.personAvatar} />
                  </View>
                  <View style={s.personInfo}>
                    <Text style={s.personName}>{u.name}</Text>
                    <Text style={s.personMeta}>{u.series}</Text>
                  </View>
                  <TouchableOpacity style={s.followBtn} activeOpacity={0.7}>
                    <Text style={s.followText}>{t('community.follow')}</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

      </ScrollView>

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
                      <Text style={[s.profileBadgeText, { color: moss.amber }]}>{t('community.dayStreak', { count: profileCard.streak })}</Text>
                    </View>
                  )}
                </View>
                <Text style={s.profileBio}>{profileCard.bio}</Text>
                <TouchableOpacity style={s.profileCloseBtn} onPress={() => setProfileCard(null)} activeOpacity={0.7}>
                  <Text style={s.profileCloseBtnText}>{t('community.close')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* STYLES                                                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: moss.pageBg },

  /* ── Header ─────────────────────────────────────────────────────────────── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: moss.headerBg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md + 2,
  },
  headerTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 22,
    color: moss.headerText,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  headerIcon: { position: 'relative' },
  headerAvatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: moss.ring },
  notifDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: moss.heartRed,
    borderWidth: 1.5,
    borderColor: moss.headerBg,
  },

  /* ── Search ───────────────────────────────────────────────────────────────── */
  searchWrap: {
    backgroundColor: moss.headerBg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: moss.searchBg,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: moss.searchBorder,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: '#2A2420',
    padding: 0,
  },

  /* ── Tabs (underline style) ─────────────────────────────────────────────── */
  tabRow: {
    flexDirection: 'row',
    backgroundColor: moss.pageBg,
    borderBottomWidth: 1,
    borderBottomColor: moss.divider,
    paddingHorizontal: spacing.xl,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md + 2,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: moss.accent,
  },
  tabText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    color: '#4A3F36',
  },
  tabTextActive: {
    fontFamily: 'DMSans_600SemiBold',
    color: '#2A2420',
  },

  /* ── Scroll ─────────────────────────────────────────────────────────────── */
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  /* ── Section headers ────────────────────────────────────────────────────── */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 18,
    color: moss.ink,
  },
  sectionLink: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 16,
    color: moss.accent,
  },

  /* ── Find Practicing Partners ───────────────────────────────────────────── */
  partnersCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: moss.cardBg,
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: moss.divider,
    shadowColor: '#8A9E78',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  partnersScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.xl,
  },
  partnerItem: { alignItems: 'center', width: 72 },
  partnerAvatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    borderColor: moss.ring,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  partnerAvatar: { width: 54, height: 54, borderRadius: 27 },
  partnerName: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    color: '#2A2420',
    textAlign: 'center',
  },
  partnerLocation: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: '#4A3F36',
    textAlign: 'center',
    marginTop: 1,
  },
  arrowWrap: {
    justifyContent: 'center',
    paddingLeft: spacing.sm,
  },

  /* ── Popular Discussions ────────────────────────────────────────────────── */
  discussionsScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  discussionCard: {
    width: SCREEN_WIDTH * 0.38,
    borderRadius: radius.xl,
    padding: spacing.lg,
    minHeight: 90,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: moss.divider,
  },
  discussionTitle: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    lineHeight: 22,
    color: '#2A2420',
    marginBottom: spacing.sm,
  },
  discussionReplies: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: '#4A3F36',
  },

  /* ── People tab ─────────────────────────────────────────────────────────── */
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: moss.sageBg,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: moss.sage,
  },
  liveText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: moss.sage,
  },
  peopleCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: moss.cardBg,
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: moss.divider,
    shadowColor: '#8A9E78',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: moss.divider,
  },
  personAvatarWrap: { position: 'relative' },
  personAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: moss.accentLight,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: moss.greenBadge,
    borderWidth: 2,
    borderColor: moss.cardBg,
  },
  personInfo: { flex: 1 },
  personName: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    color: '#2A2420',
  },
  personMeta: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: '#4A3F36',
    marginTop: 2,
  },
  followBtn: {
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: moss.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: 5,
  },
  followText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    color: moss.accent,
  },
  followBtnActive: {
    borderRadius: radius.full,
    backgroundColor: moss.accentLight,
    borderWidth: 1.5,
    borderColor: moss.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: 5,
  },
  followTextActive: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    color: moss.accent,
  },

  /* ── Topics tab ─────────────────────────────────────────────────────────── */
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: moss.cardBg,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: moss.divider,
    shadowColor: '#8A9E78',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  topicTitle: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    color: moss.ink,
    marginBottom: 3,
  },
  topicMeta: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: '#4A3F36',
  },

  /* ── Empty state ────────────────────────────────────────────────────────── */
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  emptyText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: '#4A3F36',
  },

  /* ── Profile card modal ── */
  profileBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  profileCard: {
    backgroundColor: moss.cardBg,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    ...shadows.lg,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: moss.accent,
    marginBottom: 14,
  },
  profileName: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 22,
    color: moss.ink,
    marginBottom: 10,
  },
  profileBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: moss.sageBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  profileBadgeText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    color: moss.accent,
  },
  profileBio: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: '#2A2420',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 18,
  },
  profileCloseBtn: {
    backgroundColor: moss.accent,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  profileCloseBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 16,
    color: moss.white,
  },
});
