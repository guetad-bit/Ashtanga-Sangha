// src/components/community/PostCard.tsx
import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface PostCardProps {
  userName: string;
  userAvatar: string;
  imageUrl?: string;
  caption: string;
  location?: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  tags: string[];
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onUserPress?: () => void;
}

function formatTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 5) return 'Just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d`;
}

export default function PostCard({
  userName,
  userAvatar,
  imageUrl,
  caption,
  location,
  likesCount,
  isLiked,
  createdAt,
  tags,
  onLike,
  onComment,
  onShare,
  onUserPress,
}: PostCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [likes, setLikes] = useState(likesCount);

  const handleLike = () => {
    setLiked(prev => !prev);
    setLikes(prev => (liked ? prev - 1 : prev + 1));
    onLike?.();
  };

  return (
    <View style={s.card}>
      {/* ── Header ── */}
      <TouchableOpacity style={s.header} onPress={onUserPress} activeOpacity={0.7}>
        <View style={s.avatarWrap}>
          <Image source={{ uri: userAvatar }} style={s.avatar} />
          <View style={s.avatarRing} />
        </View>
        <View style={s.headerInfo}>
          <Text style={s.userName}>{userName}</Text>
          {location ? (
            <View style={s.locationRow}>
              <Ionicons name="location-outline" size={11} color={colors.muted} />
              <Text style={s.location}>{location}</Text>
            </View>
          ) : null}
        </View>
        <Text style={s.time}>{formatTimeAgo(createdAt)}</Text>
      </TouchableOpacity>

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
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? colors.orange : colors.muted}
          />
          <Text style={[s.actionLabel, liked && s.actionLabelActive]}>{likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.actionBtn} onPress={onComment} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={19} color={colors.muted} />
          <Text style={s.actionLabel}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.actionBtn} onPress={onShare} activeOpacity={0.7}>
          <Ionicons name="paper-plane-outline" size={19} color={colors.muted} />
          <Text style={s.actionLabel}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius['2xl'],
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.md,
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
    backgroundColor: colors.skyMid,
  },
  avatarRing: {
    position: 'absolute',
    inset: -2,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.sageL,
  },
  headerInfo: { flex: 1 },
  userName: { ...typography.headingSm, color: colors.ink },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  location: { ...typography.bodyXs, color: colors.muted },
  time: { ...typography.bodyXs, color: colors.mutedL },

  // Image — full-bleed, no horizontal margins
  postImage: {
    width: '100%',
    height: 230,
    backgroundColor: colors.skyMid,
  },

  // Caption
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  caption: {
    ...typography.bodyMd,
    color: colors.inkMid,
    lineHeight: 22,
  },
  captionName: {
    ...typography.headingSm,
    color: colors.ink,
  },

  // Tags
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tagPill: {
    backgroundColor: colors.sky,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  tagText: {
    ...typography.bodyXs,
    color: colors.blueDeep,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.sky,
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
    color: colors.muted,
  },
  actionLabelActive: { color: colors.orange },
});
