// src/screens/community/NewPostScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { spacing, radius, typography } from '@/styles/tokens';
import { useAppStore } from '@/store/useAppStore';
import { createPost, uploadPostImage } from '@/lib/supabase';

/* ââ Warm palette (matches Home / Community) ââ */
const warm = {
  bg: '#FAF8F5', cardBg: '#FFFFFF', headerBg: '#FFFFFF',
  ink: '#3D3229', inkMid: '#5C4F42', muted: '#8B7D6E', mutedLight: '#B5A899',
  accent: '#C47B3F', accentLight: '#F0E0CC',
  sage: '#7A8B5E', sageBg: '#E8EDDF',
  orange: '#E8834A', orangeLight: '#FFF0E6',
  divider: '#EDE5D8', white: '#FFFFFF',
};

const POPULAR_TAGS = [
  '#morningpractice', '#ashtangayoga', '#primaryseries',
  '#moonday', '#mysore', '#yogalife', '#breathe', '#onthemat',
];

export default function NewPostScreen() {
  const { t } = useTranslation();
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
      Alert.alert(t('newPost.permissionPhotos'));
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
      Alert.alert(t('newPost.permissionCamera'));
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
      Alert.alert(t('newPost.emptyPost'), t('newPost.emptyPostMsg'));
      return;
    }
    setPosting(true);
    try {
      // Upload image to Supabase Storage first (if any)
      let publicImageUrl: string | undefined;
      if (imageUri) {
        const { url, error: uploadErr } = await uploadPostImage(user?.id ?? '', imageUri);
        if (uploadErr || !url) {
          console.error('Image upload failed:', uploadErr);
          Alert.alert('Error', 'Failed to upload image');
          setPosting(false);
          return;
        }
        publicImageUrl = url;
      }

      // Save to Supabase
      const { error } = await createPost(
        user?.id ?? '',
        caption.trim(),
        publicImageUrl,
        location.trim() || undefined,
      );
      if (error) {
        console.error('Failed to save post:', error);
        Alert.alert('Error', error.message ?? 'Failed to save post');
        setPosting(false);
        return;
      }
      // Also add to local store for immediate display
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
      router.back();
    } catch (e) {
      console.error('Post error:', e);
      Alert.alert('Error', 'Something went wrong');
    }
    setPosting(false);
  };

  const canPost = caption.trim().length > 0 || imageUri;
  const firstName = user?.name?.split(' ')[0] || 'Yogi';

  return (
    <SafeAreaView style={s.safe}>
      {/* ââ Header ââ */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={warm.ink} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t('newPost.share')}</Text>
        <TouchableOpacity
          onPress={handlePost}
          disabled={!canPost || posting}
          style={[s.postBtn, (!canPost || posting) && s.postBtnDisabled]}
          activeOpacity={0.8}
        >
          <Text style={[s.postBtnText, (!canPost || posting) && s.postBtnTextDisabled]}>
            {posting ? t('newPost.posting') : t('newPost.post')}
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
          {/* ââ Composer card ââ */}
          <View style={s.composerCard}>
            {/* User row */}
            <View style={s.userRow}>
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={s.userAvatar} />
              ) : (
                <View style={[s.userAvatar, s.avatarFallback]}>
                  <Text style={s.avatarInitial}>{firstName.charAt(0)}</Text>
                </View>
              )}
              <View>
                <Text style={s.userName}>{user?.name ?? 'Practitioner'}</Text>
                <Text style={s.userHint}>{t('newPost.whatsOnYourMat')}</Text>
              </View>
            </View>

            {/* Caption */}
            <TextInput
              style={s.captionInput}
              placeholder={t('newPost.sharePlaceholder')}
              placeholderTextColor={warm.mutedLight}
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
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ââ Attachments ââ */}
          <Text style={s.sectionLabel}>{t('newPost.addToPost')}</Text>
          <View style={s.attachRow}>
            <TouchableOpacity style={s.attachBtn} onPress={pickImage} activeOpacity={0.7}>
              <View style={[s.attachIcon, { backgroundColor: warm.sageBg }]}>
                <Ionicons name="image-outline" size={20} color={warm.sage} />
              </View>
              <Text style={s.attachText}>{t('newPost.gallery')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.attachBtn} onPress={takePhoto} activeOpacity={0.7}>
              <View style={[s.attachIcon, { backgroundColor: warm.orangeLight }]}>
                <Ionicons name="camera-outline" size={20} color={warm.orange} />
              </View>
              <Text style={s.attachText}>{t('newPost.camera')}</Text>
            </TouchableOpacity>

            <View style={s.attachBtn}>
              <View style={[s.attachIcon, { backgroundColor: warm.accentLight }]}>
                <Ionicons name="location-outline" size={20} color={warm.accent} />
              </View>
              <TextInput
                style={s.locationInline}
                placeholder={t('newPost.location')}
                placeholderTextColor={warm.mutedLight}
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          {/* ââ Tags ââ */}
          <Text style={s.sectionLabel}>{t('newPost.popularTags')}</Text>
          <View style={s.tagsWrap}>
            {POPULAR_TAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[s.tagChip, active && s.tagChipActive]}
                  onPress={() => toggleTag(tag)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.tagText, active && s.tagTextActive]}>{tag}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ââ Styles ââ */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: warm.bg },

  /* Header */
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: warm.headerBg,
    borderBottomWidth: 1, borderBottomColor: warm.divider,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: warm.bg,
  },
  headerTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 20, color: warm.ink,
  },
  postBtn: {
    backgroundColor: warm.orange, borderRadius: 20,
    paddingHorizontal: 22, paddingVertical: 9,
    shadowColor: warm.orange, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  postBtnDisabled: {
    backgroundColor: warm.divider,
    shadowOpacity: 0,
  },
  postBtnText: { fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: '#fff' },
  postBtnTextDisabled: { color: warm.mutedLight },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },

  /* Composer card */
  composerCard: {
    backgroundColor: warm.cardBg, borderRadius: 20,
    padding: 18, marginBottom: 24,
    borderWidth: 1, borderColor: warm.divider,
  },
  userRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 16,
  },
  userAvatar: { width: 46, height: 46, borderRadius: 23 },
  avatarFallback: {
    backgroundColor: warm.accentLight,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 18, color: warm.accent,
  },
  userName: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 16, color: warm.ink,
  },
  userHint: {
    fontFamily: 'DMSans_400Regular', fontSize: 12, color: warm.muted, marginTop: 1,
  },
  captionInput: {
    fontFamily: 'DMSans_400Regular', fontSize: 16, lineHeight: 24,
    color: warm.ink, minHeight: 100, textAlignVertical: 'top',
  },

  /* Image preview */
  imagePreview: {
    marginTop: 14, borderRadius: 16, overflow: 'hidden', position: 'relative',
  },
  previewImage: {
    width: '100%', height: 220, borderRadius: 16,
  },
  removeImageBtn: {
    position: 'absolute', top: 10, right: 10,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },

  /* Attachments */
  sectionLabel: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: warm.muted,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 10, marginLeft: 4,
  },
  attachRow: {
    flexDirection: 'row', gap: 10, marginBottom: 24,
  },
  attachBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: warm.cardBg, borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 12,
    borderWidth: 1, borderColor: warm.divider,
  },
  attachIcon: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  attachText: {
    fontFamily: 'DMSans_500Medium', fontSize: 13, color: warm.ink,
  },
  locationInline: {
    fontFamily: 'DMSans_400Regular', fontSize: 13, color: warm.ink,
    flex: 1, paddingVertical: 0,
  },

  /* Tags */
  tagsWrap: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    marginBottom: 20,
  },
  tagChip: {
    backgroundColor: warm.cardBg, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1.5, borderColor: warm.divider,
  },
  tagChipActive: {
    backgroundColor: warm.sage, borderColor: warm.sage,
  },
  tagText: {
    fontFamily: 'DMSans_500Medium', fontSize: 13, color: warm.inkMid,
  },
  tagTextActive: { color: '#fff' },
});
