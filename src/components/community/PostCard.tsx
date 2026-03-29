// src/components/community/PostCard.tsx
import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
              <Ionicons name="location-outline" size={11} color="#9B8E7E" />
              <Text style={s.location}>{location}</Text>
            </View>
          ) : null}
        </View>
        <Text style={s.time}>{formatTimeAgo(createdAt, t)}</Text>
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
});
