// src/screens/community/CommunityScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, RefreshControl, FlatList, Modal, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import AppHeader from '@/components/AppHeader';
import FriendRow from '@/components/community/FriendRow';
import PostCard from '@/components/community/PostCard';
import { getPracticingNow } from '@/lib/supabase';

type Tab = 'feed' | 'practicing' | 'discover';

interface PracticingUser {
  id: string;
  name: string;
  avatar_url: string | null;
  series: string;
  level: string;
  streak: number;
  practicing_since: string;
}

export default function CommunityScreen() {
  const router = useRouter();
  const { user, userPosts } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [refreshing, setRefreshing] = useState(false);
  const [livePractitioners, setLivePractitioners] = useState<PracticingUser[]>([]);

  /** Open profile (currently disabled - would need user lookup) */
  const openProfile = useCallback((name: string) => {
    // User profiles would be fetched from Supabase
  }, []);

  // Fetch who's on the mat from Supabase
  const fetchPracticing = useCallback(async () => {
    const { data } = await getPracticingNow();
    if (data) setLivePractitioners(data as PracticingUser[]);
  }, []);

  useEffect(() => { fetchPracticing(); }, []);

  // Real Supabase data only - show empty when no practitioners
  const practicingNow = livePractitioners.map((p) => ({
    id: p.id,
    name: p.name ?? 'Practitioner',
    avatarUrl: p.avatar_url,
    series: p.series,
    streak: p.streak ?? 0,
    lastPractice: p.practicing_since,
    isFollowing: true,
    level: p.level,
  }));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPracticing();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader />

      {/* Tab selector */}
      <View style={styles.tabRow}>
        {(['feed', 'practicing', 'discover'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'feed' ? 'Feed' : tab === 'practicing' ? 'Practicing' : 'Discover'}
            </Text>
            {tab === 'practicing' && practicingNow.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{practicingNow.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* ── Feed tab ─────────────────────────────────────── */}
        {activeTab === 'feed' && (
          <>
            {/* Practicing now strip */}
            {practicingNow.length > 0 && (
              <View style={styles.practicingStrip}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>On the mat now</Text>
                  <View style={styles.liveChip}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>{practicingNow.length} practicing</Text>
                  </View>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.avatarStrip}
                >
                  {practicingNow.map((u) => (
                    <TouchableOpacity key={u.id} style={styles.avatarBubble} activeOpacity={0.7} onPress={() => openProfile(u.name)}>
                      <View style={styles.avatarRing}>
                        {u.avatarUrl ? (
                          <Image source={{ uri: u.avatarUrl }} style={styles.miniAvatar} />
                        ) : (
                          <View style={[styles.miniAvatar, { backgroundColor: colors.skyDeep, alignItems: 'center', justifyContent: 'center' }]}>
                            <Text style={{ fontSize: 18, color: colors.white, fontWeight: '600' }}>
                              {u.name.charAt(0)}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.avatarName} numberOfLines={1}>
                        {u.name.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Posts feed */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest Posts</Text>
              <TouchableOpacity onPress={() => router.push('/new-post')}>
                <Text style={styles.sectionLink}>New post →</Text>
              </TouchableOpacity>
            </View>

            {/* User's own posts (newest first) */}
            {userPosts.length > 0 ? (
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
              <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
                <Text style={{ color: colors.muted, fontSize: 14 }}>No posts yet</Text>
              </View>
            )}
          </>
        )}

        {/* ── Practicing tab ───────────────────────────────── */}
        {activeTab === 'practicing' && (
          <>
            {/* Stats card */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{practicingNow.length}</Text>
                <Text style={styles.statLabel}>Practicing now</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>In your sangha</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Combined streak</Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Who's practicing</Text>
            </View>

            {/* Live practitioners */}
            {practicingNow.length > 0 && (
              <View style={styles.friendsCard}>
                <View style={styles.friendsCardHeader}>
                  <View style={styles.liveDot} />
                  <Text style={styles.friendsCardTitle}>On the mat</Text>
                </View>
                {practicingNow.map((u) => (
                  <FriendRow
                    key={u.id}
                    name={u.name}
                    avatarUrl={u.avatarUrl}
                    series={u.series}
                    streak={u.streak}
                    lastPractice={u.lastPractice}
                    isFollowing={u.isFollowing}
                    onPress={() => openProfile(u.name)}
                  />
                ))}
              </View>
            )}

            {/* All community members */}
            <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
              <Text style={styles.sectionTitle}>Your Sangha</Text>
            </View>
            <View style={styles.friendsCard}>
              <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
                <Text style={{ color: colors.muted, fontSize: 14 }}>No sangha members yet</Text>
              </View>
            </View>
          </>
        )}

        {/* ── Discover tab ─────────────────────────────────── */}
        {activeTab === 'discover' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Suggested Practitioners</Text>
            </View>
            <View style={styles.friendsCard}>
              <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
                <Text style={{ color: colors.muted, fontSize: 14 }}>No suggestions yet</Text>
              </View>
            </View>

            {/* Teachers spotlight */}
            <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
              <Text style={styles.sectionTitle}>Featured Teachers</Text>
            </View>
            <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
              <Text style={{ color: colors.muted, fontSize: 14 }}>No teachers yet</Text>
            </View>
          </>
        )}
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.page },


  // ── Tabs ───────────────────────────────────────────────────────────────────
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.skyMid,
    gap: spacing.xs,
  },
  tabActive: {
    backgroundColor: colors.blueDeep,
    borderColor: colors.blueDeep,
  },
  tabText: { ...typography.headingSm, color: colors.inkMid },
  tabTextActive: { color: colors.white },
  tabBadge: {
    backgroundColor: colors.orange,
    borderRadius: radius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  tabBadgeText: { ...typography.headingXs, color: colors.white, fontSize: 10 },

  // ── Scroll ─────────────────────────────────────────────────────────────────
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing['4xl'] },

  // ── Section headers (same pattern as HomeScreen) ───────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.headingLg, color: colors.ink },
  sectionLink: { ...typography.labelMd, color: colors.blue },

  // ── Practicing now strip ───────────────────────────────────────────────────
  practicingStrip: { marginBottom: spacing.xl },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.sagePale,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.sage,
  },
  liveText: { ...typography.labelSm, color: colors.sage },
  avatarStrip: { paddingHorizontal: spacing.xl, gap: spacing.lg },
  avatarBubble: { alignItems: 'center', width: 60 },
  avatarRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: colors.sage,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  miniAvatar: { width: 44, height: 44, borderRadius: 22 },
  avatarName: { ...typography.bodyXs, color: colors.ink, textAlign: 'center' },

  // ── Stats card ─────────────────────────────────────────────────────────────
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: radius['2xl'],
    padding: spacing.lg,
    ...shadows.sm,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { ...typography.displaySm, color: colors.blueDeep },
  statLabel: { ...typography.bodyXs, color: colors.muted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: colors.skyMid, marginVertical: spacing.xs },

  // ── Friends card ───────────────────────────────────────────────────────────
  friendsCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  friendsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  friendsCardTitle: { ...typography.headingSm, color: colors.sage },

  // ── Teacher cards ──────────────────────────────────────────────────────────
  teacherCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius['2xl'],
    padding: spacing.lg,
    gap: spacing.lg,
    ...shadows.sm,
  },
  teacherAvatar: {
    width: 64, height: 64, borderRadius: radius.xl,
    backgroundColor: colors.skyMid,
  },
  teacherInfo: { flex: 1 },
  teacherNameRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4,
  },
  teacherName: { ...typography.headingMd, color: colors.ink },
  teacherBadge: {
    backgroundColor: colors.sagePale,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  teacherBadgeText: { ...typography.bodyXs, color: colors.sage, fontFamily: 'DMSans_500Medium' },
  teacherBio: { ...typography.bodySm, color: colors.inkMid, marginBottom: spacing.sm },
  teacherMeta: { flexDirection: 'row', gap: spacing.sm },
  teacherTag: {
    backgroundColor: colors.sky,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  teacherTagText: { ...typography.bodyXs, color: colors.blueDeep },

  // ── User Profile Sheet ──────────────────────────────────────────────────────
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius['3xl'],
    borderTopRightRadius: radius['3xl'],
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
    paddingTop: spacing.md,
    ...shadows.lg,
  },
  sheetHandle: {
    width: 40, height: 4,
    borderRadius: 2,
    backgroundColor: colors.skyMid,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sheetClose: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.xl,
    width: 32, height: 32,
    borderRadius: 16,
    backgroundColor: colors.sky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetHero: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  sheetAvatar: {
    width: 88, height: 88,
    borderRadius: 44,
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: colors.sageL ?? colors.sage,
  },
  sheetName: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 22, lineHeight: 28,
    color: colors.ink,
    marginBottom: 4,
  },
  sheetTeacherBadge: {
    backgroundColor: colors.sky,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    marginBottom: spacing.xs,
  },
  sheetTeacherBadgeText: { ...typography.bodyXs, color: colors.blueDeep, fontWeight: '700' },
  sheetLocationRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 2,
  },
  sheetLocation: { ...typography.bodySm, color: colors.muted },

  sheetStats: {
    flexDirection: 'row',
    backgroundColor: colors.page,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sheetStatItem: { flex: 1, alignItems: 'center' },
  sheetStatNum: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 20, lineHeight: 26,
    color: colors.blueDeep,
  },
  sheetStatLabel: { ...typography.bodyXs, color: colors.muted, marginTop: 2 },
  sheetStatDivider: { width: 1, backgroundColor: colors.skyMid, marginVertical: 4 },

  sheetBio: {
    ...typography.bodyMd,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },

  sheetFollowBtn: {
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.blue,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  sheetFollowBtnActive: {
    backgroundColor: colors.sage,
    borderColor: colors.sage,
  },
  sheetFollowText: { ...typography.headingSm, color: colors.blue },
  sheetFollowTextActive: { color: '#fff' },
});
