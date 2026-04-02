// src/components/community/PostCard.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Dimensions, Modal, Pressable, TextInput, FlatList,
  KeyboardAvoidingView, Platform, Share, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';
import { getComments, addComment, deleteComment, likePost, unlikePost } from '@/lib/supabase';

const SCREEN_WIDTH = Dimensions.get('window').width;

/* ── colour tokens ── */
const warm = {
  ink: '#3B3228',
  inkMid: '#5E5245',
  muted: '#9B8E7E',
  mutedLight: '#C4B8A8',
  divider: '#E8E0D4',
  cardBg: '#FFFFFF',
  sage: '#8A9E78',
  orange: '#E07A3A',
  heartRed: '#E25858',
  bg: '#FAF8F5',
};

interface PostCardProps {
  postId?: string;
  userId?: string;        // current user
  userName: string;
  userAvatar: string;
  imageUrl?: string;
  caption: string;
  location?: string;
  likesCount: number;
  commentsCount?: number;
  isLiked: boolean;
  createdAt: string;
  tags: string[];
  isOwner?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onUserPress?: () => void;
  onDelete?: (postId: string) => void;
  onEdit?: (postId: string, newCaption: string) => void;
}

interface Comment {
  id: string;
  body: string;
  user_id: string;
  created_at: string;
  profiles: { name: string; avatar_url: string | null } | null;
}

function formatTimeAgo(isoDate: string, t: any): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 5) return t('postCard.justNow');
  if (mins < 60) return t('postCard.minutesAgo', { count: mins });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t('postCard.hoursAgo', { count: hrs });
  const days = Math.floor(hrs / 24);
  if (days === 1) return t('postCard.yesterday');
  return t('postCard.daysAgo', { count: days });
}

