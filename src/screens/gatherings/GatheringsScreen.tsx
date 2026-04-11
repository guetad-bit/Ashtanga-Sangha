// src/screens/gatherings/GatheringsScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Animated, Platform, LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

/* ─── clay palette ─── */
const clay = {
  bg:        '#F5EFE6',
  card:      '#FFFFFF',
  ink:       '#2A2420',
  sub:       '#6B5E52',
  muted:     '#8A7A68',
  border:    '#E8DFD0',
  clay:      '#C26B4D',
  clayDark:  '#A5502F',
  sage:      '#A8B59B',
  sand:      '#D4C5A9',
  warm:      '#F9F4ED',
};

/* ─── types ─── */
type GatheringType = 'retreat' | 'led_class' | 'workshop' | 'mysore';

interface Gathering {
  id: string;
  title: string;
  subtitle: string;
  type: GatheringType;
  date: string;
  dateRange: string;
  location: string;
  country: string;
  price: string;
  spotsLeft: number;
  spotsTotal: number;
  imageId: string;
  guide: {
    name: string;
    avatar: string;
    bio: string;
  };
  description: string;
  tags: string[];
}

/* ─── unsplash helpers ─── */
const img = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${Math.round(w * 0.6)}&q=80&auto=format&fit=crop`;

const avatar = (id: string) =>
  `https://images.unsplash.com/${id}?w=120&h=120&q=80&auto=format&fit=crop&crop=face`;

/* ─── 4 gatherings ─── */
const GATHERINGS: Gathering[] = [
  {
    id: 'g1',
    title: 'Ashtanga Retreat: Mediterranean Flow',
    subtitle: '6 days of practice by the sea',
    type: 'retreat',
    date: '2026-06-14',
    dateRange: 'Jun 14 – 20, 2026',
    location: 'Paphos',
    country: 'Cyprus',
    price: '€1,450',
    spotsLeft: 4,
    spotsTotal: 18,
    imageId: 'photo-1507525428034-b723cf961d3e',
    guide: {
      name: 'Lucas Fernandes',
      avatar: 'photo-1506794778202-cad84cf45f1d',
      bio: 'Authorized Level 2 Ashtanga teacher. Lucas has practiced in Mysore under Sharath Jois for over a decade and leads retreats across the Mediterranean each summer.',
    },
    description: 'Wake to the sound of waves, practice Primary & Intermediate series at sunrise, then explore the Cypriot coast. Includes pranayama workshops, philosophy talks, and two guided excursions. All meals are plant-based and locally sourced.',
    tags: ['Primary Series', 'Intermediate', 'Pranayama', 'Beachfront'],
  },
  {
    id: 'g2',
    title: 'Desert Silence Retreat',
    subtitle: '4 days in the Negev wilderness',
    type: 'retreat',
    date: '2026-09-03',
    dateRange: 'Sep 3 – 7, 2026',
    location: 'Mitzpe Ramon',
    country: 'Israel',
    price: '₪3,200',
    spotsLeft: 6,
    spotsTotal: 14,
    imageId: 'photo-1509316785289-025f5b846b35',
    guide: {
      name: 'Daniel Cohen',
      avatar: 'photo-1500648767791-00dcc994a43e',
      bio: 'Daniel teaches Ashtanga and meditation in Tel Aviv and the Negev. A former IDF mental resilience instructor, he blends traditional Mysore-style practice with breathwork and silent meditation.',
    },
    description: 'Disconnect from the noise. Practice twice daily at the edge of the Ramon Crater, with silent mornings, guided desert walks, and evening philosophy circles under the stars. Accommodation in eco-lodges.',
    tags: ['Primary Series', 'Meditation', 'Silent Practice', 'Desert'],
  },
  {
    id: 'g3',
    title: 'Led Primary with Moran Ezra',
    subtitle: 'Weekly led class in central Tel Aviv',
    type: 'led_class',
    date: '2026-04-17',
    dateRange: 'Every Friday, 7:00 AM',
    location: 'Tel Aviv',
    country: 'Israel',
    price: '₪65 / class',
    spotsLeft: 8,
    spotsTotal: 20,
    imageId: 'photo-1545389336-cf090694435e',
    guide: {
      name: 'Moran Ezra',
      avatar: 'photo-1438761681033-6461ffad8d80',
      bio: 'Moran has dedicated over a decade to Ashtanga Yoga, with multiple extended study periods in Mysore, India. She is known for her precise, compassionate teaching style and deep knowledge of the traditional count. She leads the Ashtanga community at Yoga Shala Tel Aviv.',
    },
    description: 'Traditional led Primary Series with Sanskrit count. Moran guides students of all levels through the full sequence with clear adjustments and a steady rhythm. Drop-in welcome; bring your own mat.',
    tags: ['Primary Series', 'Led Class', 'Sanskrit Count', 'All Levels'],
  },
  {
    id: 'g4',
    title: 'Pranayama & Philosophy Weekend',
    subtitle: 'Deepen your practice beyond asana',
    type: 'workshop',
    date: '2026-05-08',
    dateRange: 'May 8 – 10, 2026',
    location: 'Jaffa',
    country: 'Israel',
    price: '₪850',
    spotsLeft: 10,
    spotsTotal: 16,
    imageId: 'photo-1506126613408-eca07ce68773',
    guide: {
      name: 'Sofia Moretti',
      avatar: 'photo-1544005313-94ddf0286df2',
      bio: 'Sofia teaches pranayama, chanting, and Yoga Sutra study. After 8 years of Ashtanga practice she turned her focus to the subtler limbs, studying under O.P. Tiwari in Kaivalyadhama.',
    },
    description: 'A weekend immersion into the breathing practices and philosophical roots of Ashtanga. Morning pranayama sessions, afternoon sutra study with group discussion, and gentle evening practice. Open to practitioners of all traditions.',
    tags: ['Pranayama', 'Philosophy', 'Yoga Sutras', 'Weekend Immersion'],
  },
];

