import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, RefreshControl, TextInput, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import PostCard from '@/components/community/PostCard';
import { getPracticingNow, getFeed, supabase } from '@/lib/supabase';

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

type Tab = 'latest' | 'people' | 'topics';

interface PracticingUser {
  id: string;
  name: string;
  avatar_url: string | null;
  series: string;
  level: string;
  streak: number;
  practicing_since: string;
  location?: string;
}

interface FeedPost {
  id: string;
  user_id: string;
  caption: string;
  image_url: string | null;
  location: string | null;
  likes_count: number;
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

/* ── Mock discussion topics ─────────────────────────────────────────────── */
const DISCUSSIONS = [
  { id: '1', title: 'Padmasana Tips',    replies: 125, color: moss.sage,  bg: moss.sageBg  },
  { id: '2', title: 'Overcoming Injury', replies: 99,  color: moss.gold,  bg: moss.goldBg  },
  { id: '3', title: 'Morning Practice Wins', replies: 154, color: moss.amber, bg: moss.amberBg },
];

// Fake users for demo feed
const FAKE_USERS_FEED = [
  { id: 'f1', name: 'Liat', avatarUrl: 'https://i.pravatar.cc/200?img=5', feedCaption: 'Morning Mysore done — feeling so grateful for this practice.', feedImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&q=80', feedTime: '4 min ago', feedLikes: 3, feedComments: 1 },
  { id: 'f2', name: 'David', avatarUrl: 'https://i.pravatar.cc/200?img=11', feedCaption: 'Working on my dropbacks! Finally catching my ankles.', feedImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&q=80', feedTime: '15 min ago', feedLikes: 5, feedComments: 2 },
  { id: 'f3', name: 'Emma', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80', feedCaption: 'Supta Kurmasana breakthrough today — never give up!', feedImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=300&q=80', feedTime: '22 min ago', feedLikes: 7, feedComments: 3 },
  { id: 'f4', name: 'Noah', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80', feedCaption: 'Led class this morning was intense. Love the energy of practicing together.', feedImage: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=300&q=80', feedTime: '35 min ago', feedLikes: 4, feedComments: 1 },
  { id: 'f5', name: 'Priya', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', feedCaption: 'Kapotasana progress — patience is the real practice.', feedImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&q=80', feedTime: '1 hr ago', feedLikes: 9, feedComments: 4 },
  { id: 'f6', name: 'Marco', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', feedCaption: 'Three weeks straight — the mat is my medicine.', feedImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&q=80', feedTime: '1 hr ago', feedLikes: 12, feedComments: 5 },
  { id: 'f7', name: 'Yuki', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80', feedCaption: 'Beautiful sunrise practice at the shala today.', feedImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=300&q=80', feedTime: '2 hr ago', feedLikes: 6, feedComments: 2 },
];

export default function CommunityScreen() {
  const router = useRouter();
  const { user, userPosts } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('latest');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [livePractitioners, setLivePractitioners] = useState<PracticingUser[]>([]);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const openProfile = useCallback((name: string) => {}, []);

  const fetchPracticing = useCallback(async () => {
    const { data } = await getPracticingNow();
    if (data) setLivePractitioners(data as PracticingUser[]);
  }, []);

  const fetchFeed = useCallback(async () => {
    const { data } = await getFeed(user?.id ?? '');
    if (data) setFeedPosts(data as FeedPost[]);
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

  useEffect(() => {
    fetchPracticing();
    fetchFeed();
    fetchMembers();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchPracticing(), fetchFeed(), fetchMembers()]);
    setRefreshing(false);
  }, []);

  const allPeople = [
    ...livePractitioners.map((p) => ({
      id: p.id,
      name: p.name ?? 'Practitioner',
      avatarUrl: p.avatar_url,
      location: p.location ?? null,
      series: p.series,
      streak: p.streak ?? 0,
    })),
    ...members.map((m) => ({
      id: m.id,
      name: m.name ?? 'Practitioner',
      avatarUrl: m.avatar_url,
      location: m.location,
      series: m.series,
      streak: m.streak ?? 0,
    })),
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

  const renderDiscussionCard = (d: typeof DISCUSSIONS[0]) => (
    <TouchableOpacity key={d.id} style={[s.discussionCard, { backgroundColor: d.bg }]} activeOpacity={0.7}>
      <Text style={[s.discussionTitle, { color: d.color }]}>{d.title}</Text>
      <Text style={[s.discussionReplies, { color: d.color }]}>{d.replies} Replies</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* ── Light header ── */}
      <View style={s.header}>
        <TouchableOpacity activeOpacity={0.7}>
          <Ionicons name="menu" size={26} color={moss.headerText} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Community</Text>
        <View style={s.headerRight}>
          <TouchableOpacity activeOpacity={0.7} style={s.headerIcon}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={moss.headerText} />
            <View style={s.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(tabs)/profile')}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={s.headerAvatar} />
            ) : (
              <Ionicons name="person" size={22} color={moss.headerText} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search bar ── */}
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <Ionicons name="search-outline" size={18} color={moss.muted} />
          <TextInput
            style={s.searchInput}
            placeholder="Search members..."
            placeholderTextColor={moss.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* ── Underline tabs ── */}
      <View style={s.tabRow}>
        {(['latest', 'people', 'topics'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, activeTab === tab && s.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
              {tab === 'latest' ? 'Latest' : tab === 'people' ? 'People' : 'Topics'}
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
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>On the Mat Right Now</Text>
            </View>
            <View style={s.partnersCard}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.partnersScroll}
              >
                {allPeople.length > 0 ? (
                  <>
                    {allPeople.slice(0, 4).map((p, i) => renderPartnerAvatar(p, i))}
                    {allPeople.length > 4 && (
                      <TouchableOpacity style={s.partnerItem} activeOpacity={0.7}>
                        <View style={[s.partnerAvatarRing, { borderColor: moss.greenBadge }]}>
                          <View style={[s.partnerAvatar, { backgroundColor: moss.greenBadge, alignItems: 'center', justifyContent: 'center' }]}>
                            <Text style={{ color: moss.white, fontFamily: 'DMSans_600SemiBold', fontSize: 12 }}>More</Text>
                          </View>
                        </View>
                        <Text style={s.partnerName}>+ More</Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.xl }}>
                    <Text style={{ color: moss.muted, fontSize: 14 }}>No practitioners yet</Text>
                  </View>
                )}
                {/* Arrow indicator */}
                {allPeople.length > 3 && (
                  <View style={s.arrowWrap}>
                    <Ionicons name="chevron-forward" size={20} color={moss.mutedLight} />
                  </View>
                )}
              </ScrollView>
            </View>

            {/* Popular Discussions */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Popular Discussions</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.discussionsScroll}
            >
              {DISCUSSIONS.map(renderDiscussionCard)}
            </ScrollView>

            {/* Sangha Feed */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Sangha Feed</Text>
              <TouchableOpacity onPress={() => router.push('/new-post')} activeOpacity={0.7}>
                <Text style={s.sectionLink}>New post</Text>
              </TouchableOpacity>
            </View>

            {feedPosts.length > 0 ? (
              feedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  userName={post.profiles?.name ?? 'Practitioner'}
                  userAvatar={post.profiles?.avatar_url ?? 'https://via.placeholder.com/120'}
                  imageUrl={post.image_url ?? undefined}
                  caption={post.caption ?? ''}
                  location={post.location ?? undefined}
                  likesCount={post.likes_count ?? 0}
                  isLiked={false}
                  createdAt={post.created_at}
                  tags={[]}
                  onUserPress={() => openProfile(post.profiles?.name ?? '')}
                />
              ))
            ) : userPosts.length > 0 ? (
              userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  userName={post.userName}
                  userAvatar={post.userAvatar ?? 'https://via.placeholder.com/120'}
                  imageUrl={post.imageUri}
                  caption={post.caption}
                  location={post.location}
                  likesCount={post.likesCount}
                  isLiked={post.isLiked}
                  createdAt={post.createdAt}
                  tags={post.tags}
                  onUserPress={() => openProfile(post.userName)}
                />
              ))
            ) : (
              FAKE_USERS_FEED.map((u) => (
                <View key={u.id} style={{ backgroundColor: moss.cardBg, borderRadius: 16, borderWidth: 1, borderColor: moss.divider, marginHorizontal: spacing.lg, marginBottom: 12, overflow: 'hidden' }}>
                  <View style={{ flexDirection: 'row' }}>
                    <View style={{ flex: 1, padding: 16 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <Image source={{ uri: u.avatarUrl }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                        <View>
                          <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 15, color: moss.ink }}>{u.name}</Text>
                          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: moss.muted }}>{u.feedTime}</Text>
                        </View>
                      </View>
                      <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 15, color: moss.ink, marginBottom: 10 }}>{u.feedCaption}</Text>
                      <View style={{ flexDirection: 'row', gap: 14 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="heart-outline" size={14} color={moss.heartRed ?? moss.amber} />
                          <Text style={{ fontSize: 14, color: moss.heartRed ?? moss.amber }}>{u.feedLikes}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="chatbubble-outline" size={13} color={moss.muted} />
                          <Text style={{ fontSize: 14, color: moss.muted }}>{u.feedComments}</Text>
                        </View>
                      </View>
                    </View>
                    <Image source={{ uri: u.feedImage }} style={{ width: 130, minHeight: 120 }} />
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* ═══════════ PEOPLE TAB ═══════════ */}
        {activeTab === 'people' && (
          <>
            {/* On the mat now */}
            {livePractitioners.length > 0 && (
              <>
                <View style={s.sectionHeader}>
                  <Text style={s.sectionTitle}>On the Mat Now</Text>
                  <View style={s.liveBadge}>
                    <View style={s.liveDot} />
                    <Text style={s.liveText}>{livePractitioners.length}</Text>
                  </View>
                </View>
                <View style={s.peopleCard}>
                  {livePractitioners.map((p) => (
                    <TouchableOpacity key={p.id} style={s.personRow} activeOpacity={0.7} onPress={() => openProfile(p.name)}>
                      <View style={s.personAvatarWrap}>
                        {p.avatar_url ? (
                          <Image source={{ uri: p.avatar_url }} style={s.personAvatar} />
                        ) : (
                          <View style={[s.personAvatar, { backgroundColor: moss.accent, alignItems: 'center', justifyContent: 'center' }]}>
                            <Text style={{ fontSize: 16, color: moss.white, fontWeight: '600' }}>{p.name.charAt(0)}</Text>
                          </View>
                        )}
                        <View style={s.onlineDot} />
                      </View>
                      <View style={s.personInfo}>
                        <Text style={s.personName}>{p.name}</Text>
                                     <Text style={s.personMeta}>{p.series} {p.streak > 0 ? `· On the mat` : ''}</Text>
                      </View>
                      <View style={s.followBtnActive}>
                        <Text style={s.followTextActive}>Following</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* All Members */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Community Members</Text>
            </View>
            {members.length > 0 ? (
              <View style={s.peopleCard}>
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
                    <TouchableOpacity style={s.followBtn} activeOpacity={0.7}>
                      <Text style={s.followText}>Follow</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={s.emptyState}>
                <Ionicons name="people-outline" size={40} color={moss.mutedLight} />
                <Text style={s.emptyText}>No members found yet</Text>
              </View>
            )}
          </>
        )}

        {/* ═══════════ TOPICS TAB ═══════════ */}
        {activeTab === 'topics' && (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Discussion Topics</Text>
            </View>
            {DISCUSSIONS.map((d) => (
              <TouchableOpacity key={d.id} style={[s.topicRow, { borderLeftColor: d.color }]} activeOpacity={0.7}>
                <View style={{ flex: 1 }}>
                  <Text style={s.topicTitle}>{d.title}</Text>
                  <Text style={s.topicMeta}>{d.replies} replies · Active today</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={moss.mutedLight} />
              </TouchableOpacity>
            ))}
            <View style={s.emptyState}>
              <Text style={[s.emptyText, { marginTop: spacing.lg }]}>More topics coming soon</Text>
            </View>
          </>
        )}
      </ScrollView>
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
  headerAvatar: { width: 28, height: 28, borderRadius: 14 },
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
    fontSize: 14,
    color: moss.ink,
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
    fontSize: 15,
    color: moss.mutedLight,
  },
  tabTextActive: {
    fontFamily: 'DMSans_600SemiBold',
    color: moss.ink,
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
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 17,
    color: moss.ink,
  },
  sectionLink: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
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
    fontSize: 12,
    color: moss.ink,
    textAlign: 'center',
  },
  partnerLocation: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: moss.muted,
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
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  discussionReplies: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
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
    fontSize: 11,
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
    fontSize: 14,
    color: moss.ink,
  },
  personMeta: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: moss.muted,
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
    fontSize: 11,
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
    fontSize: 11,
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
    fontSize: 12,
    color: moss.muted,
  },

  /* ── Empty state ────────────────────────────────────────────────────────── */
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  emptyText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: moss.mutedLight,
  },
});
