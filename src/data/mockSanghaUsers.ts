/**
 * Mock sangha practitioners — seeded fake users with anjali-mudra style avatars
 * and sample posts. Merged into the feed & "on the mat" list so the app feels
 * alive before real community grows.
 */

export interface MockUser {
  id: string;
  name: string;
  avatar_url: string;
  series: string;
  level: string;
  streak: number;
  bio?: string;
}

export interface MockPost {
  id: string;
  user_id: string;
  caption: string;
  image_url: string | null;
  location: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: { name: string; avatar_url: string | null; series?: string | null } | null;
}

// Unsplash photos — hands at heart / anjali mudra / meditation
const PHOTO = (id: string, w = 600) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

const AV = (id: string) => PHOTO(id, 200);

export const MOCK_SANGHA_USERS: MockUser[] = [
  {
    id: 'mock-u-01',
    name: 'Maya Shankar',
    avatar_url: AV('photo-1545389336-cf090694435e'),
    series: 'full_primary',
    level: 'Intermediate',
    streak: 47,
    bio: 'Mysore every morning. Gratitude in every breath.',
  },
  {
    id: 'mock-u-02',
    name: 'Arjun Patel',
    avatar_url: AV('photo-1506794778202-cad84cf45f1d'),
    series: 'primary',
    level: 'Beginner',
    streak: 12,
    bio: 'New to Ashtanga. Learning to breathe.',
  },
  {
    id: 'mock-u-03',
    name: 'Sofia Moretti',
    avatar_url: AV('photo-1438761681033-6461ffad8d80'),
    series: 'intermediate',
    level: 'Advanced',
    streak: 183,
    bio: 'Second series. Samasthiti to savasana.',
  },
  {
    id: 'mock-u-04',
    name: 'Daniel Cohen',
    avatar_url: AV('photo-1500648767791-00dcc994a43e'),
    series: 'full_primary',
    level: 'Intermediate',
    streak: 65,
    bio: 'Tel Aviv shala. Drishti. Tristana. Repeat.',
  },
  {
    id: 'mock-u-05',
    name: 'Priya Iyer',
    avatar_url: AV('photo-1544005313-94ddf0286df2'),
    series: 'primary',
    level: 'Intermediate',
    streak: 29,
    bio: 'Mother, teacher, student.',
  },
  {
    id: 'mock-u-06',
    name: 'Lucas Fernandes',
    avatar_url: AV('photo-1521119989659-a83eee488004'),
    series: 'advanced_a',
    level: 'Advanced',
    streak: 321,
    bio: 'Mysore, India — 6 years on the mat.',
  },
  {
    id: 'mock-u-07',
    name: 'Aya Nakamura',
    avatar_url: AV('photo-1531123897727-8f129e1688ce'),
    series: 'intermediate',
    level: 'Intermediate',
    streak: 88,
    bio: 'Tokyo. Morning practice by the river.',
  },
  {
    id: 'mock-u-08',
    name: 'Noa Levi',
    avatar_url: AV('photo-1534528741775-53994a69daeb'),
    series: 'half_primary',
    level: 'Beginner',
    streak: 8,
    bio: 'Just started. One day at a time.',
  },
  {
    id: 'mock-u-09',
    name: 'Rohan Desai',
    avatar_url: AV('photo-1507003211169-0a1dd7228f2d'),
    series: 'full_primary',
    level: 'Intermediate',
    streak: 102,
    bio: 'Breath first. Everything else follows.',
  },
  {
    id: 'mock-u-10',
    name: 'Elena Ricci',
    avatar_url: AV('photo-1488426862026-3ee34a7d66df'),
    series: 'primary',
    level: 'Intermediate',
    streak: 54,
    bio: 'Roma. Ashtangi. Tea drinker.',
  },
];

// Helper: minutes ago → ISO timestamp
const mins = (m: number) => new Date(Date.now() - m * 60 * 1000).toISOString();
const hrs = (h: number) => mins(h * 60);

