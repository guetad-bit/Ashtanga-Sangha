// src/screens/gatherings/GatheringsScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Image, Modal, Alert, Animated,
  ActivityIndicator, RefreshControl, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';
import { useAppStore } from '@/store/useAppStore';
import { getGatherings, bookGathering, getUserBookings, cancelBooking } from '@/lib/supabase';
import { gatherings as mockData, type Gathering, type Attendee } from '@/data/mockGatherings';

type BookingStep = 'review' | 'details' | 'confirmed';

type FilterType = 'all' | 'retreat' | 'workshop' | 'training' | 'online';

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Retreats', value: 'retreat' },
  { label: 'Workshops', value: 'workshop' },
  { label: 'Trainings', value: 'training' },
  { label: 'Online', value: 'online' },
];

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const sStr = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const eStr = e.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${sStr} – ${eStr}`;
}

function daysBetween(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000);
}

export default function GatheringsScreen() {
  const { user } = useAppStore();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [gatherings, setGatherings] = useState<Gathering[]>([]);
  const [bookedIds, setBookedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Gathering | null>(null);
  const [booking, setBooking] = useState(false);

  // Booking flow state
  const [bookingGathering, setBookingGathering] = useState<Gathering | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStep>('review');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestNotes, setGuestNotes] = useState('');
  const confirmAnim = useRef(new Animated.Value(0)).current;

  // Attendee views
  const [showAllAttendees, setShowAllAttendees] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);

  const fetchData = useCallback(async () => {
    // Use mock data (Supabase can be wired later)
    setGatherings(mockData);

    if (user) {
      const { data: bookings } = await getUserBookings(user.id);
      if (bookings) {
        setBookedIds(new Set(bookings.map((b: any) => b.gathering_id)));
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const filtered = gatherings.filter((g) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'retreat') return g.region === 'europe' || g.region === 'bali';
    if (activeFilter === 'workshop') return g.days <= 3;
    if (activeFilter === 'training') return g.days >= 14;
    if (activeFilter === 'online') return g.location.toLowerCase().includes('online');
    return true;
  });

  const featured = gatherings.filter((g) => g.spotsLeft <= 5);

  // Open booking flow
  const openBooking = (g: Gathering) => {
    if (!user) { Alert.alert('Sign in required', 'Please sign in to book.'); return; }
    if (bookedIds.has(g.id)) {
      Alert.alert('Cancel Booking', `Cancel your spot at ${g.title}?`, [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: async () => {
            setBooking(true);
            await cancelBooking(g.id, user.id);
            setBookedIds((prev) => { const n = new Set(prev); n.delete(g.id); return n; });
            setBooking(false);
          },
        },
      ]);
      return;
    }
    setGuestName(user.name ?? '');
    setGuestEmail(user.email ?? '');
    setGuestPhone('');
    setGuestNotes('');
    setBookingStep('review');
    // Close detail modal first, then open booking modal
    setSelected(null);
    setTimeout(() => setBookingGathering(g), 400);
  };

  const confirmBooking = async () => {
    if (!user || !bookingGathering) return;
    setBooking(true);
    const { error } = await bookGathering(bookingGathering.id, user.id);
    setBooking(false);
    if (!error) {
      setBookedIds((prev) => new Set(prev).add(bookingGathering.id));
      setBookingStep('confirmed');
      confirmAnim.setValue(0);
      Animated.spring(confirmAnim, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }).start();
    } else {
      Alert.alert('Error', error.message);
    }
  };

  const closeBooking = () => {
    setBookingGathering(null);
    setBookingStep('review');
  };

  if (loading) {
    return (
      <SafeAreaView style={[s.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.sage} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Gatherings</Text>
        <Text style={s.subtitle}>Retreats, workshops & immersions</Text>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filters} style={s.filterScroll}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[s.filterPill, activeFilter === f.value && s.filterActive]}
            onPress={() => setActiveFilter(f.value)}
          >
            <Text style={[s.filterText, activeFilter === f.value && s.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Cards */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filtered.length === 0 ? (
          <View style={s.emptyCard}>
            <Text style={s.emptyEmoji}>🌍</Text>
            <Text style={s.emptyTitle}>No gatherings found</Text>
            <Text style={s.emptySub}>Check back soon or try a different filter</Text>
          </View>
        ) : (
          filtered.map((g) => {
            const isBooked = bookedIds.has(g.id);
            const goingCount = g.social.count;
            const goingAvatars = g.social.going.slice(0, 3);
            return (
              <TouchableOpacity key={g.id} style={s.card} onPress={() => setSelected(g)} activeOpacity={0.9}>
                <Image source={{ uri: g.imageUrl }} style={s.cardImage} />
                <View style={s.cardOverlay} />
                <View style={s.cardContent}>
                  {/* Top — tags + booked badge */}
                  <View style={s.cardTop}>
                    <View style={s.cardTags}>
                      {g.tags.slice(0, 2).map((tag) => (
                        <View key={tag} style={s.cardTag}>
                          <Text style={s.cardTagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                    {isBooked && (
                      <View style={s.bookedBadge}><Text style={s.bookedText}>Booked</Text></View>
                    )}
                  </View>

                  {/* Bottom — info + attendees */}
                  <View>
                    <Text style={s.cardTitle}>{g.title}</Text>
                    <Text style={s.cardLocation}>{g.location}</Text>
                    <View style={s.cardFooter}>
                      <View style={s.cardMeta}>
                        <Text style={s.cardDate}>
                          {formatDateRange(g.startDate, g.endDate)} · {g.days} days
                        </Text>
                        <Text style={s.cardPrice}>from ${g.priceUsd.toLocaleString()}</Text>
                      </View>
                      {/* Attendees strip */}
                      <View style={s.attendeesRow}>
                        {goingAvatars.map((a, i) => (
                          <Image
                            key={a.name}
                            source={{ uri: a.img }}
                            style={[s.attendeeAvatar, i > 0 && { marginLeft: -10 }]}
                          />
                        ))}
                        {goingCount > 3 && (
                          <View style={[s.attendeeMore, { marginLeft: -10 }]}>
                            <Text style={s.attendeeMoreText}>+{goingCount - 3}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {g.spotsLeft <= 5 && (
                      <View style={s.spotsChip}>
                        <Text style={s.spotsChipText}>
                          {g.spotsLeft === 0 ? 'Sold Out' : `Only ${g.spotsLeft} spots left`}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* ── Detail Modal ── */}
      <Modal visible={!!selected} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelected(null)}>
        {selected && (
          <View style={s.modalWrap}>
            {/* Hero */}
            <View style={s.modalHero}>
              <Image source={{ uri: selected.imageUrl }} style={s.modalHeroImg} />
              <View style={s.modalHeroOv} />
              <SafeAreaView style={s.modalHeroInner}>
                <TouchableOpacity onPress={() => setSelected(null)} style={s.backBtn}>
                  <Text style={s.backBtnText}>← Back</Text>
                </TouchableOpacity>
                <View>
                  <Text style={s.modalTitle}>{selected.title}</Text>
                  <Text style={s.modalLocation}>{selected.location}, {selected.country}</Text>
                </View>
              </SafeAreaView>
            </View>

            <ScrollView style={s.modalScroll} contentContainerStyle={s.modalScrollContent} showsVerticalScrollIndicator={false}>
              {/* Quick info */}
              <View style={s.infoRow}>
                <View style={s.infoItem}>
                  <Text style={s.infoIcon}>📅</Text>
                  <Text style={s.infoLabel}>Dates</Text>
                  <Text style={s.infoValue}>{formatDateRange(selected.startDate, selected.endDate)}</Text>
                </View>
                <View style={s.infoDivider} />
                <View style={s.infoItem}>
                  <Text style={s.infoIcon}>⏱️</Text>
                  <Text style={s.infoLabel}>Duration</Text>
                  <Text style={s.infoValue}>{selected.days} days</Text>
                </View>
                <View style={s.infoDivider} />
                <View style={s.infoItem}>
                  <Text style={s.infoIcon}>💰</Text>
                  <Text style={s.infoLabel}>From</Text>
                  <Text style={s.infoValue}>${selected.priceUsd.toLocaleString()}</Text>
                </View>
              </View>

              {/* Teacher */}
              <View style={s.teacherCard}>
                <View style={s.teacherAv}>
                  <Text style={{ fontSize: 22 }}>🧘</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.teacherName}>{selected.teacher}</Text>
                  <Text style={s.teacherRole}>{selected.teacherTitle}</Text>
                </View>
              </View>

              {/* Who's Going — tap to see all */}
              <View style={s.section}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                  <Text style={s.sectionTitle}>Who's Going</Text>
                  <TouchableOpacity onPress={() => setShowAllAttendees(true)}>
                    <Text style={{ ...typography.headingSm, color: colors.sage }}>See All ({selected.social.count})</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.lg }}>
                  {selected.social.going.slice(0, 6).map((a) => (
                    <TouchableOpacity key={a.id || a.name} style={s.goingBubble} onPress={() => setSelectedAttendee(a)} activeOpacity={0.7}>
                      <Image source={{ uri: a.img }} style={s.goingAvatar} />
                      <Text style={s.goingName}>{a.name.split(' ')[0]}</Text>
                      {a.mutualFriends && a.mutualFriends > 0 ? (
                        <Text style={s.goingMutual}>{a.mutualFriends} mutual</Text>
                      ) : null}
                    </TouchableOpacity>
                  ))}
                  {selected.social.count > 6 && (
                    <TouchableOpacity style={s.goingBubble} onPress={() => setShowAllAttendees(true)}>
                      <View style={[s.goingAvatar, { backgroundColor: colors.sagePale, alignItems: 'center', justifyContent: 'center' }]}>
                        <Text style={{ ...typography.headingSm, color: colors.sage }}>
                          +{selected.social.count - 6}
                        </Text>
                      </View>
                      <Text style={s.goingName}>more</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>

              {/* About */}
              <View style={s.section}>
                <Text style={s.sectionTitle}>About</Text>
                <Text style={s.descText}>{selected.description}</Text>
              </View>

              {/* Highlights */}
              {selected.highlights.length > 0 && (
                <View style={s.section}>
                  <Text style={s.sectionTitle}>Highlights</Text>
                  {selected.highlights.map((h, i) => (
                    <View key={i} style={s.highlightRow}>
                      <Text style={s.highlightDot}>•</Text>
                      <Text style={s.highlightText}>{h}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Itinerary */}
              {selected.itinerary.length > 0 && (
                <View style={s.section}>
                  <Text style={s.sectionTitle}>Schedule</Text>
                  {selected.itinerary.map((item, i) => (
                    <View key={i} style={s.itineraryItem}>
                      <View style={s.itineraryDot} />
                      <View style={s.itineraryContent}>
                        <View style={s.itineraryHead}>
                          <Text style={s.itineraryDay}>{item.day}</Text>
                          {item.tag && (
                            <View style={s.itineraryTag}>
                              <Text style={s.itineraryTagText}>{item.tag}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={s.itineraryTitle}>{item.title}</Text>
                        <Text style={s.itineraryDetail}>{item.detail}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Spots */}
              <View style={s.spotsCard}>
                <View style={s.spotsBar}>
                  <View style={[s.spotsFill, { width: `${Math.round(((selected.spotsTotal - selected.spotsLeft) / selected.spotsTotal) * 100)}%` }]} />
                </View>
                <Text style={s.spotsInfo}>{selected.spotsLeft} of {selected.spotsTotal} spots remaining</Text>
              </View>
            </ScrollView>

            {/* Bottom CTA */}
            <View style={s.bottomBar}>
              <View>
                <Text style={s.bottomLabel}>From</Text>
                <Text style={s.bottomPrice}>${selected.priceUsd.toLocaleString()}</Text>
              </View>
              <TouchableOpacity
                style={[s.bookBtn, bookedIds.has(selected.id) && s.bookBtnBooked]}
                onPress={() => openBooking(selected)}
                activeOpacity={0.85}
              >
                <Text style={s.bookBtnText}>
                  {bookedIds.has(selected.id) ? 'Booked ✓' : 'Book My Spot'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

      {/* ── Booking Flow Modal (standalone) ── */}
      <Modal visible={!!bookingGathering} animationType="slide" presentationStyle="pageSheet" onRequestClose={closeBooking}>
        {bookingGathering && (
          <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
            <View style={s.bookingHeader}>
              <TouchableOpacity onPress={closeBooking} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Text style={s.bookingClose}>← Back</Text>
              </TouchableOpacity>
              <Text style={s.bookingHeaderTitle}>
                {bookingStep === 'review' ? 'Review Booking' : bookingStep === 'details' ? 'Your Details' : 'Confirmed!'}
              </Text>
              <View style={{ width: 50 }} />
            </View>

            {bookingStep !== 'confirmed' && (
              <View style={s.progressRow}>
                <View style={[s.progressDot, s.progressDotActive]} />
                <View style={[s.progressLine, bookingStep === 'details' && s.progressLineActive]} />
                <View style={[s.progressDot, bookingStep === 'details' && s.progressDotActive]} />
              </View>
            )}

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: spacing.xl, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {bookingStep === 'review' && (
                <>
                  <View style={s.bkSummaryCard}>
                    <Image source={{ uri: bookingGathering.imageUrl }} style={s.bkSummaryImg} />
                    <View style={s.bkSummaryBody}>
                      <Text style={s.bkSummaryTitle}>{bookingGathering.title}</Text>
                      <Text style={s.bkSummaryLoc}>{bookingGathering.location}, {bookingGathering.country}</Text>
                      <Text style={s.bkSummaryDate}>
                        {formatDateRange(bookingGathering.startDate, bookingGathering.endDate)} · {bookingGathering.days} days
                      </Text>
                    </View>
                  </View>

                  <View style={s.bkRow}>
                    <Text style={s.bkRowLabel}>Teacher</Text>
                    <Text style={s.bkRowValue}>{bookingGathering.teacher}</Text>
                  </View>
                  <View style={s.bkRow}>
                    <Text style={s.bkRowLabel}>Availability</Text>
                    <Text style={[s.bkRowValue, bookingGathering.spotsLeft <= 3 && { color: colors.orange }]}>
                      {bookingGathering.spotsLeft} spots left of {bookingGathering.spotsTotal}
                    </Text>
                  </View>

                  {bookingGathering.social.going.length > 0 && (
                    <View style={s.bkSocialCard}>
                      <View style={s.bkSocialAvatars}>
                        {bookingGathering.social.going.slice(0, 4).map((g, i) => (
                          <Image key={g.name} source={{ uri: g.img }} style={[s.bkSocialAvatar, i > 0 && { marginLeft: -8 }]} />
                        ))}
                      </View>
                      <Text style={s.bkSocialText}>
                        {bookingGathering.social.going.slice(0, 2).map(g => g.name).join(', ')}
                        {bookingGathering.social.count > 2 ? ` and ${bookingGathering.social.count - 2} others are going` : ' are going'}
                      </Text>
                    </View>
                  )}

                  <View style={s.bkPriceCard}>
                    <Text style={s.bkPriceTitle}>Price Breakdown</Text>
                    <View style={s.bkPriceLine}>
                      <Text style={s.bkPriceLabel}>Gathering ({bookingGathering.days} days)</Text>
                      <Text style={s.bkPriceAmount}>${bookingGathering.priceUsd.toLocaleString()}</Text>
                    </View>
                    <View style={s.bkPriceLine}>
                      <Text style={s.bkPriceLabel}>Booking fee</Text>
                      <Text style={s.bkPriceAmount}>${Math.round(bookingGathering.priceUsd * 0.05).toLocaleString()}</Text>
                    </View>
                    <View style={s.bkPriceDivider} />
                    <View style={s.bkPriceLine}>
                      <Text style={s.bkPriceTotalLabel}>Total</Text>
                      <Text style={s.bkPriceTotalAmount}>
                        ${(bookingGathering.priceUsd + Math.round(bookingGathering.priceUsd * 0.05)).toLocaleString()}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity style={s.bkCtaInline} onPress={() => setBookingStep('details')} activeOpacity={0.85}>
                    <Text style={s.bkCtaText}>Continue</Text>
                  </TouchableOpacity>
                </>
              )}

              {bookingStep === 'details' && (
                <>
                  <Text style={s.bkFormHeading}>Contact Information</Text>
                  <Text style={s.bkFormSub}>We'll share this with the organizer to confirm your spot.</Text>

                  <Text style={s.bkInputLabel}>Full Name</Text>
                  <TextInput style={s.bkInput} value={guestName} onChangeText={setGuestName} placeholder="Your name" placeholderTextColor={colors.muted} />

                  <Text style={s.bkInputLabel}>Email</Text>
                  <TextInput style={s.bkInput} value={guestEmail} onChangeText={setGuestEmail} placeholder="you@email.com" placeholderTextColor={colors.muted} keyboardType="email-address" autoCapitalize="none" />

                  <Text style={s.bkInputLabel}>Phone (optional)</Text>
                  <TextInput style={s.bkInput} value={guestPhone} onChangeText={setGuestPhone} placeholder="+1 (555) 000-0000" placeholderTextColor={colors.muted} keyboardType="phone-pad" />

                  <Text style={s.bkInputLabel}>Notes for the teacher (optional)</Text>
                  <TextInput
                    style={[s.bkInput, s.bkInputMulti]}
                    value={guestNotes}
                    onChangeText={setGuestNotes}
                    placeholder="Injuries, experience level, dietary needs..."
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={3}
                  />

                  <View style={s.bkPaymentCard}>
                    <Text style={s.bkPaymentIcon}>💳</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.bkPaymentTitle}>Payment</Text>
                      <Text style={s.bkPaymentSub}>You'll pay when the organizer confirms your spot. No charge now.</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                    <TouchableOpacity style={s.bkBackBtn} onPress={() => setBookingStep('review')} activeOpacity={0.7}>
                      <Text style={s.bkBackText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.bkCtaInline, { flex: 1, backgroundColor: colors.orange, marginTop: 0 }, booking && { opacity: 0.6 }]}
                      onPress={confirmBooking}
                      disabled={booking || !guestName.trim() || !guestEmail.trim()}
                      activeOpacity={0.85}
                    >
                      {booking ? <ActivityIndicator color="#fff" /> : (
                        <Text style={s.bkCtaText}>Confirm Booking</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {bookingStep === 'confirmed' && (
                <Animated.View style={[s.bkConfirmed, { opacity: confirmAnim, transform: [{ scale: confirmAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }]}>
                  <View style={s.bkConfirmedCircle}>
                    <Text style={s.bkConfirmedCheck}>✓</Text>
                  </View>
                  <Text style={s.bkConfirmedTitle}>You're In!</Text>
                  <Text style={s.bkConfirmedSub}>
                    Your spot at {bookingGathering.title} has been reserved.
                  </Text>
                  <View style={s.bkConfirmedCard}>
                    <Image source={{ uri: bookingGathering.imageUrl }} style={s.bkConfirmedImg} />
                    <View style={s.bkConfirmedInfo}>
                      <Text style={s.bkConfirmedName}>{bookingGathering.title}</Text>
                      <Text style={s.bkConfirmedLoc}>{bookingGathering.location}</Text>
                      <Text style={s.bkConfirmedDate}>
                        {formatDateRange(bookingGathering.startDate, bookingGathering.endDate)}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.bkConfirmedNote}>
                    We've sent a confirmation to {guestEmail || user?.email}. The organizer will reach out with final details.
                  </Text>
                  <TouchableOpacity style={[s.bkCtaInline, { marginTop: 24 }]} onPress={closeBooking} activeOpacity={0.85}>
                    <Text style={s.bkCtaText}>Done</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* ── All Attendees Modal ── */}
      <Modal visible={showAllAttendees && !!selected} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAllAttendees(false)}>
        {selected && (
          <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
            <View style={s.attHeader}>
              <TouchableOpacity onPress={() => setShowAllAttendees(false)}>
                <Text style={s.bookingClose}>← Back</Text>
              </TouchableOpacity>
              <Text style={s.bookingHeaderTitle}>Who's Going</Text>
              <View style={{ width: 50 }} />
            </View>

            <View style={s.attCountBar}>
              <Text style={s.attCountText}>{selected.social.count} yogis attending {selected.title}</Text>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.xl, paddingBottom: 60 }}>
              {selected.social.going.map((a) => (
                <TouchableOpacity
                  key={a.id || a.name}
                  style={s.attCard}
                  onPress={() => { setShowAllAttendees(false); setTimeout(() => setSelectedAttendee(a), 300); }}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: a.img }} style={s.attCardAvatar} />
                  <View style={s.attCardBody}>
                    <Text style={s.attCardName}>{a.name}</Text>
                    {a.location ? <Text style={s.attCardLoc}>{a.location}</Text> : null}
                    <View style={s.attCardTags}>
                      {a.series ? (
                        <View style={s.attCardTag}><Text style={s.attCardTagText}>{a.series}</Text></View>
                      ) : null}
                      {a.practiceYears ? (
                        <Text style={s.attCardYears}>{a.practiceYears}y practice</Text>
                      ) : null}
                    </View>
                  </View>
                  {a.mutualFriends && a.mutualFriends > 0 ? (
                    <View style={s.attMutualBadge}>
                      <Text style={s.attMutualText}>{a.mutualFriends} mutual</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              ))}

              {/* Extra count placeholder */}
              {selected.social.count > selected.social.going.length && (
                <View style={s.attExtraCard}>
                  <Text style={s.attExtraText}>
                    +{selected.social.count - selected.social.going.length} more yogis attending
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* ── Attendee Profile Modal ── */}
      <Modal visible={!!selectedAttendee} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedAttendee(null)}>
        {selectedAttendee && (
          <View style={{ flex: 1, backgroundColor: '#FAF8F5' }}>
            <View style={s.attHeader}>
              <TouchableOpacity onPress={() => setSelectedAttendee(null)}>
                <Text style={s.bookingClose}>← Back</Text>
              </TouchableOpacity>
              <Text style={s.bookingHeaderTitle}>Profile</Text>
              <View style={{ width: 50 }} />
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.xl, paddingBottom: 60, alignItems: 'center' }}>
              <Image source={{ uri: selectedAttendee.img }} style={s.profAvatar} />
              <Text style={s.profName}>{selectedAttendee.name}</Text>
              {selectedAttendee.location ? <Text style={s.profLoc}>{selectedAttendee.location}</Text> : null}

              {/* Stats row */}
              <View style={s.profStatsRow}>
                {selectedAttendee.practiceYears ? (
                  <View style={s.profStat}>
                    <Text style={s.profStatNum}>{selectedAttendee.practiceYears}</Text>
                    <Text style={s.profStatLabel}>Years</Text>
                  </View>
                ) : null}
                {selectedAttendee.series ? (
                  <View style={s.profStat}>
                    <Text style={s.profStatNum}>{selectedAttendee.series}</Text>
                    <Text style={s.profStatLabel}>Series</Text>
                  </View>
                ) : null}
                {selectedAttendee.level ? (
                  <View style={s.profStat}>
                    <Text style={s.profStatNum}>{selectedAttendee.level}</Text>
                    <Text style={s.profStatLabel}>Level</Text>
                  </View>
                ) : null}
              </View>

              {selectedAttendee.bio ? (
                <View style={s.profBioCard}>
                  <Text style={s.profBio}>{selectedAttendee.bio}</Text>
                </View>
              ) : null}

              {selectedAttendee.mutualFriends && selectedAttendee.mutualFriends > 0 ? (
                <View style={s.profMutualCard}>
                  <Text style={s.profMutualIcon}>👥</Text>
                  <Text style={s.profMutualText}>{selectedAttendee.mutualFriends} mutual friends in your sangha</Text>
                </View>
              ) : null}

              {/* Action buttons */}
              <View style={s.profActions}>
                <TouchableOpacity style={s.profActionBtn} activeOpacity={0.85} onPress={() => Alert.alert('Coming soon', 'Messaging will be available soon!')}>
                  <Text style={s.profActionIcon}>💬</Text>
                  <Text style={s.profActionText}>Send Message</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.profActionBtn, s.profActionBtnSecondary]} activeOpacity={0.85} onPress={() => Alert.alert('Coming soon', 'Friend requests will be available soon!')}>
                  <Text style={s.profActionIcon}>🤝</Text>
                  <Text style={[s.profActionText, { color: colors.sage }]}>Connect</Text>
                </TouchableOpacity>
              </View>

              {/* Shared gatherings */}
              {selected && (
                <View style={s.profSharedCard}>
                  <Text style={s.profSharedTitle}>Also attending</Text>
                  <View style={s.profSharedRow}>
                    <Image source={{ uri: selected.imageUrl }} style={s.profSharedImg} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.profSharedName}>{selected.title}</Text>
                      <Text style={s.profSharedDate}>{formatDateRange(selected.startDate, selected.endDate)}</Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ──

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF8F5' },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 24, color: colors.ink },
  subtitle: { ...typography.bodySm, color: colors.muted, marginTop: 2 },
  filterScroll: { flexGrow: 0 },
  filters: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.md },
  filterPill: {
    paddingHorizontal: spacing.lg, paddingVertical: 7,
    borderRadius: radius.full, backgroundColor: '#EEEAE5',
  },
  filterActive: { backgroundColor: colors.sage },
  filterText: { ...typography.headingSm, color: colors.inkMid },
  filterTextActive: { color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, gap: spacing.lg, paddingBottom: spacing['4xl'] },

  // Cards
  card: { borderRadius: radius['2xl'], overflow: 'hidden', height: 260 },
  cardImage: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(28,43,58,0.4)' },
  cardContent: { ...StyleSheet.absoluteFillObject, padding: spacing.lg, justifyContent: 'space-between' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTags: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  cardTag: {
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: radius.full,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: spacing.md, paddingVertical: 3,
  },
  cardTagText: { ...typography.headingXs, color: '#fff' },
  bookedBadge: { backgroundColor: colors.sage, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 4 },
  bookedText: { ...typography.headingXs, color: '#fff' },
  cardTitle: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, color: '#fff', lineHeight: 26 },
  cardLocation: { ...typography.bodySm, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: spacing.sm },
  cardMeta: { gap: 2 },
  cardDate: { ...typography.labelMd, color: 'rgba(255,255,255,0.8)' },
  cardPrice: { ...typography.headingSm, color: '#fff' },

  // Attendees on card
  attendeesRow: { flexDirection: 'row', alignItems: 'center' },
  attendeeAvatar: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: '#fff' },
  attendeeMore: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  attendeeMoreText: { ...typography.headingXs, color: '#fff', fontSize: 10 },

  spotsChip: {
    backgroundColor: colors.orange, borderRadius: radius.full, alignSelf: 'flex-start',
    paddingHorizontal: spacing.md, paddingVertical: 3, marginTop: spacing.sm,
  },
  spotsChipText: { ...typography.headingXs, color: '#fff' },

  // Empty
  emptyCard: { backgroundColor: '#fff', borderRadius: radius['2xl'], padding: spacing['3xl'], alignItems: 'center' },
  emptyEmoji: { fontSize: 32, marginBottom: spacing.md },
  emptyTitle: { ...typography.headingMd, color: colors.ink },
  emptySub: { ...typography.bodySm, color: colors.muted, textAlign: 'center' },

  // ── Detail Modal ──
  modalWrap: { flex: 1, backgroundColor: '#FAF8F5' },
  modalHero: { height: 240, position: 'relative' },
  modalHeroImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  modalHeroOv: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(28,43,58,0.5)' },
  modalHeroInner: { ...StyleSheet.absoluteFillObject, padding: spacing.xl, justifyContent: 'space-between' },
  backBtn: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  backBtnText: { ...typography.headingSm, color: '#fff' },
  modalTitle: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 26, color: '#fff', lineHeight: 30 },
  modalLocation: { ...typography.bodyMd, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  modalScroll: { flex: 1 },
  modalScrollContent: { padding: spacing.xl, paddingBottom: spacing['4xl'] },

  // Info row
  infoRow: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: radius['2xl'], padding: spacing.lg, marginBottom: spacing.xl, ...shadows.sm },
  infoItem: { flex: 1, alignItems: 'center' },
  infoDivider: { width: 1, backgroundColor: '#EEEAE5', marginVertical: spacing.xs },
  infoIcon: { fontSize: 20, marginBottom: spacing.xs },
  infoLabel: { ...typography.bodyXs, color: colors.muted },
  infoValue: { ...typography.headingSm, color: colors.ink, marginTop: 2, textAlign: 'center' },

  // Teacher
  teacherCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.xl },
  teacherAv: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.sagePale, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  teacherName: { ...typography.headingMd, color: colors.ink },
  teacherRole: { ...typography.bodySm, color: colors.muted, marginTop: 1 },

  // Sections
  section: { marginBottom: spacing.xl },
  sectionTitle: { ...typography.headingSm, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md },
  descText: { ...typography.bodyMd, color: colors.inkMid, lineHeight: 22 },

  // Who's Going
  goingRow: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.sm },
  goingBubble: { alignItems: 'center' },
  goingAvatar: { width: 50, height: 50, borderRadius: 25, marginBottom: spacing.xs },
  goingName: { ...typography.bodyXs, color: colors.ink },
  goingCount: { ...typography.labelSm, color: colors.sage },

  // Highlights
  highlightRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  highlightDot: { ...typography.bodyMd, color: colors.sage, lineHeight: 22 },
  highlightText: { ...typography.bodyMd, color: colors.inkMid, lineHeight: 22, flex: 1 },

  // Itinerary
  itineraryItem: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  itineraryDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.sage, marginTop: 6 },
  itineraryContent: { flex: 1 },
  itineraryHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 },
  itineraryDay: { ...typography.headingSm, color: colors.ink },
  itineraryTag: { backgroundColor: colors.sagePale, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  itineraryTagText: { ...typography.labelSm, color: colors.sage },
  itineraryTitle: { ...typography.headingMd, color: colors.ink, marginBottom: 2 },
  itineraryDetail: { ...typography.bodySm, color: colors.muted },

  // Spots
  spotsCard: { backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.xl },
  spotsBar: { height: 8, backgroundColor: '#EEEAE5', borderRadius: 4, overflow: 'hidden', marginBottom: spacing.sm },
  spotsFill: { height: '100%', backgroundColor: colors.sage, borderRadius: 4 },
  spotsInfo: { ...typography.labelSm, color: colors.muted, textAlign: 'center' },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.lg,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#EEEAE5',
    paddingBottom: spacing['3xl'],
  },
  bottomLabel: { ...typography.bodyXs, color: colors.muted },
  bottomPrice: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 24, color: colors.ink },
  bookBtn: { backgroundColor: colors.sage, borderRadius: radius.lg, paddingVertical: spacing.md, paddingHorizontal: spacing['3xl'], ...shadows.md },
  bookBtnBooked: { backgroundColor: colors.muted },
  bookBtnText: { ...typography.headingMd, color: '#fff' },

  // ── Booking Flow ──
  bookingWrap: { flex: 1, backgroundColor: '#FAF8F5' },
  bookingHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingTop: 16, paddingBottom: spacing.sm,
  },
  bookingClose: { ...typography.headingSm, color: colors.muted },
  bookingHeaderTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18, color: colors.ink,
  },

  // Progress
  progressRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.md, gap: 0,
  },
  progressDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#DDD8D0',
  },
  progressDotActive: { backgroundColor: colors.sage },
  progressLine: {
    width: 60, height: 2, backgroundColor: '#DDD8D0',
  },
  progressLineActive: { backgroundColor: colors.sage },

  bookingScrollContent: { padding: spacing.xl, paddingBottom: 60 },

  // Summary card
  bkSummaryCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: radius.xl,
    overflow: 'hidden', marginBottom: spacing.xl, ...shadows.sm,
  },
  bkSummaryImg: { width: 100, height: 100 },
  bkSummaryBody: { flex: 1, padding: spacing.md, justifyContent: 'center' },
  bkSummaryTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 17, color: colors.ink, lineHeight: 22,
  },
  bkSummaryLoc: { ...typography.bodySm, color: colors.muted, marginTop: 2 },
  bkSummaryDate: { ...typography.labelSm, color: colors.sage, marginTop: 4 },

  // Detail rows
  bkRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: '#F0EDE8',
  },
  bkRowLabel: { ...typography.bodySm, color: colors.muted },
  bkRowValue: { ...typography.headingSm, color: colors.ink },

  // Social proof
  bkSocialCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.sagePale, borderRadius: radius.xl,
    padding: spacing.lg, marginTop: spacing.xl,
  },
  bkSocialAvatars: { flexDirection: 'row' },
  bkSocialAvatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: colors.sagePale },
  bkSocialText: { ...typography.bodySm, color: colors.sage, flex: 1 },

  // Price breakdown
  bkPriceCard: {
    backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.xl,
    marginTop: spacing.xl, ...shadows.sm,
  },
  bkPriceTitle: { ...typography.headingSm, color: colors.ink, marginBottom: spacing.md },
  bkPriceLine: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm,
  },
  bkPriceLabel: { ...typography.bodyMd, color: colors.inkMid },
  bkPriceAmount: { ...typography.bodyMd, color: colors.ink },
  bkPriceDivider: { height: 1, backgroundColor: '#F0EDE8', marginVertical: spacing.sm },
  bkPriceTotalLabel: { ...typography.headingMd, color: colors.ink },
  bkPriceTotalAmount: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 20, color: colors.ink },

  // Details form
  bkFormHeading: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 20, color: colors.ink, marginBottom: 4,
  },
  bkFormSub: { ...typography.bodySm, color: colors.muted, marginBottom: spacing.xl },
  bkInputLabel: { ...typography.headingSm, color: colors.ink, marginBottom: spacing.xs, marginTop: spacing.md },
  bkInput: {
    backgroundColor: '#fff', borderRadius: radius.lg, borderWidth: 1, borderColor: '#E8E4DF',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    ...typography.bodyMd, color: colors.ink,
  },
  bkInputMulti: { height: 80, textAlignVertical: 'top', paddingTop: spacing.md },

  // Payment placeholder
  bkPaymentCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: '#FFF8F0', borderRadius: radius.xl, borderWidth: 1,
    borderColor: '#F0E6D8', padding: spacing.lg, marginTop: spacing.xl,
  },
  bkPaymentIcon: { fontSize: 24 },
  bkPaymentTitle: { ...typography.headingSm, color: colors.ink },
  bkPaymentSub: { ...typography.bodyXs, color: colors.muted, marginTop: 2 },

  // Confirmed
  bkConfirmed: { alignItems: 'center', paddingTop: spacing['3xl'] },
  bkConfirmedCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: colors.sage,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xl,
  },
  bkConfirmedCheck: { fontSize: 32, color: '#fff', fontWeight: '700' },
  bkConfirmedTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 26, color: colors.ink, marginBottom: spacing.sm,
  },
  bkConfirmedSub: {
    ...typography.bodyMd, color: colors.muted, textAlign: 'center',
    paddingHorizontal: spacing.xl, marginBottom: spacing['2xl'],
  },
  bkConfirmedCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: radius.xl,
    overflow: 'hidden', ...shadows.sm, alignSelf: 'stretch', marginBottom: spacing.xl,
  },
  bkConfirmedImg: { width: 80, height: 80 },
  bkConfirmedInfo: { flex: 1, padding: spacing.md, justifyContent: 'center' },
  bkConfirmedName: { ...typography.headingSm, color: colors.ink },
  bkConfirmedLoc: { ...typography.bodyXs, color: colors.muted, marginTop: 2 },
  bkConfirmedDate: { ...typography.labelSm, color: colors.sage, marginTop: 4 },
  bkConfirmedNote: {
    ...typography.bodySm, color: colors.muted, textAlign: 'center',
    paddingHorizontal: spacing.md, lineHeight: 20,
  },

  // Inline CTA button (inside scroll)
  bkCtaInline: {
    backgroundColor: colors.sage, borderRadius: radius.lg,
    paddingVertical: 16, alignItems: 'center', marginTop: spacing.xl,
  },
  bkCtaText: { ...typography.headingMd, color: '#fff' },
  bkBackBtn: {
    paddingVertical: spacing.md, paddingHorizontal: spacing.xl,
    borderRadius: radius.lg, borderWidth: 1, borderColor: '#DDD8D0',
    alignItems: 'center', justifyContent: 'center',
  },
  bkBackText: { ...typography.headingSm, color: colors.inkMid },

  // ── Who's Going (enhanced) ──
  goingMutual: { ...typography.bodyXs, color: colors.sage, marginTop: 1 },

  // ── All Attendees Modal ──
  attHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingTop: 16, paddingBottom: spacing.sm,
  },
  attCountBar: {
    paddingHorizontal: spacing.xl, paddingBottom: spacing.md,
  },
  attCountText: { ...typography.bodySm, color: colors.muted },

  attCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: radius.xl,
    padding: spacing.lg, marginBottom: spacing.md,
    ...shadows.sm,
  },
  attCardAvatar: { width: 52, height: 52, borderRadius: 26, marginRight: spacing.md },
  attCardBody: { flex: 1 },
  attCardName: { ...typography.headingSm, color: colors.ink },
  attCardLoc: { ...typography.bodyXs, color: colors.muted, marginTop: 2 },
  attCardTags: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  attCardTag: {
    backgroundColor: colors.sagePale, borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 2,
  },
  attCardTagText: { ...typography.labelSm, color: colors.sage },
  attCardYears: { ...typography.bodyXs, color: colors.muted },
  attMutualBadge: {
    backgroundColor: colors.sagePale, borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 3, marginLeft: spacing.sm,
  },
  attMutualText: { ...typography.labelSm, color: colors.sage },
  attExtraCard: {
    backgroundColor: '#EEEAE5', borderRadius: radius.xl,
    padding: spacing.xl, alignItems: 'center',
  },
  attExtraText: { ...typography.bodySm, color: colors.muted },

  // ── Attendee Profile ──
  profAvatar: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 3, borderColor: colors.sage,
    marginBottom: spacing.lg, marginTop: spacing.md,
  },
  profName: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 24, color: colors.ink,
    marginBottom: 4,
  },
  profLoc: { ...typography.bodySm, color: colors.muted, marginBottom: spacing.xl },
  profStatsRow: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: radius.xl,
    padding: spacing.lg, gap: spacing.xl, alignSelf: 'stretch',
    justifyContent: 'center', marginBottom: spacing.xl, ...shadows.sm,
  },
  profStat: { alignItems: 'center' },
  profStatNum: { ...typography.headingSm, color: colors.ink },
  profStatLabel: { ...typography.bodyXs, color: colors.muted, marginTop: 2 },
  profBioCard: {
    backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.xl,
    alignSelf: 'stretch', marginBottom: spacing.lg, ...shadows.sm,
  },
  profBio: { ...typography.bodyMd, color: colors.inkMid, lineHeight: 22, fontStyle: 'italic' },
  profMutualCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.sagePale, borderRadius: radius.xl,
    padding: spacing.lg, alignSelf: 'stretch', marginBottom: spacing.xl,
  },
  profMutualIcon: { fontSize: 18 },
  profMutualText: { ...typography.bodySm, color: colors.sage, flex: 1 },
  profActions: {
    flexDirection: 'row', gap: spacing.md, alignSelf: 'stretch', marginBottom: spacing.xl,
  },
  profActionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, backgroundColor: colors.sage, borderRadius: radius.lg,
    paddingVertical: 14,
  },
  profActionBtnSecondary: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.sage,
  },
  profActionIcon: { fontSize: 16 },
  profActionText: { ...typography.headingSm, color: '#fff' },
  profSharedCard: {
    backgroundColor: '#fff', borderRadius: radius.xl, padding: spacing.lg,
    alignSelf: 'stretch', ...shadows.sm,
  },
  profSharedTitle: { ...typography.headingSm, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md },
  profSharedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  profSharedImg: { width: 48, height: 48, borderRadius: radius.lg },
  profSharedName: { ...typography.headingSm, color: colors.ink },
  profSharedDate: { ...typography.bodyXs, color: colors.muted, marginTop: 2 },
});
