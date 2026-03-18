// src/screens/shalas/ShalaFinderScreen.tsx
import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  Modal,
  Animated,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { colors, spacing, radius, shadows, typography } from '@/styles/tokens';
import { shalas, type Shala, type Review } from '@/data/mockShalas';
import AppHeader from '@/components/AppHeader';

const { width: SCREEN_W } = Dimensions.get('window');

type FilterRegion = 'all' | 'india' | 'europe' | 'asia' | 'americas' | 'oceania';
type FilterAuth = 'all' | 'KPJAYI' | 'Certified' | 'Authorized Level 2' | 'Authorized Level 1' | 'Traditional';

const REGION_LABELS: { key: FilterRegion; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'india', label: 'India' },
  { key: 'europe', label: 'Europe' },
  { key: 'asia', label: 'Asia' },
  { key: 'americas', label: 'Americas' },
  { key: 'oceania', label: 'Oceania' },
];

const AUTH_LABELS: { key: FilterAuth; label: string }[] = [
  { key: 'all', label: 'Any' },
  { key: 'KPJAYI', label: 'KPJAYI' },
  { key: 'Certified', label: 'Certified' },
  { key: 'Authorized Level 2', label: 'Auth. L2' },
  { key: 'Authorized Level 1', label: 'Auth. L1' },
];

// ─── Stars Component ────────────────────────────────────
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<Ionicons key={i} name="star" size={size} color="#E8A44A" />);
    } else if (i - 0.5 <= rating) {
      stars.push(<Ionicons key={i} name="star-half" size={size} color="#E8A44A" />);
    } else {
      stars.push(<Ionicons key={i} name="star-outline" size={size} color={colors.mutedL} />);
    }
  }
  return <View style={{ flexDirection: 'row', gap: 1 }}>{stars}</View>;
}

// ─── Chip / Pill ────────────────────────────────────────
function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, active && s.chipActive]}
    >
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

