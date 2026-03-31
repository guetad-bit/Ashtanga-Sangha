/**
 * Social Activity Agent — Ashtanga Sangha
 *
 * Simulates realistic community activity using 8 predefined personas.
 * Run via scheduled task (cron) or manually.
 *
 * Usage:
 *   npx ts-node scripts/social-agent.ts
 *
 * Requires env vars:
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY (service role, not anon)
 */

import { createClient } from '@supabase/supabase-js';

// ── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Personas ────────────────────────────────────────────────────────────────

interface Persona {
  name: string;
  email: string;
  location: string;
  bio: string;
  series: string;
  level: string;
  avatar_url: string;
  // Behavior model
  practiceFrequency: number;  // days per week (0-6)
  postFrequency: number;      // posts per week
  preferredTimes: number[];   // hours (24h format) when they're active
  tone: 'enthusiastic' | 'minimal' | 'reflective' | 'technical' | 'casual' | 'poetic' | 'humorous' | 'disciplined';
  likeFrequency: number;      // likes per day (average)
  commentFrequency: number;   // comments per week
}

const PERSONAS: Persona[] = [
  {
    name: 'Maya Levi',
    email: 'maya.levi.sim@ashtangasangha.app',
    location: 'Tel Aviv',
    bio: 'UX designer. Ashtanga keeps me grounded between sprints.',
    series: 'primary',
    level: 'regular',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    practiceFrequency: 5,
    postFrequency: 3,
    preferredTimes: [6, 7, 8, 19, 20],
    tone: 'casual',
    likeFrequency: 2,
    commentFrequency: 2,
  },
  {
    name: 'Yoav Cohen',
    email: 'yoav.cohen.sim@ashtangasangha.app',
    location: 'Haifa',
    bio: 'Software engineer. Primary series at 5:30am, every day.',
    series: 'primary',
    level: 'dedicated',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    practiceFrequency: 6,
    postFrequency: 1,
    preferredTimes: [5, 6, 7],
    tone: 'minimal',
    likeFrequency: 1,
    commentFrequency: 1,
  },
  {
    name: 'Noa Avraham',
    email: 'noa.avraham.sim@ashtangasangha.app',
    location: 'Jerusalem',
    bio: 'Psychology student exploring the mind-body connection through practice.',
    series: 'primary',
    level: 'beginner',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    practiceFrequency: 3,
    postFrequency: 2,
    preferredTimes: [7, 8, 9, 17, 18],
    tone: 'reflective',
    likeFrequency: 3,
    commentFrequency: 3,
  },
  {
    name: 'Ido Friedman',
    email: 'ido.friedman.sim@ashtangasangha.app',
    location: 'Tel Aviv',
    bio: 'Startup founder. Yoga is my reset button.',
    series: 'half_primary',
    level: 'beginner',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    practiceFrequency: 2,
    postFrequency: 1,
    preferredTimes: [6, 7, 21, 22],
    tone: 'humorous',
    likeFrequency: 1,
    commentFrequency: 0,
  },
  {
    name: 'Shira Ben-David',
    email: 'shira.bendavid.sim@ashtangasangha.app',
    location: 'Ramat Gan',
    bio: 'Ashtanga teacher, 15 years of practice. Sharing what the mat teaches me.',
    series: 'intermediate',
    level: 'teacher',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    practiceFrequency: 6,
    postFrequency: 4,
    preferredTimes: [5, 6, 7, 8, 16, 17],
    tone: 'poetic',
    likeFrequency: 4,
    commentFrequency: 4,
  },
  {
    name: 'Tomer Haddad',
    email: 'tomer.haddad.sim@ashtangasangha.app',
    location: "Be'er Sheva",
    bio: 'Physiotherapist. Fascinated by how Ashtanga builds functional strength.',
    series: 'primary',
    level: 'regular',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    practiceFrequency: 4,
    postFrequency: 2,
    preferredTimes: [6, 7, 8, 18, 19],
    tone: 'technical',
    likeFrequency: 2,
    commentFrequency: 2,
  },
  {
    name: 'Dana Rosen',
    email: 'dana.rosen.sim@ashtangasangha.app',
    location: 'Herzliya',
    bio: 'Content creator & yoga enthusiast. Documenting my journey one breath at a time.',
    series: 'primary',
    level: 'regular',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    practiceFrequency: 4,
    postFrequency: 5,
    preferredTimes: [7, 8, 9, 10, 18, 19, 20],
    tone: 'enthusiastic',
    likeFrequency: 5,
    commentFrequency: 3,
  },
  {
    name: 'Alon Segev',
    email: 'alon.segev.sim@ashtangasangha.app',
    location: 'Kfar Saba',
    bio: 'Lawyer by day, yogi by dawn. The discipline translates.',
    series: 'primary',
    level: 'dedicated',
    avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80',
    practiceFrequency: 5,
    postFrequency: 1,
    preferredTimes: [5, 6, 7],
    tone: 'disciplined',
    likeFrequency: 1,
    commentFrequency: 1,
  },
];

