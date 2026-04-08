// app/practice-mode.tsx
// Minimalist Practice Mode — distraction-free pose sequence for self-practice.
// Dark green backdrop, large Sanskrit names, breath counter, tap-to-advance.

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PRIMARY_POSE_SEQUENCE } from '@/data/asanaPoses';

const BG = '#1C120A';
const INK = '#F5EFE6';
const MUTED = '#B5926E';
const ACCENT = '#C26B4D';

export default function PracticeMode() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const pose = PRIMARY_POSE_SEQUENCE[index];
  const total = PRIMARY_POSE_SEQUENCE.length;
  const breathsTarget = typeof pose.breaths === 'number' ? pose.breaths : 5;

  const next = () => {
    setBreathCount(0);
    setIndex((i) => Math.min(i + 1, total - 1));
  };
  const prev = () => {
    setBreathCount(0);
    setIndex((i) => Math.max(i - 1, 0));
  };
  const tickBreath = () => {
    setBreathCount((c) => (c + 1 > breathsTarget ? 1 : c + 1));
  };

  return (
    <View style={styles.root}>
      {Platform.OS !== 'web' && <StatusBar barStyle="light-content" backgroundColor={BG} />}
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Exit */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="close" size={28} color={INK} />
          </TouchableOpacity>
          <Text style={styles.counter}>
            {index + 1} / {total}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Pose image */}
        <View style={styles.imageWrap}>
          <Image source={pose.image} style={styles.image} resizeMode="contain" />
        </View>

        {/* Sanskrit + English */}
        <View style={styles.nameBlock}>
          <Text style={styles.sanskrit}>{pose.sanskrit}</Text>
          <Text style={styles.english}>{pose.english}</Text>
        </View>

        {/* Breath counter — tap to advance */}
        <Pressable onPress={tickBreath} style={styles.breathCard}>
          <Text style={styles.breathLabel}>Breaths</Text>
          <Text style={styles.breathNum}>
            {breathCount} <Text style={styles.breathTarget}>/ {breathsTarget}</Text>
          </Text>
          <Text style={styles.breathHint}>tap to count</Text>
        </Pressable>

        {/* Nav */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            onPress={prev}
            disabled={index === 0}
            style={[styles.navBtn, index === 0 && styles.navBtnDisabled]}>
            <Ionicons name="chevron-back" size={22} color={INK} />
            <Text style={styles.navTxt}>Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={next}
            disabled={index === total - 1}
            style={[styles.navBtn, index === total - 1 && styles.navBtnDisabled]}>
            <Text style={styles.navTxt}>Next</Text>
            <Ionicons name="chevron-forward" size={22} color={INK} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8,
  },
  counter: { color: MUTED, fontSize: 14, letterSpacing: 2, fontWeight: '500' },
  imageWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32,
  },
  image: { width: 280, height: 280, opacity: 0.95, tintColor: INK },
  nameBlock: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 12 },
  sanskrit: { color: INK, fontSize: 32, fontWeight: '300', textAlign: 'center', letterSpacing: 0.5 },
  english: { color: MUTED, fontSize: 15, marginTop: 6, letterSpacing: 1, textTransform: 'uppercase' },
  breathCard: {
    alignSelf: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: ACCENT + '33', borderRadius: 100,
    paddingVertical: 18, paddingHorizontal: 44, marginBottom: 20,
  },
  breathLabel: { color: MUTED, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' },
  breathNum: { color: INK, fontSize: 44, fontWeight: '200', marginTop: 2 },
  breathTarget: { color: MUTED, fontSize: 22 },
  breathHint: { color: MUTED, fontSize: 10, marginTop: 2, letterSpacing: 1 },
  bottomBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 32, paddingBottom: 16,
  },
  navBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 12, paddingHorizontal: 20,
  },
  navBtnDisabled: { opacity: 0.3 },
  navTxt: { color: INK, fontSize: 16, fontWeight: '500' },
});