// ─── Shala Card ─────────────────────────────────────────
function ShalaCard({ shala, onPress }: { shala: Shala; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={s.card}>
      <Image source={{ uri: shala.imageUrl }} style={s.cardImage} />
      <View style={s.cardBody}>
        <View style={s.cardHeader}>
          <Text style={s.cardName} numberOfLines={1}>{shala.name}</Text>
          <View style={s.cardRating}>
            <Ionicons name="star" size={13} color="#E8A44A" />
            <Text style={s.cardRatingText}>{shala.rating}</Text>
          </View>
        </View>

        <View style={s.cardLocationRow}>
          <Ionicons name="location-outline" size={14} color={colors.muted} />
          <Text style={s.cardLocation}>{shala.city}, {shala.country}</Text>
        </View>

        <View style={s.cardTeacherRow}>
          <Image source={{ uri: shala.teacherImg }} style={s.cardTeacherImg} />
          <View style={{ flex: 1 }}>
            <Text style={s.cardTeacher}>{shala.teacher}</Text>
            <Text style={s.cardAuth}>{shala.authorization}</Text>
          </View>
        </View>

        <View style={s.cardFooter}>
          <View style={s.cardStyleTags}>
            {shala.style.slice(0, 2).map((st) => (
              <View key={st} style={s.styleTag}>
                <Text style={s.styleTagText}>{st}</Text>
              </View>
            ))}
            {shala.style.length > 2 && (
              <Text style={s.moreStyles}>+{shala.style.length - 2}</Text>
            )}
          </View>
          <View style={s.cardCheckins}>
            <MaterialCommunityIcons name="map-marker-check" size={14} color={colors.sage} />
            <Text style={s.checkinsText}>{shala.checkins}</Text>
          </View>
        </View>

        {shala.dropIn && (
          <View style={s.dropInBadge}>
            <Text style={s.dropInText}>Drop-in {shala.dropInPrice}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ─── Review Card ────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  return (
    <View style={s.reviewCard}>
      <View style={s.reviewHeader}>
        <Image source={{ uri: review.userImg }} style={s.reviewAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={s.reviewName}>{review.userName}</Text>
          <Text style={s.reviewMeta}>
            {review.userLocation} · {review.date}
            {review.practicedMonths ? ` · ${review.practicedMonths}mo` : ''}
          </Text>
        </View>
        <Stars rating={review.rating} size={12} />
      </View>
      <Text style={s.reviewText}>{review.text}</Text>
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────
export default function ShalaFinderScreen() {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<FilterRegion>('all');
  const [authFilter, setAuthFilter] = useState<FilterAuth>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Shala | null>(null);

  const filtered = useMemo(() => {
    let results = shalas;
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (sh) =>
          sh.name.toLowerCase().includes(q) ||
          sh.city.toLowerCase().includes(q) ||
          sh.country.toLowerCase().includes(q) ||
          sh.teacher.toLowerCase().includes(q)
      );
    }
    if (regionFilter !== 'all') {
      results = results.filter((sh) => sh.region === regionFilter);
    }
    if (authFilter !== 'all') {
      results = results.filter((sh) => sh.authorization === authFilter);
    }
    return results;
  }, [search, regionFilter, authFilter]);

  const activeFilterCount =
    (regionFilter !== 'all' ? 1 : 0) + (authFilter !== 'all' ? 1 : 0);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <AppHeader />

      {/* Search Bar */}
      <View style={s.searchRow}>
        <View style={s.searchBar}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            style={s.searchInput}
            placeholder="City, teacher, or shala name…"
            placeholderTextColor={colors.mutedL}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.mutedL} />
            </Pressable>
          )}
        </View>
        <Pressable
          style={[s.filterBtn, showFilters && s.filterBtnActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options-outline" size={20} color={showFilters ? colors.white : colors.ink} />
          {activeFilterCount > 0 && (
            <View style={s.filterBadge}>
              <Text style={s.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={s.filtersPanel}>
          <Text style={s.filterLabel}>Region</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipRow}>
            {REGION_LABELS.map((r) => (
              <Chip
                key={r.key}
                label={r.label}
                active={regionFilter === r.key}
                onPress={() => setRegionFilter(r.key)}
              />
            ))}
          </ScrollView>
          <Text style={[s.filterLabel, { marginTop: 12 }]}>Teacher Authorization</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipRow}>
            {AUTH_LABELS.map((a) => (
              <Chip
                key={a.key}
                label={a.label}
                active={authFilter === a.key}
                onPress={() => setAuthFilter(a.key)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="search-outline" size={48} color={colors.mutedL} />
            <Text style={s.emptyTitle}>No shalas found</Text>
            <Text style={s.emptyText}>Try a different city or adjust filters</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ShalaCard shala={item} onPress={() => setSelected(item)} />
        )}
      />

      {/* ─── Detail Modal ──────────────────────────────── */}
      <Modal
        visible={!!selected}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelected(null)}
      >
        {selected && (
          <View style={s.modalContainer}>
            {/* Modal Header */}
            <View style={s.modalHandle} />
            <ScrollView
              style={s.modalScroll}
              contentContainerStyle={s.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Hero Image */}
              <Image source={{ uri: selected.imageUrl }} style={s.modalImage} />

              {/* Name & Rating */}
              <View style={s.modalSection}>
                <Text style={s.modalName}>{selected.name}</Text>
                <View style={s.modalRatingRow}>
                  <Stars rating={selected.rating} size={16} />
                  <Text style={s.modalRatingNum}>{selected.rating}</Text>
                  <Text style={s.modalReviewCount}>({selected.reviewCount} reviews)</Text>
                </View>
                <View style={s.modalLocationRow}>
                  <Ionicons name="location" size={16} color={colors.sage} />
                  <Text style={s.modalLocation}>{selected.city}, {selected.country}</Text>
                </View>
              </View>

              {/* Teacher */}
              <View style={s.modalSection}>
                <Text style={s.sectionTitle}>Teacher</Text>
                <View style={s.teacherCard}>
                  <Image source={{ uri: selected.teacherImg }} style={s.teacherImg} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.teacherName}>{selected.teacher}</Text>
                    <View style={s.authBadge}>
                      <MaterialCommunityIcons name="certificate" size={14} color={colors.sage} />
                      <Text style={s.authBadgeText}>{selected.authorization}</Text>
                    </View>
                    <Text style={s.lineageText}>{selected.lineage}</Text>
                  </View>
                </View>
              </View>

              {/* About */}
              <View style={s.modalSection}>
                <Text style={s.sectionTitle}>About</Text>
                <Text style={s.descText}>{selected.description}</Text>
              </View>

              {/* Schedule */}
              <View style={s.modalSection}>
                <Text style={s.sectionTitle}>Schedule</Text>
                {selected.schedule.map((sc, i) => (
                  <View key={i} style={s.scheduleRow}>
                    <Text style={s.schedDay}>{sc.day}</Text>
                    <Text style={s.schedTime}>{sc.time}</Text>
                    <Text style={s.schedClass}>{sc.class}</Text>
                  </View>
                ))}
                <View style={s.moonRow}>
                  <MaterialCommunityIcons name="moon-waning-crescent" size={14} color={colors.sandDeep} />
                  <Text style={s.moonText}>{selected.moonDayPolicy}</Text>
                </View>
              </View>

              {/* Styles */}
              <View style={s.modalSection}>
                <Text style={s.sectionTitle}>Practice Styles</Text>
                <View style={s.tagsWrap}>
                  {selected.style.map((st) => (
                    <View key={st} style={s.modalStyleTag}>
                      <Text style={s.modalStyleTagText}>{st}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Pricing */}
              <View style={s.modalSection}>
                <Text style={s.sectionTitle}>Pricing</Text>
                <View style={s.priceCard}>
                  {selected.dropIn && selected.dropInPrice && (
                    <View style={s.priceRow}>
                      <Text style={s.priceLabel}>Drop-in</Text>
                      <Text style={s.priceValue}>{selected.dropInPrice}</Text>
                    </View>
                  )}
                  {selected.monthlyPrice && (
                    <View style={s.priceRow}>
                      <Text style={s.priceLabel}>Monthly</Text>
                      <Text style={s.priceValue}>{selected.monthlyPrice}</Text>
                    </View>
                  )}
                  {!selected.dropIn && (
                    <Text style={s.noDropIn}>Registration required — no drop-ins</Text>
                  )}
                </View>
              </View>

              {/* Amenities */}
              <View style={s.modalSection}>
                <Text style={s.sectionTitle}>Amenities</Text>
                <View style={s.tagsWrap}>
                  {selected.amenities.map((am) => (
                    <View key={am} style={s.amenityTag}>
                      <Text style={s.amenityTagText}>{am}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Community / Check-ins */}
              <View style={s.modalSection}>
                <Text style={s.sectionTitle}>Community</Text>
                <View style={s.communityCard}>
                  <View style={s.communityRow}>
                    <MaterialCommunityIcons name="map-marker-check" size={20} color={colors.sage} />
                    <Text style={s.communityNum}>{selected.checkins.toLocaleString()}</Text>
                    <Text style={s.communityLabel}>check-ins</Text>
                  </View>
                  {selected.practitioners.length > 0 && (
                    <View style={s.practitionerRow}>
                      {selected.practitioners.slice(0, 5).map((p, i) => (
                        <Image
                          key={i}
                          source={{ uri: p.img }}
                          style={[s.practitionerAvatar, i > 0 && { marginLeft: -8 }]}
                        />
                      ))}
                      <Text style={s.practitionerText}>
                        {selected.practitioners.map((p) => p.name).join(', ')} practiced here
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Reviews */}
              <View style={s.modalSection}>
                <Text style={s.sectionTitle}>
                  Reviews ({selected.reviewCount})
                </Text>
                {selected.reviews.length > 0 ? (
                  selected.reviews.map((rev) => (
                    <ReviewCard key={rev.id} review={rev} />
                  ))
                ) : (
                  <View style={s.noReviews}>
                    <Feather name="message-circle" size={24} color={colors.mutedL} />
                    <Text style={s.noReviewsText}>No reviews yet — be the first!</Text>
                  </View>
                )}

                {/* Write Review Button */}
                <Pressable
                  style={s.writeReviewBtn}
                  onPress={() => {/* TODO */}}
                >
                  <Feather name="edit-3" size={16} color={colors.sage} />
                  <Text style={s.writeReviewText}>Write a Review</Text>
                </Pressable>
              </View>

              {/* Check-in CTA */}
              <Pressable
                style={s.checkinCta}
                onPress={() => {/* TODO */}}
              >
                <MaterialCommunityIcons name="map-marker-check-outline" size={20} color={colors.white} />
                <Text style={s.checkinCtaText}>I Practice Here</Text>
              </Pressable>

              <View style={{ height: 40 }} />
            </ScrollView>

            {/* Close */}
            <Pressable style={s.closeBtn} onPress={() => setSelected(null)}>
              <Ionicons name="close" size={22} color={colors.ink} />
            </Pressable>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.page },


  // Search
  searchRow: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 12, gap: 10 },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
    ...shadows.sm,
  },
  searchInput: { flex: 1, ...typography.bodyMd, color: colors.ink, height: 44 },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  filterBtnActive: { backgroundColor: colors.ink },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.orange,
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: { ...typography.bodyXs, color: colors.white, fontWeight: '700', fontSize: 10 },

  // Filters
  filtersPanel: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: radius.lg,
    padding: 14,
    ...shadows.sm,
  },
  filterLabel: { ...typography.headingSm, color: colors.ink, marginBottom: 6 },
  chipRow: { flexDirection: 'row', marginBottom: 4 },

  // Chips
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.sky,
    marginRight: 8,
  },
  chipActive: { backgroundColor: colors.ink },
  chipText: { ...typography.labelSm, color: colors.inkMid },
  chipTextActive: { ...typography.labelSm, color: colors.white },

  // List
  list: { padding: 20, paddingTop: 14, gap: 14 },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { ...typography.headingLg, color: colors.ink, marginTop: 12 },
  emptyText: { ...typography.bodyMd, color: colors.muted, marginTop: 4 },

  // Card
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  cardImage: { width: '100%', height: 160 },
  cardBody: { padding: 14, gap: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { ...typography.headingMd, color: colors.ink, flex: 1, marginRight: 8 },
  cardRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardRatingText: { ...typography.labelSm, color: colors.ink },
  cardLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardLocation: { ...typography.bodySm, color: colors.muted },
  cardTeacherRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  cardTeacherImg: { width: 32, height: 32, borderRadius: 16 },
  cardTeacher: { ...typography.labelMd, color: colors.ink },
  cardAuth: { ...typography.bodyXs, color: colors.sage },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  cardStyleTags: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  styleTag: { backgroundColor: colors.sagePale, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  styleTagText: { ...typography.bodyXs, color: colors.sage, fontWeight: '600' },
  moreStyles: { ...typography.bodyXs, color: colors.muted },
  cardCheckins: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  checkinsText: { ...typography.bodyXs, color: colors.sage, fontWeight: '600' },
  dropInBadge: {
    position: 'absolute',
    top: -160 - 14 + 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  dropInText: { ...typography.labelSm, color: colors.ink },

  // ── Modal ──
  modalContainer: { flex: 1, backgroundColor: colors.page },
  modalHandle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.mutedL,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  modalScroll: { flex: 1 },
  modalContent: { paddingBottom: 20 },
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...shadows.sm,
  },

  // Modal Image
  modalImage: { width: '100%', height: 220 },

  // Modal Sections
  modalSection: {
    paddingHorizontal: 20,
    paddingTop: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.skyMid,
    paddingBottom: 18,
  },
  sectionTitle: { ...typography.headingMd, color: colors.ink, marginBottom: 10 },

  // Name & Rating
  modalName: { ...typography.displayMd, color: colors.ink },
  modalRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  modalRatingNum: { ...typography.labelMd, color: colors.ink },
  modalReviewCount: { ...typography.bodySm, color: colors.muted },
  modalLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  modalLocation: { ...typography.bodyMd, color: colors.inkMid },

  // Teacher
  teacherCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.white,
    padding: 14,
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  teacherImg: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: colors.sagePale },
  teacherName: { ...typography.headingMd, color: colors.ink },
  authBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  authBadgeText: { ...typography.labelSm, color: colors.sage },
  lineageText: { ...typography.bodyXs, color: colors.muted, marginTop: 4 },

  // Description
  descText: { ...typography.bodyMd, color: colors.inkMid, lineHeight: 22 },

  // Schedule
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.sky,
  },
  schedDay: { ...typography.labelMd, color: colors.ink, width: 90 },
  schedTime: { ...typography.bodyMd, color: colors.inkMid, width: 80 },
  schedClass: { ...typography.bodySm, color: colors.muted, flex: 1 },
  moonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: colors.sand,
    padding: 10,
    borderRadius: radius.sm,
  },
  moonText: { ...typography.bodySm, color: colors.sandDeep },

  // Styles tags
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modalStyleTag: {
    backgroundColor: colors.sagePale,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  modalStyleTagText: { ...typography.labelSm, color: colors.sage },

  // Pricing
  priceCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 14,
    ...shadows.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  priceLabel: { ...typography.bodyMd, color: colors.muted },
  priceValue: { ...typography.headingMd, color: colors.ink },
  noDropIn: { ...typography.bodySm, color: colors.muted, fontStyle: 'italic' },

  // Amenities
  amenityTag: {
    backgroundColor: colors.sky,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  amenityTagText: { ...typography.bodyXs, color: colors.inkMid },

  // Community
  communityCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 14,
    gap: 10,
    ...shadows.sm,
  },
  communityRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  communityNum: { ...typography.displaySm, color: colors.ink },
  communityLabel: { ...typography.bodyMd, color: colors.muted },
  practitionerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 4 },
  practitionerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.white,
  },
  practitionerText: { ...typography.bodySm, color: colors.muted, marginLeft: 8, flex: 1 },

  // Reviews
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 10,
    ...shadows.sm,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18 },
  reviewName: { ...typography.labelMd, color: colors.ink },
  reviewMeta: { ...typography.bodyXs, color: colors.muted },
  reviewText: { ...typography.bodyMd, color: colors.inkMid, lineHeight: 21 },
  noReviews: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  noReviewsText: { ...typography.bodySm, color: colors.muted },
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: colors.sage,
    borderRadius: radius.lg,
    marginTop: 6,
  },
  writeReviewText: { ...typography.labelMd, color: colors.sage },

  // Check-in CTA
  checkinCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: colors.sage,
    paddingVertical: 16,
    borderRadius: radius.xl,
    ...shadows.md,
  },
  checkinCtaText: { ...typography.headingMd, color: colors.white },
});
