// src/styles/tokens.ts
// Single source of truth for all design tokens

export const colors = {
  // Sky palette — backgrounds, subtle fills
  sky: '#EEF4FB',
  skyMid: '#DDEAF6',
  skyDeep: '#B8D4EE',

  // Blue palette — primary actions, links, focus
  blue: '#4A90C4',
  blueL: '#6AABD8',
  blueDeep: '#2C6A96',

  // Sand palette — moon days, rest states
  sand: '#F7F0E6',
  sandMid: '#EDE3D4',
  sandDeep: '#C8B49A',

  // Sage palette — success, nature accents
  sage: '#6B8F71',
  sageL: '#9DB8A0',
  sagePale: '#E8F0E9',

  // Orange palette — streaks, urgent, FAB
  orange: '#E8834A',
  orangeL: '#F0A070',
  orangePale: '#FDF0E8',

  // Ink palette — text
  ink: '#1C2B3A',
  inkMid: '#3A4F63',

  // Muted — secondary text, placeholders
  muted: '#7A8E9E',
  mutedL: '#A8BBCA',

  // Base
  white: '#FFFFFF',
  page: '#F3F7FB',

  // Onboarding dark backgrounds
  obDark: '#0D1922',
  obDarkMid: '#152435',
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