const FILTERS: { label: string; value: GatheringType | 'all' }[] = [
  { label: 'All',        value: 'all' },
  { label: 'Retreat',    value: 'retreat' },
  { label: 'Led Class',  value: 'led_class' },
  { label: 'Workshop',   value: 'workshop' },
  { label: 'Mysore',     value: 'mysore' },
];

/* ─── badge color per type ─── */
const typeBadge: Record<GatheringType, { bg: string; text: string; label: string }> = {
  retreat:   { bg: '#E8D5CE', text: clay.clayDark, label: 'Retreat' },
  led_class: { bg: '#D5E0D0', text: '#3D5A3A', label: 'Led Class' },
  workshop:  { bg: '#DDD5E8', text: '#5A3D6B', label: 'Workshop' },
  mysore:    { bg: '#D5DAE8', text: '#3A4D6B', label: 'Mysore' },
};

/* ─── single gathering card ─── */
function GatheringCard({ g }: { g: Gathering }) {
  const [expanded, setExpanded] = useState(false);
  const badge = typeBadge[g.type];
  const spotsPercent = ((g.spotsTotal - g.spotsLeft) / g.spotsTotal) * 100;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity activeOpacity={0.92} onPress={toggle} style={s.card}>
      {/* Hero image */}
      <Image source={{ uri: img(g.imageId) }} style={s.cardImage} />

      {/* Type badge */}
      <View style={[s.badge, { backgroundColor: badge.bg }]}>
        <Text style={[s.badgeText, { color: badge.text }]}>{badge.label}</Text>
      </View>

      {/* Content */}
      <View style={s.cardBody}>
        <Text style={s.cardTitle}>{g.title}</Text>
        <Text style={s.cardSubtitle}>{g.subtitle}</Text>

        {/* Meta row */}
        <View style={s.metaRow}>
          <View style={s.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={clay.muted} />
            <Text style={s.metaText}>{g.dateRange}</Text>
          </View>
          <View style={s.metaItem}>
            <Ionicons name="location-outline" size={14} color={clay.muted} />
            <Text style={s.metaText}>{g.location}, {g.country}</Text>
          </View>
        </View>

        {/* Price + Spots */}
        <View style={s.priceRow}>
          <Text style={s.price}>{g.price}</Text>
          <View style={s.spotsWrap}>
            <View style={s.spotsBar}>
              <View style={[s.spotsFill, { width: `${spotsPercent}%` }]} />
            </View>
            <Text style={s.spotsText}>{g.spotsLeft} spots left</Text>
          </View>
        </View>

        {/* Expanded content */}
        {expanded && (
          <View style={s.expandedSection}>
            {/* Guide */}
            <View style={s.guideRow}>
              <Image source={{ uri: avatar(g.guide.avatar) }} style={s.guideAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={s.guideName}>{g.guide.name}</Text>
                <Text style={s.guideBio}>{g.guide.bio}</Text>
              </View>
            </View>

            {/* Description */}
            <Text style={s.description}>{g.description}</Text>

            {/* Tags */}
            <View style={s.tagsRow}>
              {g.tags.map((t) => (
                <View key={t} style={s.tag}>
                  <Text style={s.tagText}>{t}</Text>
                </View>
              ))}
            </View>

            {/* CTA */}
            <TouchableOpacity activeOpacity={0.85} style={s.cta}>
              <LinearGradient
                colors={[clay.clay, clay.clayDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.ctaGradient}
              >
                <Text style={s.ctaText}>Reserve Your Spot</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Expand hint */}
        <View style={s.expandHint}>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={clay.muted}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ─── main screen ─── */
export default function GatheringsScreen() {
  const [filter, setFilter] = useState<GatheringType | 'all'>('all');

  const filtered = filter === 'all'
    ? GATHERINGS
    : GATHERINGS.filter((g) => g.type === filter);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={s.header}>Gatherings</Text>
        <Text style={s.headerSub}>Retreats, classes & workshops for the Ashtanga community</Text>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterRow}
          style={s.filterScroll}
        >
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                onPress={() => setFilter(f.value)}
                style={[s.filterChip, active && s.filterChipActive]}
                activeOpacity={0.8}
              >
                <Text style={[s.filterLabel, active && s.filterLabelActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Cards */}
        {filtered.map((g) => (
          <GatheringCard key={g.id} g={g} />
        ))}

        {filtered.length === 0 && (
          <View style={s.emptyWrap}>
            <Ionicons name="calendar-outline" size={48} color={clay.border} />
            <Text style={s.emptyText}>No gatherings in this category yet</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ─── styles ─── */
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: clay.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  /* header */
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: clay.ink,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerSub: {
    fontSize: 14,
    color: clay.sub,
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 14,
  },

  /* filters */
  filterScroll: {
    marginBottom: 10,
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: clay.card,
    borderWidth: 1,
    borderColor: clay.border,
  },
  filterChipActive: {
    backgroundColor: clay.clay,
    borderColor: clay.clay,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: clay.sub,
  },
  filterLabelActive: {
    color: '#fff',
  },

  /* card */
  card: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: clay.card,
    borderWidth: 1,
    borderColor: clay.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 3 },
      web: { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' } as any,
    }),
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: clay.border,
  },
  badge: {
    position: 'absolute',
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: clay.ink,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: clay.sub,
    marginBottom: 12,
  },

  /* meta */
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: clay.muted,
  },

  /* price + spots */
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: clay.clay,
  },
  spotsWrap: {
    alignItems: 'flex-end',
    gap: 3,
  },
  spotsBar: {
    width: 80,
    height: 4,
    borderRadius: 2,
    backgroundColor: clay.border,
    overflow: 'hidden',
  },
  spotsFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: clay.sage,
  },
  spotsText: {
    fontSize: 11,
    color: clay.muted,
  },

  /* expanded */
  expandedSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: clay.border,
    paddingTop: 16,
  },
  guideRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  guideAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: clay.border,
  },
  guideName: {
    fontSize: 15,
    fontWeight: '700',
    color: clay.ink,
    marginBottom: 2,
  },
  guideBio: {
    fontSize: 12,
    color: clay.sub,
    lineHeight: 17,
  },
  description: {
    fontSize: 14,
    color: clay.ink,
    lineHeight: 21,
    marginBottom: 14,
  },

  /* tags */
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: clay.warm,
    borderWidth: 1,
    borderColor: clay.border,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: clay.sub,
  },

  /* CTA */
  cta: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  ctaGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 14,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },

  /* expand hint */
  expandHint: {
    alignItems: 'center',
    marginTop: 4,
  },

  /* empty */
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: clay.muted,
  },
});