// ── Content Templates ───────────────────────────────────────────────────────

type PostType = 'started' | 'finished' | 'struggle' | 'short' | 'reflection' | 'skipped';

const POST_TEMPLATES: Record<Persona['tone'], Record<PostType, string[]>> = {
  casual: {
    started: [
      'On the mat. Let\'s go 🧘',
      'Morning practice, here we go',
      'Mat time ✨',
    ],
    finished: [
      'Done! That felt good today',
      'Practice done. Coffee time ☕',
      'Wrapped up. Savasana was *chef\'s kiss*',
    ],
    struggle: [
      'Marichyasana C is humbling me lately',
      'My hamstrings said no today lol',
      'Binding is a journey, not a destination... right?',
    ],
    short: [
      'Only had 30 min today but still showed up',
      'Quick sun salutations before work',
      'Half practice > no practice',
    ],
    reflection: [
      'Three months in and I finally get why they say "practice and all is coming"',
      'The mat doesn\'t care about your to-do list',
    ],
    skipped: [
      'Rest day. Body needed it.',
      'Taking today off. See you tomorrow, mat.',
    ],
  },
  minimal: {
    started: ['Practice.', 'On the mat.', '🧘'],
    finished: ['Done.', 'Practiced.', 'Full primary. Done.'],
    struggle: ['Tough one today.', 'Stiff.', 'Heavy practice.'],
    short: ['Short practice.', '30 min.', 'Surya Namaskara only.'],
    reflection: ['Consistency matters.', 'Day 47.'],
    skipped: ['Rest.', 'Moon day.'],
  },
  reflective: {
    started: [
      'Setting an intention for today\'s practice',
      'Noticing where I hold tension before I even begin',
    ],
    finished: [
      'There\'s something about the rhythm of the breath that quiets everything',
      'Post-practice clarity is real. The mind is so much softer now.',
      'Grateful for this practice today',
    ],
    struggle: [
      'Noticed I was forcing instead of breathing today. Had to remind myself to let go.',
      'Some days the practice practices you',
      'Struggling with focus today. The mind keeps wandering. That\'s okay too.',
    ],
    short: [
      'Even 20 minutes shifted something in me today',
      'A short practice with full presence > a long practice on autopilot',
    ],
    reflection: [
      'The hardest part isn\'t the postures. It\'s showing up when you don\'t feel like it.',
      'I\'m starting to understand why they call it a "practice" and not a "perfect"',
    ],
    skipped: [
      'Listening to my body today. Rest is part of the practice too.',
      'No mat today. Just breath.',
    ],
  },
  technical: {
    started: [
      'Morning Mysore. Focusing on hip external rotation today.',
      'Practice time. Working on bandha engagement through standing sequence.',
    ],
    finished: [
      'Good session. Noticed better scapular stability in Chaturanga today.',
      'Full primary. Jump-backs are getting cleaner with proper hasta bandha.',
    ],
    struggle: [
      'Supta Kurmasana — the limiting factor is thoracic rotation, not hip flexibility',
      'Interesting: my left SI joint compensation shows up most in Janu Sirsasana B',
    ],
    short: [
      'Abbreviated practice — standing + finishing. Focused on alignment over quantity.',
      'Sun Sals + standing only. Sometimes specificity wins.',
    ],
    reflection: [
      'The vinyasa count isn\'t arbitrary — each movement has a biomechanical purpose',
    ],
    skipped: [
      'Active recovery day. Some gentle mobility work instead.',
    ],
  },
  enthusiastic: {
    started: [
      'Good morning! Mat is rolled out, let\'s do this! 🌅',
      'Sooo ready for practice today!',
      'Early morning practice hits different ✨',
    ],
    finished: [
      'AMAZING practice today!! Everything just clicked',
      'That post-practice glow though 🌟',
      'Practice done and I feel incredible!',
      'Best savasana ever. Literally floated off the mat.',
    ],
    struggle: [
      'Okay Marichyasana D, we\'ll meet again tomorrow 😤',
      'My body was NOT cooperating today but hey, I showed up!',
    ],
    short: [
      'Quick 30 min practice but it was exactly what I needed!',
      'Even a short practice fills the cup ☕✨',
    ],
    reflection: [
      'Can\'t believe I almost quit 6 months ago. This practice changed everything.',
      'The community here makes all the difference 💛',
    ],
    skipped: [
      'Rest day! Treating myself to a long walk instead 🌿',
    ],
  },
  poetic: {
    started: [
      'The mat waits like an old friend. Beginning.',
      'First breath. The world falls quiet.',
    ],
    finished: [
      'From effort to ease. Practice complete.',
      'The body remembers what the mind forgets. Grateful for this morning.',
      'Stillness after movement — that\'s where the practice lives.',
    ],
    struggle: [
      'Some postures are teachers. Today Kapotasana taught me patience.',
      'The edge is where growth lives. Uncomfortable, necessary.',
    ],
    short: [
      'Even a few sun salutations carry the whole practice within them.',
      'Brief but whole. Quality of attention over quantity of postures.',
    ],
    reflection: [
      'After 15 years, the practice still surprises me. That\'s the gift.',
      'We don\'t practice to be good at yoga. We practice to be present.',
    ],
    skipped: [
      'Sometimes the deepest practice is stillness.',
      'Rest is not the absence of practice. It is its completion.',
    ],
  },
  humorous: {
    started: [
      'My alarm went off at 5:30. I have questions about my life choices.',
      'Plot twist: the mat is cold. Proceeding anyway.',
    ],
    finished: [
      'Survived another primary series. Send coffee.',
      'Practice done. Reward: standing upright for the rest of the day.',
      'My savasana was dangerously close to a nap.',
    ],
    struggle: [
      'Tried to bind in Marichyasana D. My arms disagreed.',
      'Day 200 of pretending I can do Navasana without shaking.',
    ],
    short: [
      'CEO of the 30-minute practice today',
      'Speed-ran the standing sequence. Efficiency.',
    ],
    reflection: [
      'Started yoga for flexibility. Stayed because it\'s the only hour nobody can Slack me.',
    ],
    skipped: [
      'Rest day. The mat will still be there tomorrow (unfortunately).',
    ],
  },
  disciplined: {
    started: [
      'Practice. 5:30am.',
      'On the mat before sunrise, as usual.',
    ],
    finished: [
      'Full primary series completed. Strong practice.',
      'Consistent effort, consistent results.',
      'Practice logged. Moving on to the day.',
    ],
    struggle: [
      'Working through tightness in the hips. Patience.',
      'Difficult practice. Showed up anyway.',
    ],
    short: [
      'Abbreviated practice today. Still counts.',
      'Standing sequence only. Time constraints.',
    ],
    reflection: [
      'Discipline is choosing what you want most over what you want now.',
    ],
    skipped: [
      'Scheduled rest day.',
      'Recovery day. Back tomorrow.',
    ],
  },
};

