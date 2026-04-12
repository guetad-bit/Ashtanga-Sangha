// src/screens/gatherings/GatheringsScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Platform, LayoutAnimation,
  Modal, Pressable, Linking, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { MOCK_SANGHA_USERS } from '@/data/mockSanghaUsers';

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

interface ScheduleDay {
  time: string;
  activity: string;
}

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
  earlyBird?: string;
  spotsLeft: number;
  spotsTotal: number;
  imageId: string;
  galleryIds: string[];
  guide: {
    name: string;
    avatar: string;
    bio: string;
    credentials: string[];
  };
  description: string;
  dailySchedule: ScheduleDay[];
  includes: string[];
  accommodation?: string;
  tags: string[];
  testimonial?: { text: string; author: string };
  participants?: { name: string; avatar: string }[];
}

/* ─── unsplash helpers ─── */
const img = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${Math.round(w * 0.6)}&q=80&auto=format&fit=crop`;

const avatar = (id: string) =>
  `https://images.unsplash.com/${id}?w=120&h=120&q=80&auto=format&fit=crop&crop=face`;

/* ─── participant helpers ─── */
const mkP = (i: number) => ({ name: MOCK_SANGHA_USERS[i].name, avatar: MOCK_SANGHA_USERS[i].avatar_url });
const EXTRA_FACES = [
  { name: 'Yael Rozner', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&q=80&auto=format&fit=crop&crop=face' },
  { name: 'Amit Shavit', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&q=80&auto=format&fit=crop&crop=face' },
  { name: 'Tali Kedem', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&q=80&auto=format&fit=crop&crop=face' },
  { name: 'Omer Ben-Ari', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&q=80&auto=format&fit=crop&crop=face' },
];

/* ─── 4 gatherings ─── */
const GATHERINGS: Gathering[] = [
  {
    id: 'g3',
    title: 'Led Primary with Moran Ezra',
    subtitle: 'Weekly tradition in the heart of Tel Aviv',
    type: 'led_class',
    date: '2026-04-17',
    dateRange: 'Every Friday, 7:00 AM',
    location: 'Tel Aviv',
    country: 'Israel',
    price: '₪120 / drop-in',
    spotsLeft: 8,
    spotsTotal: 20,
    imageId: 'photo-1545389336-cf090694435e',
    galleryIds: [
      'photo-1575052814086-f385e2e2ad1b',
      'photo-1593810450967-f9c42742e326',
    ],
    guide: {
      name: 'Moran Ezra',
      avatar: 'photo-1438761681033-6461ffad8d80',
      bio: 'Moran has dedicated over a decade to Ashtanga Yoga. She has made multiple extended trips to Mysore to study at KPJAYI, immersing herself in the Parampara tradition. Her teaching is precise and compassionate — she holds space for beginners and advanced practitioners alike, guiding the room through the full traditional count with steady rhythm and clear adjustments. She leads the Ashtanga community at Yoga Shala Tel Aviv.',
      credentials: ['KPJAYI student', 'Yoga Shala Tel Aviv', '10+ years of practice'],
    },
    description: 'Every Friday morning, Moran leads the full Primary Series with traditional Sanskrit count. The class moves as one — breath synchronized, gaze steady. Moran walks the room offering quiet adjustments while maintaining the count. Beginners are welcome; she\'ll guide you through modifications. The session closes with a short led closing sequence and 10 minutes of rest. Bring your own mat. The shala opens at 6:45.',
    dailySchedule: [
      { time: '6:45 AM', activity: 'Shala opens, settle in' },
      { time: '7:00 AM', activity: 'Opening mantra & Surya Namaskar' },
      { time: '7:15 AM', activity: 'Standing sequence' },
      { time: '7:45 AM', activity: 'Seated sequence' },
      { time: '8:30 AM', activity: 'Finishing sequence & Savasana' },
      { time: '8:50 AM', activity: 'Closing mantra & tea' },
    ],
    includes: [
      'Full led Primary Series with Sanskrit count',
      'Hands-on adjustments',
      'Modifications for all levels',
      'Post-practice tea',
    ],
    tags: ['Primary Series', 'Led Class', 'Sanskrit Count', 'All Levels', 'Weekly'],
    testimonial: {
      text: 'Moran\'s Friday class is the anchor of my week. Her count is steady and her adjustments are gold.',
      author: 'Roni K., Tel Aviv',
    },
    participants: [mkP(0), mkP(1), mkP(2), mkP(3), mkP(4), mkP(5), mkP(6), mkP(7), mkP(8), mkP(9), EXTRA_FACES[0], EXTRA_FACES[1]],
  },
  {
    id: 'g1',
    title: 'Ashtanga Retreat: Mediterranean Flow',
    subtitle: '6 days of practice, breath & sea',
    type: 'retreat',
    date: '2026-06-14',
    dateRange: 'Jun 14 – 20, 2026',
    location: 'Paphos',
    country: 'Cyprus',
    price: '€1,450',
    earlyBird: '€1,250 before May 1',
    spotsLeft: 4,
    spotsTotal: 18,
    imageId: 'photo-1507525428034-b723cf961d3e',
    galleryIds: [
      'photo-1506126613408-eca07ce68773',
      'photo-1575052814086-f385e2e2ad1b',
      'photo-1588286840104-8457f03c87a8',
    ],
    guide: {
      name: 'Lucas Fernandes',
      avatar: 'photo-1506794778202-cad84cf45f1d',
      bio: 'Lucas has practiced Ashtanga for 18 years and studied under Sharath Jois in Mysore for six consecutive seasons. He teaches with precision, warmth, and an emphasis on the breath-body connection. Each summer he leads retreats along the Mediterranean coast.',
      credentials: ['Authorized Level 2', 'KPJAYI Mysore', '18 years of practice'],
    },
    description: 'Wake to the sound of waves on the Cypriot coast. Each morning begins with a full Mysore-style practice in an open-air shala overlooking the sea, followed by a plant-based breakfast sourced from local farms. Afternoons are yours — swim in hidden coves, explore ancient ruins at Kato Paphos, or rest in the shade with a good book. Late afternoon brings pranayama and a philosophy talk. Evenings close with a communal dinner and kirtan under the stars.',
    dailySchedule: [
      { time: '6:00 AM', activity: 'Mysore practice (Primary & Intermediate)' },
      { time: '8:30 AM', activity: 'Breakfast — plant-based, locally sourced' },
      { time: '10:00 AM', activity: 'Workshop: alignment, adjustments, or anatomy' },
      { time: '12:00 PM', activity: 'Free time — beach, excursions, rest' },
      { time: '4:30 PM', activity: 'Pranayama & meditation' },
      { time: '5:30 PM', activity: 'Philosophy talk / chanting' },
      { time: '7:00 PM', activity: 'Communal dinner' },
    ],
    includes: [
      '6 nights in a sea-view eco villa',
      'All meals (plant-based, organic)',
      'Daily Mysore practice & workshops',
      'Pranayama & philosophy sessions',
      '2 guided coastal excursions',
      'Airport transfers from Paphos airport',
    ],
    accommodation: 'Shared eco-villas nestled in olive groves, 200m from the shore. Each room has a private terrace with sea views. Single rooms available for +€350.',
    tags: ['Primary Series', 'Intermediate', 'Pranayama', 'Beachfront', 'All Meals'],
    testimonial: {
      text: 'The best week of my year. Lucas creates a space where you can truly go inward while surrounded by breathtaking nature.',
      author: 'Noa S., Tel Aviv',
    },
    participants: [mkP(5), mkP(2), mkP(0), mkP(6), mkP(8), mkP(3), EXTRA_FACES[0], EXTRA_FACES[2], mkP(9), mkP(4), EXTRA_FACES[1], EXTRA_FACES[3], mkP(7), mkP(1)],
  },
  {
    id: 'g2',
    title: 'Desert Silence Retreat',
    subtitle: '4 days at the edge of the crater',
    type: 'retreat',
    date: '2026-09-03',
    dateRange: 'Sep 3 – 7, 2026',
    location: 'Mitzpe Ramon',
    country: 'Israel',
    price: '₪3,200',
    earlyBird: '₪2,800 before Jul 15',
    spotsLeft: 6,
    spotsTotal: 14,
    imageId: 'photo-1509316785289-025f5b846b35',
    galleryIds: [
      'photo-1506629082955-511b1aa562c8',
      'photo-1552196563-55cd4e45efb3',
      'photo-1599447421416-3414500d18a5',
    ],
    guide: {
      name: 'Daniel Cohen',
      avatar: 'photo-1500648767791-00dcc994a43e',
      bio: 'Daniel has been teaching Ashtanga and Vipassana meditation for 12 years. A former IDF mental-resilience instructor, he brings a grounded, no-nonsense approach to the practice. He splits his time between Tel Aviv and the Negev, where he runs two silent retreats each year at the edge of the Ramon Crater.',
      credentials: ['Authorized Level 1', 'Vipassana teacher', '12 years of practice'],
    },
    description: 'Four days of silence, movement, and stillness in one of the most striking landscapes on earth. Mornings open with Mysore practice as the sun rises over the crater, followed by a silent breakfast. The rest of the day alternates between sitting meditation, walking meditation along the crater rim, and rest. The evening gathering is the only time voices join — a brief philosophy circle before stargazing in one of the darkest skies in the Middle East.',
    dailySchedule: [
      { time: '5:30 AM', activity: 'Sunrise sitting meditation' },
      { time: '6:00 AM', activity: 'Mysore practice (Primary Series)' },
      { time: '8:00 AM', activity: 'Silent breakfast' },
      { time: '10:00 AM', activity: 'Walking meditation along the crater rim' },
      { time: '12:00 PM', activity: 'Lunch & rest (noble silence)' },
      { time: '4:00 PM', activity: 'Pranayama & breathwork' },
      { time: '5:30 PM', activity: 'Evening philosophy circle (voices welcome)' },
      { time: '7:00 PM', activity: 'Dinner & stargazing' },
    ],
    includes: [
      '4 nights in eco-lodge accommodation',
      'All meals (vegetarian, local ingredients)',
      'Daily Mysore & meditation sessions',
      'Guided crater-rim walks',
      'Stargazing with a local astronomer',
    ],
    accommodation: 'Minimalist desert eco-lodge built from local stone. Private rooms with crater views, shared bathrooms. No Wi-Fi by design.',
    tags: ['Primary Series', 'Meditation', 'Silent Practice', 'Desert', 'Stargazing'],
    testimonial: {
      text: 'I arrived scattered and left centered. The silence and the desert do something words can\'t describe.',
      author: 'Yonatan M., Haifa',
    },
    participants: [mkP(3), mkP(0), mkP(7), mkP(2), EXTRA_FACES[3], mkP(9), EXTRA_FACES[2], mkP(8)],
  },
  {
    id: 'g4',
    title: 'Pranayama & Philosophy Weekend',
    subtitle: 'Beyond asana — the subtler limbs',
    type: 'workshop',
    date: '2026-05-08',
    dateRange: 'May 8 – 10, 2026',
    location: 'Jaffa',
    country: 'Israel',
    price: '₪850',
    earlyBird: '₪720 before Apr 20',
    spotsLeft: 10,
    spotsTotal: 16,
    imageId: 'photo-1506126613408-eca07ce68773',
    galleryIds: [
      'photo-1588286840104-8457f03c87a8',
      'photo-1506629082955-511b1aa562c8',
    ],
    guide: {
      name: 'Sofia Moretti',
      avatar: 'photo-1544005313-94ddf0286df2',
      bio: 'Sofia is an Italian-born teacher who has practiced Ashtanga for 15 years and dedicated the last 8 to the subtler limbs — pranayama, chanting, and Yoga Sutra study. She trained under O.P. Tiwari at Kaivalyadhama and holds a Master\'s in Sanskrit from SOAS London. She brings academic rigor and warm accessibility to ancient texts.',
      credentials: ['Kaivalyadhama trained', 'MA Sanskrit (SOAS)', '15 years of practice'],
    },
    description: 'Most Ashtanga practitioners spend years on asana — this weekend is an invitation to explore what comes next. Over three days in a restored Ottoman-era courtyard in Jaffa, Sofia leads progressive pranayama sessions (from Nadi Shodhana to Kumbhaka), afternoon sutra study in small groups, and gentle evening practice. No prior pranayama experience needed — just a sincere curiosity about the deeper dimensions of the practice.',
    dailySchedule: [
      { time: '7:00 AM', activity: 'Gentle asana practice (45 min)' },
      { time: '8:00 AM', activity: 'Pranayama session (progressive, 75 min)' },
      { time: '9:30 AM', activity: 'Breakfast' },
      { time: '11:00 AM', activity: 'Yoga Sutra study & discussion' },
      { time: '1:00 PM', activity: 'Lunch & free time in Jaffa' },
      { time: '4:00 PM', activity: 'Afternoon pranayama / chanting' },
      { time: '6:00 PM', activity: 'Evening closing & dinner' },
    ],
    includes: [
      'All pranayama & philosophy sessions',
      'Printed Yoga Sutra study booklet',
      'Lunch on Saturday & Sunday',
      'Closing dinner on Sunday evening',
      'Recording of guided pranayama for home practice',
    ],
    accommodation: 'Day retreat format — no accommodation provided. Nearby hotel recommendations available upon booking.',
    tags: ['Pranayama', 'Philosophy', 'Yoga Sutras', 'Chanting', 'Weekend Immersion'],
    testimonial: {
      text: 'Sofia made the sutras feel alive. I left with a pranayama practice I actually do every morning now.',
      author: 'Maya L., Jerusalem',
    },
    participants: [mkP(2), mkP(0), mkP(4), EXTRA_FACES[0], mkP(6), mkP(9)],
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
function GatheringCard({ g, onBook }: { g: Gathering; onBook: (g: Gathering) => void }) {
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
          <View>
            <Text style={s.price}>{g.price}</Text>
            {g.earlyBird && <Text style={s.earlyBird}>{g.earlyBird}</Text>}
          </View>
          <View style={s.spotsWrap}>
            <View style={s.spotsBar}>
              <View style={[s.spotsFill, { width: `${spotsPercent}%` }]} />
            </View>
            <Text style={s.spotsText}>{g.spotsLeft} of {g.spotsTotal} spots left</Text>
          </View>
        </View>

        {/* Participant faces (for drop-in classes) */}
        {g.participants && g.participants.length > 0 && (
          <View style={s.participantsRow}>
            <View style={s.participantFaces}>
              {g.participants.slice(0, 8).map((p, i) => (
                <Image key={i} source={{ uri: p.avatar }} style={[s.participantFace, i > 0 && { marginLeft: -6 }]} />
              ))}
              {g.participants.length > 8 && (
                <View style={[s.participantFace, s.participantMore, { marginLeft: -6 }]}>
                  <Text style={s.participantMoreTxt}>+{g.participants.length - 8}</Text>
                </View>
              )}
            </View>
            <Text style={s.participantLabel}>
              {g.type === 'led_class' ? 'Dropping in this Friday' : g.type === 'retreat' ? 'Already signed up' : 'Registered'}
            </Text>
          </View>
        )}

        {/* Expanded content */}
        {expanded && (
          <View style={s.expandedSection}>
            {/* Guide */}
            <View style={s.guideRow}>
              <Image source={{ uri: avatar(g.guide.avatar) }} style={s.guideAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={s.guideName}>{g.guide.name}</Text>
                <View style={s.credRow}>
                  {g.guide.credentials.map((c) => (
                    <View key={c} style={s.credBadge}>
                      <Text style={s.credText}>{c}</Text>
                    </View>
                  ))}
                </View>
                <Text style={s.guideBio}>{g.guide.bio}</Text>
              </View>
            </View>

            {/* Description */}
            <Text style={s.description}>{g.description}</Text>

            {/* Gallery */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.galleryScroll} contentContainerStyle={s.galleryRow}>
              {g.galleryIds.map((gid) => (
                <Image key={gid} source={{ uri: img(gid, 300) }} style={s.galleryImg} />
              ))}
            </ScrollView>

            {/* Daily schedule */}
            <Text style={s.sectionTitle}>Daily Schedule</Text>
            <View style={s.scheduleWrap}>
              {g.dailySchedule.map((item, i) => (
                <View key={i} style={s.scheduleItem}>
                  <Text style={s.scheduleTime}>{item.time}</Text>
                  <View style={s.scheduleDot} />
                  <Text style={s.scheduleActivity}>{item.activity}</Text>
                </View>
              ))}
            </View>

            {/* What's included */}
            <Text style={s.sectionTitle}>What's Included</Text>
            <View style={s.includesList}>
              {g.includes.map((item) => (
                <View key={item} style={s.includeItem}>
                  <Ionicons name="checkmark-circle" size={16} color={clay.sage} />
                  <Text style={s.includeText}>{item}</Text>
                </View>
              ))}
            </View>

            {/* Accommodation */}
            {g.accommodation && (
              <>
                <Text style={s.sectionTitle}>Accommodation</Text>
                <View style={s.accomBox}>
                  <Ionicons name="bed-outline" size={18} color={clay.clay} style={{ marginTop: 2 }} />
                  <Text style={s.accomText}>{g.accommodation}</Text>
                </View>
              </>
            )}

            {/* Testimonial */}
            {g.testimonial && (
              <View style={s.testimonialBox}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={clay.clay} style={{ marginBottom: 6 }} />
                <Text style={s.testimonialText}>"{g.testimonial.text}"</Text>
                <Text style={s.testimonialAuthor}>— {g.testimonial.author}</Text>
              </View>
            )}

            {/* Tags */}
            <View style={s.tagsRow}>
              {g.tags.map((t) => (
                <View key={t} style={s.tag}>
                  <Text style={s.tagText}>{t}</Text>
                </View>
              ))}
            </View>

            {/* ─── Reserve section ─── */}
            <View style={s.reserveSection}>
              {/* Price recap */}
              <View style={s.reservePriceRow}>
                <View>
                  <Text style={s.reservePrice}>{g.price}</Text>
                  {g.earlyBird && <Text style={s.reserveEarly}>{g.earlyBird}</Text>}
                </View>
                <View style={s.reserveSpotsChip}>
                  <View style={[s.reserveDot, g.spotsLeft <= 4 && { backgroundColor: '#C26B4D' }]} />
                  <Text style={[s.reserveSpotsChipTxt, g.spotsLeft <= 4 && { color: '#C26B4D' }]}>
                    {g.spotsLeft <= 4 ? `Only ${g.spotsLeft} left` : `${g.spotsLeft} spots left`}
                  </Text>
                </View>
              </View>

              {/* Who's joining */}
              {g.participants && g.participants.length > 0 && (
                <View style={s.reserveJoining}>
                  <View style={s.reserveJoiningFaces}>
                    {g.participants.slice(0, 6).map((p, i) => (
                      <Image key={i} source={{ uri: p.avatar }} style={[s.reserveFace, i > 0 && { marginLeft: -5 }]} />
                    ))}
                  </View>
                  <Text style={s.reserveJoiningTxt}>
                    {g.participants.slice(0, 3).map((p) => p.name.split(' ')[0]).join(', ')}
                    {g.participants.length > 3 ? ` & ${g.participants.length - 3} others` : ''} are joining
                  </Text>
                </View>
              )}

              {/* What you'll get mini-summary */}
              <View style={s.reserveIncludes}>
                {g.includes.slice(0, 3).map((item, i) => (
                  <View key={i} style={s.reserveIncludeItem}>
                    <Ionicons name="checkmark" size={14} color={clay.sage} />
                    <Text style={s.reserveIncludeTxt}>{item}</Text>
                  </View>
                ))}
                {g.includes.length > 3 && (
                  <Text style={s.reserveIncludeMore}>+{g.includes.length - 3} more included</Text>
                )}
              </View>

              {/* CTA button */}
              <TouchableOpacity activeOpacity={0.85} style={s.cta} onPress={() => onBook(g)}>
                <LinearGradient
                  colors={[clay.clay, clay.clayDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={s.ctaGradient}
                >
                  <Ionicons name="calendar-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={s.ctaText}>Reserve Your Spot</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Trust / fine print */}
              <View style={s.reserveTrust}>
                <Ionicons name="shield-checkmark-outline" size={13} color={clay.muted} />
                <Text style={s.reserveTrustTxt}>Free cancellation up to 7 days before</Text>
              </View>
            </View>
          </View>
        )}

        {/* Expand hint */}
        <View style={s.expandHint}>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={clay.muted}
          />
          {!expanded && <Text style={s.expandHintText}>Tap for details</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ─── Google Calendar deep link helper ─── */
function buildGCalUrl(g: Gathering): string {
  // Parse a date for the event
  const dateStr = g.date; // e.g. '2026-04-17'
  const start = dateStr.replace(/-/g, '');
  // For single-day events, end = start + 1 day
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  const end = d.toISOString().slice(0, 10).replace(/-/g, '');
  const title = encodeURIComponent(g.title);
  const location = encodeURIComponent(`${g.location}, ${g.country}`);
  const details = encodeURIComponent(`${g.subtitle}\n\nGuide: ${g.guide.name}\nPrice: ${g.price}\n\nBooked via Sangha`);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${location}&details=${details}`;
}

/* ─── booking steps ─── */
type BookingStep = 'confirm' | 'success';

/* ─── main screen ─── */
export default function GatheringsScreen() {
  const router = useRouter();
  const { user, bookedGatherings, addBooking } = useAppStore();
  const [filter, setFilter] = useState<GatheringType | 'all'>('all');
  const [bookingGathering, setBookingGathering] = useState<Gathering | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>('confirm');

  const filtered = filter === 'all'
    ? GATHERINGS
    : GATHERINGS.filter((g) => g.type === filter);

  const isBooked = (gId: string) => bookedGatherings.some((b) => b.gatheringId === gId);

  const handleOpenBooking = useCallback((g: Gathering) => {
    if (isBooked(g.id)) {
      // Already booked — open Google Calendar
      Linking.openURL(buildGCalUrl(g)).catch(() => {});
      return;
    }
    setBookingGathering(g);
    setBookingStep('confirm');
  }, [bookedGatherings]);

  const handleConfirmBooking = useCallback(() => {
    if (!bookingGathering) return;
    addBooking({
      gatheringId: bookingGathering.id,
      title: bookingGathering.title,
      date: bookingGathering.dateRange,
      location: `${bookingGathering.location}, ${bookingGathering.country}`,
      type: bookingGathering.type,
      guideName: bookingGathering.guide.name,
      bookedAt: new Date().toISOString(),
    });
    setBookingStep('success');
  }, [bookingGathering, addBooking]);

  const handleAddToCalendar = useCallback(() => {
    if (!bookingGathering) return;
    Linking.openURL(buildGCalUrl(bookingGathering)).catch(() => {});
  }, [bookingGathering]);

  const closeBooking = useCallback(() => {
    setBookingGathering(null);
  }, []);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top brand bar */}
        <View style={s.topBar}>
          <Text style={s.brandWord}>sangha</Text>
          <View style={s.topRight}>
            <TouchableOpacity style={s.bellBtn} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={18} color={clay.ink} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/profile' as any)}>
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={s.avatarSm} />
              ) : (
                <LinearGradient colors={[clay.clay, clay.clayDark]} style={s.avatarSm}>
                  <Text style={s.avatarInit}>{user?.name?.charAt(0) ?? '?'}</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Section title */}
        <Text style={s.header}>Gatherings</Text>
        <Text style={s.headerSub}>Retreats, classes & workshops for the community</Text>

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
          <GatheringCard key={g.id} g={g} onBook={handleOpenBooking} />
        ))}

        {filtered.length === 0 && (
          <View style={s.emptyWrap}>
            <Ionicons name="calendar-outline" size={48} color={clay.border} />
            <Text style={s.emptyText}>No gatherings in this category yet</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ═══════════ Booking Modal ═══════════ */}
      <Modal visible={!!bookingGathering} transparent animationType="slide" onRequestClose={closeBooking}>
        <Pressable style={s.modalBackdrop} onPress={closeBooking}>
          <Pressable style={s.modalSheet} onPress={(e) => e.stopPropagation()}>
            {bookingGathering && bookingStep === 'confirm' && (
              <>
                {/* Header */}
                <View style={s.modalHandle} />
                <Text style={s.modalTitle}>Reserve Your Spot</Text>

                {/* Gathering summary */}
                <View style={s.modalSummaryCard}>
                  <Image source={{ uri: img(bookingGathering.imageId, 200) }} style={s.modalThumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.modalGatheringTitle}>{bookingGathering.title}</Text>
                    <View style={s.modalMetaRow}>
                      <Ionicons name="calendar-outline" size={13} color={clay.muted} />
                      <Text style={s.modalMetaTxt}>{bookingGathering.dateRange}</Text>
                    </View>
                    <View style={s.modalMetaRow}>
                      <Ionicons name="location-outline" size={13} color={clay.muted} />
                      <Text style={s.modalMetaTxt}>{bookingGathering.location}, {bookingGathering.country}</Text>
                    </View>
                    <View style={s.modalMetaRow}>
                      <Ionicons name="person-outline" size={13} color={clay.muted} />
                      <Text style={s.modalMetaTxt}>{bookingGathering.guide.name}</Text>
                    </View>
                  </View>
                </View>

                {/* Price line */}
                <View style={s.modalPriceLine}>
                  <Text style={s.modalPriceLabel}>Total</Text>
                  <Text style={s.modalPriceValue}>{bookingGathering.price}</Text>
                </View>
                {bookingGathering.earlyBird && (
                  <View style={s.modalEarlyBirdRow}>
                    <Ionicons name="time-outline" size={13} color={clay.sage} />
                    <Text style={s.modalEarlyBirdTxt}>{bookingGathering.earlyBird}</Text>
                  </View>
                )}

                {/* Spots left */}
                <View style={s.modalSpotsRow}>
                  <View style={[s.reserveDot, bookingGathering.spotsLeft <= 4 && { backgroundColor: clay.clay }]} />
                  <Text style={s.modalSpotsTxt}>
                    {bookingGathering.spotsLeft} of {bookingGathering.spotsTotal} spots remaining
                  </Text>
                </View>

                {/* Who's going */}
                {bookingGathering.participants && bookingGathering.participants.length > 0 && (
                  <View style={s.modalParticipants}>
                    <View style={{ flexDirection: 'row' }}>
                      {bookingGathering.participants.slice(0, 5).map((p, i) => (
                        <Image key={i} source={{ uri: p.avatar }} style={[s.modalParticipantFace, i > 0 && { marginLeft: -5 }]} />
                      ))}
                    </View>
                    <Text style={s.modalParticipantTxt}>
                      {bookingGathering.participants.slice(0, 2).map((p) => p.name.split(' ')[0]).join(' & ')}
                      {bookingGathering.participants.length > 2 ? ` + ${bookingGathering.participants.length - 2} more` : ''} going
                    </Text>
                  </View>
                )}

                {/* Confirm button */}
                <TouchableOpacity activeOpacity={0.85} onPress={handleConfirmBooking} style={s.modalConfirmBtn}>
                  <LinearGradient colors={[clay.clay, clay.clayDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.modalConfirmGrad}>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={s.modalConfirmTxt}>Confirm Reservation</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Fine print */}
                <View style={s.modalFinePrint}>
                  <Ionicons name="shield-checkmark-outline" size={12} color={clay.muted} />
                  <Text style={s.modalFinePrintTxt}>Free cancellation up to 7 days before · No payment now</Text>
                </View>

                {/* Cancel link */}
                <TouchableOpacity onPress={closeBooking} activeOpacity={0.7} style={s.modalCancelBtn}>
                  <Text style={s.modalCancelTxt}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}

            {bookingGathering && bookingStep === 'success' && (
              <>
                <View style={s.modalHandle} />

                {/* Success state */}
                <View style={s.successIcon}>
                  <LinearGradient colors={['#D8E4CF', '#A8B59B']} style={s.successCircle}>
                    <Ionicons name="checkmark" size={32} color="#fff" />
                  </LinearGradient>
                </View>
                <Text style={s.successTitle}>You're in!</Text>
                <Text style={s.successSub}>
                  {bookingGathering.title}{'\n'}
                  <Text style={{ fontWeight: '600' }}>{bookingGathering.dateRange}</Text>
                  {' · '}{bookingGathering.location}
                </Text>

                {/* Add to Google Calendar */}
                <TouchableOpacity activeOpacity={0.85} onPress={handleAddToCalendar} style={s.gcalBtn}>
                  <View style={s.gcalInner}>
                    <Ionicons name="logo-google" size={18} color="#4285F4" style={{ marginRight: 10 }} />
                    <Text style={s.gcalTxt}>Add to Google Calendar</Text>
                  </View>
                </TouchableOpacity>

                {/* Also offer Apple calendar */}
                <TouchableOpacity activeOpacity={0.7} onPress={handleAddToCalendar} style={s.applCalBtn}>
                  <Ionicons name="calendar-outline" size={16} color={clay.clay} style={{ marginRight: 8 }} />
                  <Text style={s.applCalTxt}>Add to Apple Calendar</Text>
                </TouchableOpacity>

                {/* Share with a friend */}
                <TouchableOpacity activeOpacity={0.7} style={s.shareBtn}>
                  <Ionicons name="share-social-outline" size={16} color={clay.sub} style={{ marginRight: 8 }} />
                  <Text style={s.shareBtnTxt}>Share with a friend</Text>
                </TouchableOpacity>

                {/* Your face is now in the lineup */}
                <View style={s.successFaces}>
                  {bookingGathering.participants?.slice(0, 4).map((p, i) => (
                    <Image key={i} source={{ uri: p.avatar }} style={[s.modalParticipantFace, i > 0 && { marginLeft: -5 }]} />
                  ))}
                  <LinearGradient colors={[clay.clay, clay.clayDark]} style={[s.modalParticipantFace, { marginLeft: -5, alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>You</Text>
                  </LinearGradient>
                  <Text style={s.successFacesTxt}>You joined {(bookingGathering.participants?.length ?? 0) + 1} practitioners</Text>
                </View>

                {/* Done */}
                <TouchableOpacity activeOpacity={0.85} onPress={closeBooking} style={s.modalDoneBtn}>
                  <Text style={s.modalDoneTxt}>Done</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

/* ─── styles ─── */
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: clay.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  /* top brand bar */
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 4 },
  brandWord: { fontFamily: 'Georgia', fontSize: 24, fontWeight: '300', letterSpacing: 7, color: clay.clay, paddingLeft: 7 },
  topRight: { flexDirection: 'row', alignItems: 'center' },
  bellBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarSm: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarInit: { fontSize: 15, fontWeight: '700', color: '#fff' },

  /* section header */
  header: {
    fontSize: 22, fontWeight: '800', color: clay.ink,
    paddingHorizontal: 20, paddingTop: 8,
  },
  headerSub: {
    fontSize: 14, color: clay.sub,
    paddingHorizontal: 20, marginTop: 4, marginBottom: 14,
  },

  /* filters */
  filterScroll: { marginBottom: 10 },
  filterRow: { paddingHorizontal: 16, gap: 8 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: clay.card, borderWidth: 1, borderColor: clay.border,
  },
  filterChipActive: { backgroundColor: clay.clay, borderColor: clay.clay },
  filterLabel: { fontSize: 13, fontWeight: '600', color: clay.sub },
  filterLabelActive: { color: '#fff' },

  /* card */
  card: {
    marginHorizontal: 16, marginTop: 14, borderRadius: 18,
    backgroundColor: clay.card, borderWidth: 1, borderColor: clay.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 3 },
      web: { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' } as any,
    }),
  },
  cardImage: { width: '100%', height: 200, backgroundColor: clay.border },
  badge: {
    position: 'absolute', top: 14, left: 14,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  badgeText: {
    fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  cardBody: { padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: clay.ink, marginBottom: 2 },
  cardSubtitle: { fontSize: 13, color: clay.sub, marginBottom: 12 },

  /* meta */
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: clay.muted },

  /* price + spots */
  priceRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  price: { fontSize: 18, fontWeight: '800', color: clay.clay },
  earlyBird: { fontSize: 11, color: clay.sage, fontWeight: '600', marginTop: 2 },
  spotsWrap: { alignItems: 'flex-end', gap: 3 },
  spotsBar: {
    width: 80, height: 4, borderRadius: 2,
    backgroundColor: clay.border, overflow: 'hidden',
  },
  spotsFill: { height: 4, borderRadius: 2, backgroundColor: clay.sage },
  spotsText: { fontSize: 11, color: clay.muted },
  participantsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 10 },
  participantFaces: { flexDirection: 'row', alignItems: 'center' },
  participantFace: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: '#fff' },
  participantMore: { backgroundColor: clay.sand, alignItems: 'center', justifyContent: 'center' },
  participantMoreTxt: { fontSize: 9, fontWeight: '700', color: clay.sub },
  participantLabel: { fontSize: 11, color: clay.muted, fontStyle: 'italic' },

  /* expanded */
  expandedSection: {
    marginTop: 16, borderTopWidth: 1,
    borderTopColor: clay.border, paddingTop: 16,
  },

  /* guide */
  guideRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  guideAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: clay.border, borderWidth: 2, borderColor: clay.warm,
  },
  guideName: { fontSize: 16, fontWeight: '700', color: clay.ink, marginBottom: 4 },
  credRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 6 },
  credBadge: {
    backgroundColor: clay.warm, borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
    borderWidth: 1, borderColor: clay.border,
  },
  credText: { fontSize: 10, fontWeight: '600', color: clay.muted },
  guideBio: { fontSize: 13, color: clay.sub, lineHeight: 18 },

  /* description */
  description: { fontSize: 14, color: clay.ink, lineHeight: 22, marginBottom: 16 },

  /* gallery */
  galleryScroll: { marginBottom: 16 },
  galleryRow: { gap: 8 },
  galleryImg: {
    width: 160, height: 100, borderRadius: 12,
    backgroundColor: clay.border,
  },

  /* section titles */
  sectionTitle: {
    fontSize: 15, fontWeight: '700', color: clay.ink,
    marginBottom: 10, marginTop: 4,
  },

  /* daily schedule */
  scheduleWrap: { marginBottom: 16 },
  scheduleItem: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginBottom: 8, gap: 8,
  },
  scheduleTime: {
    fontSize: 12, fontWeight: '700', color: clay.clay,
    width: 62, textAlign: 'right',
  },
  scheduleDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: clay.border, marginTop: 4,
  },
  scheduleActivity: { fontSize: 13, color: clay.ink, flex: 1, lineHeight: 18 },

  /* includes */
  includesList: { marginBottom: 16, gap: 6 },
  includeItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  includeText: { fontSize: 13, color: clay.ink, flex: 1, lineHeight: 18 },

  /* accommodation */
  accomBox: {
    flexDirection: 'row', gap: 10, marginBottom: 16,
    backgroundColor: clay.warm, padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: clay.border,
  },
  accomText: { fontSize: 13, color: clay.sub, flex: 1, lineHeight: 18 },

  /* testimonial */
  testimonialBox: {
    backgroundColor: clay.warm, padding: 16, borderRadius: 14,
    marginBottom: 16, borderWidth: 1, borderColor: clay.border,
  },
  testimonialText: {
    fontSize: 14, color: clay.ink, fontStyle: 'italic', lineHeight: 21, marginBottom: 6,
  },
  testimonialAuthor: { fontSize: 12, fontWeight: '600', color: clay.muted },

  /* tags */
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  tag: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
    backgroundColor: clay.warm, borderWidth: 1, borderColor: clay.border,
  },
  tagText: { fontSize: 11, fontWeight: '600', color: clay.sub },

  /* CTA */
  cta: { borderRadius: 14, overflow: 'hidden' },
  ctaGradient: { paddingVertical: 15, alignItems: 'center', justifyContent: 'center', borderRadius: 14, flexDirection: 'row' },
  ctaText: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },

  /* ─── Reserve section ─── */
  reserveSection: {
    marginTop: 16, borderTopWidth: 1, borderTopColor: clay.border, paddingTop: 16,
  },
  reservePriceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14,
  },
  reservePrice: { fontSize: 20, fontWeight: '800', color: clay.ink },
  reserveEarly: { fontSize: 11, color: clay.sage, fontWeight: '600', marginTop: 2 },
  reserveSpotsChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8F4',
    borderWidth: 1, borderColor: '#F0DDD3', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, gap: 5,
  },
  reserveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: clay.sage },
  reserveSpotsChipTxt: { fontSize: 11, fontWeight: '600', color: clay.sub },

  reserveJoining: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  reserveJoiningFaces: { flexDirection: 'row', alignItems: 'center' },
  reserveFace: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: '#fff' },
  reserveJoiningTxt: { fontSize: 12, color: clay.sub, flex: 1 },

  reserveIncludes: { marginBottom: 14 },
  reserveIncludeItem: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  reserveIncludeTxt: { fontSize: 12, color: clay.sub },
  reserveIncludeMore: { fontSize: 11, color: clay.muted, fontStyle: 'italic', marginTop: 2, marginLeft: 20 },

  reserveTrust: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 10 },
  reserveTrustTxt: { fontSize: 11, color: clay.muted },

  /* expand hint */
  expandHint: { alignItems: 'center', marginTop: 6, gap: 2 },
  expandHintText: { fontSize: 11, color: clay.muted },

  /* empty */
  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: clay.muted },

  /* ═══════ Booking Modal ═══════ */
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: clay.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, paddingTop: 12,
    maxHeight: '92%',
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: clay.border,
    alignSelf: 'center', marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20, fontWeight: '800', color: clay.ink, marginBottom: 16,
  },
  modalSummaryCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14,
    padding: 12, gap: 12, borderWidth: 1, borderColor: clay.border, marginBottom: 16,
  },
  modalThumb: { width: 72, height: 72, borderRadius: 10 },
  modalGatheringTitle: { fontSize: 14, fontWeight: '700', color: clay.ink, marginBottom: 4 },
  modalMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  modalMetaTxt: { fontSize: 12, color: clay.muted },

  modalPriceLine: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, borderTopWidth: 1, borderTopColor: clay.border,
  },
  modalPriceLabel: { fontSize: 14, color: clay.sub },
  modalPriceValue: { fontSize: 20, fontWeight: '800', color: clay.ink },
  modalEarlyBirdRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 12 },
  modalEarlyBirdTxt: { fontSize: 12, color: clay.sage, fontWeight: '600' },

  modalSpotsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  modalSpotsTxt: { fontSize: 12, color: clay.sub },

  modalParticipants: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  modalParticipantFace: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: '#fff' },
  modalParticipantTxt: { fontSize: 12, color: clay.sub, flex: 1 },

  modalConfirmBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  modalConfirmGrad: {
    paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14,
  },
  modalConfirmTxt: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },

  modalFinePrint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 4, marginBottom: 8 },
  modalFinePrintTxt: { fontSize: 10, color: clay.muted },

  modalCancelBtn: { alignItems: 'center', paddingVertical: 10 },
  modalCancelTxt: { fontSize: 14, color: clay.muted },

  /* ─── Success state ─── */
  successIcon: { alignItems: 'center', marginTop: 8, marginBottom: 12 },
  successCircle: {
    width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { fontSize: 24, fontWeight: '800', color: clay.ink, textAlign: 'center', marginBottom: 6 },
  successSub: { fontSize: 14, color: clay.sub, textAlign: 'center', lineHeight: 20, marginBottom: 20 },

  gcalBtn: {
    borderRadius: 14, borderWidth: 1.5, borderColor: '#4285F4', marginBottom: 10, overflow: 'hidden',
  },
  gcalInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14,
  },
  gcalTxt: { fontSize: 15, fontWeight: '700', color: '#4285F4' },

  applCalBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, borderColor: clay.border, marginBottom: 10,
  },
  applCalTxt: { fontSize: 14, fontWeight: '600', color: clay.clay },

  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, marginBottom: 16,
  },
  shareBtnTxt: { fontSize: 13, color: clay.sub },

  successFaces: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16,
  },
  successFacesTxt: { fontSize: 12, color: clay.muted },

  modalDoneBtn: {
    backgroundColor: clay.ink, borderRadius: 14, paddingVertical: 14, alignItems: 'center',
  },
  modalDoneTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
