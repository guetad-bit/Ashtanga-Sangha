// src/utils/practiceStreak.ts

import { isMoonDay } from './moonDay';

export interface PracticeLog {
  id: string;
  userId: string;
  loggedAt: string; // ISO date string
  series: string;
  durationMin: number;
}

/**
 * Calculate current streak from a list of practice logs.
 * Moon days don't break the streak â they are valid rest days.
 */
export function calculateStreak(logs: PracticeLog[]): number {
  if (!logs || !Array.isArray(logs) || logs.length === 0) return 0;

  // Sort descending by date
  const sorted = [...logs].sort(
    (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
  );

  const practicedDates = new Set(
    sorted.map(l => new Date(l.loggedAt).toISOString().split('T')[0])
  );

  let streak = 0;
  const today = new Date();
  const cursor = new Date(today);

  while (true) {
    const dateStr = cursor.toISOString().split('T')[0];
    const practiced = practicedDates.has(dateStr);
    const moonDay = isMoonDay(cursor);

    if (practiced || moonDay) {
      if (practiced) streak++;
      // Move to previous day
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Returns the 7 days of the current week with practice status.
 */
export function getWeeklyRhythm(logs: PracticeLog[]): {
  date: Date;
  label: string;
  status: 'done' | 'today' | 'rest' | 'empty' | 'future';
}[] {
  const safeLogs = logs && Array.isArray(logs) ? logs : [];
  const practicedDates = new Set(
    safeLogs.map(l => new Date(l.loggedAt).toISOString().split('T')[0])
  );

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    const isFuture = dateStr > todayStr;
    const isToday = dateStr === todayStr;
    const practiced = practicedDates.has(dateStr);
    const moonRest = isMoonDay(date);

    let status: 'done' | 'today' | 'rest' | 'empty' | 'future';
    if (isFuture) status = 'future';
    else if (isToday) status = 'today';
    else if (practiced) status = 'done';
    else if (moonRest) status = 'rest';
    else status = 'empty';

    return { date, label: days[i], status };
  });
}
