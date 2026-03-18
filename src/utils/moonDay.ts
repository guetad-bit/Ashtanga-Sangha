// src/utils/moonDay.ts
// Ashtanga practitioners rest on new moon and full moon days

const MOON_DAYS_2025_2026: string[] = [
  // 2025 Full moons
  '2025-01-13', '2025-02-12', '2025-03-14', '2025-04-13',
  '2025-05-12', '2025-06-11', '2025-07-10', '2025-08-09',
  '2025-09-07', '2025-10-07', '2025-11-05', '2025-12-04',
  // 2025 New moons
  '2025-01-29', '2025-02-28', '2025-03-29', '2025-04-27',
  '2025-05-27', '2025-06-25', '2025-07-24', '2025-08-23',
  '2025-09-21', '2025-10-21', '2025-11-20', '2025-12-20',
  // 2026 Full moons
  '2026-01-03', '2026-02-01', '2026-03-03', '2026-04-02',
  '2026-05-01', '2026-05-31', '2026-06-30', '2026-07-29',
  '2026-08-28', '2026-09-26', '2026-10-26', '2026-11-24', '2026-12-24',
  // 2026 New moons
  '2026-01-18', '2026-02-17', '2026-03-19', '2026-04-17',
  '2026-05-16', '2026-06-15', '2026-07-14', '2026-08-12',
  '2026-09-11', '2026-10-10', '2026-11-09', '2026-12-09',
];

export function isMoonDay(date: Date = new Date()): boolean {
  const dateStr = date.toISOString().split('T')[0];
  return MOON_DAYS_2025_2026.includes(dateStr);
}

export function nextMoonDay(from: Date = new Date()): Date | null {
  const fromStr = from.toISOString().split('T')[0];
  const future = MOON_DAYS_2025_2026.filter(d => d > fromStr).sort();
  if (future.length === 0) return null;
  return new Date(future[0] + 'T00:00:00');
}

export function getMoonDayType(date: Date = new Date()): 'full' | 'new' | null {
  // Full moons are at even indices (0, 2, 4...) in the yearly list — rough heuristic
  // In production, use a proper astronomical library like suncalc
  const dateStr = date.toISOString().split('T')[0];
  if (!MOON_DAYS_2025_2026.includes(dateStr)) return null;
  const idx = MOON_DAYS_2025_2026.indexOf(dateStr);
  return idx % 2 === 0 ? 'full' : 'new';
}

export function daysUntilNextMoonDay(from: Date = new Date()): number {
  const next = nextMoonDay(from);
  if (!next) return -1;
  const diff = next.getTime() - from.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