const COMMENT_TEMPLATES: Record<Persona['tone'], string[]> = {
  casual: ['Nice!', 'Love this 🙌', 'Same here!', 'Keep it up!'],
  minimal: ['🙏', '💪', 'Good.'],
  reflective: ['Beautiful reflection', 'This resonates', 'So true. Thank you for sharing.'],
  technical: ['Good approach', 'Try engaging the bandhas more — it helps', 'Solid practice'],
  enthusiastic: ['YESSS! 🔥', 'You\'re crushing it!', 'So inspiring!!', 'Love love love this'],
  poetic: ['Beautiful 🙏', 'This speaks to me', 'Beautifully said'],
  humorous: ['😂😂', 'This is so real', 'I feel this in my bones (literally)'],
  disciplined: ['Well done', 'Strong', 'Good discipline'],
};

// ── Utility Functions ───────────────────────────────────────────────────────

function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function chance(probability: number): boolean {
  return Math.random() < probability;
}

function getCurrentHour(): number {
  // Israel timezone (UTC+2 / UTC+3 during DST)
  const now = new Date();
  const israelTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
  return israelTime.getHours();
}

function isActiveHour(persona: Persona): boolean {
  const hour = getCurrentHour();
  // Check if current hour is within ±1 of preferred times
  return persona.preferredTimes.some(h => Math.abs(h - hour) <= 1);
}

