// src/styles/tokens.ts
// Single source of truth for all design tokens — Stone & Moss theme

export const colors = {
  // Background palette — soft sage parchment
  sky: '#EEF1E6',
  skyMid: '#FFFFFF',
  skyDeep: '#E8EFDC',

  // Primary greens → (primary actions, links, focus)
  blue: '#5A8A3F',
  blueL: '#6E9456',
  blueDeep: '#3F6B27',

  // Secondary sage fills
  sand: '#D6E0C2',
  sandMid: '#B8D49A',
  sandDeep: '#E4EEDF',

  // Sage palette → (success, nature accents)
  sage: '#6E9456',
  sageL: '#DDEBC2',
  sagePale: '#E8EFDC',

  // Accent → (soft highlight for CTAs)
  orange: '#5A8A3F',
  orangeL: '#9DBF6E',
  orangePale: '#DDEBC2',

  // Ink palette → Dark text (deep forest)
  ink: '#1F2A1A',
  inkMid: '#344028',

  // Muted — secondary text, placeholders
  muted: '#7A8870',
  mutedL: '#A8B59B',

  // Base (card and page)
  white: '#FFFFFF',
  page: '#EEF1E6',

  // Light backgrounds
  obDark: '#EEF1E6',
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
    shadowColor: '#1F2A1A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#8A9E78',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#8A9E78',
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
  bodyMd: { fontFamily: 'DMSans_400Regular', fontSize: 15, lineHeight: 22 },
  bodySm: { fontFamily: 'DMSans_400Regular', fontSize: 15, lineHeight: 22 },
  bodyXs: { fontFamily: 'DMSans_400Regular', fontSize: 15, lineHeight: 22 },

  // Medium weight
  labelLg: { fontFamily: 'DMSans_500Medium', fontSize: 16, lineHeight: 22 },
  labelMd: { fontFamily: 'DMSans_500Medium', fontSize: 15, lineHeight: 22 },
  labelSm: { fontFamily: 'DMSans_500Medium', fontSize: 15, lineHeight: 22 },

  // Bold / semibold
  headingLg: { fontFamily: 'DMSans_600SemiBold', fontSize: 17, lineHeight: 24 },
  headingMd: { fontFamily: 'DMSans_600SemiBold', fontSize: 16, lineHeight: 22 },
  headingSm: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, lineHeight: 22 },
  headingXs: { fontFamily: 'DMSans_600SemiBold', fontSize: 15, lineHeight: 22 },
} as const;
