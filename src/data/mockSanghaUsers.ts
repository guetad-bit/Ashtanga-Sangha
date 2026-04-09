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

export interface MockLiker { name: string; avatar_url: string }

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
  // practice stats
  duration_min?: number;
  poses_done?: number;
  poses_total?: number;
  breath_per_pose?: number;
  status?: 'complete' | 'in_progress';
  progress_label?: string;
  shala?: string;
  likers?: MockLiker[];
}

// Curated anjali-mudra (hands-at-heart) photos.
// Using source.unsplash.com with consistent namaste keywords so every portrait
// shows practitioners in anjali mudra regardless of which id resolves.
const ANJALI = (seed: number, w = 400) =>
  `https://source.unsplash.com/${w}x${w}/?namaste,prayer-hands,yoga&sig=${seed}`;

const PHOTO = (_id: string, w = 600) => ANJALI((w * 7) % 9973, w);
const AV = (seed: number) => ANJALI(seed, 240);

export const MOCK_SANGHA_USERS: MockUser[] = [
  {
    id: 'mock-u-01',
    name: 'Maya Shankar',
    avatar_url: AV(1),
    series: 'full_primary',
    level: 'Intermediate',
    streak: 47,
    bio: 'Mysore every morning. Gratitude in every breath.',
  },
  {
    id: 'mock-u-02',
    name: 'Arjun Patel',
    avatar_url: AV(2),
    series: 'primary',
    level: 'Beginner',
    streak: 12,
    bio: 'New to Ashtanga. Learning to breathe.',
  },
  {
    id: 'mock-u-03',
    name: 'Sofia Moretti',
    avatar_url: AV(3),
    series: 'intermediate',
    level: 'Advanced',
    streak: 183,
    bio: 'Second series. Samasthiti to savasana.',
  },
  {
    id: 'mock-u-04',
    name: 'Daniel Cohen',
    avatar_url: AV(4),
    series: 'full_primary',
    level: 'Intermediate',
    streak: 65,
    bio: 'Tel Aviv shala. Drishti. Tristana. Repeat.',
  },
  {
    id: 'mock-u-05',
    name: 'Priya Iyer',
    avatar_url: AV(5),
    series: 'primary',
    level: 'Intermediate',
    streak: 29,
    bio: 'Mother, teacher, student.',
  },
  {
    id: 'mock-u-06',
    name: 'Lucas Fernandes',
    avatar_url: AV(6),
    series: 'advanced_a',
    level: 'Advanced',
    streak: 321,
    bio: 'Mysore, India — 6 years on the mat.',
  },
  {
    id: 'mock-u-07',
    name: 'Aya Nakamura',
    avatar_url: AV(7),
    series: 'intermediate',
    level: 'Intermediate',
    streak: 88,
    bio: 'Tokyo. Morning practice by the river.',
  },
  {
    id: 'mock-u-08',
    name: 'Noa Levi',
    avatar_url: AV(8),
    series: 'half_primary',
    level: 'Beginner',
    streak: 8,
    bio: 'Just started. One day at a time.',
  },
  {
    id: 'mock-u-09',
    name: 'Rohan Desai',
    avatar_url: AV(9),
    series: 'full_primary',
    level: 'Intermediate',
    streak: 102,
    bio: 'Breath first. Everything else follows.',
  },
  {
    id: 'mock-u-10',
    name: 'Elena Ricci',
    avatar_url: AV(10),
    series: 'primary',
    level: 'Intermediate',
    streak: 54,
    bio: 'Roma. Ashtangi. Tea drinker.',
  },
];

// Helper: minutes ago → ISO timestamp
const mins = (m: number) => new Date(Date.now() - m * 60 * 1000).toISOString();
const hrs = (h: number) => mins(h * 60);

const U = MOCK_SANGHA_USERS;
const liker = (i: number) => ({ name: U[i].name, avatar_url: U[i].avatar_url });

