// src/data/mockUsers.ts

export interface MockUser {
  id: string;
  name: string;
  avatarUrl: string;
  series: 'primary' | 'intermediate' | 'advanced_a';
  level: 'beginner' | 'regular' | 'intermediate' | 'advanced' | 'teacher';
  location: string;
  streak: number;
  bio: string;
  practicingSince: number;
  isFollowing: boolean;
  lastPractice?: string; // ISO date
}

export interface MockPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  imageUrl?: string;
  caption: string;
  location?: string;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  tags: string[];
}

export const mockUsers: MockUser[] = [
  {
    id: 'u1',
    name: 'Sara Johansson',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&crop=face',
    series: 'intermediate',
    level: 'advanced',
    location: 'Stockholm, Sweden',
    streak: 42,
    bio: 'Devoted practitioner since 2015. Second series and loving the journey.',
    practicingSince: 2015,
    isFollowing: true,
    lastPractice: new Date().toISOString(),
  },
  {
    id: 'u2',
    name: 'Priya Nair',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face',
    series: 'primary',
    level: 'regular',
    location: 'Mysore, India',
    streak: 108,
    bio: 'Born in the birthplace of Ashtanga. Practice is my prayer.',
    practicingSince: 2012,
    isFollowing: true,
    lastPractice: new Date().toISOString(),
  },
  {
    id: 'u3',
    name: 'Alex Chen',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face',
    series: 'primary',
    level: 'intermediate',
    location: 'San Francisco, CA',
    streak: 21,
    bio: 'Tech worker finding balance on the mat. Primary series journey.',
    practicingSince: 2020,
    isFollowing: true,
    lastPractice: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'u4',
    name: 'Lucia Fernández',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face',
    series: 'intermediate',
    level: 'teacher',
    location: 'Barcelona, Spain',
    streak: 365,
    bio: 'Authorized Level 2 teacher. Sharing the practice with love.',
    practicingSince: 2008,
    isFollowing: false,
    lastPractice: new Date().toISOString(),
  },
  {
    id: 'u5',
    name: 'Kenji Tanaka',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
    series: 'primary',
    level: 'beginner',
    location: 'Tokyo, Japan',
    streak: 7,
    bio: 'Just starting this beautiful practice. One breath at a time.',
    practicingSince: 2025,
    isFollowing: false,
  },
  {
    id: 'u6',
    name: 'Amara Okafor',
    avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&h=120&fit=crop&crop=face',
    series: 'advanced_a',
    level: 'advanced',
    location: 'London, UK',
    streak: 88,
    bio: 'Third series practitioner. Breath by breath, day by day.',
    practicingSince: 2011,
    isFollowing: true,
    lastPractice: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const mockPosts: MockPost[] = [
  {
    id: 'p1',
    userId: 'u1',
    userName: 'Sara Johansson',
    userAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&crop=face',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80',
    caption: 'Morning practice in the golden light. There is nothing like the stillness of a 5am Mysore room.',
    location: 'Stockholm, Sweden',
    likesCount: 34,
    isLiked: true,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    tags: ['#morningpractice', '#ashtangayoga'],
  },
  {
    id: 'p2',
    userId: 'u2',
    userName: 'Priya Nair',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face',
    caption: '108 day streak today! The practice does not get easier — you just get more present. Grateful for this sangha.',
    likesCount: 67,
    isLiked: false,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    tags: ['#108days', '#ashtangasangha', '#streak'],
  },
  {
    id: 'p3',
    userId: 'u4',
    userName: 'Lucia Fernández',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face',
    imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&q=80',
    caption: 'Led class this morning with a full room. The energy when 30 people breathe together is electric.',
    location: 'Barcelona, Spain',
    likesCount: 89,
    isLiked: false,
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    tags: ['#ledclass', '#teacherlife', '#ashtangabarcelona'],
  },
  {
    id: 'p4',
    userId: 'u6',
    userName: 'Amara Okafor',
    userAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&h=120&fit=crop&crop=face',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    caption: 'Preparing for the Tuscany gathering. Who else is coming? Cannot wait to share the mat with all of you.',
    location: 'London, UK',
    likesCount: 52,
    isLiked: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    tags: ['#tuscanygathering', '#ashtangasangha'],
  },
  {
    id: 'p5',
    userId: 'u3',
    userName: 'Alex Chen',
    userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face',
    caption: 'Moon day rest. Taking the time to study the yoga sutras and just breathe. Sometimes the practice off the mat is just as important.',
    likesCount: 23,
    isLiked: false,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    tags: ['#moonday', '#rest', '#yogasutras'],
  },
];
