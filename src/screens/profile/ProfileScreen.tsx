// src/screens/profile/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Image, Alert, ActivityIndicator, RefreshControl,
  ImageBackground, Modal, Pressable,
} from 'react-native';
import type { PracticeLog } from '@/utils/practiceStreak';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';
import { useAppStore, Series, Level } from '@/store/useAppStore';
import { upsertProfile, signOut, getProfile, uploadAvatar } from '@/lib/supabase';
import { calculateStreak } from '@/utils/practiceStreak';
import AppLogo from '@/components/AppLogo';

const HERO_BG = require('../../../assets/onboard-1.png');

const SERIES_OPTIONS: { value: Series; label: string; emoji: string }[] = [
  { value: 'sun_sals', label: 'Sun Salutations', emoji: '☀️' },
  { value: 'primary',  label: 'Primary',         emoji: '🧘' },
  { value: 'intermediate', label: 'Intermediate', emoji: '🔥' },
  { value: 'advanced_a',   label: 'Advanced A',   emoji: '⚡' },
  { value: 'advanced_b',   label: 'Advanced B',   emoji: '🌟' },
  { value: 'short',        label: 'Short',        emoji: '🔐' },
];

const LEVEL_OPTIONS: { value: Level; label: string }[] = [
  { value: 'beginner',     label: 'Beginner' },
  { value: 'regular',      label: 'Regular' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced',     label: 'Advanced' },
  { value: 'teacher',      label: 'Teacher' },
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, setUser, clearUser, practiceLogs, updatePracticeLog, removePracticeLog } = useAppStore();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Practice log editing
  const [editingLog, setEditingLog] = useState<PracticeLog | null>(null);
  const [editLogSeries, setEditLogSeries] = useState<string>('primary');
  const [editLogDuration, setEditLogDuration] = useState<number>(90);

  const openLogEdit = (log: PracticeLog) => {
    setEditingLog(log);
    setEditLogSeries(log.series);
    setEditLogDuration(log.durationMin);
  };

  const saveLogEdit = () => {
    if (!editingLog) return;
    updatePracticeLog(editingLog.id, { series: editLogSeries, durationMin: editLogDuration });
    setEditingLog(null);
  };

  const deleteLog = () => {
    if (!editingLog) return;
    Alert.alert('Delete Practice', 'Remove this practice from your log?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { removePracticeLog(editingLog.id); setEditingLog(null); } },
    ]);
  };

  // Editable fields
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [location, setLocation] = useState(user?.location ?? '');
  const [series, setSeries] = useState<Series>(user?.series ?? 'primary');
  const [level, setLevel] = useState<Level>(user?.level ?? 'beginner');

  const streak = calculateStreak(practiceLogs);
  const totalPractices = practiceLogs.length;
  const totalHours = Math.round(practiceLogs.reduce((sum, l) => sum + l.durationMin, 0) / 60);
  const totalCheers = Math.max(0, Math.floor(totalPractices * 0.5)); // Calculate sangha cheers

  // Last 7 days rhythm
  const today = new Date();
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const key = d.toISOString().split('T')[0];
    const practiced = practiceLogs.some((l) => l.loggedAt.split('T')[0] === key);
    return { label: DAY_LABELS[d.getDay()], practiced, isToday: i === 6 };
  });

  // Recent logs (up to 5)
  const recentLogs = practiceLogs.slice(0, 5);

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
    Alert.alert('Profile Photo', 'Choose a photo source', [
      { text: 'Camera', onPress: () => pickImage('camera') },
      { text: 'Photo Library', onPress: () => pickImage('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const pickImage = async (source: 'camera' | 'library') => {
    if (!user) return;
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission needed', 'Camera access required.'); return; }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission needed', 'Photo library access required.'); return; }
    }
    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (result.canceled || !result.assets?.[0]) return;
    setUploadingPhoto(true);
    const { url, error } = await uploadAvatar(user.id, result.assets[0].uri);
    if (error) { Alert.alert('Upload failed', error.message); }
    else if (url) { setUser({ ...user, avatarUrl: url }); }
    setUploadingPhoto(false);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) { Alert.alert('Name required', 'Please enter your name.'); return; }
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

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); clearUser(); } },
    ]);
  };

  const currentSeriesOpt = SERIES_OPTIONS.find((s) => s.value === (user?.series ?? 'primary'));
  const currentLevelOpt  = LEVEL_OPTIONS.find((l) => l.value === (user?.level ?? 'beginner'));

  return (
    <SafeAreaView style={s.safe} edges={['top']}>

      {/* ── Top bar ── */}
      <View style={s.topbar}>
        <View style={s.topbarLeft}>
          <AppLogo size={36} />
          <Text style={s.appTitle}>Ashtanga Sangha</Text>
        </View>
        {editing ? (
          <View style={s.topbarActions}>
            <TouchableOpacity onPress={handleCancel} style={s.cancelBtn}>
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} disabled={saving} style={s.saveBtn}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>Save</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setEditing(true)} style={s.editBtn} activeOpacity={0.7}>
            <Ionicons name="pencil" size={15} color="#3B3228" />
            <Text style={s.editBtnText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* ── Hero ── */}
        <View style={s.heroCard}>
          <ImageBackground source={HERO_BG} style={s.heroBg} imageStyle={s.heroBgImage}>
            <LinearGradient
              colors={['rgba(138,158,120,0.6)', 'rgba(110,138,92,0.9)']}
              style={s.heroGradient}
            >
              {/* Avatar */}
              <TouchableOpacity
                onPress={editing ? handlePickPhoto : undefined}
                activeOpacity={editing ? 0.75 : 1}
                style={s.avatarWrap}
              >
                {user?.avatarUrl ? (
                  <Image source={{ uri: user.avatarUrl }} style={s.avatar} />
                ) : (
                  <View style={[s.avatar, s.avatarFallback]}>
                    <Text style={s.avatarInitial}>{(user?.name ?? 'P')[0].toUpperCase()}</Text>
                  </View>
                )}
                <View style={s.avatarRing} />
                {editing && (
                  <View style={s.avatarEditOverlay}>
                    {uploadingPhoto
                      ? <ActivityIndicator color="#fff" />
                      : <Ionicons name="camera" size={22} color="#fff" />}
                  </View>
                )}
              </TouchableOpacity>

              {/* Name */}
              {editing ? (
                <TextInput
                  style={s.nameInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  autoFocus
                />
              ) : (
                <Text style={s.heroName}>{user?.name ?? 'Practitioner'}</Text>
              )}

              {/* Level badge + email */}
              <View style={s.heroBadgeRow}>
                <View style={s.levelBadge}>
                  <Text style={s.levelBadgeText}>{currentLevelOpt?.label ?? 'Practitioner'}</Text>
                </View>
                {currentSeriesOpt && (
                  <View style={[s.levelBadge, s.seriesBadge]}>
                    <Text style={s.levelBadgeText}>{currentSeriesOpt.emoji} {currentSeriesOpt.label}</Text>
                  </View>
                )}
              </View>

              {user?.location ? (
                <View style={s.heroLocation}>
                  <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.7)" />
                  <Text style={s.heroLocationText}>{user.location}</Text>
                </View>
              ) : null}
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* ── Stats ── */}
        <View style={s.statsCard}>
          <View style={s.statItem}>
            <Text style={s.statNum}>{streak}</Text>
            <Text style={s.statLabel}>Days on mat</Text>
          </View>
          <View style={s.statDiv} />
          <View style={s.statItem}>
            <Text style={s.statNum}>{totalPractices}</Text>
            <Text style={s.statLabel}>Practices</Text>
          </View>
          <View style={s.statDiv} />
          <View style={s.statItem}>
            <Text style={s.statNum}>{totalCheers}</Text>
            <Text style={s.statLabel}>Sangha cheers</Text>
          </View>
        </View>

        {/* ── Weekly rhythm ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>This Week</Text>
          <View style={s.rhythmRow}>
            {last7.map((day, i) => (
              <View key={i} style={s.rhythmDay}>
                <View style={[
                  s.rhythmDot,
                  day.practiced && s.rhythmDotDone,
                  day.isToday && !day.practiced && s.rhythmDotToday,
                ]} />
                <Text style={[s.rhythmLabel, day.isToday && s.rhythmLabelToday]}>{day.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── About ── */}
        <View style={s.card}>
          <Text style={s.cardTitle}>About</Text>
          {editing ? (
            <TextInput
              style={s.bioInput}
              value={bio}
              onChangeText={setBio}
              placeholder="Share your practice journey..."
              placeholderTextColor="#9B8E7E"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          ) : (
            <Text style={s.bioText}>
              {user?.bio || 'No bio yet. Tap Edit to add one.'}
            </Text>
          )}
        </View>

        {/* ── Location (edit only) ── */}
        {editing && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Location</Text>
            <TextInput
              style={s.fieldInput}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Mysore, India"
              placeholderTextColor="#9B8E7E"
            />
          </View>
        )}

        {/* ── Series + Level (edit mode) ── */}
        {editing && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Current Series</Text>
            <View style={s.chipRow}>
              {SERIES_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[s.chip, series === opt.value && s.chipActive]}
                  onPress={() => setSeries(opt.value)}
                >
                  <Text style={s.chipEmoji}>{opt.emoji}</Text>
                  <Text style={[s.chipText, series === opt.value && s.chipTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[s.cardTitle, { marginTop: spacing.lg }]}>Level</Text>
            <View style={s.chipRow}>
              {LEVEL_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[s.chip, level === opt.value && s.chipActive]}
                  onPress={() => setLevel(opt.value)}
                >
                  <Text style={[s.chipText, level === opt.value && s.chipTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Recent practices ── */}
        {recentLogs.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Recent Practices</Text>
            {recentLogs.map((log, i) => {
              const d = new Date(log.loggedAt);
              const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              const seriesOpt = SERIES_OPTIONS.find((o) => o.value === log.series);
              return (
                <TouchableOpacity
                  key={log.id}
                  style={[s.logRow, i < recentLogs.length - 1 && s.logRowDivider]}
                  onPress={() => openLogEdit(log)}
                  activeOpacity={0.7}
                >
                  <View style={s.logDot} />
                  <View style={s.logInfo}>
                    <Text style={s.logSeries}>{seriesOpt?.emoji ?? '🧘'} {seriesOpt?.label ?? log.series}</Text>
                    <Text style={s.logDate}>{label}</Text>
                  </View>
                  <View style={s.logRight}>
                    <Text style={s.logDuration}>{log.durationMin} min</Text>
                    <Ionicons name="pencil" size={13} color="#7B8FAD" />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ── Sign out ── */}
        <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#C4956A" />
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={s.version}>Ashtanga Sangha v1.0</Text>
      </ScrollView>

      {/* ── Edit Practice Log Sheet ── */}
      <Modal
        visible={!!editingLog}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingLog(null)}
      >
        <Pressable style={s.sheetBackdrop} onPress={() => setEditingLog(null)}>
          <Pressable style={s.sheetBox} onPress={() => {}}>
            {editingLog && (
              <>
                <View style={s.sheetHandle} />

                <View style={s.sheetTopRow}>
                  <Text style={s.sheetTitle}>Edit Practice</Text>
                  <Text style={s.sheetDate}>
                    {new Date(editingLog.loggedAt).toLocaleDateString('en-US', {
                      weekday: 'long', month: 'long', day: 'numeric',
                    })}
                  </Text>
                </View>

                {/* Series picker */}
                <Text style={s.sheetLabel}>Series</Text>
                <View style={s.chipRow}>
                  {SERIES_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[s.chip, editLogSeries === opt.value && s.chipActive]}
                      onPress={() => setEditLogSeries(opt.value)}
                    >
                      <Text style={s.chipEmoji}>{opt.emoji}</Text>
                      <Text style={[s.chipText, editLogSeries === opt.value && s.chipTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Duration stepper */}
                <Text style={[s.sheetLabel, { marginTop: spacing.lg }]}>Duration</Text>
                <View style={s.stepper}>
                  <TouchableOpacity
                    style={s.stepBtn}
                    onPress={() => setEditLogDuration((v) => Math.max(10, v - 15))}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text style={s.stepValue}>{editLogDuration} min</Text>
                  <TouchableOpacity
                    style={s.stepBtn}
                    onPress={() => setEditLogDuration((v) => Math.min(300, v + 15))}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {/* Actions */}
                <View style={s.sheetActions}>
                  <TouchableOpacity style={s.deleteBtn} onPress={deleteLog} activeOpacity={0.8}>
                    <Ionicons name="trash-outline" size={16} color="#C4956A" />
                    <Text style={s.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.saveSheetBtn} onPress={saveLogEdit} activeOpacity={0.8}>
                    <Text style={s.saveSheetBtnText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F2EC' },

  // ── Top bar ──
  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#E8E0D4',
  },
  topbarLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  appTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18,
    color: '#3B3228', lineHeight: 22,
  },
  topbarActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'transparent', borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderWidth: 1, borderColor: '#8A9E78',
  },
  editBtnText: { ...typography.labelSm, color: '#3B3228' },
  cancelBtn: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
  },
  cancelText: { ...typography.labelMd, color: '#9B8E7E' },
  saveBtn: {
    backgroundColor: '#8A9E78', borderRadius: radius.full,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    minWidth: 64, alignItems: 'center',
  },
  saveBtnText: { ...typography.headingSm, color: '#fff' },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },

  // ── Hero card ──
  heroCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.lg,
    borderRadius: radius['2xl'], overflow: 'hidden',
    ...shadows.md,
  },
  heroBg: { width: '100%' },
  heroBgImage: { borderRadius: radius['2xl'] },
  heroGradient: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },

  // Avatar
  avatarWrap: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#8A9E78',
  },
  avatarFallback: {
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 38, color: '#fff',
  },
  avatarRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: '#8A9E78',
    margin: -3,
  },
  avatarEditOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 48,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },

  heroName: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 26, lineHeight: 32,
    color: '#fff', marginBottom: spacing.sm,
  },
  nameInput: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 24, color: '#fff',
    textAlign: 'center', borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255,255,255,0.5)',
    paddingBottom: 4, marginBottom: spacing.sm, minWidth: 200,
  },
  heroBadgeRow: {
    flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm,
  },
  levelBadge: {
    backgroundColor: 'rgba(138,158,120,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(138,158,120,0.4)',
  },
  seriesBadge: {
    backgroundColor: 'rgba(52,211,153,0.2)',
    borderColor: 'rgba(52,211,153,0.4)',
  },
  levelBadgeText: {
    fontSize: 12, color: 'rgba(255,255,255,0.92)', fontWeight: '600', letterSpacing: 0.4,
  },
  heroLocation: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4,
  },
  heroLocationText: {
    ...typography.bodyXs, color: 'rgba(255,255,255,0.7)',
  },

  // ── Stats ──
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    backgroundColor: '#FFFFFF', borderRadius: radius['2xl'],
    paddingVertical: spacing.lg, ...shadows.sm,
    borderWidth: 1, borderColor: '#E8E0D4',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 26, color: '#8A9E78',
  },
  statLabel: { ...typography.bodyXs, color: '#9B8E7E', marginTop: 2 },
  statDiv: { width: 1, backgroundColor: '#E8E0D4', marginVertical: spacing.xs },

  // ── Cards ──
  card: {
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    backgroundColor: '#FFFFFF', borderRadius: radius.xl,
    padding: spacing.lg, ...shadows.sm,
    borderWidth: 1, borderColor: '#E8E0D4',
  },
  cardTitle: {
    ...typography.headingXs, color: '#9B8E7E',
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: spacing.md,
  },

  // Weekly rhythm
  rhythmRow: {
    flexDirection: 'row', justifyContent: 'space-between',
  },
  rhythmDay: { alignItems: 'center', gap: 6 },
  rhythmDot: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#F6F2EC',
    borderWidth: 1.5, borderColor: '#E8E0D4',
  },
  rhythmDotDone: {
    backgroundColor: '#8A9E78', borderColor: '#8A9E78',
  },
  rhythmDotToday: {
    borderColor: '#C4B8A8', borderWidth: 2,
  },
  rhythmLabel: { ...typography.bodyXs, color: '#9B8E7E' },
  rhythmLabelToday: { color: '#C4B8A8', fontWeight: '700' },

  // Bio / fields
  bioText: { ...typography.bodyMd, color: '#5E5245', lineHeight: 22 },
  bioInput: {
    ...typography.bodyMd, color: '#5E5245',
    borderWidth: 1, borderColor: '#8A9E78', borderRadius: radius.md,
    padding: spacing.md, minHeight: 80, textAlignVertical: 'top',
    backgroundColor: '#F6F2EC',
  },
  fieldInput: {
    ...typography.bodyMd, color: '#5E5245',
    borderWidth: 1, borderColor: '#8A9E78', borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: '#F6F2EC',
  },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderRadius: radius.full, borderWidth: 1.5, borderColor: '#E8E0D4',
    backgroundColor: '#F6F2EC',
  },
  chipActive: { borderColor: '#8A9E78', backgroundColor: 'rgba(138,158,120,0.12)' },
  chipEmoji: { fontSize: 13 },
  chipText: { ...typography.labelSm, color: '#5E5245' },
  chipTextActive: { color: '#8A9E78', fontWeight: '700' },

  // Recent practices
  logRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  logRowDivider: {
    borderBottomWidth: 1, borderBottomColor: '#E8E0D4',
  },
  logDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#8A9E78',
  },
  logInfo: { flex: 1 },
  logSeries: { ...typography.headingXs, color: '#3B3228' },
  logDate: { ...typography.bodyXs, color: '#9B8E7E', marginTop: 1 },
  logDuration: { ...typography.bodyXs, color: '#9B8E7E' },

  // Sign out
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    marginHorizontal: spacing.lg, marginTop: spacing.sm,
    paddingVertical: spacing.lg,
    backgroundColor: '#FFFFFF', borderRadius: radius.xl,
    borderWidth: 1, borderColor: '#E8E0D4',
    ...shadows.sm,
  },
  signOutText: { ...typography.headingSm, color: '#C4956A' },

  version: {
    ...typography.bodyXs, color: '#C4B8A8',
    textAlign: 'center', marginTop: spacing.xl, marginBottom: spacing.xl,
  },

  // Log row — tappable with pencil hint
  logRight: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },

  // ── Edit log sheet ──
  sheetBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end',
  },
  sheetBox: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radius['3xl'],
    borderTopRightRadius: radius['3xl'],
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
    paddingTop: spacing.md,
    ...shadows.lg,
    borderTopWidth: 1, borderTopColor: '#E8E0D4',
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E8E0D4',
    alignSelf: 'center', marginBottom: spacing.lg,
  },
  sheetTopRow: { marginBottom: spacing.lg },
  sheetTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, lineHeight: 28,
    color: '#3B3228', marginBottom: 2,
  },
  sheetDate: { ...typography.bodySm, color: '#9B8E7E' },
  sheetLabel: {
    ...typography.headingXs, color: '#9B8E7E',
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },

  // Duration stepper
  stepper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F6F2EC', borderRadius: radius.xl,
    padding: spacing.xs, alignSelf: 'flex-start',
    gap: spacing.md,
  },
  stepBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#8A9E78', alignItems: 'center', justifyContent: 'center',
    ...shadows.sm,
  },
  stepValue: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 20,
    color: '#3B3228', minWidth: 80, textAlign: 'center',
  },

  // Sheet action buttons
  sheetActions: {
    flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl,
  },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: '#FFF5EC', borderRadius: radius.full,
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
  },
  deleteBtnText: { ...typography.headingSm, color: '#C4956A' },
  saveSheetBtn: {
    flex: 1, backgroundColor: '#8A9E78', borderRadius: radius.full,
    paddingVertical: spacing.md, alignItems: 'center',
  },
  saveSheetBtnText: { ...typography.headingSm, color: '#fff' },
});
