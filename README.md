# Ashtanga Sangha — Mobile App

> *Practice, and all is coming.* — Sri K. Pattabhi Jois

A community platform for Ashtanga yoga practitioners worldwide. Track your practice, connect with your sangha, and find gatherings.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React Native (Expo) | Cross-platform iOS + Android, fast iteration |
| Navigation | Expo Router (file-based) | Clean URL-like routing, deep linking ready |
| State | Zustand | Lightweight, no boilerplate |
| Styling | NativeWind (Tailwind for RN) | Consistent design tokens, fast iteration |
| Backend | Supabase | Auth, Postgres DB, realtime, storage |
| Push Notifs | Expo Notifications | Moon day alerts, practice reminders |
| Analytics | PostHog | Privacy-first product analytics |

---

## Project Structure

```
ashtanga-sangha/
├── README.md
├── package.json
├── app.json                        # Expo config
├── tsconfig.json
├── babel.config.js
│
├── src/
│   ├── screens/
│   │   ├── onboarding/
│   │   │   ├── SplashScreen.tsx    # Mandala splash
│   │   │   ├── JourneyScreen.tsx   # Philosophy / "Start Your Journey"
│   │   │   ├── FeaturesScreen.tsx  # 3-slide feature tour
│   │   │   ├── PersonalizeScreen.tsx
│   │   │   ├── LevelScreen.tsx
│   │   │   ├── NotificationsScreen.tsx
│   │   │   ├── WelcomeScreen.tsx   # Done / confetti
│   │   │   └── RegisterScreen.tsx  # Account creation
│   │   │
│   │   ├── home/
│   │   │   └── HomeScreen.tsx      # Practice hero, rhythm tracker, feed
│   │   │
│   │   ├── community/
│   │   │   └── CommunityScreen.tsx # Social feed, who's practicing
│   │   │
│   │   ├── gatherings/
│   │   │   ├── GatheringsScreen.tsx
│   │   │   └── GatheringDetailScreen.tsx
│   │   │
│   │   ├── schedule/
│   │   │   └── ScheduleScreen.tsx
│   │   │
│   │   └── profile/
│   │       └── ProfileScreen.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Toast.tsx
│   │   │
│   │   ├── practice/
│   │   │   ├── PracticeHeroCard.tsx
│   │   │   ├── RhythmTracker.tsx
│   │   │   └── StreakBadge.tsx
│   │   │
│   │   ├── community/
│   │   │   ├── FriendRow.tsx
│   │   │   └── PostCard.tsx
│   │   │
│   │   └── navigation/
│   │       └── BottomTabBar.tsx
│   │
│   ├── styles/
│   │   ├── tokens.ts               # Design tokens (colors, spacing, typography)
│   │   ├── theme.ts                # Light/dark theme
│   │   └── typography.ts           # Font scale
│   │
│   ├── data/
│   │   ├── mockGatherings.ts       # Gathering data
│   │   ├── mockUsers.ts            # Community members
│   │   └── moonCalendar.ts        # 2024–2026 moon day dates
│   │
│   ├── utils/
│   │   ├── moonDay.ts              # Is today a moon day?
│   │   ├── practiceStreak.ts       # Streak calculation logic
│   │   └── formatDate.ts
│   │
│   └── assets/
│       ├── fonts/                  # DM Serif Display + DM Sans
│       └── icons/                  # SVG icon set
│
└── public/
    └── index.html                  # Web preview (the prototype)
```

---

## Screens & Features

### Onboarding Flow
1. **Splash** — Animated mandala, app logo, "Practice, and all is coming" slogan
2. **Journey** — Philosophy page: what Ashtanga and Sangha mean
3. **Features** — 3-slide tour: Practice tracking / Community / Gatherings
4. **Personalize** — Series, interests, experience level chips
5. **Level** — Beginner → Teacher selector
6. **Notifications** — Moon day alerts, practice reminders
7. **Welcome** — Confetti, community stats counter
8. **Register** — Name / email / password + Google / Apple SSO

### Main App
- **Home** — Today's practice card, weekly rhythm tracker, friends feed
- **Community** — Live practice map, social posts, following
- **Practice** (FAB) — Log practice modal, series selector
- **Explore** — Discover teachers, shalas, practitioners
- **Gatherings** — Browse / filter / book Ashtanga gatherings worldwide

---

## Database Schema (Supabase)

```sql
-- Users
profiles (id, name, avatar_url, series, level, location, streak, created_at)

-- Practice logs
practice_logs (id, user_id, series, duration_min, notes, logged_at)

-- Social
follows (follower_id, following_id)
posts (id, user_id, image_url, caption, location, likes_count, created_at)
likes (post_id, user_id)

-- Gatherings
gatherings (id, title, location, country, start_date, end_date, price_usd, spots_total, spots_left, teacher, description, image_url)
gathering_bookings (id, gathering_id, user_id, status, booked_at)

-- Moon days (static table)
moon_days (date, type) -- 'new_moon' | 'full_moon'
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Open web preview
open public/index.html
```

---

## Environment Variables

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_POSTHOG_KEY=your_posthog_key
```

---

## Design Tokens

All colors, spacing and typography live in `src/styles/tokens.ts`. The palette:

| Token | Value | Usage |
|---|---|---|
| `sky` | `#EEF4FB` | Backgrounds, subtle fills |
| `blue` | `#4A90C4` | Primary actions, links |
| `blue-deep` | `#2C6A96` | Text on light, headers |
| `sage` | `#6B8F71` | Success, nature accents |
| `orange` | `#E8834A` | Streaks, urgent, FAB |
| `ink` | `#1C2B3A` | Primary text |
| `sand` | `#F7F0E6` | Moon day, rest states |

---

## Prototype

The `public/index.html` file is a fully interactive HTML/CSS/JS prototype of the complete app — all screens, onboarding flow, and interactions. Open it in any browser to explore the design without any build step.
