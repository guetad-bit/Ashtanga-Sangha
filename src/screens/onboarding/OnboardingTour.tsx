// src/screens/onboarding/OnboardingTour.tsx
import React, { useRef, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Dimensions, Platform,
  FlatList, NativeSyntheticEvent, NativeScrollEvent,
  ImageBackground, ImageSourcePropType, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { colors, spacing, radius, typography } from '@/styles/tokens';
import AppLogo from '@/components/AppLogo';

const { width, height } = Dimensions.get('window');

// ââ Warm earth-tone palette (matches Community & Home) ââââââââââââââââââ
const warm = {
  bg: '#FAF6F0',
  ink: '#3D3229',
  inkMid: '#5C4F42',
  muted: '#8B7D6E',
  accent: '#C47B3F',
  sage: '#7A8B5E',
  gold: '#B8944A',
  terra: '#A0704C',
  orange: '#E8834A',
  divider: '#EDE5D8',
  cardBg: '#FFFFFF',
};

interface Slide {
  id: string;
  image: ImageSourcePropType;
  accent: string;
  gradientFloor: string;
  title: string;
  kicker: string;
  description: string;
}

interface OnboardingTourProps {
  onFinish: () => void;
}

export default function OnboardingTour({ onFinish }: OnboardingTourProps) {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const SLIDES: Slide[] = [
    {
      id: '1',
      image: require('../../../assets/onboard-1.png'),
      accent: warm.orange,
      gradientFloor: 'rgba(61,50,41,0.97)',
      title: t('onboarding.slide1Title'),
      kicker: t('onboarding.slide1Subtitle'),
      description: t('onboarding.slide1Body'),
    },
    {
      id: '2',
      image: require('../../../assets/onboard-1.png'),
      accent: warm.sage,
      gradientFloor: 'rgba(50,56,38,0.97)',
      title: t('onboarding.slide2Title'),
      kicker: t('onboarding.slide2Subtitle'),
      description: t('onboarding.slide2Body'),
    },
    {
      id: '3',
      image: require('../../../assets/onboard-1.png'),
      accent: warm.gold,
      gradientFloor: 'rgba(60,48,30,0.97)',
      title: t('onboarding.slide3Title'),
      kicker: t('onboarding.slide3Subtitle'),
      description: t('onboarding.slide3Body'),
    },
    {
      id: '4',
      image: require('../../../assets/onboard-1.png'),
      accent: warm.accent,
      gradientFloor: 'rgba(55,36,22,0.97)',
      title: t('onboarding.slide4Title'),
      kicker: t('onboarding.slide4Subtitle'),
      description: t('onboarding.slide4Body'),
    },
  ];

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
          'rgba(0,0,0,0.30)',
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
        pointerEvents={Platform.OS === "web" ? "none" : "auto"}
      />

      {/* Top bar */}
      <View
        style={[s.topBar, { paddingTop: insets.top + spacing.sm }]}
        pointerEvents="box-none"
      >
        <View style={s.logoRow}>
          <AppLogo size="sm" />
        </View>
        <Pressable onPress={onFinish} hitSlop={12}>
          <Text style={s.skipText}>{t('onboarding.skip')}</Text>
        </Pressable>
      </View>

      {/* Bottom card */}
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
          <Text style={s.nextBtnText}>
            {isLast ? t('onboarding.getStarted') : t('onboarding.next')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#3D3229',
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
    color: warm.bg,
    letterSpacing: 0.2,
  },
  skipText: {
    ...typography.labelLg,
    color: warm.bg,
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
    color: '#fff',
  },
});
