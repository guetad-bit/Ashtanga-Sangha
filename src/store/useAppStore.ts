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

  // UI
  activeTab: 'home' | 'community' | 'practice' | 'explore' | 'gatherings';
  isLogModalOpen: boolean;
  isPracticing: boolean;
  practicingStartedAt: string | null;

  // Actions
  setOnboarded: (v: boolean) => void;
  setUser: (user: UserProfile) => void;
  clearUser: () => void;
  addPracticeLog: (log: PracticeLog) => void;
  setPracticeLogs: (logs: PracticeLog[]) => void;
  updatePracticeLog: (id: string, changes: Partial<PracticeLog>) => void;
  removePracticeLog: (id: string) => void;
  addUserPost: (post: UserPost) => void;
  setActiveTab: (tab: AppState['activeTab']) => void;
  setLogModalOpen: (v: boolean) => void;
  setIsPracticing: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOnboarded: false,
  isAuthenticated: false,
  user: null,
  practiceLogs: [],
  currentStreak: 0,
  userPosts: [],
  activeTab: 'home',
  isLogModalOpen: false,
  isPracticing: false,
  practicingStartedAt: null,

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

  setActiveTab: (tab) => set({ activeTab: tab }),

  setLogModalOpen: (v) => set({ isLogModalOpen: v }),

  setIsPracticing: (v) => set({
    isPracticing: v,
    practicingStartedAt: v ? new Date().toISOString() : null,
  }),
}));