function shouldPracticeToday(persona: Persona): boolean {
  // probability = practiceFrequency / 7
  // Add some randomness: ±15%
  const baseProbability = persona.practiceFrequency / 7;
  const jitter = (Math.random() - 0.5) * 0.3;
  return chance(Math.min(0.95, Math.max(0.05, baseProbability + jitter)));
}

function shouldPostToday(persona: Persona): boolean {
  const baseProbability = persona.postFrequency / 7;
  const jitter = (Math.random() - 0.5) * 0.2;
  return chance(Math.min(0.9, Math.max(0.05, baseProbability + jitter)));
}

function pickPostType(practiced: boolean): PostType {
  if (!practiced) {
    // Didn't practice: reflection, skipped, or nothing
    return pick(['reflection', 'skipped', 'skipped']);
  }
  // Practiced: weighted selection
  const weights: [PostType, number][] = [
    ['finished', 40],
    ['started', 20],
    ['struggle', 15],
    ['short', 10],
    ['reflection', 15],
  ];
  const total = weights.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [type, weight] of weights) {
    r -= weight;
    if (r <= 0) return type;
  }
  return 'finished';
}

// ── Database Operations ─────────────────────────────────────────────────────

// Map of persona email → Supabase user ID (cached after first lookup/creation)
const personaIds: Map<string, string> = new Map();

async function ensurePersonaProfiles(): Promise<void> {
  console.log('Ensuring persona profiles exist...');

  for (const p of PERSONAS) {
    // Check if profile exists by name (since we can't create auth users with service key alone)
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('name', p.name)
      .maybeSingle();

    if (existing) {
      personaIds.set(p.email, existing.id);
      console.log(`  ✓ ${p.name} exists (${existing.id})`);
    } else {
      // Create a profile with a deterministic UUID based on the email
      const id = generateDeterministicId(p.email);
      const { error } = await supabase.from('profiles').upsert({
        id,
        name: p.name,
        series: p.series,
        level: p.level,
        location: p.location,
        bio: p.bio,
        avatar_url: p.avatar_url,
        practicing_now: false,
      });
      if (error) {
        console.error(`  ✗ Failed to create ${p.name}:`, error.message);
      } else {
        personaIds.set(p.email, id);
        console.log(`  + Created ${p.name} (${id})`);
      }
    }
  }
}

function generateDeterministicId(input: string): string {
  // Simple hash → UUID-like format (deterministic so re-runs don't create duplicates)
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  // Build a valid UUID v4-like string
  return `${hex.slice(0, 8)}-sim0-4000-a000-${hex.padEnd(12, '0').slice(0, 12)}`;
}

async function createPost(personaId: string, caption: string): Promise<void> {
  const { error } = await supabase.from('posts').insert({
    user_id: personaId,
    caption,
    created_at: new Date().toISOString(),
  });
  if (error) console.error('  Post error:', error.message);
}

