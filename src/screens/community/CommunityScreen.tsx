// src/screens/community/CommunityScreen.tsx
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

/* ââ Warm earth-tone palette (from mockup) âââââââââââââââââââââââââââââââ */
const warm = {
  headerBg:    '#463B31',
  headerText:  '#FAF6F0',
  pageBg:      '#FAF6F0',
  cardBg:      '#FFFCF8',
  searchBg:    '#FFFFFF',
  searchBorder:'#E8E0D4',
  searchText:  '#8B7D6E',
  ink:         '#3D3229',
  inkMid:      '#5C4F42',
  muted:       '#8B7D6E',
  mutedLight:  '#B5A899',
  accent:      '#C47B3F',   // warm orange-brown
  accentLight: '#F0E0CC',
  sage:        '#7A8B5E',   // olive green for discussion cards
  sageBg:      '#E8EDDF',
  gold:        '#B8944A',   // golden for discussion cards
  goldBg:      '#F5EDD8',
  amber:       '#C4874D',   // amber for discussion cards
  amberBg:     '#F8E8D4',
  terra:       '#A0704C',   // terracotta for accents
  terraBg:     '#F3E4D6',
  divider:     '#EDE5D8',
  greenBadge:  '#4CAF7D',
  heartRed:    '#E05555',
  white:       '#FFFFFF',
  ring:        '#D4A76A',   // avatar ring color
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

/* ââ Mock discussion topics âââââââââââââââââââââââââââââââââââââââââââââââ */
const DISCUSSIONS = [
  { id: '1', title: 'Padmasana Tips',    replies: 125, color: warm.sage,  bg: warm.sageBg  },
  { id: '2', title: 'Overcoming Injury', replies: 99,  color: warm.gold,  bg: warm.goldBg  },
  { id: '3', title: 'Morning Practice Wins', replies: 154, color: warm.amber, bg: warm.amberBg },
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

  /* ââ Render helpers âââââââââââââââââââââââââââââââââââââââââââââââââââââ */

  const renderPartnerAvatar = (p: typeof allPeople[0], index: number) => (
    <TouchableOpacity key={p.id + index} style={s.partnerItem} activeOpacity={0.7} onPress={() => openProfile(p.name)}>
      <View style={s.partnerAvatarRing}>
        {p.avatarUrl ? (
          <Image source={{ uri: p.avatarUrl }} style={s.partnerAvatar} />
        ) : (
          <View style={[s.partnerAvatar, { backgroundColor: warm.accent, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ fontSize: 22, color: warm.white, fontWeight: '600' }}>
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
      {/* ââ Warm header ââ */}
      <View style={s.header}>
        <TouchableOpacity activeOpacity={0.7}>
          <Ionicons name="menu" size={26} color={warm.headerText} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Community</Text>
        <View style={s.headerRight}>
          <TouchableOpacity activeOpacity={0.7} style={s.headerIcon}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={warm.headerText} />
            <View style={s.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(tabs)/profile')}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={s.headerAvatar} />
            ) : (
              <Ionicons name="person" size={22} color={warm.headerText} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ââ Search bar ââ */}
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <Ionicons name="search-outline" size={18} color={warm.muted} />
          <TextInput
            style={s.searchInput}
            placeholder="Search members..."
            placeholderTextColor={warm.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* ââ Underline tabs ââ */}
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

      {/* ââ Scrollable content ââ */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={warm.accent} />}
      >

        {/* âââââââââââ LATEST TAB âââââââââââ */}
        {activeTab === 'latest' && (
          <>
            {/* Find Practicing Partners */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Find Practicing Partners</Text>
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
                        <View style={[s.partnerAvatarRing, { borderColor: warm.greenBadge }]}>
                          <View style={[s.partnerAvatar, { backgroundColor: warm.greenBadge, alignItems: 'center', justifyContent: 'center' }]}>
                            <Text style={{ color: warm.white, fontFamily: 'DMSans_600SemiBold', fontSize: 12 }}>More</Text>
                          </View>
                        </View>
                        <Text style={s.partnerName}>+ More</Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.xl }}>
                    <Text style={{ color: warm.muted, fontSize: 14 }}>No practitioners yet</Text>
                  </View>
                )}
                {/* Arrow indicator */}
                {allPeople.length > 3 && (
                  <View style={s.arrowWrap}>
                    <Ionicons name="chevron-forward" size={20} color={warm.mutedLight} />
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
              <View style={s.emptyState}>
                <Ionicons name="chatbubbles-outline" size={40} color={warm.mutedLight} />
                <Text style={s.emptyText}>No posts yet</Text>
              </View>
            )}
          </>
        )}

        {/* âââââââââââ PEOPLE TAB âââââââââââ */}
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
                          <View style={[s.personAvatar, { backgroundColor: warm.accent, alignItems: 'center', justifyContent: 'center' }]}>
                            <Text style={{ fontSize: 16, color: warm.white, fontWeight: '600' }}>{p.name.charAt(0)}</Text>
                          </View>
                        )}
                        <View style={s.onlineDot} />
                      </View>
                      <View style={s.personInfo}>
                        <Text style={s.personName}>{p.name}</Text>
                        <Text style={s.personMeta}>{p.series} {p.streak > 0 ? `Â· ${p.streak}d streak` : ''}</Text>
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
                        <View style={[s.personAvatar, { backgroundColor: warm.terra, alignItems: 'center', justifyContent: 'center' }]}>
                          <Text style={{ fontSize: 16, color: warm.white, fontWeight: '600' }}>{m.name.charAt(0)}</Text>
                        </View>
                      )}
                    </View>
                    <View style={s.personInfo}>
                      <Text style={s.personName}>{m.name}</Text>
                      <Text style={s.personMeta}>
                        {m.series} {m.location ? `Â· ${m.location}` : ''}
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
                <Ionicons name="people-outline" size={40} color={warm.mutedLight} />
                <Text style={s.emptyText}>No members found yet</Text>
              </View>
            )}
          </>
        )}

        {/* âââââââââââ TOPICS TAB âââââââââââ */}
        {activeTab === 'topics' && (
          <>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Discussion Topics</Text>
            </View>
            {DISCUSSIONS.map((d) => (
              <TouchableOpacity key={d.id} style={[s.topicRow, { borderLeftColor: d.color }]} activeOpacity={0.7}>
                <View style={{ flex: 1 }}>
                  <Text style={s.topicTitle}>{d.title}</Text>
                  <Text style={s.topicMeta}>{d.replies} replies Â· Active today</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={warm.mutedLight} />
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

/* âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
/* STYLES                                                                     */
/* âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: warm.pageBg },

  /* ââ Header âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: warm.headerBg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md + 2,
  },
  headerTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 22,
    color: warm.headerText,
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
    backgroundColor: warm.heartRed,
    borderWidth: 1.5,
    borderColor: warm.headerBg,
  },

  /* ââ Search âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
  searchWrap: {
    backgroundColor: warm.headerBg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: warm.searchBg,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: warm.searchBorder,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: warm.ink,
    padding: 0,
  },

  /* ââ Tabs (underline style) âââââââââââââââââââââââââââââââââââââââââââââââ */
  tabRow: {
    flexDirection: 'row',
    backgroundColor: warm.pageBg,
    borderBottomWidth: 1,
    borderBottomColor: warm.divider,
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
    borderBottomColor: warm.ink,
  },
  tabText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: warm.muted,
  },
  tabTextActive: {
    fontFamily: 'DMSans_600SemiBold',
    color: warm.ink,
  },

  /* ââ Scroll âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  /* ââ Section headers ââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
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
    color: warm.ink,
  },
  sectionLink: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: warm.accent,
  },

  /* ââ Find Practicing Partners âââââââââââââââââââââââââââââââââââââââââââââ */
  partnersCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: warm.cardBg,
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    shadowColor: '#3D3229',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
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
    borderColor: warm.ring,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  partnerAvatar: { width: 54, height: 54, borderRadius: 27 },
  partnerName: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
    color: warm.ink,
    textAlign: 'center',
  },
  partnerLocation: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    color: warm.muted,
    textAlign: 'center',
    marginTop: 1,
  },
  arrowWrap: {
    justifyContent: 'center',
    paddingLeft: spacing.sm,
  },

  /* ââ Popular Discussions ââââââââââââââââââââââââââââââââââââââââââââââââââ */
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

  /* ââ People tab âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: warm.sageBg,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: warm.sage,
  },
  liveText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    color: warm.sage,
  },
  peopleCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: warm.cardBg,
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    shadowColor: '#3D3229',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: warm.divider,
  },
  personAvatarWrap: { position: 'relative' },
  personAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: warm.accentLight,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: warm.sage,
    borderWidth: 2,
    borderColor: warm.cardBg,
  },
  personInfo: { flex: 1 },
  personName: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    color: warm.ink,
  },
  personMeta: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: warm.muted,
    marginTop: 2,
  },
  followBtn: {
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: warm.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: 5,
  },
  followText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
    color: warm.accent,
  },
  followBtnActive: {
    borderRadius: radius.full,
    backgroundColor: warm.accentLight,
    borderWidth: 1.5,
    borderColor: warm.ring,
    paddingHorizontal: spacing.lg,
    paddingVertical: 5,
  },
  followTextActive: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
    color: warm.terra,
  },

  /* ââ Topics tab âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: warm.cardBg,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderLeftWidth: 4,
    shadowColor: '#3D3229',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  topicTitle: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 15,
    color: warm.ink,
    marginBottom: 3,
  },
  topicMeta: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: warm.muted,
  },

  /* ââ Empty state ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ */
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  emptyText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: warm.muted,
  },
});
