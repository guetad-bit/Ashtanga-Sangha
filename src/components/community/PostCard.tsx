// src/components/community/PostCard.tsx
import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Dimensions, Modal, Pressable, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface PostCardProps {
  postId?: string;
  userName: string;
  userAvatar: string;
  imageUrl?: string;
  caption: string;
  location?: string;
  likesCount: number;
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
  userName,
  userAvatar,
  imageUrl,
  caption,
  location,
  likesCount,
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
  const { t } = useTranslation();
  const [liked, setLiked] = useState(isLiked);
  const [likes, setLikes] = useState(likesCount);
  const [showMenu, setShowMenu] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editCaption, setEditCaption] = useState(caption);

  const handleLike = () => {
    setLiked(prev => !prev);
    setLikes(prev => (liked ? prev - 1 : prev + 1));
    onLike?.();
  };

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

  return (
    <View style={s.card}>
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }} onPress={onUserPress} activeOpacity={0.7}>
          <View style={s.avatarWrap}>
            <Image source={{ uri: userAvatar }} style={s.avatar} />
            <View style={s.avatarRing} />
          </View>
          <View style={s.headerInfo}>
            <Text style={s.userName}>{userName}</Text>
            {location ? (
              <View style={s.locationRow}>
                <Ionicons name="location-outline" size={11} color="#9B8E7E" />
                <Text style={s.location}>{location}</Text>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
        <Text style={s.time}>{formatTimeAgo(createdAt, t)}</Text>
        {isOwner && (
          <TouchableOpacity onPress={() => setShowMenu(true)} hitSlop={12} style={{ paddingLeft: 8 }}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#9B8E7E" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Owner menu modal ── */}
      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <Pressable style={s.menuBackdrop} onPress={() => setShowMenu(false)}>
          <View style={s.menuBox}>
            <TouchableOpacity style={s.menuItem} onPress={() => { setShowMenu(false); setEditCaption(caption); setShowEdit(true); }}>
              <Ionicons name="create-outline" size={20} color="#3B3228" />
              <Text style={s.menuText}>{t('postCard.edit')}</Text>
            </TouchableOpacity>
            <View style={s.menuDivider} />
            <TouchableOpacity style={s.menuItem} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color="#C45B3F" />
              <Text style={[s.menuText, { color: '#C45B3F' }]}>{t('postCard.delete')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* ── Edit modal ── */}
      <Modal visible={showEdit} transparent animationType="fade" onRequestClose={() => setShowEdit(false)}>
        <Pressable style={s.menuBackdrop} onPress={() => setShowEdit(false)}>
          <View style={s.editBox}>
            <Text style={s.editTitle}>{t('postCard.editPost')}</Text>
            <TextInput
              style={s.editInput}
              value={editCaption}
              onChangeText={setEditCaption}
              multiline
              autoFocus
            />
            <View style={s.editBtns}>
              <TouchableOpacity style={s.editCancelBtn} onPress={() => setShowEdit(false)}>
                <Text style={s.editCancelText}>{t('postCard.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.editSaveBtn} onPress={handleEditSave}>
                <Text style={s.editSaveText}>{t('postCard.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* ── Delete confirmation modal ── */}
      <Modal visible={showDelete} transparent animationType="fade" onRequestClose={() => setShowDelete(false)}>
        <Pressable style={s.menuBackdrop} onPress={() => setShowDelete(false)}>
          <View style={s.editBox}>
            <Text style={s.editTitle}>{t('postCard.deleteTitle')}</Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 15, color: '#5E5245', marginBottom: 20 }}>{t('postCard.deleteConfirm')}</Text>
            <View style={s.editBtns}>
              <TouchableOpacity style={s.editCancelBtn} onPress={() => setShowDelete(false)}>
                <Text style={s.editCancelText}>{t('postCard.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.editSaveBtn, { backgroundColor: '#C45B3F' }]} onPress={confirmDelete}>
                <Text style={s.editSaveText}>{t('postCard.delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* ── Image ── */}
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={s.postImage}
          resizeMode="cover"
        />
      )}

      {/* ── Caption + tags ── */}
      <View style={s.body}>
        <Text style={s.caption}>
          <Text style={s.captionName}>{userName}{'  '}</Text>
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

      {/* ── Actions ── */}
      <View style={s.actions}>
        <TouchableOpacity style={s.actionBtn} onPress={handleLike} activeOpacity={0.7}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? '#C4956A' : '#9B8E7E'} />
          <Text style={[s.actionLabel, liked && s.actionLabelActive]}>{likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.actionBtn} onPress={onComment} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={19} color="#9B8E7E" />
          <Text style={s.actionLabel}>{t('postCard.comment')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.actionBtn} onPress={onShare} activeOpacity={0.7}>
          <Ionicons name="paper-plane-outline" size={19} color="#9B8E7E" />
          <Text style={s.actionLabel}>{t('postCard.share')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius['2xl'],
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.md,
    borderWidth: 1,
    borderColor: '#E8E0D4',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  avatarWrap: { position: 'relative', width: 44, height: 44 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8E0D4',
  },
  avatarRing: {
    position: 'absolute',
    inset: -2,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#8A9E78',
  },
  headerInfo: { flex: 1 },
  userName: { ...typography.headingSm, color: '#3B3228' },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  location: { ...typography.bodyXs, color: '#9B8E7E' },
  time: { ...typography.bodyXs, color: '#C4B8A8' },

  // Image — full-bleed
  postImage: {
    width: '100%',
    height: 230,
    backgroundColor: '#E8E0D4',
  },

  // Caption
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  caption: {
    ...typography.bodyMd,
    color: '#5E5245',
    lineHeight: 22,
  },
  captionName: {
    ...typography.headingSm,
    color: '#3B3228',
  },

  // Tags
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tagPill: {
    backgroundColor: '#DCE8D3',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  tagText: {
    ...typography.bodyXs,
    color: '#6E8A5C',
  },

  // Actions
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E8E0D4',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  actionLabel: {
    ...typography.labelSm,
    color: '#9B8E7E',
  },
  actionLabelActive: { color: '#8A9E78' },

  // Owner menu
  menuBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  menuBox: {
    backgroundColor: '#FFFFFF', borderRadius: 16, width: '100%', maxWidth: 280,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingVertical: 16,
  },
  menuText: {
    fontFamily: 'DMSans_500Medium', fontSize: 16, color: '#3B3228',
  },
  menuDivider: { height: 1, backgroundColor: '#E8E0D4' },

  // Edit modal
  editBox: {
    backgroundColor: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 340,
    padding: 20,
  },
  editTitle: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 18, color: '#3B3228',
    marginBottom: 12,
  },
  editInput: {
    fontFamily: 'DMSans_400Regular', fontSize: 15, color: '#3B3228',
    borderWidth: 1, borderColor: '#E8E0D4', borderRadius: 12,
    padding: 12, minHeight: 100, textAlignVertical: 'top',
    marginBottom: 16,
  },
  editBtns: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  editCancelBtn: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: '#E8E0D4',
  },
  editCancelText: { fontFamily: 'DMSans_500Medium', fontSize: 14, color: '#9B8E7E' },
  editSaveBtn: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#8A9E78',
  },
  editSaveText: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: '#FFFFFF' },
});
