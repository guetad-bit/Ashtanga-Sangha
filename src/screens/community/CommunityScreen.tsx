import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, RefreshControl, Dimensions, Modal, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';

import AppHeader from '@/components/AppHeader';
import { getPracticingNow, getFeed, deletePost, followUser, unfollowUser, getFollowing, getUserLikes, supabase } from '@/lib/supabase';

/* Stone & Moss light palette */
const moss = {
  headerBg:    '#FFFFFF',
  headerText:  '#3B3228',
  pageBg:      '#F6F2EC',
  cardBg:      '#FFFFFF',
  ink:         '#3B3228',
  inkMid:      '#5E5245',
  muted:       '#9B8E7E',
  mutedLight:  '#C4B8A8',
  accent:      '#8A9E78',
  accentLight: '#DCE8D3',
  sage:        '#8A9E78',
  sageBg:      '#DCE8D3',
  amber:       '#C4956A',
  amberBg:     '#FFF5EC',
  terra:       '#8B7355',
  divider:     '#E8E0D4',
  greenBadge:  '#8A9E78',
  heartRed:    '#C4956A',
  white:       '#FFFFFF',
  ring:        '#8A9E78',
};

const SCREEN_WIDTH = Dimensions.get('window').width;

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
  { id: 'fake-noa', name: 'Noa Levi', avatarUrl: 'https://i.pravatar.cc/150?img=1', series: 'primary', streak: 142, bio: 'Yoga teacher. 6 years of Ashtanga practice at a shala in Tel Aviv.', feedCaption: 'Perfect morning practice 🌅 Primary series flowed beautifully today', feedImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop', feedTime: new Date(Date.now() - 2 * 3600000).toISOString(), feedLikes: 12, feedComments: 3 },
  { id: 'fake-ori', name: 'Ori Cohen', avatarUrl: 'https://i.pravatar.cc/150?img=3', series: 'primary', streak: 8, bio: 'Software developer. Started Ashtanga 8 months ago.', feedCaption: 'Finally caught my toes in Janu Sirsasana! 🎉', feedImage: '', feedTime: new Date(Date.now() - 5 * 3600000).toISOString(), feedLikes: 18, feedComments: 7 },
  { id: 'fake-michal', name: 'Michal Avraham', avatarUrl: 'https://i.pravatar.cc/150?img=5', series: 'intermediate', streak: 365, bio: 'Psychologist, mother of three. 12 years of practice.', feedCaption: 'Kapotasana — every day is a new beginning. The breath is the key 🙏', feedImage: '', feedTime: new Date(Date.now() - 8 * 3600000).toISOString(), feedLikes: 24, feedComments: 5 },
  { id: 'fake-yotam', name: 'Yotam Barak', avatarUrl: 'https://i.pravatar.cc/150?img=8', series: 'sun_sals', streak: 21, bio: 'Diving instructor in Eilat. Practices on the beach at sunrise.', feedCaption: 'Sun salutations on the reef beach 🌊☀️ Nothing like practicing with sand under your feet', feedImage: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600&h=400&fit=crop', feedTime: new Date(Date.now() - 18 * 3600000).toISOString(), feedLikes: 31, feedComments: 9 },
  { id: 'fake-rinat', name: 'Rinat Shimoni', avatarUrl: 'https://i.pravatar.cc/150?img=9', series: 'primary', streak: 56, bio: 'Architect from Haifa. Home practitioner for 4 years.', feedCaption: 'Discovered that aligning the hips in Trikonasana changes everything', feedImage: '', feedTime: new Date(Date.now() - 3 * 3600000).toISOString(), feedLikes: 8, feedComments: 2 },
  { id: 'fake-daniel', name: 'Daniel Friedman', avatarUrl: 'https://i.pravatar.cc/150?img=11', series: 'primary', streak: 34, bio: 'Chef and restaurant owner. Practices at 10am after night shifts.', feedCaption: 'Late practice + healthy breakfast = perfect day 🍳🧘‍♂️', feedImage: '', feedTime: new Date(Date.now() - 26 * 3600000).toISOString(), feedLikes: 15, feedComments: 4 },
  { id: 'fake-talia', name: 'Talia Wolf', avatarUrl: 'https://i.pravatar.cc/150?img=10', series: 'short', streak: 89, bio: 'Organic farmer in the Galilee. Mother of 4.', feedCaption: '40-minute practice between the garden and the barn. That is all you need 🌿', feedImage: '', feedTime: new Date(Date.now() - 4 * 3600000).toISOString(), feedLikes: 22, feedComments: 6 },
  { id: 'fake-ido', name: 'Ido Nachum', avatarUrl: 'https://i.pravatar.cc/150?img=12', series: 'primary', streak: 512, bio: 'Family doctor. 18 years of practice. Travels to Mysore every two years.', feedCaption: 'After 18 years, Supta Kurmasana still teaches me something new every time', feedImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop', feedTime: new Date(Date.now() - 6 * 3600000).toISOString(), feedLikes: 35, feedComments: 11 },
  { id: 'fake-shira', name: 'Shira Mizrahi', avatarUrl: 'https://i.pravatar.cc/150?img=16', series: 'sun_sals', streak: 3, bio: 'Art student. 3 months into Ashtanga. Draws postures in her sketchbook.', feedCaption: 'Drew Virabhadrasana B today 🎨 Who wants to see?', feedImage: '', feedTime: new Date(Date.now() - 48 * 3600000).toISOString(), feedLikes: 27, feedComments: 8 },
  { id: 'fake-amir', name: 'Amir Hadad', avatarUrl: 'https://i.pravatar.cc/150?img=13', series: 'primary', streak: 12, bio: 'Lawyer and new dad. Trying to keep up the routine with a baby at home.', feedCaption: 'Baby woke up mid-Navasana. Did the rest with her on my belly 😂', feedImage: '', feedTime: new Date(Date.now() - 1 * 3600000).toISOString(), feedLikes: 42, feedComments: 14 },
  { id: 'fake-sarah', name: 'Sarah Mitchell', avatarUrl: 'https://i.pravatar.cc/150?img=20', series: 'primary', streak: 204, bio: 'Yoga teacher in London. 3 months in Mysore with Sharath.', feedCaption: 'Morning Mysore at the shala. Nothing beats practicing together 🕉️', feedImage: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&h=400&fit=crop', feedTime: new Date(Date.now() - 7 * 3600000).toISOString(), feedLikes: 19, feedComments: 4 },
  { id: 'fake-david', name: 'David Stern', avatarUrl: 'https://i.pravatar.cc/150?img=14', series: 'intermediate', streak: 730, bio: 'Former Wall Street, now yoga teacher in Brooklyn. 15 years.', feedCaption: 'Kapo day. The backbend that changed everything. Trust the breath. 🔥', feedImage: '', feedTime: new Date(Date.now() - 10 * 3600000).toISOString(), feedLikes: 28, feedComments: 6 },
];

/* Only show fake posts that have images */
const FAKE_POSTS_WITH_IMAGES = FAKE_USERS_FEED.filter((u) => !!u.feedImage);

/* Unified post shape for merged feed */
interface UnifiedPost {
  id: string;
  userName: string;
  userAvatar: string;
  caption: string;
  imageUrl: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

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
  const [refreshing, setRefreshing] = useState(false);
  const [livePractitioners, setLivePractitioners] = useState<PracticingUser[]>([]);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [profileCard, setProfileCard] = useState<{ name: string; avatarUrl: string; series: string; streak: number; bio: string } | null>(null);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());

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

  const todayStr = new Date().toISOString().slice(0, 10);
  const practicedToday = practiceLogs.some((log) => log.loggedAt?.slice(0, 10) === todayStr);

  const meOnMat = (isPracticing || practicedToday) && user
    ? [{ id: user.id, name: user.name, avatarUrl: user.avatarUrl ?? null, location: null, series: user.series ?? 'primary', streak: 0 }]
    : [];

  const fakeOnMat = FAKE_USERS_FEED.map((u) => ({
    id: u.id, name: u.name, avatarUrl: u.avatarUrl,
    location: null, series: 'primary', streak: 0,
  }));
  const dbPractitioners = livePractitioners.filter((p) => p.id !== user?.id);
  const allPeople = [
    ...meOnMat,
    ...dbPractitioners.map((p) => ({
      id: p.id, name: p.name ?? 'Practitioner', avatarUrl: p.avatar_url,
      location: p.location ?? null, series: p.series, streak: p.streak ?? 0,
    })),
    ...fakeOnMat,
  ];

  /* Merged & sorted feed (real + local + fake) */
  const allFeedPosts: UnifiedPost[] = [
    ...feedPosts.map((p) => ({
      id: p.id,
      userName: p.profiles?.name ?? 'Practitioner',
      userAvatar: p.profiles?.avatar_url ?? 'https://i.pravatar.cc/150',
      caption: p.caption ?? '',
      imageUrl: p.image_url,
      likesCount: p.likes_count ?? 0,
      commentsCount: p.comments_count ?? 0,
      createdAt: p.created_at,
    })),
    ...userPosts.map((p) => ({
      id: p.id,
      userName: p.userName,
      userAvatar: p.userAvatar ?? 'https://i.pravatar.cc/150',
      caption: p.caption,
      imageUrl: p.imageUri ?? null,
      likesCount: p.likesCount ?? 0,
      commentsCount: 0,
      createdAt: p.createdAt,
    })),
    ...FAKE_POSTS_WITH_IMAGES.map((u) => ({
      id: u.id,
      userName: u.name,
      userAvatar: u.avatarUrl,
      caption: u.feedCaption,
      imageUrl: u.feedImage || null,
      likesCount: u.feedLikes,
      commentsCount: u.feedComments,
      createdAt: u.feedTime,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  /* Render helpers */
  const renderMemberBubble = (p: typeof allPeople[0], index: number) => (
    <TouchableOpacity key={p.id + index} style={s.memberBubble} activeOpacity={0.7} onPress={() => openProfile(p.name)}>
      <View style={s.memberRing}>
        {p.avatarUrl ? (
          <Image source={{ uri: p.avatarUrl }} style={s.memberAvatar} />
        ) : (
          <View style={[s.memberAvatar, { backgroundColor: moss.accent, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ fontSize: 18, color: moss.white, fontWeight: '600' }}>
              {p.name.charAt(0)}
            </Text>
          </View>
        )}
      </View>
      <Text style={s.memberName} numberOfLines={1}>{p.name.split(' ')[0]}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <AppHeader />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={moss.accent} />}
      >

        {/* Members strip */}
        <View style={s.membersSection}>
          <View style={s.membersSectionHeader}>
            <Text style={s.membersSectionTitle}>Sangha Members</Text>
            <View style={s.onlineBadge}>
              <View style={s.onlineDot} />
              <Text style={s.onlineText}>{allPeople.length} practicing</Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.membersScroll}
          >
            {allPeople.map((p, i) => renderMemberBubble(p, i))}
          </ScrollView>
        </View>

        {/* Feed header with new post link */}
        <View style={s.feedHeader}>
          <Text style={s.feedTitle}>Sangha Feed</Text>
          <TouchableOpacity onPress={() => router.push('/new-post')} activeOpacity={0.7} style={s.newPostBtn}>
            <Ionicons name="add-circle-outline" size={18} color={moss.accent} />
            <Text style={s.newPostText}>New Post</Text>
          </TouchableOpacity>
        </View>

        {/* Feed posts */}
        {allFeedPosts.map((p) => (
          <View key={p.id} style={s.postCard}>
            <View style={s.postHeader}>
              <TouchableOpacity onPress={() => openProfile(p.userName)} activeOpacity={0.7} style={s.postAuthor}>
                <Image source={{ uri: p.userAvatar }} style={s.postAvatar} />
                <View>
                  <Text style={s.postName}>{p.userName}</Text>
                  <Text style={s.postTime}>{fakeTimeAgo(p.createdAt)}</Text>
                </View>
              </TouchableOpacity>
            </View>
            <Text style={s.postCaption}>{p.caption}</Text>
            {p.imageUrl ? (
              <Image source={{ uri: p.imageUrl }} style={s.postImage} resizeMode="cover" />
            ) : null}
            <View style={s.postFooter}>
              <View style={s.postStat}>
                <Ionicons name="heart-outline" size={17} color={moss.amber} />
                <Text style={s.postStatText}>{p.likesCount}</Text>
              </View>
              <View style={s.postStat}>
                <Ionicons name="chatbubble-outline" size={15} color={moss.muted} />
                <Text style={s.postStatText}>{p.commentsCount}</Text>
              </View>
            </View>
          </View>
        ))}

        {allFeedPosts.length === 0 && (
          <View style={s.emptyState}>
            <Ionicons name="leaf-outline" size={36} color={moss.mutedLight} />
            <Text style={s.emptyText}>No posts yet. Be the first to share!</Text>
          </View>
        )}

      </ScrollView>

      {/* Profile card modal */}
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

/* ══════════════════════════════════════════════════════════════════════════ */
/* STYLES                                                                    */
/* ══════════════════════════════════════════════════════════════════════════ */

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: moss.pageBg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  /* Members strip */
  membersSection: {
    backgroundColor: moss.white,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: moss.divider,
  },
  membersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 16,
    paddingBottom: 12,
  },
  membersSectionTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 18,
    color: moss.ink,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: moss.sageBg,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: moss.accent,
  },
  onlineText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: moss.accent,
  },
  membersScroll: {
    paddingHorizontal: spacing.lg,
    gap: 14,
  },
  memberBubble: {
    alignItems: 'center',
    width: 62,
  },
  memberRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: moss.ring,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  memberAvatar: { width: 44, height: 44, borderRadius: 22 },
  memberName: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: moss.inkMid,
    textAlign: 'center',
  },

  /* Feed header */
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: 18,
    marginBottom: 12,
  },
  feedTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 18,
    color: moss.ink,
  },
  newPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  newPostText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    color: moss.accent,
  },

  /* Post cards */
  postCard: {
    backgroundColor: moss.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: moss.divider,
    marginHorizontal: spacing.lg,
    marginBottom: 12,
    overflow: 'hidden' as any,
  },
  postHeader: {
    padding: 14,
    paddingBottom: 8,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  postAvatar: { width: 38, height: 38, borderRadius: 19 },
  postName: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    color: moss.ink,
  },
  postTime: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: moss.muted,
    marginTop: 1,
  },
  postCaption: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: moss.ink,
    lineHeight: 22,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  postImage: {
    width: '100%' as any,
    height: 240,
    backgroundColor: moss.divider,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 16,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  postStatText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: moss.inkMid,
  },

  /* Empty state */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: moss.muted,
  },

  /* Profile card modal */
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
    fontSize: 14,
    color: moss.accent,
  },
  profileBio: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: moss.ink,
    textAlign: 'center',
    lineHeight: 22,
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
    fontSize: 15,
    color: moss.white,
  },
});
