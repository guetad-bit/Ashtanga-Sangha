// src/screens/onboarding/OnboardingTour.tsx
import React, { useRef, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Dimensions, Platform,
  FlatList, NativeSyntheticEvent, NativeScrollEvent,
  ImageBackground, ImageSourcePropType, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// ── Clay / terracotta palette (matches the rest of the app) ───────────────
const clay = {
  bg:        '#F5EFE6',
  ink:       '#2A2420',
  sub:       '#6B5E52',
  muted:     '#8A7A68',
  clay:      '#C26B4D',
  clayDark:  '#A5502F',
  sage:      '#A8B59B',
  sand:      '#D4C5A9',
  warm:      '#F9F4ED',
  border:    '#E8DFD0',
};

interface Slide {
  id: string;
  image: ImageSourcePropType;
  kicker: string;
  title: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    image: require('../../../assets/onboard-1.png'),
    kicker: 'YOUR PRACTICE',
    title: 'Show up\nto the mat',
    description: 'Log your practice, hold the six-day rhythm, and honour the moon. A quiet record of your journey on the mat.',
  },
  {
    id: '2',
    image: require('../../../assets/onboard-2.png'),
    kicker: 'THE SANGHA',
    title: 'Practise\ntogether',
    description: 'See who is on the mat right now, around the world. A global Mysore room — always open, always breathing.',
  },
  {
    id: '3',
    image: require('../../../assets/onboard-3.png'),
    kicker: 'GATHERINGS',
    title: 'Led classes\nand retreats',
    description: 'Friday Led Primary, moon-day workshops, week-long retreats. Book your spot and practise shoulder to shoulder.',
  },
  {
    id: '4',
    image: require('../../../assets/onboard-4.png'),
    kicker: 'BEGIN',
    title: 'Welcome\nto sangha',
    description: 'Practice, and all is coming. Create your account and step onto the mat.',
  },
];

interface OnboardingTourProps {
  onFinish: () => void;
}

export default function OnboardingTour({ onFinish }: OnboardingTourProps) {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const insets = useSafeAreaInsets();

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (Platform.OS === 'web') return;
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      onFinish();
    }
  };

  const isLast = currentIndex === SLIDES.length - 1;
  const slide = SLIDES[currentIndex];

  const renderSlide = ({ item }: { item: Slide }) => (
    <ImageBackground
      source={item.image}
      style={s.slideBg}
      resizeMode="cover"
    >
      <LinearGradient
        colors={[
          'rgba(0,0,0,0.05)',
          'rgba(42,36,32,0.35)',
          'rgba(42,36,32,0.96)',
        ]}
        locations={[0, 0.45, 1]}
        style={s.gradient}
      />
    </ImageBackground>
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      {/* Full-screen sliding image backgrounds */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
        pointerEvents={Platform.OS === 'web' ? 'none' : 'auto'}
      />

      {/* Top bar — brand + skip */}
      <View
        style={[s.topBar, { paddingTop: insets.top + 12 }]}
        pointerEvents="box-none"
      >
        <Text style={s.brand}>sangha</Text>
        {!isLast && (
          <Pressable onPress={onFinish} hitSlop={12}>
            <Text style={s.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>

      {/* Bottom card */}
      <View style={[s.card, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={s.kicker}>{slide.kicker}</Text>
        <Text style={s.title}>{slide.title}</Text>
        <Text style={s.desc}>{slide.description}</Text>

        {/* Progress dots */}
        <View style={s.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                s.dot,
                i === currentIndex ? s.dotActive : s.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* CTA */}
        <Pressable
          style={({ pressed }) => [
            s.nextBtn,
            { opacity: pressed ? 0.88 : 1 },
          ]}
          onPress={goNext}
        >
          <LinearGradient
            colors={[clay.clay, clay.clayDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.nextBtnGradient}
          >
            <Text style={s.nextBtnText}>
              {isLast ? 'Get Started' : 'Next'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: clay.ink,
  },

  slideBg: {
    width,
    height,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },

  topBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  brand: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: 7,
    color: '#fff',
    paddingLeft: 4,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.5,
  },

  card: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 28,
    paddingTop: 28,
    zIndex: 10,
  },

  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: clay.sand,
    marginBottom: 12,
  },

  title: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '300',
    color: '#fff',
    marginBottom: 14,
  },
  desc: {
    fontSize: 16,
    lineHeight: 26,
    color: 'rgba(255,255,255,0.78)',
    marginBottom: 22,
  },

  dots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  dotActive: {
    width: 22,
    backgroundColor: clay.clay,
  },
  dotInactive: {
    width: 5,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },

  nextBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: clay.clayDark,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  nextBtnGradient: {
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
});
