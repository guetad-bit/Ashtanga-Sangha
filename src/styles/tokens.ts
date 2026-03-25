// src/styles/tokens.ts
// Single source of truth for all design tokens

export const colors = {
  // Sky palette — backgrounds, subtle fills (dark purple theme)
  sky: '#0F0B1E',
  skyMid: '#1A1432',
  skyDeep: '#231A3D',

  // Blue palette → Purple gradient (primary actions, links, focus)
  blue: '#A855F7',
  blueL: '#7C3AED',
  blueDeep: '#5B21B6',

  // Sand palette → Emerald/success (rest states, nature accents)
  sand: '#34D399',
  sandMid: '#6EE7B7',
  sandDeep: '#1A3D2F',

  // Sage palette → Emerald (success, nature accents)
  sage: '#34D399',
  sageL: '#6EE7B7',
  sagePale: '#1A3D2F',

  // Orange palette — streaks, urgent, FAB (stays warm)
  orange: '#F97316',
  orangeL: '#FDBA74',
  orangePale: '#2D1A0F',

  // Ink palette → White/light text
  ink: '#FFFFFF',
  inkMid: '#E8E0F0',

  // Muted — secondary text, placeholders (faded purple)
  muted: '#9B8CB8',
  mutedL: '#6B5C82',

  // Base (glass and white-ish)
  white: '#1A1432',
  page: '#0F0B1E',

  // Dark backgrounds (already dark, adjusted for consistency)
  obDark: '#0F0B1E',
  obDarkMid: '#1A1432',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export const typography = {
  // Display — DM Serif Display
  displayXl: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 34, lineHeight: 38 },
  displayLg: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 28, lineHeight: 32 },
  displayMd: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 24, lineHeight: 28 },
  displaySm: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 20, lineHeight: 24 },

  // Body — DM Sans
  bodyLg: { fontFamily: 'DMSans_400Regular', fontSize: 16, lineHeight: 24 },
  bodyMd: { fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 22 },
  bodySm: { fontFamily: 'DMSans_400Regular', fontSize: 13, lineHeight: 20 },
  bodyXs: { fontFamily: 'DMSans_400Regular', fontSize: 11, lineHeight: 16 },

  // Medium weight
  labelLg: { fontFamily: 'DMSans_500Medium', fontSize: 15, lineHeight: 22 },
  labelMd: { fontFamily: 'DMSans_500Medium', fontSize: 13, lineHeight: 20 },
  labelSm: { fontFamily: 'DMSans_500Medium', fontSize: 11, lineHeight: 16 },

  // Bold / semibold
  headingLg: { fontFamily: 'DMSans_600SemiBold', fontSize: 17, lineHeight: 24 },
  headingMd: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, lineHeight: 22 },
  headingSm: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, lineHeight: 20 },
  headingXs: { fontFamily: 'DMSans_600SemiBold', fontSize: 11, lineHeight: 16 },
} as const;