async function logPractice(personaId: string, series: string, durationMin: number): Promise<void> {
  const { error } = await supabase.from('practice_logs').insert({
    user_id: personaId,
    series,
    duration_min: durationMin,
    logged_at: new Date().toISOString(),
  });
  if (error) console.error('  Practice log error:', error.message);
}

async function setPracticingNow(personaId: string, practicing: boolean): Promise<void> {
  await supabase.from('profiles').update({
    practicing_now: practicing,
    practicing_started_at: practicing ? new Date().toISOString() : null,
  }).eq('id', personaId);
}

async function likeRecentPost(personaId: string): Promise<void> {
  // Get a recent post NOT by this persona
  const { data: posts } = await supabase
    .from('posts')
    .select('id, user_id')
    .neq('user_id', personaId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!posts || posts.length === 0) return;

  const post = pick(posts);
  // Upsert to avoid duplicate likes
  await supabase.from('likes').upsert({
    post_id: post.id,
    user_id: personaId,
  });
}

async function commentOnRecentPost(personaId: string, tone: Persona['tone']): Promise<void> {
  const { data: posts } = await supabase
    .from('posts')
    .select('id, user_id')
    .neq('user_id', personaId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (!posts || posts.length === 0) return;

  const post = pick(posts);
  const comment = pick(COMMENT_TEMPLATES[tone]);

  // Try to insert comment — table may or may not exist
  const { error } = await supabase.from('comments').insert({
    post_id: post.id,
    user_id: personaId,
    content: comment,
  });
  // Silently ignore if comments table doesn't exist
  if (error && !error.message.includes('does not exist')) {
    console.error('  Comment error:', error.message);
  }
}

// ── Main Agent Logic ────────────────────────────────────────────────────────

async function runAgent(): Promise<void> {
  console.log(`\n🧘 Social Activity Agent — ${new Date().toLocaleString('en-IL', { timeZone: 'Asia/Jerusalem' })}`);
  console.log(`   Current hour (Israel): ${getCurrentHour()}\n`);

  await ensurePersonaProfiles();

  let actions = 0;

  for (const persona of PERSONAS) {
    const personaId = personaIds.get(persona.email);
    if (!personaId) continue;

    // Is this persona active right now?
    if (!isActiveHour(persona)) {
      // Small chance of off-hours activity (realistic)
      if (!chance(0.05)) continue;
    }

    const practiced = shouldPracticeToday(persona);
    const shouldPost = shouldPostToday(persona);

    console.log(`\n  ${persona.name} (${persona.location}):`);

    // 1. Practice activity
    if (practiced && chance(0.6)) {
      const duration = pick([30, 45, 60, 75, 90]);
      await logPractice(personaId, persona.series, duration);
      console.log(`    📋 Logged ${duration}min practice (${persona.series})`);
      actions++;

      // Set "on mat" status briefly for some personas
      if (chance(0.3)) {
        await setPracticingNow(personaId, true);
        console.log(`    🧘 Set as practicing now`);
        // Will be cleared next run
      }
    }

    // Clear practicing status for everyone (cleanup from previous runs)
    if (chance(0.4)) {
      await setPracticingNow(personaId, false);
    }

    // 2. Post activity
    if (shouldPost) {
      const postType = pickPostType(practiced);
      const templates = POST_TEMPLATES[persona.tone][postType];
      if (templates && templates.length > 0) {
        const caption = pick(templates);
        await createPost(personaId, caption);
        console.log(`    📝 Posted (${postType}): "${caption.slice(0, 50)}..."`);
        actions++;
      }
    }

    // 3. Social interactions
    if (chance(persona.likeFrequency / 10)) {
      await likeRecentPost(personaId);
      console.log(`    ❤️  Liked a post`);
      actions++;
    }

    if (chance(persona.commentFrequency / 30)) {
      await commentOnRecentPost(personaId, persona.tone);
      console.log(`    💬 Commented on a post`);
      actions++;
    }
  }

  console.log(`\n✅ Agent run complete. ${actions} actions taken.\n`);
}

// ── Entry Point ─────────────────────────────────────────────────────────────

runAgent().catch(console.error);
