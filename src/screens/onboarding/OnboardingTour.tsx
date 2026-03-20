// src/screens/onboarding/OnboardingTour.tsx
import React, { useRef, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Dimensions, Platform,
  FlatList, NativeSyntheticEvent, NativeScrollEvent,
  ImageBackground, ImageSourcePropType, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography } from '@/styles/tokens';
import AppLogo from '@/components/AppLogo';

const { width, height } = Dimensions.get('window');

interface Slide {
  id: string;
  image: ImageSourcePropType;
  accent: string;
  gradientFloor: string;
  title: string;
  kicker: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    image: require('../../../assets/onboard-1.png'),
    accent: '#7EC8A4',
    gradientFloor: 'rgba(17,42,32,0.97)',
    title: 'Welcome to Sangha',
    kicker: 'Your Ashtanga Community',
    description: 'Track your practice, connect with fellow yogis around the world, and deepen your commitment to the mat.',
  },
  {
    id: '2',
    image: require('../../../assets/onboard-1.png'),
    accent: '#74B3E0',
    gradientFloor: 'rgba(10,24,44,0.97)',
    title: 'Step on the Mat',
    kicker: 'Practice together, apart',
    description: 'Tap "On the Mat" when you start practicing. Your sangha will see you\'re there — even from across the globe.',
  },
  {
    id: '3',
    image: require('../../../assets/onboard-1.png'),
    accent: '#F0A86A',
    gradientFloor: 'rgba(40,20,8,0.97)',
    title: 'Build Your Streak',
    kicker: 'One day at a time',
    description: 'Track your daily rhythm, build streaks, and honor moon days. Consistency is the heart of Ashtanga.',
  },
  {
    id: '4',
    image: require('../../../assets/onboard-1.png'),
    accent: '#C4A8E0',
    gradientFloor: 'rgba(22,14,38,0.97)',
    title: 'Join the Sangha',
    kicker: 'You\'re not practicing alone',
    description: 'Share moments, join gatherings, and grow with a community that breathes together.',
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
    // On web the FlatList has pointerEvents="none" so manual swiping is
    // disabled and we drive navigation purely through state.  Letting the
    // scroll handler fire on web would reset currentIndex back to 0.
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
          'rgba(0,0,0,0.08)',
          'rgba(0,0,0,0.35)',
          item.gradientFloor,
        ]}
        locations={[0, 0.45, 1]}
        style={s.gradient}
      />
    </ImageBackground>
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      {/* Full-screen sliding image backgrounds — z-index 1 */}
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
        pointerEvents={Platform.OS === "web" ? "none" : "auto"}
      />

      {/* Top bar — z-index 10, above FlatList */}
      <View
        style={[s.topBar, { paddingTop: insets.top + spacing.sm }]}
        pointerEvents="box-none"
      >
        <View style={s.logoRow}>
          <AppLogo size={32} />
          <Text style={s.appName}>Ashtanga Sangha</Text>
        </View>
        <Pressable onPress={onFinish} hitSlop={12}>
          <Text style={s.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Bottom card — z-index 10, above FlatList */}
      <View style={[s.card, { paddingBottom: insets.bottom + spacing.xl }]}>
        <Text style={s.kicker}>
          {slide.kicker.toUpperCase()}
        </Text>

        <Text style={s.title}>{slide.title}</Text>
        <Text style={s.desc}>{slide.description}</Text>

        {/* Progress dots */}
        <View style={s.dots}>
          {SLIDES.map((sl, i) => (
            <View
              key={i}
              style={[
                s.dot,
                i === currentIndex
                  ? [s.dotActive, { backgroundColor: slide.accent }]
                  : s.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* CTA */}
        <Pressable
          style={({ pressed }) => [
            s.nextBtn,
            { backgroundColor: slide.accent, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={goNext}
        >
          <Text style={[s.nextBtnText, { color: slide.gradientFloor.startsWith('rgba(40') ? '#1C1008' : '#fff' }]}>
            {isLast ? 'Get Started  →' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0D1922',
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
    paddingHorizontal: spacing.xl,
    zIndex: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  appName: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 17,
    color: '#1C2B3A',
    letterSpacing: 0.2,
  },
  skipText: {
    ...typography.labelLg,
    color: '#1C2B3A',
  },

  card: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
    gap: spacing.sm,
    zIndex: 10,
  },

  kicker: {
    fontSize: 16,
    fontFamily: 'DMSans_600SemiBold',
    letterSpacing: 1.6,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },

  title: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 36,
    lineHeight: 42,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  desc: {
    ...typography.bodyLg,
    fontSize: 18,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 28,
    marginBottom: spacing.md,
  },

  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
  },
  dotInactive: {
    width: 5,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },

  nextBtn: {
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  },
  nextBtnText: {
    ...typography.headingLg,
  },
});
