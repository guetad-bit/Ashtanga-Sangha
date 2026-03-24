', '#5C3D28']}
            locations={[0, 0.35, 0.7, 1]}
            style={st.heroGradient}
          >
            {/* Avatar – always tappable to change photo */}
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
              <View style={st.avatarRing} />
              <View style={st.avatarEditOverlay}>
                {uploadingPhoto
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Ionicons name="camera" size={16} color="rgba(255,255,255,0.9)" />}
              </View>
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

        {/* ── Stats ── */}
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

        {/* ── Weekly rhythm ── */}
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

        {/* ── About ── */}
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

        {/* ── Personal Details (view mode) ── */}
        {!editing && (user?.location || user?.teacher || user?.practicingSince) && (
          <View style={st.card}>
            <Text style={st.cardTitle}>Details</Text>
            {user?.location ? (
              <View style={st.detailRow}>
                <Ionicons name="location-outline" size={16} color={warm.muted} />
                <Text style={st.detailText}>{user.location}</Text>
              </View>
            ) : null}
            {user?.teacher ? (
              <View style={st.detailRow}>
                <Ionicons name="person-outline" size={16} color={warm.muted} />
                <Text style={st.detailText}>{user.teacher}</Text>
              </View>
            ) : null}
            {user?.practicingSince ? (
              <View style={[st.detailRow, { borderBottomWidth: 0 }]}>
                <Ionicons name="calendar-outline" size={16} color={warm.muted} />
                <Text style={st.detailText}>Practicing since {user.practicingSince}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* ── Personal Details (edit mode) ── */}
        {editing && (
          <View style={st.card}>
            <Text style={st.cardTitle}>Personal Details</Text>

            <Text style={st.fieldLabel}>Location</Text>
            <TextInput
              style={st.fieldInput}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Mysore, India"
              placeholderTextColor={warm.mutedL}
            />

            <Text style={[st.fieldLabel, { marginTop: 16 }]}>Teacher / Shala</Text>
            <TextInput
              style={st.fieldInput}
              value={teacher}
              onChangeText={setTeacher}
              placeholder="e.g. Sharath Jois, KPJAYI"
              placeholderTextColor={warm.mutedL}
            />

            <Text style={[st.fieldLabel, { marginTop: 16 }]}>Practicing Since</Text>
            <TextInput
              style={st.fieldInput}
              value={practicingSince}
              onChangeText={(t) => setPracticingSince(t.replace(/[^0-9]/g, '').slice(0, 4))}
              placeholder="e.g. 2018"
              placeholderTextColor={warm.mutedL}
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>
        )}

        {/* ── Series + Level (edit mode) ── */}
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

        {/* ── Sign out ── */}
        <TouchableOpacity style={st.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#C0392B" />
          <Text style={st.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={st.version}>Ashtanga Sangha v1.0</Text>
      </ScrollView>

      {/* ── Photo picker modal (for native; web goes straight to library) ── */}
      <Modal visible={showPhotoModal} transparent animationType="fade" onRequestClose={() => setShowPhotoModal(false)}>
        <Pressable style={st.modalOverlay} onPress={() => setShowPhotoModal(false)}>
          <View style={st.modalCard}>
            <Text style={st.modalTitle}>Profile Photo</Text>
            <TouchableOpacity style={st.modalOption} onPress={() => { setShowPhotoModal(false); pickImage('camera'); }}>
              <Ionicons name="camera-outline" size={20} color={warm.orange} />
              <Text style={st.modalOptionText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.modalOption} onPress={() => { setShowPhotoModal(false); pickImage('library'); }}>
              <Ionicons name="image-outline" size={20} color={warm.sage} />
              <Text style={st.modalOptionText}>Photo Library</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[st.modalOption, { borderBottomWidth: 0 }]} onPress={() => setShowPhotoModal(false)}>
              <Text style={[st.modalOptionText, { color: warm.muted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* ── Sign-out confirm modal (for web) ── */}
      <Modal visible={showSignOutModal} transparent animationType="fade" onRequestClose={() => setShowSignOutModal(false)}>
        <Pressable style={st.modalOverlay} onPress={() => setShowSignOutModal(false)}>
          <View style={st.modalCard}>
            <Text style={st.modalTitle}>Sign Out</Text>
            <Text style={{ fontSize: 14, color: warm.muted, textAlign: 'center', marginBottom: 16 }}>Are you sure you want to sign out?</Text>
            <TouchableOpacity style={st.modalOption} onPress={async () => { setShowSignOutModal(false); await signOut(); clearUser(); }}>
              <Ionicons name="log-out-outline" size={20} color="#C0392B" />
              <Text style={[st.modalOptionText, { color: '#C0392B' }]}>Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[st.modalOption, { borderBottomWidth: 0 }]} onPress={() => setShowSignOutModal(false)}>
              <Text style={[st.modalOptionText, { color: warm.muted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: warm.bg },

  /* ── Top bar ── */
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

  /* ── Hero card ── */
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
  XeatarWrap: { position: 'relative', marginBottom: 12 },
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
    position: 'absolute', bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)',
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

  /* ── Stats ── */
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

  /* ── Cards ── */
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
 &HethmRow: { flexDirection: 'row', justifyContent: 'space-between' },
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
  fieldLabel: {
    fontFamily: 'DMSans_500Medium', fontSize: 12, color: warm.muted,
    marginBottom: 6,
  },
  fieldInput: {
    fontFamily: 'DMSans_400Regular', fontSize: 14, color: warm.ink,
    borderWidth: 1, borderColor: warm.border, borderRadius: 12,
    padding: 12, backgroundColor: warm.field,
  },

  /* Detail rows (view mode) */
  detailRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: warm.borderL,
  },
  detailText: {
    fontFamily: 'DMSans_400Regular', fontSize: 14, color: warm.inkMid,
    flex: 1,
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

  /* Modals */
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalCard: {
    backgroundColor: warm.card, borderRadius: 20,
    padding: 20, width: 280,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  modalTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18,
    color: warm.ink, textAlign: 'center', marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: warm.borderL,
  },
  modalOptionText: {
    fontFamily: 'DMSans_500Medium', fontSize: 15, color: warm.ink,
  },
});
