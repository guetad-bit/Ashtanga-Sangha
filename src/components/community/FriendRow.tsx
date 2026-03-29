// src/components/community/FriendRow.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radius, typography } from '@/styles/tokens';

interface FriendRowProps {
  name: string;
  avatarUrl: string;
  series: string;
  streak: number;
  lastPractice?: string; // ISO date
  isFollowing: boolean;
  onPress?: () => void;
  onFollowToggle?: () => void;
}

/** Format the relative time label, e.g. "2h ago", "Just now" */
function formatTimeAgo(isoDate?: string, t?: any): string {
  if (!isoDate) return '';
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 5) return t?.('friendRow.justNow') || 'Just now';
  if (mins < 60) return t?.('friendRow.minutesAgo', { count: mins }) || `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t?.('friendRow.hoursAgo', { count: hrs }) || `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return t?.('friendRow.daysAgo', { count: days }) || `${days}d ago`;
}

/** Capitalize first letter of series name */
function formatSeries(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function FriendRow({
  name,
  avatarUrl,
  series,
  streak,
  lastPractice,
  isFollowing,
  onPress,
  onFollowToggle,
}: FriendRowProps) {
  const { t } = useTranslation();
  const timeAgo = formatTimeAgo(lastPractice, t);
  const isPracticingNow = lastPractice && (Date.now() - new Date(lastPractice).getTime()) < 2 * 3600000;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      {/* Avatar with online indicator */}
      <View style={styles.avatarWrap}>
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        {isPracticingNow && <View style={styles.onlineDot} />}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {formatSeries(series)}
          {streak > 0 ? ` · ${t('friendRow.dayStreak', { count: streak })}` : ''}
          {timeAgo ? ` · ${timeAgo}` : ''}
        </Text>
      </View>

      {/* Follow button */}
      <TouchableOpacity
        style={[styles.followBtn, isFollowing && styles.followBtnActive]}
        onPress={onFollowToggle}
        activeOpacity={0.8}
      >
        <Text style={[styles.followText, isFollowing && styles.followTextActive]}>
          {isFollowing ? t('friendRow.following') : t('friendRow.follow')}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.skyMid,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.sage,
    borderWidth: 2,
    borderColor: colors.white,
  },
  info: { flex: 1 },
  name: { ...typography.headingSm, color: colors.ink },
  meta: { ...typography.bodyXs, color: colors.muted, marginTop: 2 },
  followBtn: {
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.blue,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  followBtnActive: {
    backgroundColor: colors.sky,
    borderColor: colors.skyDeep,
  },
  followText: { ...typography.headingXs, color: colors.blue },
  followTextActive: { color: colors.blueDeep },
});
