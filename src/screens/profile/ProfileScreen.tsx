// src/screens/profile/ProfileScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Image, Alert, ActivityIndicator, RefreshControl,
  Modal, Pressable,
} from 'react-native';
import type { PracticeLog } from '@/utils/practiceStreak';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { spacing, radius, typography } from '@/styles/tokens';
import { useAppStore, Series, Level } from '@/store/useAppStore';
import { upsertProfile, signOut, getProfile, uploadAvatar } from '@/lib/supabase';
import { calculateStreak } from '@/utils/practiceStreak';
import AppLogo from '@/components/AppLogo';

/* ââ Warm palette ââ */
const warm = {
  bg:      '#FAF6F0',
  card:    '#FFFFFF',
  ink:     '#3D3229',
  inkMid:  '#5C4D3C',
  orange:  '#E8834A',
  orangeL: '#F0A070',
  sage:    '#7A8B5E',
  sageL:   '#9BAA7E',
  muted:   '#8B7D6E',
  mutedL:  '#B5A899',
  border:  '#E8DDD0',
  borderL: '#F0E8DD',
  field:   '#F5F0EA',
};

const SERIES_OPTIONS: { value: Series; label: string; emoji: string }[] = [
  { value: 'sun_sals',     label: 'Sun Salutations', emoji: 'âï¸' },
  { value: 'primary',      label: 'Primary',         emoji: 'ð§' },
  { value: 'intermediate', label: 'Intermediate',    emoji: 'ð¥' },
  { value: 'advanced_a',   label: 'Advanced A',      emoji: 'â¡' },
  { value: 'advanced_b',   label: 'Advanced B',      emoji: 'ð' },
  { value: 'short',        label: 'Short',           emoji: 'ð' },
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
    <View style={[st.root, { paddingTop: insets.top }]}>

      {/* ââ Top bar ââ */}
      <View style={st.topbar}>
        <View style={st.topbarLeft}>
          <AppLogo size={34} />
          <Text style={st.appTitle}>Ashtanga Sangha</Text>
        </View>
        {editing ? (
          <View style={st.topbarActions}>
            <TouchableOpacity onPress={handleCancel} style={st.cancelBtn}>
              <Text style={st.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} disabled={saving} style={st.saveBtn}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={st.saveBtnText}>Save</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setEditing(true)} style={st.editBtn} activeOpacity={0.7}>
            <Ionicons name="pencil" size={14} color={warm.ink} />
            <Text style={st.editBtnText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={st.scroll}
        contentContainerStyle={st.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={warm.orange} />}
      >
        {/* ââ Hero gradient card ââ */}
        <View style={st.heroCard}>
          <LinearGradient
            colors={['#D4A574', '#B87D4A', '#8B5E3C', '#5C3D28']}
            locations={[0, 0.35, 0.7, 1]}
            style={st.heroGradient}
          >
            {/* Avatar */}
            <TouchableOpacity
              onPress={editing ? handlePickPhoto : undefined}
              activeOpacity={editing ? 0.75 : 1}
              style={st.avatarWrap}
            >
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={st.avatar} />
              ) : (
                <View style={[st.avatar, st.avatarFallback]}>
                  <Text style={st.avatarInitial}>{(user?.name ?? 'P')[0].toUpperCase()}</Text>
                </View>
              )}
              <View style={st.avatarRing} />
              {editing && (
                <View style={st.avatarEditOverlay}>
                  {uploadingPhoto
                    ? <ActivityIndicator color="#fff" />
                    : <Ionicons name="camera" size={22} color="#fff" />}
                </View>
              )}
            </TouchableOpacity>

            {/* Name */}
            {editing ? (
              <TextInput
                style={st.nameInput}
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="rgba(255,255,255,0.4)"
                autoFocus
              />
            ) : (
              <Text style={st.heroName}>{user?.name ?? 'Practitioner'}</Text>
            )}

            {/* Level badge + series */}
            <View style={st.heroBadgeRow}>
              <View style={st.levelBadge}>
                <Text style={st.levelBadgeText}>{currentLevelOpt?.label ?? 'Practitioner'}</Text>
              </View>
              {currentSeriesOpt && (
                <View style={[st.levelBadge, st.seriesBadge]}>
                  <Text style={st.levelBadgeText}>{currentSeriesOpt.emoji} {currentSeriesOpt.label}</Text>
                </View>
              )}
            </View>

            {user?.location ? (
              <View style={st.heroLocation}>
                <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.7)" />
                <Text style={st.heroLocationText}>{user.location}</Text>
              </View>
            ) : null}
          </LinearGradient>
        </View>

        {/* ââ Stats ââ */}
        <View style={st.statsCard}>
          <View style={st.statItem}>
            <Text style={st.statNum}>{streak}</Text>
            <Text style={st.statLabel}>Streak</Text>
          </View>
          <View style={st.statDiv} />
          <View style={st.statItem}>
            <Text style={st.statNum}>{totalPractices}</Text>
            <Text style={st.statLabel}>Practices</Text>
          </View>
          <View style={st.statDiv} />
          <View style={st.statItem}>
            <Text style={st.statNum}>{totalHours}</Text>
            <Text style={st.statLabel}>Hours</Text>
          </View>
        </View>

        {/* ââ Weekly rhythm ââ */}
        <View style={st.card}>
          <Text style={st.cardTitle}>This Week</Text>
          <View style={st.rhythmRow}>
            {last7.map((day, i) => (
              <View key={i} style={st.rhythmDay}>
                <View style={[
                  st.rhythmDot,
                  day.practiced && st.rhythmDotDone,
                  day.isToday && !day.practiced && st.rhythmDotToday,
                ]} />
                <Text style={[st.rhythmLabel, day.isToday && st.rhythmLabelToday]}>{day.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ââ About ââ */}
        <View style={st.card}>
          <Text style={st.cardTitle}>About</Text>
          {editing ? (
            <TextInput
              style={st.bioInput}
              value={bio}
              onChangeText={setBio}
              placeholder="Share your practice journey..."
              placeholderTextColor={warm.mutedL}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          ) : (
            <Text style={st.bioText}>
              {user?.bio || 'No bio yet. Tap Edit to add one.'}
            </Text>
          )}
        </View>

        {/* ââ Location (edit only) ââ */}
        {editing && (
          <View style={st.card}>
            <Text style={st.cardTitle}>Location</Text>
            <TextInput
              style={st.fieldInput}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Mysore, India"
              placeholderTextColor={warm.mutedL}
            />
          </View>
        )}

        {/* ââ Series + Level (edit mode) ââ */}
        {editing && (
          <View style={st.card}>
            <Text style={st.cardTitle}>Current Series</Text>
            <View style={st.chipRow}>
              {SERIES_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[st.chip, series === opt.value && st.chipActive]}
                  onPress={() => setSeries(opt.value)}
                >
                  <Text style={st.chipEmoji}>{opt.emoji}</Text>
                  <Text style={[st.chipText, series === opt.value && st.chipTextActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[st.cardTitle, { marginTop: spacing.lg }]}>Level</Text>
            <View style={st.chipRow}>
              {LEVEL_OPTIONS.map((opt) => (
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

        {/* ââ Recent practices ââ */}
        {recentLogs.length > 0 && (
          <View style={st.card}>
            <Text style={st.cardTitle}>Recent Practices</Text>
            {recentLogs.map((log, i) => {
              const d = new Date(log.loggedAt);
              const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              const seriesOpt = SERIES_OPTIONS.find((o) => o.value === log.series);
              return (
                <TouchableOpacity
                  key={log.id}
                  style={[st.logRow, i < recentLogs.length - 1 && st.logRowDivider]}
                  onPress={() => openLogEdit(log)}
                  activeOpacity={0.7}
                >
                  <View style={st.logDot} />
                  <View style={st.logInfo}>
                    <Text style={st.logSeries}>{seriesOpt?.emoji ?? 'ð§'} {seriesOpt?.label ?? log.series}</Text>
                    <Text style={st.logDate}>{label}</Text>
                  </View>
                  <View style={st.logRight}>
                    <Text style={st.logDuration}>{log.durationMin} min</Text>
                    <Ionicons name="pencil" size={13} color={warm.mutedL} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* ââ Sign out ââ */}
        <TouchableOpacity style={st.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#C0392B" />
          <Text style={st.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={st.version}>Ashtanga Sangha v1.0</Text>
      </ScrollView>

      {/* ââ Edit Practice Log Sheet ââ */}
      <Modal
        visible={!!editingLog}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingLog(null)}
      >
        <Pressable style={st.sheetBackdrop} onPress={() => setEditingLog(null)}>
          <Pressable style={st.sheetBox} onPress={() => {}}>
            {editingLog && (
              <>
                <View style={st.sheetHandle} />

                <View style={st.sheetTopRow}>
                  <Text style={st.sheetTitle}>Edit Practice</Text>
                  <Text style={st.sheetDate}>
                    {new Date(editingLog.loggedAt).toLocaleDateString('en-US', {
                      weekday: 'long', month: 'long', day: 'numeric',
                    })}
                  </Text>
                </View>

                {/* Series picker */}
                <Text style={st.sheetLabel}>Series</Text>
                <View style={st.chipRow}>
                  {SERIES_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[st.chip, editLogSeries === opt.value && st.chipActive]}
                      onPress={() => setEditLogSeries(opt.value)}
                    >
                      <Text style={st.chipEmoji}>{opt.emoji}</Text>
                      <Text style={[st.chipText, editLogSeries === opt.value && st.chipTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Duration stepper */}
                <Text style={[st.sheetLabel, { marginTop: spacing.lg }]}>Duration</Text>
                <View style={st.stepper}>
                  <TouchableOpacity
                    style={st.stepBtn}
                    onPress={() => setEditLogDuration((v) => Math.max(10, v - 15))}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="remove" size={20} color={warm.ink} />
                  </TouchableOpacity>
                  <Text style={st.stepValue}>{editLogDuration} min</Text>
                  <TouchableOpacity
                    style={st.stepBtn}
                    onPress={() => setEditLogDuration((v) => Math.min(300, v + 15))}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add" size={20} color={warm.ink} />
                  </TouchableOpacity>
                </View>

                {/* Actions */}
                <View style={st.sheetActions}>
                  <TouchableOpacity style={st.deleteBtn} onPress={deleteLog} activeOpacity={0.8}>
                    <Ionicons name="trash-outline" size={16} color="#C0392B" />
                    <Text style={st.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={st.saveSheetBtn} onPress={saveLogEdit} activeOpacity={0.8}>
                    <Text style={st.saveSheetBtnText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: warm.bg },

  /* ââ Top bar ââ */
  topbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  topbarLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  appTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18,
    color: warm.ink, lineHeight: 22,
  },
  topbarActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: warm.card, borderRadius: 9999,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: warm.border,
  },
  editBtnText: {
    fontFamily: 'DMSans_500Medium', fontSize: 12, lineHeight: 16, color: warm.ink,
  },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  cancelText: { fontFamily: 'DMSans_500Medium', fontSize: 13, color: warm.muted },
  saveBtn: {
    backgroundColor: warm.orange, borderRadius: 9999,
    paddingHorizontal: 16, paddingVertical: 8,
    minWidth: 64, alignItems: 'center',
  },
  saveBtnText: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: '#fff' },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 48 },

  /* ââ Hero card ââ */
  heroCard: {
    marginHorizontal: 16, marginBottom: 16,
    borderRadius: 24, overflow: 'hidden',
    shadowColor: '#8B5E3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  heroGradient: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },

  /* Avatar */
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: warm.orange,
  },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarInitial: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 38, color: '#fff',
  },
  avatarRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 52, borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.45)',
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
    color: '#fff', marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  nameInput: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 24, color: '#fff',
    textAlign: 'center', borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255,255,255,0.5)',
    paddingBottom: 4, marginBottom: 8, minWidth: 200,
  },
  heroBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  levelBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 9999,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
  },
  seriesBadge: {
    backgroundColor: 'rgba(122,139,94,0.35)',
    borderColor: 'rgba(122,139,94,0.5)',
  },
  levelBadgeText: {
    fontSize: 12, color: 'rgba(255,255,255,0.92)', fontWeight: '600', letterSpacing: 0.4,
  },
  heroLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  heroLocationText: {
    fontFamily: 'DMSans_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)',
  },

  /* ââ Stats ââ */
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: warm.card, borderRadius: 20,
    paddingVertical: 16,
    borderWidth: 1, borderColor: warm.borderL,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 26, color: warm.orange,
  },
  statLabel: {
    fontFamily: 'DMSans_400Regular', fontSize: 11, color: warm.muted, marginTop: 2,
  },
  statDiv: { width: 1, backgroundColor: warm.border, marginVertical: 4 },

  /* ââ Cards ââ */
  card: {
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: warm.card, borderRadius: 20,
    padding: 16,
    borderWidth: 1, borderColor: warm.borderL,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  cardTitle: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 11, lineHeight: 16,
    color: warm.muted, textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 12,
  },

  /* Weekly rhythm */
  rhythmRow: { flexDirection: 'row', justifyContent: 'space-between' },
  rhythmDay: { alignItems: 'center', gap: 6 },
  rhythmDot: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: warm.field,
    borderWidth: 1.5, borderColor: warm.border,
  },
  rhythmDotDone: {
    backgroundColor: warm.sage, borderColor: warm.sage,
  },
  rhythmDotToday: {
    borderColor: warm.orange, borderWidth: 2,
  },
  rhythmLabel: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: warm.muted },
  rhythmLabelToday: { color: warm.orange, fontWeight: '700' },

  /* Bio / fields */
  bioText: {
    fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 22, color: warm.inkMid,
  },
  bioInput: {
    fontFamily: 'DMSans_400Regular', fontSize: 14, color: warm.ink,
    borderWidth: 1, borderColor: warm.border, borderRadius: 12,
    padding: 12, minHeight: 80, textAlignVertical: 'top',
    backgroundColor: warm.field,
  },
  fieldInput: {
    fontFamily: 'DMSans_400Regular', fontSize: 14, color: warm.ink,
    borderWidth: 1, borderColor: warm.border, borderRadius: 12,
    padding: 12, backgroundColor: warm.field,
  },

  /* Chips */
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 9999, borderWidth: 1.5, borderColor: warm.border,
    backgroundColor: warm.field,
  },
  chipActive: { borderColor: warm.orange, backgroundColor: 'rgba(232,131,74,0.08)' },
  chipEmoji: { fontSize: 13 },
  chipText: { fontFamily: 'DMSans_500Medium', fontSize: 11, lineHeight: 16, color: warm.inkMid },
  chipTextActive: { color: warm.orange, fontWeight: '700' },

  /* Recent practices */
  logRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 8,
  },
  logRowDivider: { borderBottomWidth: 1, borderBottomColor: warm.borderL },
  logDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: warm.sage,
  },
  logInfo: { flex: 1 },
  logSeries: { fontFamily: 'DMSans_600SemiBold', fontSize: 11, lineHeight: 16, color: warm.ink },
  logDate: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: warm.muted, marginTop: 1 },
  logDuration: { fontFamily: 'DMSans_400Regular', fontSize: 11, color: warm.muted },

  /* Sign out */
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 8,
    paddingVertical: 16,
    backgroundColor: warm.card, borderRadius: 20,
    borderWidth: 1, borderColor: '#F0E0E0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  signOutText: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: '#C0392B' },

  version: {
    fontFamily: 'DMSans_400Regular', fontSize: 11,
    color: warm.mutedL, textAlign: 'center',
    marginTop: 20, marginBottom: 20,
  },

  logRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  /* ââ Edit log sheet ââ */
  sheetBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end',
  },
  sheetBox: {
    backgroundColor: warm.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1, shadowRadius: 16, elevation: 8,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: warm.border,
    alignSelf: 'center', marginBottom: 16,
  },
  sheetTopRow: { marginBottom: 16 },
  sheetTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, lineHeight: 28,
    color: warm.ink, marginBottom: 2,
  },
  sheetDate: { fontFamily: 'DMSans_400Regular', fontSize: 13, color: warm.muted },
  sheetLabel: {
    fontFamily: 'DMSans_600SemiBold', fontSize: 11, lineHeight: 16,
    color: warm.muted, textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 8,
  },

  /* Duration stepper */
  stepper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: warm.field, borderRadius: 20,
    padding: 4, alignSelf: 'flex-start', gap: 12,
  },
  stepBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: warm.card, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  stepValue: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 20,
    color: warm.ink, minWidth: 80, textAlign: 'center',
  },

  /* Sheet action buttons */
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: '#F0D0D0', borderRadius: 9999,
    paddingVertical: 12, paddingHorizontal: 16,
  },
  deleteBtnText: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: '#C0392B' },
  saveSheetBtn: {
    flex: 1, backgroundColor: warm.orange, borderRadius: 9999,
    paddingVertical: 12, alignItems: 'center',
  },
  saveSheetBtnText: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: '#fff' },
});
