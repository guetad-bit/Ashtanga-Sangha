// src/data/mockGatherings.ts

export interface Attendee {
  id: string;
  img: string;
  name: string;
  location?: string;
  series?: string;
  level?: string;
  bio?: string;
  practiceYears?: number;
  mutualFriends?: number;
}

export interface Gathering {
  id: string;
  title: string;
  location: string;
  country: string;
  region: 'europe' | 'india' | 'bali' | 'greece' | 'japan';
  startDate: string;
  endDate: string;
  days: number;
  priceUsd: number;
  spotsTotal: number;
  spotsLeft: number;
  teacher: string;
  teacherTitle: string;
  description: string;
  imageUrl: string;
  tags: string[];
  highlights: string[];
  itinerary: { day: string; title: string; detail: string; tag?: string }[];
  social: {
    count: number;
    going: Attendee[];
    posts: {
      user: string;
      userImg: string;
      loc: string;
      time: string;
      img: string;
      caption: string;
      tags: string[];
      likes: number;
    }[];
  };
}

export const gatherings: Gathering[] = [
  {
    id: 'tuscany-2025',
    title: 'Tuscany Hills',
    location: 'Val d\'Orcia, Tuscany',
    country: 'Italy',
    region: 'europe',
    startDate: '2025-07-10',
    endDate: '2025-07-17',
    days: 8,
    priceUsd: 1650,
    spotsTotal: 20,
    spotsLeft: 3,
    teacher: 'Marco Rossi',
    teacherTitle: 'Authorized Level 2',
    description: 'Immerse yourself in the hills of Tuscany for an unforgettable 8-day Ashtanga gathering. Practice twice daily in an open-air shala overlooking rolling vineyards, guided by senior authorized teacher Marco Rossi. Evenings are for rest, reflection, and farm-to-table meals sourced from the property.',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    tags: ['Europe', 'Intermediate+', 'All inclusive'],
    highlights: [
      'Twice-daily Mysore practice in open-air shala',
      'Farm-to-table organic meals included',
      'Evening pranayama and philosophy talks',
      'Vineyard walks and Siena day trip',
    ],
    itinerary: [
      { day: 'Day 1', title: 'Arrival & Welcome', detail: 'Transfer from Florence, welcome dinner, orientation', tag: 'Travel' },
      { day: 'Day 2–7', title: 'Daily Practice', detail: '6:00 AM Mysore · 8:30 AM breakfast · free afternoons · 5:00 PM pranayama', tag: 'Practice' },
      { day: 'Day 7', title: 'Siena Excursion', detail: 'Morning practice, afternoon in Siena old town', tag: 'Excursion' },
      { day: 'Day 8', title: 'Closing & Departure', detail: 'Final practice, closing ceremony, airport transfers', tag: 'Closing' },
    ],
    social: {
      count: 18,
      going: [
        { id: 'sara-1', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&crop=face', name: 'Sara Müller', location: 'Berlin, Germany', series: 'Intermediate', level: 'Advanced', bio: 'Daily practitioner for 8 years. Love connecting with the global sangha.', practiceYears: 8, mutualFriends: 3 },
        { id: 'priya-1', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face', name: 'Priya Sharma', location: 'Mumbai, India', series: 'Primary', level: 'Intermediate', bio: 'Mysore practitioner. Returning to Tuscany for my second year!', practiceYears: 5, mutualFriends: 1 },
        { id: 'alex-1', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face', name: 'Alex Petrov', location: 'London, UK', series: 'Primary', level: 'Regular', bio: 'First retreat — excited to deepen my practice in community.', practiceYears: 2, mutualFriends: 0 },
        { id: 'lucia-1', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=face', name: 'Lucia Romano', location: 'Rome, Italy', series: 'Primary', level: 'Intermediate', bio: 'Yoga teacher and eternal student. Can\'t wait for the Tuscan sunrises.', practiceYears: 6, mutualFriends: 2 },
        { id: 'tom-1', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face', name: 'Tom Nielsen', location: 'Copenhagen, Denmark', series: 'Intermediate', level: 'Advanced', bio: 'Practicing since my first trip to Mysore in 2015.', practiceYears: 10, mutualFriends: 4 },
        { id: 'yuki-1', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face', name: 'Yuki Tanaka', location: 'Tokyo, Japan', series: 'Primary', level: 'Regular', bio: 'Weekend practitioner looking to go deeper.', practiceYears: 3, mutualFriends: 0 },
        { id: 'maya-1', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face', name: 'Maya Chen', location: 'San Francisco, USA', series: 'Intermediate', level: 'Advanced', bio: 'Authorized teacher. Love gathering with fellow practitioners.', practiceYears: 12, mutualFriends: 5 },
        { id: 'omar-1', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face', name: 'Omar Hassan', location: 'Barcelona, Spain', series: 'Primary', level: 'Intermediate', bio: 'Ashtanga brought stillness to my life. See you on the mat.', practiceYears: 4, mutualFriends: 1 },
      ],
      posts: [
        {
          user: 'sara.mysore',
          userImg: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=60&h=60&fit=crop&crop=face',
          loc: 'Tuscany, Italy',
          time: '2 days ago',
          img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
          caption: 'Counting down to Tuscany. Last year\'s gathering changed everything for me 🌅',
          tags: ['#tuscanygathering', '#ashtangasangha'],
          likes: 47,
        },
      ],
    },
  },
  {
    id: 'mysore-2025',
    title: 'Mysore at the Source',
    location: 'Gokulam, Mysore',
    country: 'India',
    region: 'india',
    startDate: '2025-09-01',
    endDate: '2025-09-29',
    days: 28,
    priceUsd: 2200,
    spotsTotal: 15,
    spotsLeft: 7,
    teacher: 'Sharath Jois',
    teacherTitle: 'Director, KPJAYI',
    description: 'Study at the source. A full month in Gokulam, Mysore — the birthplace of the modern Ashtanga tradition. Daily Mysore-style practice at KPJAYI with Sharath Jois, philosophy lectures, and deep immersion in the lineage.',
    imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80',
    tags: ['India', 'All levels', 'Lineage'],
    highlights: [
      'Daily Mysore practice at KPJAYI',
      'Weekly philosophy lectures',
      'Led class every Friday',
      'Accommodation in Gokulam arranged',
    ],
    itinerary: [],
    social: {
      count: 12,
      going: [
        { id: 'alex-1', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face', name: 'Alex Petrov', location: 'London, UK', series: 'Primary', level: 'Regular', practiceYears: 2 },
        { id: 'maya-1', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face', name: 'Maya Chen', location: 'San Francisco, USA', series: 'Intermediate', level: 'Advanced', practiceYears: 12, mutualFriends: 5 },
        { id: 'tom-1', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face', name: 'Tom Nielsen', location: 'Copenhagen, Denmark', series: 'Intermediate', level: 'Advanced', practiceYears: 10 },
      ],
      posts: [],
    },
  },
  {
    id: 'ubud-2025',
    title: 'Ubud Forest',
    location: 'Ubud, Bali',
    country: 'Indonesia',
    region: 'bali',
    startDate: '2025-11-03',
    endDate: '2025-11-10',
    days: 7,
    priceUsd: 1450,
    spotsTotal: 18,
    spotsLeft: 5,
    teacher: 'Wayan Suteja',
    teacherTitle: 'Certified Teacher',
    description: 'Seven days of deep practice in the heart of Bali\'s sacred forest. Twice-daily Ashtanga in a bamboo shala, with evenings for sound healing, sacred temple visits, and community dinners.',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    tags: ['Bali', 'All levels', 'Nature'],
    highlights: [],
    itinerary: [],
    social: {
      count: 9,
      going: [
        { id: 'sara-1', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&crop=face', name: 'Sara Müller', location: 'Berlin, Germany', series: 'Intermediate', level: 'Advanced', practiceYears: 8, mutualFriends: 3 },
        { id: 'priya-1', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face', name: 'Priya Sharma', location: 'Mumbai, India', series: 'Primary', level: 'Intermediate', practiceYears: 5 },
      ],
      posts: [],
    },
  },
];
