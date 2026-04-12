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

import { getPracticingNow, getFeed, deletePost, followUser, unfollowUser, getFollowing, getUserLikes, supabase } from '@/lib/supabase';
import { MOCK_SANGHA_POSTS, MOCK_PRACTICING_NOW } from '@/data/mockSanghaUsers';

/* Clay palette */
const moss = {
  pageBg:      '#F5EFE6',
  cardBg:      '#FFFFFF',
  ink:         '#2A2420',
  inkMid:      '#4A3F36',
  muted:       '#8A7A68',
  mutedLight:  '#B5A793',
  accent:      '#C26B4D',
  accentLight: '#F7F1E7',
  sage:        '#A8B59B',
  sageBg:      '#F0F5EB',
  amber:       '#C4956A',
  amberBg:     '#FFF5EC',
  terra:       '#8B7355',
  divider:     '#E8DFD0',
  heartRed:    '#C26B4D',
  white:       '#FFFFFF',
  ring:        '#C26B4D',
  storyGrad1:  '#C26B4D',
  storyGrad2:  '#C4956A',
  sand:        '#EFE3D3',
  border:      '#E8DFD0',
  clayDark:    '#A5502F',
  success:     '#6E7F5C',
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
    const member = members.find((m) => m.name === name);
    if (member) {
      setProfileCard({ name: member.name, avatarUrl: member.avatar_url ?? '', series: member.series, streak: member.streak, bio: member.bio ?? '' });
    }
  }, [members]);

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
    const real = (data ?? []) as PracticingUser[];
    setLivePractitioners([...real, ...(MOCK_PRACTICING_NOW as any as PracticingUser[])]);
  }, []);

  const fetchFeed = useCallback(async () => {
    const { data } = await getFeed(user?.id ?? '');
    const real = (data ?? []) as FeedPost[];
    setFeedPosts([...real, ...(MOCK_SANGHA_POSTS as any as FeedPost[])]);
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

  const dbPractitioners = livePractitioners.filter((p) => p.id !== user?.id);
  const allStories = [
    ...meOnMat,
    ...dbPractitioners.map((p) => ({
      id: p.id, name: p.name ?? 'Practitioner', avatarUrl: p.avatar_url,
      series: p.series, streak: p.streak ?? 0,
    })),
    ...members.map((m) => ({
      id: m.id, name: m.name, avatarUrl: m.avatar_url,
      series: m.series, streak: m.streak ?? 0,
    })),
  ];

  /* Merged & sorted feed */
  const allFeedPosts: UnifiedPost[] = [
    ...feedPosts.map((p) => ({
      id: p.id, userName: p.profiles?.name ?? 'Practitioner',
      userAvatar: p.profiles?.avatar_url ?? 'https://ui-avatars.com/api/?background=8A9E78&color=fff&name=P',
      caption: p.caption ?? '', imageUrl: p.image_url,
      likesCount: p.likes_count ?? 0, commentsCount: p.comments_count ?? 0,
      createdAt: p.created_at, location: p.location,
    })),
    ...userPosts.map((p) => ({
      id: p.id, userName: p.userName,
      userAvatar: p.userAvatar ?? 'https://ui-avatars.com/api/?background=8A9E78&color=fff&name=P',
      caption: p.caption, imageUrl: p.imageUri ?? null,
      likesCount: p.likesCount ?? 0, commentsCount: 0,
      createdAt: p.createdAt, location: null,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  /* Story bubble */
  const renderStory = (p: typeof allStories[0], index: number) => {
    const isMe = index === 0 && meOnMat.length > 0 && p.id === user?.id;
    return (
      <TouchableOpacity key={p.id + index} style={s.storyItem} activeOpacity={0.7} onPress={() => !isMe && openProfile(p.name)}>
        <LinearGradient
          colors={[moss.accent, moss.clayDark]}
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
      {/* Top brand bar */}
      <View style={s.topBar}>
        <Text style={s.brandWord}>sangha</Text>
        <View style={s.topRight}>
          <TouchableOpacity style={s.bellBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={18} color={moss.ink} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/profile' as any)}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={s.avatarTopSm} />
            ) : (
              <View style={[s.avatarTopSm, { backgroundColor: moss.accent, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>{user?.name?.charAt(0) ?? '?'}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

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
                      name={isLiked ? 'flower' : 'flower-outline'}
                      size={26}
                      color={isLiked ? moss.accent : moss.ink}
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

              {/* Gratitude */}
              <Text style={s.likesText}>
                <Text style={s.bold}>
                  {displayLikes === 0
                    ? 'Offer gratitude 🙏'
                    : displayLikes === 1
                    ? 'Received with gratitude'
                    : `Received with gratitude by ${displayLikes} practitioners`}
                </Text>
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

  /* top brand bar */
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8 },
  brandWord: { fontFamily: 'Georgia', fontSize: 24, fontWeight: '300', letterSpacing: 7, color: moss.accent, paddingLeft: 7 },
  topRight: { flexDirection: 'row', alignItems: 'center' },
  bellBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarTopSm: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: '#fff' },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  /* Stories strip */
  storiesWrap: {
    borderBottomWidth: 1,
    borderBottomColor: moss.border,
    backgroundColor: moss.pageBg,
  },
  storiesScroll: {
    paddingHorizontal: 14,
    paddingVertical: 14,
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
    fontSize: 11,
    color: moss.ink,
    textAlign: 'center',
    maxWidth: 68,
  },

  /* Post */
  postWrap: {
    backgroundColor: moss.white,
    marginHorizontal: 14,
    marginBottom: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: moss.border,
    overflow: 'hidden',
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
    fontSize: 13,
    fontWeight: '700',
    color: moss.ink,
  },
  postHeaderLocation: {
    fontSize: 11,
    color: moss.muted,
    marginTop: 1,
  },
  postImage: {
    width: '100%' as any,
    height: 280,
    backgroundColor: moss.sand,
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
    fontSize: 13,
    color: moss.ink,
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  bold: { fontWeight: '700' },
  captionText: {
    fontSize: 13,
    color: moss.ink,
    lineHeight: 18,
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  viewComments: {
    fontSize: 13,
    color: moss.muted,
    paddingHorizontal: 14,
    marginBottom: 3,
  },
  timeText: {
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
    shadowColor: moss.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
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
  profileName: { fontSize: 20, fontWeight: '800',
    color: moss.ink, marginBottom: 10,
  },
  profileBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  profileBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: moss.sageBg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14,
  },
  profileBadgeText: { fontSize: 13, fontWeight: '600', color: moss.accent },
  profileBio: { fontSize: 14, color: moss.inkMid,
    textAlign: 'center', lineHeight: 20, marginBottom: 18,
  },
  profileFollowBtn: {
    backgroundColor: moss.accent, borderRadius: 8,
    paddingHorizontal: 40, paddingVertical: 10, marginBottom: 10,
  },
  profileFollowBtnText: { fontSize: 14, color: moss.white,
  },
  profileCloseText: { fontSize: 13, color: moss.muted, paddingVertical: 6,
  },
});
