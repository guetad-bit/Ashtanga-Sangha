// src/styles/tokens.ts
// Single source of truth for all design tokens — Insta Ocean theme

export const colors = {
  // Sky palette — backgrounds, subtle fills (light blue-white)
  sky: '#F0F4FF',
  skyMid: '#FFFFFF',
  skyDeep: '#DDE4F0',

  // Blue palette → Ocean blue (primary actions, links, focus)
  blue: '#405DE6',
  blueL: '#5B8DEF',
  blueDeep: '#2A3EB1',

  // Sand palette → Emerald/success (rest states, nature accents)
  sand: '#34D399',
  sandMid: '#6EE7B7',
  sandDeep: '#E0FFF0',

  // Sage palette → Emerald (success, nature accents)
  sage: '#34D399',
  sageL: '#6EE7B7',
  sagePale: '#E0FFF0',

  // Orange palette → Coral (streaks, urgent, FAB)
  orange: '#FF6B6B',
  orangeL: '#FFA0A0',
  orangePale: '#FFF0F0',

  // Ink palette → Dark text
  ink: '#1A2744',
  inkMid: '#3D5070',

  // Muted — secondary text, placeholders
  muted: '#7B8FAD',
  mutedL: '#B0BDD0',

  // Base (card and page)
  white: '#FFFFFF',
  page: '#F0F4FF',

  // Light backgrounds
  obDark: '#F0F4FF',
  obDarkMid: '#FFFFFF',
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
  '3xl': 28,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#1A2744',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#405DE6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#405DE6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
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
