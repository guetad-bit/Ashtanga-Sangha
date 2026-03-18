// src/components/AppLogo.tsx
import React from 'react';
import { Image, StyleSheet } from 'react-native';

interface AppLogoProps {
  size?: number;
}

const logoSource = require('../../assets/logo-light.png');

export default function AppLogo({ size = 44 }: AppLogoProps) {
  return (
    <Image
      source={logoSource}
      style={[styles.logo, { width: size, height: size, borderRadius: size / 2 }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    backgroundColor: '#FAF7F4',
  },
});
