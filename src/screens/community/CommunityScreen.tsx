// src/screens/community/CommunityScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, RefreshControl, TextInput, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import PostCard from '@/components/community/PostCard';
import { getPracticingNow, getFeed, supabase } from '@/lib/supabase';

/* Ã¢ÂÂÃ¢ÂÂ Warm palette (shared with HomeScreen) Ã¢ÂÂÃ¢ÂÂ */
const warm = {
  bg: '#FAF8F5', cardBg: '#FFFFFF', headerBg: '#FFFFFF',
  ink: '#3D3229', inkMid: '#5C4F42', muted: '#8B7D6E', mutedLight: '#B5A899',
  accent: '#C47B3F', accentLight: '#F0E0CC',
  sage: '#7A8B5E', sageBg: '#E8EDDF',
  gold: '#B8944A', goldBg: '#F5EDD8',
  amber: '#C4874D', amberBg: '#F8E8D4', terra: '#A0704C',
  divider: '#EDE5D8', orange: '#E8834A', orangeLight: '#FFF0E6',
  white: '#FFFFFF', ring: '#D4A76A', heartRed: '#E05555',
  blue: '#5B8DB8', blueBg: '#E8F0F8',
};

const SCREEN_WIDTH = Dimensions.get('window').width;

type Tab = 'latest' | 'people' | 'topics';

interface PracticingUser {
  id: string; name: string; avatar_url: string | null;
  series: string; level: string; streak: number;
  practicing_since: string; location?: string;
}

interface FeedPost {
  id: string; user_id: string; caption: string; image_url: string | null;
  location: string | null; likes_count: number; created_at: string;
  profiles: { name: string; avatar_url: string | null } | null;
}

interface Member {
  id: string; name: string; avatar_url: string | null;
  series: string; level: string; streak: number;
  location: string | null; bio: string | null;
}

/* Ã¢ÂÂÃ¢ÂÂ Mock data Ã¢ÂÂÃ¢ÂÂ */
const DISCUSSIONS: { id: string; title: string; replies: number; icon: any; color: string; bg: string }[] = [];

const MOCK_MEMBERS: { id: string; name: string; avatar: string; series: string; streak: number; location: string }[] = [];

const PRACTICING_MOCK: { id: string; name: string; avatar: string; series: string; min: number }[] = [];

const FEED_MOCK: { id: string; name: string; avatar: string; caption: string; time: string; likes: number; tags: string[] }[] = [];