export const MOCK_SANGHA_POSTS: MockPost[] = [
  {
    id: 'mock-p-01',
    user_id: 'mock-u-01',
    caption:
      'First time completing full Primary without assists. Supta Kurmasana finally clicked. Grateful for this practice and this community.',
    image_url: null,
    location: 'Ashtanga Yoga Shala, Mysore',
    shala: 'Mysore Practice',
    likes_count: 34,
    comments_count: 5,
    duration_min: 92,
    poses_done: 42,
    poses_total: 42,
    breath_per_pose: 6.0,
    status: 'complete',
    progress_label: 'Great Practice',
    likers: [liker(9), liker(5), liker(6)],
    created_at: hrs(2),
    profiles: { name: U[0].name, avatar_url: U[0].avatar_url, series: 'full_primary' },
  },
  {
    id: 'mock-p-02',
    user_id: 'mock-u-02',
    caption: 'Focused on hip openers today. Marichyasana D work in progress.',
    image_url: null,
    location: 'Home Studio',
    shala: 'Home Practice',
    likes_count: 8,
    comments_count: 2,
    duration_min: 52,
    poses_done: 24,
    poses_total: 42,
    breath_per_pose: 5.5,
    status: 'in_progress',
    progress_label: 'Keep going',
    likers: [liker(0), liker(3)],
    created_at: hrs(4),
    profiles: { name: U[1].name, avatar_url: U[1].avatar_url, series: 'half_primary' },
  },
  {
    id: 'mock-p-03',
    user_id: 'mock-u-06',
    caption:
      'Day 321. Stepped on the mat stiff and tired. By the third sun salutation I remembered why.',
    image_url: PHOTO('photo-1506629082955-511b1aa562c8'),
    location: 'Mysore, IN',
    shala: 'Shala Practice',
    likes_count: 112,
    comments_count: 28,
    duration_min: 105,
    poses_done: 56,
    poses_total: 56,
    breath_per_pose: 6.5,
    status: 'complete',
    progress_label: 'Strong Practice',
    likers: [liker(0), liker(2), liker(6)],
    created_at: hrs(6),
    profiles: { name: U[5].name, avatar_url: U[5].avatar_url, series: 'advanced_a' },
  },
  {
    id: 'mock-p-04',
    user_id: 'mock-u-03',
    caption:
      'Kapotasana today. Heart open, fear dissolving breath by breath. This is why we come back.',
    image_url: PHOTO('photo-1575052814086-f385e2e2ad1b'),
    location: 'Milano, IT',
    shala: 'Led Class',
    likes_count: 58,
    comments_count: 14,
    duration_min: 88,
    poses_done: 48,
    poses_total: 48,
    breath_per_pose: 5.8,
    status: 'complete',
    progress_label: 'Great Practice',
    likers: [liker(0), liker(9), liker(3)],
    created_at: hrs(9),
    profiles: { name: U[2].name, avatar_url: U[2].avatar_url, series: 'intermediate' },
  },
  {
    id: 'mock-p-05',
    user_id: 'mock-u-04',
    caption:
      'Moon day rest. Walked along the sea instead. The practice continues off the mat.',
    image_url: null,
    location: 'Tel Aviv, IL',
    shala: 'Rest Day',
    likes_count: 33,
    comments_count: 5,
    likers: [liker(7), liker(0)],
    created_at: hrs(12),
    profiles: { name: U[3].name, avatar_url: U[3].avatar_url, series: 'full_primary' },
  },
  {
    id: 'mock-p-06',
    user_id: 'mock-u-07',
    caption:
      '6am by the Sumida river. City still asleep, breath steady. Favorite hour of the day.',
    image_url: PHOTO('photo-1552196563-55cd4e45efb3'),
    location: 'Tokyo, JP',
    shala: 'Outdoor Practice',
    likes_count: 76,
    comments_count: 9,
    duration_min: 68,
    poses_done: 42,
    poses_total: 42,
    breath_per_pose: 5.2,
    status: 'complete',
    progress_label: 'Steady Practice',
    likers: [liker(2), liker(5), liker(0)],
    created_at: hrs(14),
    profiles: { name: U[6].name, avatar_url: U[6].avatar_url, series: 'intermediate' },
  },
  {
    id: 'mock-p-07',
    user_id: 'mock-u-05',
    caption:
      'Practiced with my daughter watching from the corner. She folded her hands at her heart and bowed. My biggest teacher is two years old.',
    image_url: PHOTO('photo-1599447421416-3414500d18a5'),
    location: 'Chennai, IN',
    shala: 'Home Practice',
    likes_count: 94,
    comments_count: 22,
    duration_min: 74,
    poses_done: 38,
    poses_total: 42,
    breath_per_pose: 5.0,
    status: 'in_progress',
    progress_label: 'Almost there',
    likers: [liker(0), liker(2), liker(6)],
    created_at: hrs(18),
    profiles: { name: U[4].name, avatar_url: U[4].avatar_url, series: 'primary' },
  },
  {
    id: 'mock-p-08',
    user_id: 'mock-u-09',
    caption: 'Navasana x5 broke me today. Core is fire. Mind is quiet. Grateful.',
    image_url: null,
    location: 'Pune, IN',
    shala: 'Mysore Practice',
    likes_count: 47,
    comments_count: 8,
    duration_min: 84,
    poses_done: 42,
    poses_total: 42,
    breath_per_pose: 5.7,
    status: 'complete',
    progress_label: 'Great Practice',
    likers: [liker(5), liker(0)],
    created_at: hrs(22),
    profiles: { name: U[8].name, avatar_url: U[8].avatar_url, series: 'full_primary' },
  },
  {
    id: 'mock-p-09',
    user_id: 'mock-u-08',
    caption:
      'Eight days in a row. Never thought I\'d say that. Thank you, sangha, for the quiet encouragement.',
    image_url: null,
    location: 'Jerusalem, IL',
    shala: 'Home Practice',
    likes_count: 62,
    comments_count: 18,
    duration_min: 35,
    poses_done: 14,
    poses_total: 42,
    breath_per_pose: 5.0,
    status: 'in_progress',
    progress_label: 'Keep going',
    likers: [liker(3), liker(0), liker(2)],
    created_at: hrs(26),
    profiles: { name: U[7].name, avatar_url: U[7].avatar_url, series: 'half_primary' },
  },
  {
    id: 'mock-p-10',
    user_id: 'mock-u-10',
    caption:
      'Savasana felt like an ocean today. No thoughts, no body, just breath. Roma mornings.',
    image_url: PHOTO('photo-1544367567-0f2fcb009e0b'),
    location: 'Roma, IT',
    shala: 'Led Class',
    likes_count: 38,
    comments_count: 7,
    duration_min: 78,
    poses_done: 42,
    poses_total: 42,
    breath_per_pose: 5.5,
    status: 'complete',
    progress_label: 'Great Practice',
    likers: [liker(2), liker(0), liker(6)],
    created_at: hrs(30),
    profiles: { name: U[9].name, avatar_url: U[9].avatar_url, series: 'primary' },
  },
];

// "Practitioners Near You" — with distances
export const MOCK_NEAR_YOU = [
  { id: 'mock-u-07', name: 'Mika Tanaka', avatar_url: AV(11), series: 'primary', level: 'Intermediate', streak: 42, distance_km: 2.3 },
  { id: 'mock-u-11', name: 'Ravi Sharma', avatar_url: AV(12), series: 'intermediate', level: 'Intermediate', streak: 18, distance_km: 4.1 },
  { id: 'mock-u-12', name: 'Lisa Wong',  avatar_url: AV(13), series: 'primary', level: 'Beginner',    streak: 7,  distance_km: 5.6 },
  { id: 'mock-u-13', name: 'Ben Yosef',  avatar_url: AV(14), series: 'half_primary', level: 'Beginner', streak: 11, distance_km: 6.8 },
  { id: 'mock-u-14', name: 'Chiara Rossi', avatar_url: AV(15), series: 'full_primary', level: 'Intermediate', streak: 94, distance_km: 8.2 },
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
