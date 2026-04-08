// src/utils/practiceStreak.ts

import { isMoonDay } from './moonDay';

export interface PracticeLog {
  id: string;
  userId: string;
  loggedAt: string; // ISO date string
  series: string;
  durationMin: number;
  feeling?: string;   // 'strong' | 'steady' | 'challenging' | 'low_energy' | 'blissful'
  notes?: string;
}

/**
 * Calculate current streak from a list of practice logs.
 * In the Ashtanga tradition, rest days are part of the practice:
 *   - Moon days (new moon + full moon) do not break the streak
 *   - Saturdays are the traditional day of rest and do not break the streak
 *   - Each user gets one "Grace Day" per calendar month (a free skip day)
 */
export function calculateStreak(logs: PracticeLog[]): number {
  if (!logs || !Array.isArray(logs) || logs.length === 0) return 0;

  const sorted = [...logs].sort(
    (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
  );

  const practicedDates = new Set(
    sorted.map(l => new Date(l.loggedAt).toISOString().split('T')[0])
  );

  let streak = 0;
  const today = new Date();
  const cursor = new Date(today);
  const graceUsedByMonth = new Set<string>();

  // If today hasn't been practiced yet but the day isn't over, don't penalize.
  const todayStr = today.toISOString().split('T')[0];
  if (!practicedDates.has(todayStr) && !isMoonDay(cursor) && cursor.getDay() !== 6) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const dateStr = cursor.toISOString().split('T')[0];
    const practiced = practicedDates.has(dateStr);
    const moonDay = isMoonDay(cursor);
    const isSaturday = cursor.getDay() === 6;
    const monthKey = `${cursor.getFullYear()}-${cursor.getMonth()}`;

    if (practiced) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else if (moonDay || isSaturday) {
      cursor.setDate(cursor.getDate() - 1);
    } else if (!graceUsedByMonth.has(monthKey)) {
      graceUsedByMonth.add(monthKey);
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
    const isSaturday = date.getDay() === 6;

    let status: 'done' | 'today' | 'rest' | 'empty' | 'future';
    if (isFuture) status = 'future';
    else if (practiced) status = 'done';
    else if (isToday) status = 'today';
    else if (moonRest || isSaturday) status = 'rest';
    else status = 'empty';

    return { date, label: days[i], status };
  });
}