/* Ã¢ÂÂÃ¢ÂÂ Component Ã¢ÂÂÃ¢ÂÂ */
export default function CommunityScreen() {
  const router = useRouter();
  const { user, userPosts } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('latest');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [livePractitioners, setLivePractitioners] = useState<PracticingUser[]>([]);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  const fetchPracticing = useCallback(async () => {
    try {
      const { data } = await getPracticingNow();
      if (data) setLivePractitioners(data as PracticingUser[]);
    } catch (e) { console.log('fetch practicing error', e); }
  }, []);

  const fetchFeed = useCallback(async () => {
    try {
      const { data } = await getFeed(user?.id ?? '');
      if (data) setFeedPosts(data as FeedPost[]);
    } catch (e) { console.log('fetch feed error', e); }
  }, [user?.id]);

  const fetchMembers = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, series, level, streak, location, bio')
        .neq('id', user?.id ?? '')
        .order('streak', { ascending: false })
        .limit(50);
      if (data) setMembers(data as Member[]);
    } catch (e) { console.log('fetch members error', e); }
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

  /* Ã¢ÂÂÃ¢ÂÂ Tabs Ã¢ÂÂÃ¢ÂÂ */
  const TABS: { key: Tab; label: string }[] = [
    { key: 'latest', label: 'Latest' },
    { key: 'people', label: 'People' },
    { key: 'topics', label: 'Topics' },
  ];

  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      {/* Ã¢ÂÂÃ¢ÂÂ Top Bar (matches homepage) Ã¢ÂÂÃ¢ÂÂ */}
      <View style={st.topBar}>
        <View style={st.topBarLeft}>
          <Ionicons name="people" size={24} color={warm.orange} />
          <Text style={st.brandText}>Community</Text>
        </View>
        <View style={st.topBarRight}>
          <TouchableOpacity style={st.newPostBtn} onPress={() => router.push('/new-post')}>
            <Ionicons name="add" size={18} color={warm.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={st.topAvatar} />
            ) : (
              <View style={[st.topAvatar, { backgroundColor: warm.accentLight, alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="person" size={18} color={warm.accent} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Ã¢ÂÂÃ¢ÂÂ Search bar Ã¢ÂÂÃ¢ÂÂ */}
      <View style={st.searchWrap}>
        <View style={st.searchBar}>
          <Ionicons name="search-outline" size={16} color={warm.muted} />
          <TextInput
            style={st.searchInput}
            placeholder="Search members, topics..."
            placeholderTextColor={warm.mutedLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Ã¢ÂÂÃ¢ÂÂ Pill tabs (matches homepage feed tabs style) Ã¢ÂÂÃ¢ÂÂ */}
      <View style={st.tabRow}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[st.tab, activeTab === t.key && st.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[st.tabText, activeTab === t.key && st.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Ã¢ÂÂÃ¢ÂÂ Content Ã¢ÂÂÃ¢ÂÂ */}
      <ScrollView
        style={st.scroll}
        contentContainerStyle={st.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={warm.accent} />}
      >

        {/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ LATEST TAB Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */}
        {activeTab === 'latest' && (
          <>
            {/* On the Mat Now Ã¢ÂÂ live strip */}
            <View style={st.liveStrip}>
              <View style={st.liveStripHeader}>
                <View style={st.liveStripDot} />
                <Text style={st.liveStripTitle}>On the Mat Now</Text>
                <Text style={st.liveStripCount}>{PRACTICING_MOCK.length} practicing</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.liveAvatarScroll}>
                {PRACTICING_MOCK.map((p) => (
                  <TouchableOpacity key={p.id} style={st.liveAvatarItem}>
                    <View style={st.liveAvatarRing}>
                      <Image source={{ uri: p.avatar }} style={st.liveAvatarImg} />
                    </View>
                    <Text style={st.liveAvatarName}>{p.name}</Text>
                    <Text style={st.liveAvatarMeta}>{p.min}m</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Popular Discussions Ã¢ÂÂ horizontal cards */}
            <Text style={st.sectionTitle}>Popular Discussions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.discScroll}>
              {DISCUSSIONS.map((d) => (
                <TouchableOpacity key={d.id} style={[st.discCard, { backgroundColor: d.bg }]}>
                  <Ionicons name={d.icon} size={20} color={d.color} style={{ marginBottom: 6 }} />
                  <Text style={[st.discTitle, { color: d.color }]}>{d.title}</Text>
                  <Text style={[st.discReplies, { color: d.color }]}>{d.replies} replies</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Sangha Feed */}
            <View style={st.feedHeader}>
              <Text style={st.sectionTitle}>Sangha Feed</Text>
              <TouchableOpacity onPress={() => router.push('/new-post')}>
                <Text style={st.newPostLink}>+ New post</Text>
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
                  onUserPress={() => {}}
                />
              ))
            ) : (
              /* Mock feed when no real data */
              FEED_MOCK.map((f) => (
                <View key={f.id} style={st.feedItem}>
                  <Image source={{ uri: f.avatar }} style={st.feedAvatar} />
                  <View style={st.feedContent}>
                    <View style={st.feedNameRow}>
                      <Text style={st.feedName}>{f.name}</Text>
                      <Text style={st.feedTime}>{f.time}</Text>
                    </View>
                    <Text style={st.feedCaption}>{f.caption}</Text>
                    <View style={st.feedTagRow}>
                      {f.tags.map((tag) => (
                        <View key={tag} style={st.feedTag}>
                          <Text style={st.feedTagText}>#{tag}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={st.feedActions}>
                      <TouchableOpacity style={st.feedAction}>
                        <Ionicons name="heart-outline" size={16} color={warm.muted} />
                        <Text style={st.feedActionText}>{f.likes}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={st.feedAction}>
                        <Ionicons name="chatbubble-outline" size={14} color={warm.muted} />
                        <Text style={st.feedActionText}>Reply</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={st.feedAction}>
                        <Ionicons name="share-outline" size={14} color={warm.muted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ PEOPLE TAB Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */}
        {activeTab === 'people' && (
          <>
            {/* On the mat now */}
            <View style={st.card}>
              <View style={st.cardHeader}>
                <Text style={st.cardTitle}>On the Mat Now</Text>
                <View style={st.liveBadge}>
                  <View style={st.liveBadgeDot} />
                  <Text style={st.liveBadgeText}>{PRACTICING_MOCK.length}</Text>
                </View>
              </View>
              {PRACTICING_MOCK.map((p, i) => (
                <View key={p.id} style={[st.memberRow, i === PRACTICING_MOCK.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={st.memberAvatarWrap}>
                    <Image source={{ uri: p.avatar }} style={st.memberAvatar} />
                    <View style={st.greenDot} />
                  </View>
                  <View style={st.memberInfo}>
                    <Text style={st.memberName}>{p.name}</Text>
                    <Text style={st.memberMeta}>{p.series} ÃÂ· {p.min}m</Text>
                  </View>
                  <TouchableOpacity style={st.namasteBtn}>
                    <Text style={st.namasteBtnText}>Namaste</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Community Members */}
            <Text style={[st.sectionTitle, { marginTop: 16 }]}>Community Members</Text>
            <View style={st.card}>
              {(members.length > 0 ? members : MOCK_MEMBERS).map((m: any, i: number, arr: any[]) => (
                <View key={m.id} style={[st.memberRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                  <Image source={{ uri: m.avatar_url || m.avatar }} style={st.memberAvatar} />
                  <View style={st.memberInfo}>
                    <Text style={st.memberName}>{m.name}</Text>
                    <Text style={st.memberMeta}>{m.series} ÃÂ· {m.location} ÃÂ· {m.streak}d streak</Text>
                  </View>
                  <TouchableOpacity style={st.followBtn}>
                    <Text style={st.followBtnText}>Follow</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ TOPICS TAB Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ */}
        {activeTab === 'topics' && (
          <>
            <Text style={st.sectionTitle}>Discussion Topics</Text>
            {DISCUSSIONS.map((d) => (
              <TouchableOpacity key={d.id} style={st.topicCard}>
                <View style={[st.topicIcon, { backgroundColor: d.bg }]}>
                  <Ionicons name={d.icon} size={20} color={d.color} />
                </View>
                <View style={st.topicInfo}>
                  <Text style={st.topicTitle}>{d.title}</Text>
                  <Text style={st.topicMeta}>{d.replies} replies ÃÂ· Active today</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={warm.mutedLight} />
              </TouchableOpacity>
            ))}
            <View style={st.emptyBanner}>
              <Ionicons name="chatbubbles-outline" size={28} color={warm.mutedLight} />
              <Text style={st.emptyText}>More topics coming soon</Text>
            </View>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* Ã¢ÂÂÃ¢ÂÂ Styles Ã¢ÂÂÃ¢ÂÂ */
const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: warm.bg },

  /* Top bar (matches homepage) */
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: warm.headerBg,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandText: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18, color: warm.ink },
  newPostBtn: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: warm.orange,
    alignItems: 'center', justifyContent: 'center',
  },
  topAvatar: { width: 34, height: 34, borderRadius: 17, overflow: 'hidden' },

  /* Search */
  searchWrap: { paddingHorizontal: 16, paddingBottom: 8, backgroundColor: warm.headerBg },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: warm.bg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: warm.divider,
  },
  searchInput: { flex: 1, fontSize: 14, color: warm.ink, padding: 0 },

  /* Tabs (pill style like homepage feed tabs) */
  tabRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: warm.headerBg, gap: 6,
    borderBottomWidth: 1, borderBottomColor: warm.divider,
  },
  tab: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: warm.bg, borderWidth: 1, borderColor: warm.divider,
  },
  tabActive: { backgroundColor: warm.ink, borderColor: warm.ink },
  tabText: { fontSize: 13, fontWeight: '600', color: warm.muted },
  tabTextActive: { color: warm.white },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  /* Section title */
  sectionTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 16, color: warm.ink,
    paddingHorizontal: 16, marginTop: 12, marginBottom: 10,
  },

  /* Live strip */
  liveStrip: {
    marginHorizontal: 16, marginTop: 12, padding: 14,
    backgroundColor: warm.cardBg, borderRadius: 16,
    borderWidth: 1, borderColor: warm.divider,
  },
  liveStripHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  liveStripDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: warm.sage },
  liveStripTitle: { fontSize: 14, fontWeight: '600', color: warm.ink, flex: 1 },
  liveStripCount: { fontSize: 12, color: warm.muted },
  liveAvatarScroll: { gap: 16 },
  liveAvatarItem: { alignItems: 'center', width: 60 },
  liveAvatarRing: {
    width: 50, height: 50, borderRadius: 25, borderWidth: 2.5,
    borderColor: warm.sage, alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  liveAvatarImg: { width: 42, height: 42, borderRadius: 21 },
  liveAvatarName: { fontSize: 12, fontWeight: '600', color: warm.ink, textAlign: 'center' },
  liveAvatarMeta: { fontSize: 10, color: warm.muted },

  /* Discussions */
  discScroll: { paddingHorizontal: 16, gap: 10 },
  discCard: {
    width: SCREEN_WIDTH * 0.36, borderRadius: 14, padding: 14,
    minHeight: 95, justifyContent: 'space-between',
  },
  discTitle: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  discReplies: { fontSize: 12, fontWeight: '500' },

  /* Feed header */
  feedHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, marginTop: 12, marginBottom: 10,
  },
  newPostLink: { fontSize: 13, fontWeight: '600', color: warm.orange },

  /* Feed items */
  feedItem: {
    flexDirection: 'row', gap: 12, marginHorizontal: 16, marginBottom: 8,
    padding: 14, backgroundColor: warm.cardBg, borderRadius: 16,
    borderWidth: 1, borderColor: warm.divider,
  },
  feedAvatar: { width: 40, height: 40, borderRadius: 20 },
  feedContent: { flex: 1 },
  feedNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  feedName: { fontSize: 14, fontWeight: '600', color: warm.ink },
  feedTime: { fontSize: 11, color: warm.muted },
  feedCaption: { fontSize: 13, color: warm.inkMid, lineHeight: 19, marginBottom: 6 },
  feedTagRow: { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  feedTag: { backgroundColor: warm.orangeLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  feedTagText: { fontSize: 11, color: warm.orange, fontWeight: '500' },
  feedActions: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  feedAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  feedActionText: { fontSize: 12, color: warm.muted },

  /* Card (shared) */
  card: {
    marginHorizontal: 16, marginBottom: 8, backgroundColor: warm.cardBg,
    borderRadius: 16, borderWidth: 1, borderColor: warm.divider, overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderBottomWidth: 1, borderBottomColor: warm.divider,
  },
  cardTitle: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 16, color: warm.ink },

  /* Live badge */
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: warm.sageBg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3,
  },
  liveBadgeDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: warm.sage },
  liveBadgeText: { fontSize: 11, fontWeight: '600', color: warm.sage },

  /* Member rows */
  memberRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: warm.divider,
  },
  memberAvatarWrap: { position: 'relative' },
  memberAvatar: { width: 42, height: 42, borderRadius: 21 },
  greenDot: {
    position: 'absolute', bottom: -1, right: -1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: warm.sage, borderWidth: 2, borderColor: warm.cardBg,
  },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: '600', color: warm.ink },
  memberMeta: { fontSize: 12, color: warm.muted, marginTop: 2 },
  namasteBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: warm.sageBg, borderRadius: 20,
  },
  namasteBtnText: { fontSize: 12, fontWeight: '600', color: warm.sage },
  followBtn: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1.5, borderColor: warm.orange,
  },
  followBtnText: { fontSize: 12, fontWeight: '600', color: warm.orange },

  /* Topic cards */
  topicCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 16, marginBottom: 8, padding: 14,
    backgroundColor: warm.cardBg, borderRadius: 14,
    borderWidth: 1, borderColor: warm.divider,
  },
  topicIcon: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  topicInfo: { flex: 1 },
  topicTitle: { fontSize: 15, fontWeight: '600', color: warm.ink, marginBottom: 2 },
  topicMeta: { fontSize: 12, color: warm.muted },

  /* Empty */
  emptyBanner: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyText: { fontSize: 14, color: warm.muted },
});
