// src/screens/profile/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Image, Alert, ActivityIndicator, RefreshControl, Platform, Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';
import { useAppStore, Series, Level } from '@/store/useAppStore';
import i18n from '@/i18n';
import { upsertProfile, signOut, getProfile, uploadAvatar } from '@/lib/supabase';
import AppHeader from '@/components/AppHeader';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, setUser, clearUser, language, setLanguage } = useAppStore();

  // Dynamic options based on translation
  const seriesOptions: { value: Series; label: string; icon: string }[] = [
    { value: 'sun_sals',     label: t('series.sun_sals'), icon: 'sunny-outline' },
    { value: 'primary',      label: t('series.primary'),         icon: 'leaf-outline' },
    { value: 'intermediate', label: t('series.intermediate'),    icon: 'flame-outline' },
    { value: 'advanced_a',   label: t('series.advanced_a'),      icon: 'flash-outline' },
    { value: 'advanced_b',   label: t('series.advanced_b'),      icon: 'star-outline' },
    { value: 'short',        label: t('series.short'),           icon: 'timer-outline' },
  ];

  const levelOptions: { value: Level; label: string }[] = [
    { value: 'beginner',     label: t('level.beginner') },
    { value: 'regular',      label: t('level.regular') },
    { value: 'intermediate', label: t('level.intermediate') },
    { value: 'advanced',     label: t('level.advanced') },
    { value: 'teacher',      label: t('level.teacher') },
  ];

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Editable fields
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [location, setLocation] = useState(user?.location ?? '');
  const [series, setSeries] = useState<Series>(user?.series ?? 'primary');
  const [level, setLevel] = useState<Level>(user?.level ?? 'beginner');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio ?? '');
      setLocation(user.location ?? '');
      setSeries(user.series);
      setLevel(user.level);
    }
  }, [user]);

  const onRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    const { data } = await getProfile(user.id);
    if (data) {
      setUser({
        ...user,
        name: data.name ?? user.name,
        bio: data.bio ?? '',
        location: data.location ?? '',
        series: (data.series as Series) ?? user.series,
        level: (data.level as Level) ?? user.level,
        avatarUrl: data.avatar_url ?? user.avatarUrl,
      });
    }
    setRefreshing(false);
  };

  const handlePickPhoto = () => {
    // On web, Alert.alert with multiple buttons doesn't work — go straight to library
    if (Platform.OS === 'web') {
      pickImage('library');
      return;
    }
    Alert.alert(t('profile.profilePhoto'), t('profile.chooseSource'), [
      { text: t('profile.camera'), onPress: () => pickImage('camera') },
      { text: t('profile.photoLibrary'), onPress: () => pickImage('library') },
      { text: t('profile.cancel'), style: 'cancel' },
    ]);
  };

  const pickImage = async (source: 'camera' | 'library') => {
    if (!user) return;
    // On web, no permissions needed — ImagePicker uses a file input
    if (Platform.OS !== 'web') {
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') { Alert.alert(t('profile.permissionNeeded'), t('profile.cameraAccess')); return; }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert(t('profile.permissionNeeded'), t('profile.photoAccess')); return; }
      }
    }
    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (result.canceled || !result.assets?.[0]) return;
    setUploadingPhoto(true);
    try {
      const { url, error } = await uploadAvatar(user.id, result.assets[0].uri);
      if (error) { console.error('Upload failed:', error); }
      else if (url) { setUser({ ...user, avatarUrl: url }); }
    } catch (e) {
      console.error('Upload exception:', e);
    }
    setUploadingPhoto(false);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) { Alert.alert(t('profile.nameRequired'), t('profile.nameRequiredMsg')); return; }
    setSaving(true);
    const { error } = await upsertProfile({
      id: user.id, name: name.trim(), series, level,
      location: location.trim() || undefined,
      bio: bio.trim() || undefined,
    });
    if (error) { Alert.alert('Error', error.message); setSaving(false); return; }
    setUser({ ...user, name: name.trim(), bio: bio.trim(), series, level, location: location.trim() });
    setEditing(false);
    setSaving(false);
  };

  const handleCancel = () => {
    setName(user?.name ?? '');
    setBio(user?.bio ?? '');
    setLocation(user?.location ?? '');
    setSeries(user?.series ?? 'primary');
    setLevel(user?.level ?? 'beginner');
    setEditing(false);
  };

  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const handleSignOut = () => {
    setShowSignOutConfirm(true);
  };
  const confirmSignOut = async () => {
    setShowSignOutConfirm(false);
    await signOut();
    clearUser();
  };

  const currentSeriesOpt = seriesOptions.find((s) => s.value === (user?.series ?? 'primary'));
  const currentLevelOpt  = levelOptions.find((l) => l.value === (user?.level ?? 'beginner'));

  return (
    <SafeAreaView style={st.safe} edges={['top']}>
      <AppHeader />

      <ScrollView
        style={st.scroll}
        contentContainerStyle={st.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* ── Avatar + Name section ── */}
        <View style={st.profileHeader}>
          <TouchableOpacity
            onPress={handlePickPhoto}
            activeOpacity={0.75}
            style={st.avatarWrap}
          >
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={st.avatar} />
            ) : (
              <View style={[st.avatar, st.avatarFallback]}>
                <Text style={st.avatarInitial}>{(user?.name ?? 'P')[0].toUpperCase()}</Text>
              </View>
            )}
            <View style={st.avatarCameraBadge}>
              {uploadingPhoto
                ? <ActivityIndicator color="#fff" size="small" />
                : <Ionicons name="camera-outline" size={16} color="#fff" />}
            </View>
          </TouchableOpacity>

          {editing ? (
            <TextInput
              style={st.nameInput}
              value={name}
              onChangeText={setName}
              placeholder={t('profile.yourName')}
              placeholderTextColor="#C4B8A8"
              autoFocus
            />
          ) : (
            <Text style={st.profileName}>{user?.name ?? t('profile.practitioner')}</Text>
          )}

          {/* Badges */}
          {!editing && (
            <View style={st.badgeRow}>
              <View style={st.badge}>
                <Ionicons name="person-outline" size={12} color={colors.sage} />
                <Text style={st.badgeText}>{currentLevelOpt?.label ?? t('profile.practitioner')}</Text>
              </View>
              {currentSeriesOpt && (
                <View style={st.badge}>
                  <Ionicons name={currentSeriesOpt.icon as any} size={12} color={colors.sage} />
                  <Text style={st.badgeText}>{currentSeriesOpt.label}</Text>
                </View>
              )}
            </View>
          )}

          {!editing && user?.location ? (
            <View style={st.locationRow}>
              <Ionicons name="location-outline" size={13} color="#9B8E7E" />
              <Text style={st.locationText}>{user.location}</Text>
            </View>
          ) : null}

          {/* Edit / Save / Cancel */}
          <View style={st.actionRow}>
            {editing ? (
              <>
                <TouchableOpacity onPress={handleCancel} style={st.cancelBtn}>
                  <Text style={st.cancelText}>{t('profile.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} disabled={saving} style={st.saveBtn}>
                  {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={st.saveBtnText}>{t('profile.save')}</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={() => setEditing(true)} style={st.editBtn} activeOpacity={0.7}>
                <Ionicons name="pencil-outline" size={14} color={colors.sage} />
                <Text style={st.editBtnText}>{t('profile.editProfile')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── About ── */}
        <View style={st.card}>
          <Text style={st.cardTitle}>{t('profile.about')}</Text>
          {editing ? (
            <TextInput
              style={st.bioInput}
              value={bio}
              onChangeText={setBio}
              placeholder={t('profile.bioPlaceholder')}
              placeholderTextColor="#C4B8A8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          ) : (
            <Text style={st.bioText}>
              {user?.bio || t('profile.noBio')}
            </Text>
          )}
        </View>

        {/* ── Location (edit mode) ── */}
        {editing && (
          <View style={st.card}>
            <Text style={st.cardTitle}>{t('profile.location')}</Text>
            <TextInput
              style={st.fieldInput}
              value={location}
              onChangeText={setLocation}
              placeholder={t('profile.locationPlaceholder')}
              placeholderTextColor="#C4B8A8"
            />
          </View>
        )}

        {/* ── Series + Level (edit mode) ── */}
        {editing && (
          <View style={st.card}>
            <Text style={st.cardTitle}>{t('profile.currentSeries')}</Text>
            <View style={st.chipRow}>
              {seriesOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[st.chip, series === opt.value && st.chipActive]}
                  onPress={() => setSeries(opt.value)}
                >
                  <Ionicons name={opt.icon as any} size={14} color={series === opt.value ? colors.sage : '#9B8E7E'} />
                  <Text style={[st.chipText, series === opt.value && st.chipTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[st.cardTitle, { marginTop: spacing.lg }]}>{t('profile.levelLabel')}</Text>
            <View style={st.chipRow}>
              {levelOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[st.chip, level === opt.value && st.chipActive]}
                  onPress={() => setLevel(opt.value)}
                >
                  <Text style={[st.chipText, level === opt.value && st.chipTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Language toggle ── */}
        {!editing && (
          <View style={st.card}>
            <Text style={st.cardTitle}>{t('profile.language')}</Text>
            <View style={st.chipRow}>
              <TouchableOpacity
                style={[st.chip, language === 'en' && st.chipActive]}
                onPress={() => {
                  setLanguage('en');
                  i18n.changeLanguage('en');
                }}
              >
                <Text style={[st.chipText, language === 'en' && st.chipTextActive]}>English</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[st.chip, language === 'he' && st.chipActive]}
                onPress={() => {
                  setLanguage('he');
                  i18n.changeLanguage('he');
                }}
              >
                <Text style={[st.chipText, language === 'he' && st.chipTextActive]}>עברית</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Sign out ── */}
        <TouchableOpacity style={st.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#C4956A" />
          <Text style={st.signOutText}>{t('profile.signOut')}</Text>
        </TouchableOpacity>

        <Text style={st.version}>{t('profile.version')}</Text>
      </ScrollView>

      {/* Sign-out confirmation modal */}
      <Modal visible={showSignOutConfirm} transparent animationType="fade" onRequestClose={() => setShowSignOutConfirm(false)}>
        <Pressable style={st.modalBackdrop} onPress={() => setShowSignOutConfirm(false)}>
          <View style={st.modalBox}>
            <Text style={st.modalTitle}>{t('profile.signOut')}</Text>
            <Text style={st.modalBody}>{t('profile.signOutConfirm')}</Text>
            <View style={st.modalBtns}>
              <TouchableOpacity style={st.modalCancelBtn} onPress={() => setShowSignOutConfirm(false)} activeOpacity={0.7}>
                <Text style={st.modalCancelText}>{t('profile.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.modalConfirmBtn} onPress={confirmSignOut} activeOpacity={0.7}>
                <Text style={st.modalConfirmText}>{t('profile.signOut')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F2EC' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },

  // ── Profile header ──
  profileHeader: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },

  // Avatar
  avatarWrap: {
    position: 'relative' as any,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 3, borderColor: '#8A9E78',
  },
  avatarFallback: {
    backgroundColor: '#8A9E78',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 42, color: '#fff',
  },
  avatarCameraBadge: {
    position: 'absolute' as any,
    bottom: 2, right: 2,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#8A9E78',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: '#F6F2EC',
  },

  profileName: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 26, lineHeight: 32,
    color: '#3B3228', marginBottom: spacing.xs,
  },
  nameInput: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 24, color: '#3B3228',
    textAlign: 'center' as any, borderBottomWidth: 1.5,
    borderBottomColor: '#8A9E78',
    paddingBottom: 4, marginBottom: spacing.sm, minWidth: 200,
  },

  badgeRow: {
    flexDirection: 'row' as any, gap: spacing.sm, marginBottom: spacing.xs,
  },
  badge: {
    flexDirection: 'row' as any, alignItems: 'center' as any, gap: 4,
    backgroundColor: 'rgba(138,158,120,0.12)',
    borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(138,158,120,0.25)',
  },
  badgeText: {
    fontSize: 12, color: '#3B3228', fontWeight: '600' as any, letterSpacing: 0.3,
  },

  locationRow: {
    flexDirection: 'row' as any, alignItems: 'center' as any, gap: 4,
    marginTop: 4,
  },
  locationText: { ...typography.bodyXs, color: '#5E5245' },

  // Action row
  actionRow: {
    flexDirection: 'row' as any, gap: spacing.sm,
    marginTop: spacing.md,
  },
  editBtn: {
    flexDirection: 'row' as any, alignItems: 'center' as any, gap: 6,
    borderRadius: radius.full,
    paddingHorizontal: 20, paddingVertical: 10,
    borderWidth: 1.5, borderColor: '#8A9E78',
  },
  editBtnText: { ...typography.labelSm, color: '#3B3228', fontWeight: '600' as any },
  cancelBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 1.5, borderColor: '#E8E0D4',
  },
  cancelText: { ...typography.labelSm, color: '#9B8E7E' },
  saveBtn: {
    backgroundColor: '#8A9E78', borderRadius: radius.full,
    paddingHorizontal: 24, paddingVertical: 10,
    minWidth: 80, alignItems: 'center' as any,
  },
  saveBtnText: { ...typography.headingSm, color: '#fff' },

  // ── Cards ──
  card: {
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    backgroundColor: '#FFFFFF', borderRadius: radius.xl,
    padding: spacing.lg, ...shadows.sm,
    borderWidth: 1, borderColor: '#E8E0D4',
  },
  cardTitle: {
    ...typography.headingXs, color: '#5E5245',
    textTransform: 'uppercase' as any, letterSpacing: 0.8,
    marginBottom: spacing.md,
  },

  // Bio / fields
  bioText: { ...typography.bodyMd, color: '#3B3228', lineHeight: 22 },
  bioInput: {
    ...typography.bodyMd, color: '#3B3228',
    borderWidth: 1, borderColor: '#8A9E78', borderRadius: radius.md,
    padding: spacing.md, minHeight: 80, textAlignVertical: 'top' as any,
    backgroundColor: '#F6F2EC',
  },
  fieldInput: {
    ...typography.bodyMd, color: '#3B3228',
    borderWidth: 1, borderColor: '#8A9E78', borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: '#F6F2EC',
  },

  // Chips
  chipRow: { flexDirection: 'row' as any, flexWrap: 'wrap' as any, gap: spacing.sm },
  chip: {
    flexDirection: 'row' as any, alignItems: 'center' as any, gap: spacing.xs,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderRadius: radius.full, borderWidth: 1.5, borderColor: '#E8E0D4',
    backgroundColor: '#F6F2EC',
  },
  chipActive: { borderColor: '#8A9E78', backgroundColor: 'rgba(138,158,120,0.12)' },
  chipText: { ...typography.labelSm, color: '#3B3228' },
  chipTextActive: { color: '#8A9E78', fontWeight: '700' as any },

  // Sign out
  signOutBtn: {
    flexDirection: 'row' as any, alignItems: 'center' as any, justifyContent: 'center' as any, gap: spacing.sm,
    marginHorizontal: spacing.lg, marginTop: spacing.sm,
    paddingVertical: spacing.lg,
    backgroundColor: '#FFFFFF', borderRadius: radius.xl,
    borderWidth: 1, borderColor: '#E8E0D4',
    ...shadows.sm,
  },
  signOutText: { ...typography.headingSm, color: '#C4956A' },

  version: {
    ...typography.bodyXs, color: '#C4B8A8',
    textAlign: 'center' as any, marginTop: spacing.xl, marginBottom: spacing.xl,
  },

  // Sign-out confirmation modal
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center' as any, alignItems: 'center' as any,
  },
  modalBox: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28, width: 300,
    ...shadows.lg,
  },
  modalTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 20, color: '#3B3228',
    textAlign: 'center' as any, marginBottom: 8,
  },
  modalBody: {
    fontFamily: 'DMSans_400Regular', fontSize: 15, color: '#5E5245',
    textAlign: 'center' as any, marginBottom: 24,
  },
  modalBtns: {
    flexDirection: 'row' as any, gap: 12,
  },
  modalCancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: '#E8E0D4', alignItems: 'center' as any,
  },
  modalCancelText: { fontFamily: 'DMSans_500Medium', fontSize: 15, color: '#5E5245' },
  modalConfirmBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#C4956A', alignItems: 'center' as any,
  },
  modalConfirmText: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, color: '#FFFFFF' },
});
