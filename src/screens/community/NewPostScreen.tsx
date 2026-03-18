// src/screens/community/NewPostScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';
import { useAppStore } from '@/store/useAppStore';

const POPULAR_TAGS = [
  '#morningpractice',
  '#ashtangayoga',
  '#primaryseries',
  '#moonday',
  '#mysore',
  '#yogalife',
  '#breathe',
  '#onthemat',
];

export default function NewPostScreen() {
  const router = useRouter();
  const { user, addUserPost } = useAppStore();

  const [caption, setCaption] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need access to your photos to add an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera access to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handlePost = async () => {
    if (!caption.trim() && !imageUri) {
      Alert.alert('Empty post', 'Write something or add a photo.');
      return;
    }
    setPosting(true);
    // TODO: upload image to Supabase Storage + insert into posts table
    addUserPost({
      id: `up-${Date.now()}`,
      userName: user?.name ?? 'Practitioner',
      userAvatar: user?.avatarUrl ?? null,
      imageUri: imageUri ?? undefined,
      caption: caption.trim(),
      location: location.trim() || undefined,
      tags: selectedTags,
      likesCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
    });
    setPosting(false);
    router.back();
  };

  const canPost = caption.trim().length > 0 || imageUri;

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={s.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>New Post</Text>
        <TouchableOpacity
          onPress={handlePost}
          disabled={!canPost || posting}
          style={[s.postBtn, (!canPost || posting) && s.postBtnDisabled]}
        >
          <Text style={[s.postBtnText, (!canPost || posting) && s.postBtnTextDisabled]}>
            {posting ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* User info row */}
          <View style={s.userRow}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={s.userAvatar} />
            ) : (
              <View style={[s.userAvatar, { backgroundColor: colors.skyDeep, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ fontSize: 16, color: colors.white, fontWeight: '600' }}>
                  {user?.name?.charAt(0) ?? '?'}
                </Text>
              </View>
            )}
            <Text style={s.userName}>{user?.name ?? 'Practitioner'}</Text>
          </View>

          {/* Caption input */}
          <TextInput
            style={s.captionInput}
            placeholder="Share your practice, thoughts, or a moment..."
            placeholderTextColor={colors.mutedL}
            multiline
            value={caption}
            onChangeText={setCaption}
            autoFocus
          />

          {/* Image preview */}
          {imageUri && (
            <View style={s.imagePreview}>
              <Image source={{ uri: imageUri }} style={s.previewImage} />
              <TouchableOpacity style={s.removeImageBtn} onPress={() => setImageUri(null)}>
                <Text style={s.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Photo buttons */}
          <View style={s.photoRow}>
            <TouchableOpacity style={s.photoBtn} onPress={pickImage}>
              <Text style={s.photoBtnEmoji}>🖼️</Text>
              <Text style={s.photoBtnText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.photoBtn} onPress={takePhoto}>
              <Text style={s.photoBtnEmoji}>📷</Text>
              <Text style={s.photoBtnText}>Camera</Text>
            </TouchableOpacity>
          </View>

          {/* Location */}
          <View style={s.locationRow}>
            <Text style={s.locationIcon}>📍</Text>
            <TextInput
              style={s.locationInput}
              placeholder="Add location (optional)"
              placeholderTextColor={colors.mutedL}
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Tags */}
          <View style={s.tagsSection}>
            <Text style={s.tagsLabel}>Tags</Text>
            <View style={s.tagsWrap}>
              {POPULAR_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[s.tagChip, selectedTags.includes(tag) && s.tagChipActive]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[s.tagText, selectedTags.includes(tag) && s.tagTextActive]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.page },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.skyMid,
    backgroundColor: colors.white,
  },
  cancelText: { ...typography.labelLg, color: colors.muted },
  headerTitle: { ...typography.headingLg, color: colors.ink },
  postBtn: {
    backgroundColor: colors.sage, borderRadius: radius.lg,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.sm,
  },
  postBtnDisabled: { backgroundColor: colors.skyMid },
  postBtnText: { ...typography.headingSm, color: '#fff' },
  postBtnTextDisabled: { color: colors.mutedL },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl },

  // User row
  userRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    marginBottom: spacing.lg,
  },
  userAvatar: { width: 40, height: 40, borderRadius: 20 },
  userName: { ...typography.headingMd, color: colors.ink },

  // Caption
  captionInput: {
    ...typography.bodyLg, color: colors.ink,
    minHeight: 100, textAlignVertical: 'top',
    marginBottom: spacing.lg,
  },

  // Image preview
  imagePreview: {
    marginBottom: spacing.lg, borderRadius: radius['2xl'],
    overflow: 'hidden', position: 'relative',
  },
  previewImage: {
    width: '100%', height: 220, borderRadius: radius['2xl'],
  },
  removeImageBtn: {
    position: 'absolute', top: spacing.sm, right: spacing.sm,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  removeImageText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Photo buttons
  photoRow: {
    flexDirection: 'row', gap: spacing.md,
    marginBottom: spacing.xl,
  },
  photoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.white, borderRadius: radius.lg,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderWidth: 1, borderColor: colors.skyMid,
  },
  photoBtnEmoji: { fontSize: 18 },
  photoBtnText: { ...typography.labelMd, color: colors.ink },

  // Location
  locationRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.white, borderRadius: radius.lg,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderWidth: 1, borderColor: colors.skyMid,
    marginBottom: spacing.xl,
  },
  locationIcon: { fontSize: 16 },
  locationInput: {
    ...typography.bodyMd, color: colors.ink, flex: 1,
  },

  // Tags
  tagsSection: { marginBottom: spacing.xl },
  tagsLabel: {
    ...typography.headingSm, color: colors.ink,
    marginBottom: spacing.md,
  },
  tagsWrap: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
  },
  tagChip: {
    backgroundColor: colors.white, borderRadius: radius.full,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderWidth: 1, borderColor: colors.skyMid,
  },
  tagChipActive: {
    backgroundColor: colors.blueDeep, borderColor: colors.blueDeep,
  },
  tagText: { ...typography.labelSm, color: colors.inkMid },
  tagTextActive: { color: '#fff' },
});
