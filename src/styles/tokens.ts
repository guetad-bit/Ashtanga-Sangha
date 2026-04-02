// src/styles/tokens.ts
// Single source of truth for all design tokens — Stone & Moss theme

export const colors = {
  // Beige palette — backgrounds, subtle fills (warm parchment)
  sky: '#F6F2EC',
  skyMid: '#FFFFFF',
  skyDeep: '#E8E0D4',

  // Olive palette → (primary actions, links, focus)
  blue: '#8A9E78',
  blueL: '#6E8A5C',
  blueDeep: '#5A7B4A',

  // Wood palette → (warm accents, secondary fills)
  sand: '#D4C4AB',
  sandMid: '#B8A88E',
  sandDeep: '#EDE6DA',

  // Sage palette → (success, nature accents)
  sage: '#8A9E78',
  sageL: '#DCE8D3',
  sagePale: '#F0F5EB',

  // Orange palette → (soft amber for CTAs, gentle emphasis)
  orange: '#C4956A',
  orangeL: '#DDB892',
  orangePale: '#FFF5EC',

  // Ink palette → Dark text (warm brown-black)
  ink: '#2A2420',
  inkMid: '#4A3F36',

  // Muted — secondary text, placeholders
  muted: '#7A6E60',
  mutedL: '#9B8E7E',

  // Base (card and page)
  white: '#FFFFFF',
  page: '#F6F2EC',

  // Light backgrounds
  obDark: '#F6F2EC',
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
    shadowColor: '#3B3228',
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
