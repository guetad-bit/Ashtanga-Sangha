import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, RefreshControl, Dimensions, Modal, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing, radius, shadows } from '@/styles/tokens';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';

import AppHeader from '@/components/AppHeader';
import { getPracticingNow, getFeed, deletePost, followUser, unfollowUser, getFollowing, getUserLikes, supabase } from '@/lib/supabase';

/* Stone & Moss palette */
const moss = {
  pageBg:      '#FFFFFF',
  cardBg:      '#FFFFFF',
  ink:         '#262626',
  inkMid:      '#555555',
  muted:       '#8E8E8E',
  mutedLight:  '#C7C7C7',
  accent:      '#8A9E78',
  accentLight: '#DCE8D3',
  sage:        '#8A9E78',
  sageBg:      '#DCE8D3',
  amber:       '#C4956A',
  amberBg:     '#FFF5EC',
  terra:       '#8B7355',
  divider:     '#EFEFEF',
  heartRed:    '#ED4956',
  white:       '#FFFFFF',
  ring:        '#8A9E78',
  storyGrad1:  '#DE0046',
  storyGrad2:  '#F7A34B',
};

const SCREEN_WIDTH = Dimensions.get('window').width;

interface PracticingUser {
  id: string; name: string; avatar_url: string | null; series: string;
  level: string; streak: number; practicing_started_at: string; location?: string;
}
interface FeedPost {
  id: string; user_id: string; caption: string; image_url: string | null;
  location: string | null; likes_count: number; comments_count?: number;
  created_at: string; profiles: { name: string; avatar_url: string | null } | null;
}
interface Member {
  id: string; name: string; avatar_url: string | null; series: string;
  level: string; streak: number; location: string | null; bio: string | null;
}

