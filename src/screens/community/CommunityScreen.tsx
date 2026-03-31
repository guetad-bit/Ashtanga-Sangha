import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, RefreshControl, TextInput, Dimensions, Modal, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import PostCard from '@/components/community/PostCard';
import AppHeader from '@/components/AppHeader';
import { getPracticingNow, getFeed, deletePost, supabase } from '@/lib/supabase';

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
}[] = [];

export default function CommunityScreen() {
  const router = useRouter();
  const { user, userPosts } = useAppStore();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const [activeTab, setActiveTab] = useState<Tab>('latest');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [livePractitioners, setLivePractitioners] = useState<PracticingUser[]>([]);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [profileCard, setProfileCard] = useState<{ name: string; avatarUrl: string; series: string; streak: number; bio: string } | null>(null);

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

  // Combine real practitioners + fake demo users (same as homepage)
  const fakeOnMat = FAKE_USERS_FEED.map((u) => ({
    id: u.id, name: u.name, avatarUrl: u.avatarUrl,
    location: null, series: 'primary', streak: 0,
  }));
  const allPeople = [
    ...livePractitioners.map((p) => ({
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
            style={[s.searchInput, isRTL && { textAlign: 'right' }]}
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
                        <Text style={s.partnerName}>{t('community.more')}</Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, width: '100%' }}>
                    <Text style={{ color: moss.muted, fontSize: 14, textAlign: isRTL ? 'right' : 'left' }}>{t('community.noPractitioners')}</Text>
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

            {/* Sangha Feed */}
            <View style={[s.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={[s.sectionTitle, isRTL && { textAlign: 'right' }]}>{t('community.sanghaFeed')}</Text>
              <TouchableOpacity onPress={() => router.push('/new-post')} activeOpacity={0.7}>
                <Text style={s.sectionLink}>{t('community.newPost')}</Text>
              </TouchableOpacity>
            </View>

            {feedPosts.length > 0 ? (
              feedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  postId={post.id}
                  userName={post.profiles?.name ?? 'Practitioner'}
                  userAvatar={post.profiles?.avatar_url ?? 'https://via.placeholder.com/120'}
                  imageUrl={post.image_url ?? undefined}
                  caption={post.caption ?? ''}
                  location={post.location ?? undefined}
                  likesCount={post.likes_count ?? 0}
                  isLiked={false}
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
              ))
            ) : userPosts.length > 0 ? (
              userPosts.map((post) => (
                <PostCard
                  key={post.id}
                  postId={post.id}
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
                    // Also remove from local store
                    setFeedPosts((prev) => prev.filter((p) => p.id !== id));
                  }}
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
                  <TouchableOpacity style={s.followBtn} activeOpacity={0.7}>
                    <Text style={s.followText}>{t('community.follow')}</Text>
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
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 18,
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
    fontSize: 12,
    color: moss.accent,
  },
  profileBio: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: moss.inkMid,
    textAlign: 'center',
    lineHeight: 20,
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
    fontSize: 14,
    color: moss.white,
  },
});
