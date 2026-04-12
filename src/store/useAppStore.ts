// src/store/useAppStore.ts
import { create } from 'zustand';
import type { PracticeLog } from '@/utils/practiceStreak';

export interface UserPost {
  id: string;
  userName: string;
  userAvatar: string | null;
  imageUri?: string;
  caption: string;
  location?: string;
  tags: string[];
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
}

export type Series = 'primary' | 'intermediate' | 'advanced_a' | 'advanced_b' | 'sun_sals' | 'short';
export type Level = 'beginner' | 'regular' | 'intermediate' | 'advanced' | 'teacher';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  series: Series;
  level: Level;
  location?: string;
  bio?: string;
  practicingSince?: number; // year
  teacher?: string;
}

export interface BookedGathering {
  gatheringId: string;
  title: string;
  date: string;        // ISO or display string
  location: string;
  type: string;
  guideName: string;
  bookedAt: string;    // ISO timestamp
}

interface AppState {
  // Auth
  isOnboarded: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null;

  // Practice
  practiceLogs: PracticeLog[];
  currentStreak: number;

  // Posts
  userPosts: UserPost[];

  // Bookings
  bookedGatherings: BookedGathering[];

  // UI
  activeTab: 'home' | 'community' | 'practice' | 'explore' | 'gatherings';
  isLogModalOpen: boolean;
  isPracticing: boolean;
  practicingStartedAt: string | null;
  language: 'en' | 'he';

  // Actions
  setOnboarded: (v: boolean) => void;
  setUser: (user: UserProfile) => void;
  clearUser: () => void;
  addPracticeLog: (log: PracticeLog) => void;
  setPracticeLogs: (logs: PracticeLog[]) => void;
  updatePracticeLog: (id: string, changes: Partial<PracticeLog>) => void;
  removePracticeLog: (id: string) => void;
  addUserPost: (post: UserPost) => void;
  addBooking: (booking: BookedGathering) => void;
  removeBooking: (gatheringId: string) => void;
  setActiveTab: (tab: AppState['activeTab']) => void;
  setLogModalOpen: (v: boolean) => void;
  setIsPracticing: (v: boolean) => void;
  setLanguage: (lang: 'en' | 'he') => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOnboarded: false,
  isAuthenticated: false,
  user: null,
  practiceLogs: [],
  currentStreak: 0,
  userPosts: [],
  bookedGatherings: [],
  activeTab: 'home',
  isLogModalOpen: false,
  isPracticing: false,
  practicingStartedAt: null,
  language: 'he',

  setOnboarded: (v) => set({ isOnboarded: v }),

  setUser: (user) => set({ user, isAuthenticated: true }),

  clearUser: () => set({ user: null, isAuthenticated: false, isOnboarded: false }),

  addPracticeLog: (log) =>
    set((state) => ({
      practiceLogs: [log, ...state.practiceLogs],
      currentStreak: state.currentStreak + 1,
    })),

  setPracticeLogs: (logs) => set({ practiceLogs: logs }),

  updatePracticeLog: (id, changes) =>
    set((state) => ({
      practiceLogs: state.practiceLogs.map((l) =>
        l.id === id ? { ...l, ...changes } : l
      ),
    })),

  removePracticeLog: (id) =>
    set((state) => ({
      practiceLogs: state.practiceLogs.filter((l) => l.id !== id),
    })),

  addUserPost: (post) =>
    set((state) => ({ userPosts: [post, ...state.userPosts] })),

  addBooking: (booking) =>
    set((state) => ({
      bookedGatherings: [...state.bookedGatherings, booking],
    })),

  removeBooking: (gatheringId) =>
    set((state) => ({
      bookedGatherings: state.bookedGatherings.filter((b) => b.gatheringId !== gatheringId),
    })),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setLogModalOpen: (v) => set({ isLogModalOpen: v }),

  setIsPracticing: (v) => set({
    isPracticing: v,
    practicingStartedAt: v ? new Date().toISOString() : null,
  }),

  setLanguage: (lang) => set({ language: lang }),
}));