const FAKE_USERS_FEED: {
  id: string; name: string; avatarUrl: string; series: string; streak: number; bio: string;
  feedCaption: string; feedImage: string; feedTime: string; feedLikes: number; feedComments: number;
  location?: string;
}[] = [
  { id: 'fake-noa', name: 'Noa Levi', avatarUrl: 'https://i.pravatar.cc/150?img=1', series: 'primary', streak: 142, bio: 'Yoga teacher. 6 years of Ashtanga practice at a shala in Tel Aviv.', feedCaption: 'Perfect morning practice. Primary series flowed beautifully today', feedImage: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad33?w=600&h=600&fit=crop', feedTime: new Date(Date.now() - 2 * 3600000).toISOString(), feedLikes: 12, feedComments: 3, location: 'Tel Aviv, Israel' },
  { id: 'fake-ori', name: 'Ori Cohen', avatarUrl: 'https://i.pravatar.cc/150?img=3', series: 'primary', streak: 8, bio: 'Software developer. Started Ashtanga 8 months ago.', feedCaption: 'Finally caught my toes in Janu Sirsasana! Small wins matter', feedImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=600&fit=crop', feedTime: new Date(Date.now() - 5 * 3600000).toISOString(), feedLikes: 18, feedComments: 7, location: 'Herzliya, Israel' },
  { id: 'fake-michal', name: 'Michal Avraham', avatarUrl: 'https://i.pravatar.cc/150?img=5', series: 'intermediate', streak: 365, bio: 'Psychologist, mother of three. 12 years of practice.', feedCaption: 'Kapotasana — every day is a new beginning. The breath is the key', feedImage: 'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600&h=600&fit=crop', feedTime: new Date(Date.now() - 8 * 3600000).toISOString(), feedLikes: 24, feedComments: 5, location: 'Jerusalem, Israel' },
  { id: 'fake-yotam', name: 'Yotam Barak', avatarUrl: 'https://i.pravatar.cc/150?img=8', series: 'sun_sals', streak: 21, bio: 'Diving instructor in Eilat. Practices on the beach at sunrise.', feedCaption: 'Sun salutations on the reef beach. Nothing like practicing with sand under your feet', feedImage: 'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=600&h=600&fit=crop', feedTime: new Date(Date.now() - 18 * 3600000).toISOString(), feedLikes: 31, feedComments: 9, location: 'Eilat, Israel' },
  { id: 'fake-rinat', name: 'Rinat Shimoni', avatarUrl: 'https://i.pravatar.cc/150?img=9', series: 'primary', streak: 56, bio: 'Architect from Haifa. Home practitioner for 4 years.', feedCaption: 'Home practice corner ready. Mat down, incense lit, phone off', feedImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&h=600&fit=crop', feedTime: new Date(Date.now() - 3 * 3600000).toISOString(), feedLikes: 8, feedComments: 2, location: 'Haifa, Israel' },
  { id: 'fake-daniel', name: 'Daniel Friedman', avatarUrl: 'https://i.pravatar.cc/150?img=11', series: 'primary', streak: 34, bio: 'Chef and restaurant owner. Practices at 10am after night shifts.', feedCaption: 'Late practice + healthy breakfast = perfect day', feedImage: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=600&h=600&fit=crop', feedTime: new Date(Date.now() - 26 * 3600000).toISOString(), feedLikes: 15, feedComments: 4, location: 'Jaffa, Israel' },
  { id: 'fake-talia', name: 'Talia Wolf', avatarUrl: 'https://i.pravatar.cc/150?img=10', series: 'short', streak: 89, bio: 'Organic farmer in the Galilee. Mother of 4.', feedCaption: '40-minute practice between the garden and the barn. That is all you need', feedImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=600&fit=crop', feedTime: new Date(Date.now() - 4 * 3600000).toISOString(), feedLikes: 22, feedComments: 6, location: 'Galilee, Israel' },
  { id: 'fake-ido', name: 'Ido Nachum', avatarUrl: 'https://i.pravatar.cc/150?img=12', series: 'primary', streak: 512, bio: 'Family doctor. 18 years of practice. Travels to Mysore every two years.', feedCaption: 'After 18 years, Supta Kurmasana still teaches me something new every time', feedImage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&h=600&fit=crop', feedTime: new Date(Date.now() - 6 * 3600000).toISOString(), feedLikes: 35, feedComments: 11, location: 'Mysore, India' },
  { id: 'fake-shira', name: 'Shira Mizrahi', avatarUrl: 'https://i.pravatar.cc/150?img=16', series: 'sun_sals', streak: 3, bio: 'Art student. 3 months into Ashtanga. Draws postures in her sketchbook.', feedCaption: 'Drew Virabhadrasana B today. Mixing art and practice', feedImage: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=600&h=600&fit=crop', feedTime: new Date(Date.now() - 48 * 3600000).toISOString(), feedLikes: 27, feedComments: 8, location: 'Bezalel, Jerusalem' },
  { id: 'fake-amir', name: 'Amir Hadad', avatarUrl: 'https://i.pravatar.cc/150?img=13', series: 'primary', streak: 12, bio: 'Lawyer and new dad. Trying to keep up the routine with a baby at home.', feedCaption: 'Baby woke up mid-Navasana. Did the rest with her on my belly', feedImage: 'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=600&h=600&fit=crop', feedTime: new Date(Date.now() - 1 * 3600000).toISOString(), feedLikes: 42, feedComments: 14, location: 'Ramat Gan, Israel' },
  { id: 'fake-sarah', name: 'Sarah Mitchell', avatarUrl: 'https://i.pravatar.cc/150?img=20', series: 'primary', streak: 204, bio: 'Yoga teacher in London. 3 months in Mysore with Sharath.', feedCaption: 'Morning Mysore at the shala. Nothing beats practicing together', feedImage: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&h=600&fit=crop', feedTime: new Date(Date.now() - 7 * 3600000).toISOString(), feedLikes: 19, feedComments: 4, location: 'London, UK' },
  { id: 'fake-david', name: 'David Stern', avatarUrl: 'https://i.pravatar.cc/150?img=14', series: 'intermediate', streak: 730, bio: 'Former Wall Street, now yoga teacher in Brooklyn. 15 years.', feedCaption: 'Kapo day. The backbend that changed everything. Trust the breath.', feedImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop', feedTime: new Date(Date.now() - 10 * 3600000).toISOString(), feedLikes: 28, feedComments: 6, location: 'Brooklyn, NY' },
];

interface UnifiedPost {
  id: string; userName: string; userAvatar: string; caption: string;
  imageUrl: string | null; likesCount: number; commentsCount: number;
  createdAt: string; location?: string | null;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

/* Pick a random "liked by" name from the fake users for each post */
function getLikedByName(postId: string): string {
  const names = FAKE_USERS_FEED.map(u => u.name.split(' ')[0].toLowerCase());
  const idx = Math.abs(postId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % names.length;
  return names[idx];
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
  const [localLiked, setLocalLiked] = useState<Set<string>>(new Set());

  const fetchFollowing = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await getFollowing(user.id);
    if (data) setFollowingIds(new Set(data.map((f: any) => f.following_id)));
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

  const toggleLocalLike = useCallback((postId: string) => {
    setLocalLiked(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
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
      fetchPracticing(); fetchFeed(); fetchMembers(); fetchFollowing(); fetchLikes();
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
    ? [{ id: user.id, name: user.name, avatarUrl: user.avatarUrl ?? null, series: user.series ?? 'primary', streak: 0 }]
    : [];

  const fakeStories = FAKE_USERS_FEED.map((u) => ({
    id: u.id, name: u.name, avatarUrl: u.avatarUrl, series: 'primary', streak: 0,
  }));
  const dbPractitioners = livePractitioners.filter((p) => p.id !== user?.id);
  const allStories = [
    ...meOnMat,
    ...dbPractitioners.map((p) => ({
      id: p.id, name: p.name ?? 'Practitioner', avatarUrl: p.avatar_url,
      series: p.series, streak: p.streak ?? 0,
    })),
    ...fakeStories,
  ];

  /* Merged & sorted feed */
  const allFeedPosts: UnifiedPost[] = [
    ...feedPosts.map((p) => ({
      id: p.id, userName: p.profiles?.name ?? 'Practitioner',
      userAvatar: p.profiles?.avatar_url ?? 'https://i.pravatar.cc/150',
      caption: p.caption ?? '', imageUrl: p.image_url,
      likesCount: p.likes_count ?? 0, commentsCount: p.comments_count ?? 0,
      createdAt: p.created_at, location: p.location,
    })),
    ...userPosts.map((p) => ({
      id: p.id, userName: p.userName,
      userAvatar: p.userAvatar ?? 'https://i.pravatar.cc/150',
      caption: p.caption, imageUrl: p.imageUri ?? null,
      likesCount: p.likesCount ?? 0, commentsCount: 0,
      createdAt: p.createdAt, location: null,
    })),
    ...FAKE_USERS_FEED.map((u) => ({
      id: u.id, userName: u.name, userAvatar: u.avatarUrl,
      caption: u.feedCaption, imageUrl: u.feedImage || null,
      likesCount: u.feedLikes, commentsCount: u.feedComments,
      createdAt: u.feedTime, location: u.location ?? null,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  /* Story bubble */
  const renderStory = (p: typeof allStories[0], index: number) => {
    const isMe = index === 0 && meOnMat.length > 0 && p.id === user?.id;
    return (
      <TouchableOpacity key={p.id + index} style={s.storyItem} activeOpacity={0.7} onPress={() => !isMe && openProfile(p.name)}>
        <LinearGradient
          colors={['#DE0046', '#F7A34B']}
          start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }}
          style={s.storyRing}
        >
          <View style={s.storyRingInner}>
            {p.avatarUrl ? (
              <Image source={{ uri: p.avatarUrl }} style={s.storyAvatar} />
            ) : (
              <View style={[s.storyAvatar, { backgroundColor: moss.accent, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ fontSize: 20, color: '#fff', fontWeight: '600' }}>{p.name.charAt(0)}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
        <Text style={s.storyName} numberOfLines={1}>
          {isMe ? 'You' : p.name.split(' ')[0]}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <AppHeader />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={moss.accent} />}
      >

        {/* ── Stories strip ── */}
        <View style={s.storiesWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.storiesScroll}
          >
            {allStories.map((p, i) => renderStory(p, i))}
          </ScrollView>
        </View>

        {/* ── Feed ── */}
        {allFeedPosts.map((p) => {
          const isLiked = localLiked.has(p.id);
          const displayLikes = p.likesCount + (isLiked ? 1 : 0);
          return (
            <View key={p.id} style={s.postWrap}>
              {/* Post header */}
              <TouchableOpacity style={s.postHeader} activeOpacity={0.7} onPress={() => openProfile(p.userName)}>
                <Image source={{ uri: p.userAvatar }} style={s.postHeaderAvatar} />
                <View style={s.postHeaderInfo}>
                  <Text style={s.postHeaderName}>{p.userName.toLowerCase().replace(/\s/g, '_')}</Text>
                  {p.location ? <Text style={s.postHeaderLocation}>{p.location}</Text> : null}
                </View>
                <TouchableOpacity activeOpacity={0.6} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="ellipsis-horizontal" size={18} color={moss.ink} />
                </TouchableOpacity>
              </TouchableOpacity>

              {/* Post image (full width) */}
              {p.imageUrl ? (
                <TouchableOpacity
                  activeOpacity={0.95}
                  onPress={() => toggleLocalLike(p.id)}
                >
                  <Image source={{ uri: p.imageUrl }} style={s.postImage} resizeMode="cover" />
                </TouchableOpacity>
              ) : null}

              {/* Action row */}
              <View style={s.actionsRow}>
                <View style={s.actionsLeft}>
                  <TouchableOpacity activeOpacity={0.6} onPress={() => toggleLocalLike(p.id)}>
                    <Ionicons
                      name={isLiked ? 'heart' : 'heart-outline'}
                      size={26}
                      color={isLiked ? moss.heartRed : moss.ink}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.6}>
                    <Ionicons name="chatbubble-outline" size={23} color={moss.ink} />
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.6}>
                    <Ionicons name="paper-plane-outline" size={23} color={moss.ink} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity activeOpacity={0.6}>
                  <Ionicons name="bookmark-outline" size={24} color={moss.ink} />
                </TouchableOpacity>
              </View>

              {/* Likes */}
              <Text style={s.likesText}>
                Liked by <Text style={s.bold}>{getLikedByName(p.id)}</Text> and <Text style={s.bold}>{displayLikes.toLocaleString()} others</Text>
              </Text>

              {/* Caption */}
              <Text style={s.captionText}>
                <Text style={s.bold}>{p.userName.toLowerCase().replace(/\s/g, '_')}</Text>{'  '}{p.caption}
              </Text>

              {/* Comments hint */}
              {p.commentsCount > 0 && (
                <TouchableOpacity activeOpacity={0.6}>
                  <Text style={s.viewComments}>View all {p.commentsCount} comments</Text>
                </TouchableOpacity>
              )}

              {/* Time */}
              <Text style={s.timeText}>{timeAgo(p.createdAt)} ago</Text>
            </View>
          );
        })}

        {allFeedPosts.length === 0 && (
          <View style={s.emptyState}>
            <Ionicons name="leaf-outline" size={36} color={moss.mutedLight} />
            <Text style={s.emptyText}>No posts yet. Be the first to share!</Text>
          </View>
        )}

      </ScrollView>

      {/* Floating new post button */}
      <TouchableOpacity style={s.fab} activeOpacity={0.85} onPress={() => router.push('/new-post')}>
        <Ionicons name="add" size={28} color={moss.white} />
      </TouchableOpacity>

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
                <TouchableOpacity style={s.profileFollowBtn} onPress={() => setProfileCard(null)} activeOpacity={0.7}>
                  <Text style={s.profileFollowBtnText}>Follow</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setProfileCard(null)} activeOpacity={0.7}>
                  <Text style={s.profileCloseText}>Close</Text>
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
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: moss.pageBg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  /* Stories strip */
  storiesWrap: {
    borderBottomWidth: 1,
    borderBottomColor: moss.divider,
    backgroundColor: moss.white,
  },
  storiesScroll: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 14,
  },
  storyItem: { alignItems: 'center', width: 68 },
  storyRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  storyRingInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2.5,
    borderColor: moss.white,
    overflow: 'hidden',
  },
  storyAvatar: { width: '100%' as any, height: '100%' as any, borderRadius: 28 },
  storyName: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: moss.ink,
    textAlign: 'center',
    maxWidth: 68,
  },

  /* Post */
  postWrap: {
    backgroundColor: moss.white,
    borderBottomWidth: 1,
    borderBottomColor: moss.divider,
    marginBottom: 4,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  postHeaderAvatar: { width: 34, height: 34, borderRadius: 17 },
  postHeaderInfo: { flex: 1 },
  postHeaderName: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    color: moss.ink,
  },
  postHeaderLocation: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: moss.muted,
    marginTop: 1,
  },
  postImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    backgroundColor: moss.divider,
  },

  /* Actions row */
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  actionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  /* Likes, caption, comments, time */
  likesText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: moss.ink,
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  bold: {
    fontFamily: 'DMSans_600SemiBold',
  },
  captionText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: moss.ink,
    lineHeight: 18,
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  viewComments: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: moss.muted,
    paddingHorizontal: 14,
    marginBottom: 3,
  },
  timeText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: moss.muted,
    textTransform: 'uppercase',
    paddingHorizontal: 14,
    paddingBottom: 12,
    letterSpacing: 0.3,
  },

  /* FAB */
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: moss.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  /* Empty state */
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontFamily: 'DMSans_400Regular', fontSize: 15, color: moss.muted },

  /* Profile card modal */
  profileBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  profileCard: {
    backgroundColor: moss.white, borderRadius: 20, padding: 28,
    alignItems: 'center', width: '100%', maxWidth: 320,
    ...shadows.lg,
  },
  profileAvatar: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: moss.accent, marginBottom: 14,
  },
  profileName: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 20,
    color: moss.ink, marginBottom: 10,
  },
  profileBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  profileBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: moss.sageBg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14,
  },
  profileBadgeText: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: moss.accent },
  profileBio: {
    fontFamily: 'DMSans_400Regular', fontSize: 14, color: moss.inkMid,
    textAlign: 'center', lineHeight: 20, marginBottom: 18,
  },
  profileFollowBtn: {
    backgroundColor: moss.accent, borderRadius: 8,
    paddingHorizontal: 40, paddingVertical: 10, marginBottom: 10,
  },
  profileFollowBtnText: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: moss.white,
  },
  profileCloseText: {
    fontFamily: 'DMSans_500Medium', fontSize: 13, color: moss.muted, paddingVertical: 6,
  },
});
