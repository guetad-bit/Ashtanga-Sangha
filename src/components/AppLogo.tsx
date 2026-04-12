// src/components/AppLogo.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showDots?: boolean;
  color?: string;
}

const clay = {
  clay: '#C26B4D',
  clayDark: '#A5502F',
  ink: '#2A2420',
};

export default function AppLogo({ size = 'md', showDots = false, color }: AppLogoProps) {
  const textColor = color ?? clay.clay;
  const fontSize = size === 'sm' ? 18 : size === 'md' ? 26 : 42;
  const letterSpacing = size === 'sm' ? 5 : size === 'md' ? 8 : 14;
  const dotSize = size === 'sm' ? 3 : size === 'md' ? 4 : 5.5;
  const dotGap = size === 'sm' ? 4 : size === 'md' ? 5 : 7;

  return (
    <View style={s.wrap}>
      <Text
        style={[
          s.text,
          {
            fontSize,
            letterSpacing,
            color: textColor,
            paddingLeft: letterSpacing, // compensate tracking so text looks centered
          },
        ]}
      >
        sangha
      </Text>
      {showDots && (
        <View style={[s.dots, { gap: dotGap, marginTop: size === 'lg' ? 8 : 5 }]}>
          <View style={[s.dot, { width: dotSize, height: dotSize, backgroundColor: textColor, opacity: 0.35 }]} />
          <View style={[s.dot, { width: dotSize, height: dotSize, backgroundColor: textColor, opacity: 0.55 }]} />
          <View style={[s.dot, { width: dotSize, height: dotSize, backgroundColor: textColor, opacity: 0.35 }]} />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Georgia',
    fontWeight: '300',
    textTransform: 'lowercase',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    borderRadius: 50,
  },
});