export const MOCK_SANGHA_POSTS: MockPost[] = [
  {
    id: 'mock-p-01',
    user_id: 'mock-u-01',
    caption:
      'Finished full primary this morning. Marichyasana D finally landed — not from force, from patience. Eight months of waiting for the bind. Practice, and all is coming.',
    image_url: PHOTO('photo-1506126613408-eca07ce68773'),
    location: 'Bengaluru, IN',
    likes_count: 24,
    comments_count: 6,
    created_at: mins(18),
    profiles: { name: MOCK_SANGHA_USERS[0].name, avatar_url: MOCK_SANGHA_USERS[0].avatar_url, series: 'full_primary' },
  },
  {
    id: 'mock-p-02',
    user_id: 'mock-u-03',
    caption:
      'Kapotasana today. Heart open, fear dissolving breath by breath. The room was silent except for ujjayi. This is why we come back.',
    image_url: PHOTO('photo-1575052814086-f385e2e2ad1b'),
    location: 'Milano, IT',
    likes_count: 58,
    comments_count: 14,
    created_at: hrs(2),
    profiles: { name: MOCK_SANGHA_USERS[2].name, avatar_url: MOCK_SANGHA_USERS[2].avatar_url, series: 'intermediate' },
  },
  {
    id: 'mock-p-03',
    user_id: 'mock-u-06',
    caption:
      'Day 321. Woke up stiff, tired, questioning. Stepped on the mat anyway. By the third sun salutation I remembered why. 🙏',
    image_url: PHOTO('photo-1506629082955-511b1aa562c8'),
    location: 'Mysore, IN',
    likes_count: 112,
    comments_count: 28,
    created_at: hrs(4),
    profiles: { name: MOCK_SANGHA_USERS[5].name, avatar_url: MOCK_SANGHA_USERS[5].avatar_url, series: 'advanced_a' },
  },
  {
    id: 'mock-p-04',
    user_id: 'mock-u-02',
    caption:
      'Week three of Ashtanga. Still can\'t touch my toes in paschimottanasana but I showed up six days this week. That counts, right?',
    image_url: null,
    location: 'Mumbai, IN',
    likes_count: 41,
    comments_count: 12,
    created_at: hrs(6),
    profiles: { name: MOCK_SANGHA_USERS[1].name, avatar_url: MOCK_SANGHA_USERS[1].avatar_url, series: 'primary' },
  },
  {
    id: 'mock-p-05',
    user_id: 'mock-u-04',
    caption:
      'Moon day rest. Took a long walk along the sea instead. The practice continues off the mat.',
    image_url: PHOTO('photo-1593810450967-f9c42742e326'),
    location: 'Tel Aviv, IL',
    likes_count: 33,
    comments_count: 5,
    created_at: hrs(9),
    profiles: { name: MOCK_SANGHA_USERS[3].name, avatar_url: MOCK_SANGHA_USERS[3].avatar_url, series: 'full_primary' },
  },
  {
    id: 'mock-p-06',
    user_id: 'mock-u-07',
    caption:
      '6am by the Sumida river. The city still asleep, the breath steady. This is my favorite hour.',
    image_url: PHOTO('photo-1552196563-55cd4e45efb3'),
    location: 'Tokyo, JP',
    likes_count: 76,
    comments_count: 9,
    created_at: hrs(11),
    profiles: { name: MOCK_SANGHA_USERS[6].name, avatar_url: MOCK_SANGHA_USERS[6].avatar_url, series: 'intermediate' },
  },
  {
    id: 'mock-p-07',
    user_id: 'mock-u-05',
    caption:
      'Practiced with my daughter watching from the corner of the mat today. She folded her hands at her heart and bowed. My biggest teacher is two years old.',
    image_url: PHOTO('photo-1599447421416-3414500d18a5'),
    location: 'Chennai, IN',
    likes_count: 94,
    comments_count: 22,
    created_at: hrs(14),
    profiles: { name: MOCK_SANGHA_USERS[4].name, avatar_url: MOCK_SANGHA_USERS[4].avatar_url, series: 'primary' },
  },
  {
    id: 'mock-p-08',
    user_id: 'mock-u-09',
    caption:
      'Navasana x5 broke me today. Core is fire. Mind is quiet. Grateful.',
    image_url: PHOTO('photo-1588286840104-8457f03c87a8'),
    location: 'Pune, IN',
    likes_count: 47,
    comments_count: 8,
    created_at: hrs(18),
    profiles: { name: MOCK_SANGHA_USERS[8].name, avatar_url: MOCK_SANGHA_USERS[8].avatar_url, series: 'full_primary' },
  },
  {
    id: 'mock-p-09',
    user_id: 'mock-u-08',
    caption:
      'Eight days in a row. Never thought I\'d say that about anything. Thank you to this sangha for the quiet encouragement.',
    image_url: null,
    location: 'Jerusalem, IL',
    likes_count: 62,
    comments_count: 18,
    created_at: hrs(22),
    profiles: { name: MOCK_SANGHA_USERS[7].name, avatar_url: MOCK_SANGHA_USERS[7].avatar_url, series: 'half_primary' },
  },
  {
    id: 'mock-p-10',
    user_id: 'mock-u-10',
    caption:
      'Savasana felt like an ocean today. No thoughts, no body, just breath. Then the bells of the church nearby pulled me back. Roma mornings.',
    image_url: PHOTO('photo-1544367567-0f2fcb009e0b'),
    location: 'Roma, IT',
    likes_count: 38,
    comments_count: 7,
    created_at: hrs(26),
    profiles: { name: MOCK_SANGHA_USERS[9].name, avatar_url: MOCK_SANGHA_USERS[9].avatar_url, series: 'primary' },
  },
];

// "On the mat right now" — subset currently practicing
export const MOCK_PRACTICING_NOW = [
  { id: 'mock-u-01', name: MOCK_SANGHA_USERS[0].name, avatar_url: MOCK_SANGHA_USERS[0].avatar_url, series: 'full_primary', level: 'Intermediate', streak: 47, practicing_started_at: mins(12) },
  { id: 'mock-u-03', name: MOCK_SANGHA_USERS[2].name, avatar_url: MOCK_SANGHA_USERS[2].avatar_url, series: 'intermediate', level: 'Advanced', streak: 183, practicing_started_at: mins(34) },
  { id: 'mock-u-06', name: MOCK_SANGHA_USERS[5].name, avatar_url: MOCK_SANGHA_USERS[5].avatar_url, series: 'advanced_a', level: 'Advanced', streak: 321, practicing_started_at: mins(8) },
  { id: 'mock-u-07', name: MOCK_SANGHA_USERS[6].name, avatar_url: MOCK_SANGHA_USERS[6].avatar_url, series: 'intermediate', level: 'Intermediate', streak: 88, practicing_started_at: mins(45) },
  { id: 'mock-u-09', name: MOCK_SANGHA_USERS[8].name, avatar_url: MOCK_SANGHA_USERS[8].avatar_url, series: 'full_primary', level: 'Intermediate', streak: 102, practicing_started_at: mins(22) },
  { id: 'mock-u-10', name: MOCK_SANGHA_USERS[9].name, avatar_url: MOCK_SANGHA_USERS[9].avatar_url, series: 'primary', level: 'Intermediate', streak: 54, practicing_started_at: mins(60) },
];