export default function PostCard({
  postId,
  userId,
  userName,
  userAvatar,
  imageUrl,
  caption,
  location,
  likesCount,
  commentsCount = 0,
  isLiked,
  createdAt,
  tags,
  isOwner,
  onLike,
  onComment,
  onShare,
  onUserPress,
  onDelete,
  onEdit,
}: PostCardProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  // ── Like state ──
  const [liked, setLiked] = useState(isLiked);
  const [likes, setLikes] = useState(likesCount);
  const heartScale = useRef(new Animated.Value(1)).current;

  // ── Comments state ──
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commCount, setCommCount] = useState(commentsCount);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const commentInputRef = useRef<TextInput>(null);

  // ── Owner menu state ──
  const [showMenu, setShowMenu] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editCaption, setEditCaption] = useState(caption);

  // Sync external props
  useEffect(() => { setLiked(isLiked); }, [isLiked]);
  useEffect(() => { setLikes(likesCount); }, [likesCount]);
  useEffect(() => { setCommCount(commentsCount); }, [commentsCount]);

  /* ── Like handler with animation ── */
  const handleLike = useCallback(() => {
    const willLike = !liked;
    setLiked(willLike);
    setLikes(prev => willLike ? prev + 1 : prev - 1);

    // Heart pop animation
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.3, useNativeDriver: true, friction: 3 }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, friction: 3 }),
    ]).start();

    // DB call
    if (postId && userId) {
      (willLike ? likePost(postId, userId) : unlikePost(postId, userId)).catch(console.error);
    }
    onLike?.();
  }, [liked, postId, userId]);

  /* ── Double-tap to like ── */
  const lastTap = useRef(0);
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!liked) handleLike();
    }
    lastTap.current = now;
  };

  /* ── Comments handlers ── */
  const openComments = useCallback(async () => {
    setShowComments(true);
    setLoadingComments(true);
    if (postId) {
      const { data } = await getComments(postId);
      if (data) setComments(data as Comment[]);
    }
    setLoadingComments(false);
  }, [postId]);

  const handleSendComment = useCallback(async () => {
    const body = newComment.trim();
    if (!body || !postId || !userId) return;
    setSendingComment(true);
    const { data } = await addComment(postId, userId, body);
    if (data && Array.isArray(data) && data[0]) {
      // Optimistic add — add with current user info
      setComments(prev => [...prev, {
        id: data[0].id,
        body,
        user_id: userId,
        created_at: new Date().toISOString(),
        profiles: { name: userName, avatar_url: userAvatar },
      }]);
      setCommCount(prev => prev + 1);
    } else {
      // Refresh from DB
      const { data: fresh } = await getComments(postId);
      if (fresh) {
        setComments(fresh as Comment[]);
        setCommCount(fresh.length);
      }
    }
    setNewComment('');
    setSendingComment(false);
  }, [newComment, postId, userId, userName, userAvatar]);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    setCommCount(prev => prev - 1);
    await deleteComment(commentId);
  }, []);

  /* ── Share handler ── */
  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `${userName}: ${caption}`,
        title: t('postCard.share'),
      });
    } catch {
      // User cancelled — no-op
    }
    onShare?.();
  }, [userName, caption]);

  /* ── Owner actions ── */
  const handleDelete = () => {
    setShowMenu(false);
    setShowDelete(true);
  };
  const confirmDelete = () => {
    setShowDelete(false);
    if (postId) onDelete?.(postId);
  };
  const handleEditSave = () => {
    if (postId && editCaption.trim()) {
      onEdit?.(postId, editCaption.trim());
    }
    setShowEdit(false);
  };

  /* ── Like summary text ── */
  const likeSummary = likes === 0
    ? ''
    : likes === 1
    ? (liked ? t('postCard.youLikedThis') : `1 ${t('postCard.likeNoun')}`)
    : liked
    ? t('postCard.youAndOthers', { count: likes - 1 })
    : `${likes} ${t('postCard.likesNoun')}`;

  return (
    <View style={s.card}>
      {/* ── Header ── */}
      <View style={[s.header, isRTL && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity
          style={[{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }, isRTL && { flexDirection: 'row-reverse' }]}
          onPress={onUserPress}
          activeOpacity={0.7}
        >
          <View style={s.avatarWrap}>
            <Image source={{ uri: userAvatar }} style={s.avatar} />
          </View>
          <View style={[s.headerInfo, isRTL && { alignItems: 'flex-end' }]}>
            <Text style={s.userName}>{userName}</Text>
            <View style={[s.metaRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={s.time}>{formatTimeAgo(createdAt, t)}</Text>
              {location ? (
                <>
                  <Text style={s.metaDot}>·</Text>
                  <Ionicons name="location-outline" size={11} color={warm.mutedLight} />
                  <Text style={s.location}>{location}</Text>
                </>
              ) : null}
            </View>
          </View>
        </TouchableOpacity>
        {isOwner && (
          <TouchableOpacity onPress={() => setShowMenu(true)} hitSlop={12} style={{ paddingLeft: 8 }}>
            <Ionicons name="ellipsis-horizontal" size={20} color={warm.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Caption + tags ── */}
      <View style={s.body}>
        <Text style={[s.caption, isRTL && { textAlign: 'right' }]}>
          {caption}
        </Text>
        {tags.length > 0 && (
          <View style={s.tagsRow}>
            {tags.map((tag) => (
              <View key={tag} style={s.tagPill}>
                <Text style={s.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ── Image (double-tap to like) ── */}
      {imageUrl && (
        <TouchableOpacity activeOpacity={1} onPress={handleDoubleTap}>
          <Image source={{ uri: imageUrl }} style={s.postImage} resizeMode="cover" />
        </TouchableOpacity>
      )}

      {/* ── Like / Comment count summary ── */}
      {(likes > 0 || commCount > 0) && (
        <View style={[s.countBar, isRTL && { flexDirection: 'row-reverse' }]}>
          {likes > 0 && (
            <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6 }, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={s.likeCountBadge}>
                <Ionicons name="heart" size={10} color="#fff" />
              </View>
              <Text style={s.countText}>{likeSummary}</Text>
            </View>
          )}
          <View style={{ flex: 1 }} />
          {commCount > 0 && (
            <TouchableOpacity onPress={openComments}>
              <Text style={s.countText}>
                {commCount} {t(commCount === 1 ? 'postCard.commentNoun' : 'postCard.commentsNoun')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Action buttons ── */}
      <View style={s.actionDivider} />
      <View style={[s.actions, isRTL && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity style={s.actionBtn} onPress={handleLike} activeOpacity={0.7}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={20}
              color={liked ? warm.heartRed : warm.muted}
            />
          </Animated.View>
          <Text style={[s.actionLabel, liked && { color: warm.heartRed, fontWeight: '600' }]}>
            {t('postCard.likeVerb')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.actionBtn} onPress={openComments} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={19} color={warm.muted} />
          <Text style={s.actionLabel}>{t('postCard.comment')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.actionBtn} onPress={handleShare} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={19} color={warm.muted} />
          <Text style={s.actionLabel}>{t('postCard.share')}</Text>
        </TouchableOpacity>
      </View>

      {/* ═══════════ COMMENTS MODAL ═══════════ */}
      <Modal visible={showComments} transparent animationType="slide" onRequestClose={() => setShowComments(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={s.commModalWrap}
        >
          <Pressable style={s.commBackdrop} onPress={() => setShowComments(false)} />
          <View style={s.commSheet}>
            {/* Handle bar */}
            <View style={s.commHandle} />
            {/* Header */}
            <View style={[s.commHeader, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={s.commTitle}>{t('postCard.commentsTitle')}</Text>
              <TouchableOpacity onPress={() => setShowComments(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color={warm.ink} />
              </TouchableOpacity>
            </View>

            {/* Comment list */}
            {loadingComments ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ color: warm.muted }}>{t('postCard.loadingComments')}</Text>
              </View>
            ) : comments.length === 0 ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Ionicons name="chatbubbles-outline" size={36} color={warm.divider} />
                <Text style={{ color: '#4A3F36', marginTop: 12, fontSize: 16 }}>{t('postCard.noComments')}</Text>
                <Text style={{ color: '#7A6E60', fontSize: 15, marginTop: 4 }}>{t('postCard.beFirst')}</Text>
              </View>
            ) : (
              <FlatList
                data={comments}
                keyExtractor={(c) => c.id}
                style={s.commList}
                renderItem={({ item }) => (
                  <View style={[s.commItem, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Image
                      source={{ uri: item.profiles?.avatar_url || 'https://via.placeholder.com/40' }}
                      style={s.commAvatar}
                    />
                    <View style={[s.commBubble, isRTL && { alignItems: 'flex-end' }]}>
                      <Text style={s.commAuthor}>{item.profiles?.name ?? 'User'}</Text>
                      <Text style={[s.commBody, isRTL && { textAlign: 'right' }]}>{item.body}</Text>
                      <View style={[s.commMeta, isRTL && { flexDirection: 'row-reverse' }]}>
                        <Text style={s.commTime}>{formatTimeAgo(item.created_at, t)}</Text>
                        {item.user_id === userId && (
                          <TouchableOpacity onPress={() => handleDeleteComment(item.id)} hitSlop={8}>
                            <Text style={s.commDeleteBtn}>{t('postCard.delete')}</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                )}
              />
            )}

            {/* Comment input */}
            <View style={[s.commInputRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <TextInput
                ref={commentInputRef}
                style={[s.commInput, isRTL && { textAlign: 'right' }]}
                placeholder={t('postCard.addComment')}
                placeholderTextColor={warm.mutedLight}
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[s.commSendBtn, (!newComment.trim() || sendingComment) && { opacity: 0.4 }]}
                onPress={handleSendComment}
                disabled={!newComment.trim() || sendingComment}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ═══════════ OWNER MENU MODAL ═══════════ */}
      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <Pressable style={s.menuBackdrop} onPress={() => setShowMenu(false)}>
          <Pressable style={s.menuBox} onPress={(e) => e.stopPropagation()}>
            <TouchableOpacity style={s.menuItem} onPress={() => { setShowMenu(false); setEditCaption(caption); setShowEdit(true); }}>
              <Ionicons name="create-outline" size={20} color={warm.ink} />
              <Text style={s.menuText}>{t('postCard.edit')}</Text>
            </TouchableOpacity>
            <View style={s.menuDivider} />
            <TouchableOpacity style={s.menuItem} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color="#C45B3F" />
              <Text style={[s.menuText, { color: '#C45B3F' }]}>{t('postCard.delete')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ═══════════ EDIT MODAL ═══════════ */}
      <Modal visible={showEdit} transparent animationType="fade" onRequestClose={() => setShowEdit(false)}>
        <Pressable style={s.menuBackdrop} onPress={() => setShowEdit(false)}>
          <Pressable style={s.editBox} onPress={(e) => e.stopPropagation()}>
            <Text style={s.editTitle}>{t('postCard.editPost')}</Text>
            <TextInput
              style={[s.editInput, isRTL && { textAlign: 'right' }]}
              value={editCaption}
              onChangeText={setEditCaption}
              multiline
              autoFocus
            />
            <View style={[s.editBtns, isRTL && { flexDirection: 'row-reverse' }]}>
              <TouchableOpacity style={s.editCancelBtn} onPress={() => setShowEdit(false)}>
                <Text style={s.editCancelText}>{t('postCard.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.editSaveBtn} onPress={handleEditSave}>
                <Text style={s.editSaveText}>{t('postCard.save')}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ═══════════ DELETE CONFIRMATION ═══════════ */}
      <Modal visible={showDelete} transparent animationType="fade" onRequestClose={() => setShowDelete(false)}>
        <Pressable style={s.menuBackdrop} onPress={() => setShowDelete(false)}>
          <Pressable style={s.editBox} onPress={(e) => e.stopPropagation()}>
            <Text style={s.editTitle}>{t('postCard.deleteTitle')}</Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 15, color: warm.inkMid, marginBottom: 20 }}>
              {t('postCard.deleteConfirm')}
            </Text>
            <View style={[s.editBtns, isRTL && { flexDirection: 'row-reverse' }]}>
              <TouchableOpacity style={s.editCancelBtn} onPress={() => setShowDelete(false)}>
                <Text style={s.editCancelText}>{t('postCard.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.editSaveBtn, { backgroundColor: '#C45B3F' }]} onPress={confirmDelete}>
                <Text style={s.editSaveText}>{t('postCard.delete')}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/* ═══════════════════════════ STYLES ═══════════════════════════ */
const s = StyleSheet.create({
  card: {
    backgroundColor: warm.cardBg,
    borderRadius: 16,
    marginHorizontal: spacing.lg,
    marginBottom: 14,
    overflow: 'hidden',
    ...shadows.md,
    borderWidth: 1,
    borderColor: warm.divider,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  avatarWrap: { width: 42, height: 42 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: warm.divider },
  headerInfo: { flex: 1 },
  userName: { fontFamily: 'DMSans_600SemiBold', fontSize: 16, color: '#2A2420' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  metaDot: { color: '#7A6E60', fontSize: 15 },
  time: { fontFamily: 'DMSans_400Regular', fontSize: 15, color: '#7A6E60' },
  location: { fontFamily: 'DMSans_400Regular', fontSize: 15, color: '#7A6E60' },

  /* Body / Caption */
  body: { paddingHorizontal: 16, paddingBottom: 10 },
  caption: { fontFamily: 'DMSans_400Regular', fontSize: 16, color: '#2A2420', lineHeight: 24 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tagPill: { backgroundColor: '#DCE8D3', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  tagText: { fontFamily: 'DMSans_400Regular', fontSize: 15, color: '#6E8A5C' },

  /* Image */
  postImage: { width: '100%', height: 260, backgroundColor: warm.divider },

  /* Count bar (like X and Y comments) */
  countBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  likeCountBadge: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: warm.heartRed,
    alignItems: 'center', justifyContent: 'center',
  },
  countText: { fontFamily: 'DMSans_400Regular', fontSize: 15, color: '#4A3F36' },

  /* Actions bar */
  actionDivider: { height: 1, backgroundColor: warm.divider, marginHorizontal: 16 },
  actions: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  actionLabel: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: '#4A3F36' },

  /* ── Comments modal (bottom sheet) ── */
  commModalWrap: { flex: 1, justifyContent: 'flex-end' },
  commBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  commSheet: {
    backgroundColor: warm.cardBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    minHeight: 300,
  },
  commHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: warm.divider,
    alignSelf: 'center', marginTop: 10, marginBottom: 4,
  },
  commHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: warm.divider,
  },
  commTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 17, color: warm.ink },

  commList: { flex: 1, paddingHorizontal: 16 },
  commItem: { flexDirection: 'row', gap: 10, paddingVertical: 10 },
  commAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: warm.divider },
  commBubble: { flex: 1, backgroundColor: warm.bg, borderRadius: 14, padding: 10 },
  commAuthor: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, color: '#2A2420', marginBottom: 2 },
  commBody: { fontFamily: 'DMSans_400Regular', fontSize: 15, color: '#2A2420', lineHeight: 22 },
  commMeta: { flexDirection: 'row', gap: 14, marginTop: 6 },
  commTime: { fontFamily: 'DMSans_400Regular', fontSize: 15, color: '#7A6E60' },
  commDeleteBtn: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: '#C45B3F' },

  commInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: warm.divider,
    backgroundColor: warm.cardBg,
  },
  commInput: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: '#2A2420',
    backgroundColor: warm.bg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 80,
    borderWidth: 1,
    borderColor: warm.divider,
  },
  commSendBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: warm.sage,
    alignItems: 'center', justifyContent: 'center',
  },

  /* ── Owner menu ── */
  menuBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  menuBox: {
    backgroundColor: warm.cardBg, borderRadius: 16, width: '100%', maxWidth: 280,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 16,
  },
  menuText: { fontFamily: 'DMSans_500Medium', fontSize: 16, color: warm.ink },
  menuDivider: { height: 1, backgroundColor: warm.divider },

  /* ── Edit modal ── */
  editBox: {
    backgroundColor: warm.cardBg, borderRadius: 20, width: '100%', maxWidth: 340,
    padding: 20,
  },
  editTitle: { fontFamily: 'DMSans_600SemiBold', fontSize: 18, color: warm.ink, marginBottom: 12 },
  editInput: {
    fontFamily: 'DMSans_400Regular', fontSize: 15, color: warm.ink,
    borderWidth: 1, borderColor: warm.divider, borderRadius: 12,
    padding: 12, minHeight: 100, textAlignVertical: 'top',
    marginBottom: 16,
  },
  editBtns: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  editCancelBtn: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: warm.divider,
  },
  editCancelText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: '#4A3F36' },
  editSaveBtn: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10,
    backgroundColor: warm.sage,
  },
  editSaveText: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, color: '#FFFFFF' },
});
