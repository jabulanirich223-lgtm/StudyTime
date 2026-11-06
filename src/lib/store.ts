import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question, SubjectId } from './types';

export const dayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
export const today = () => dayKey();
export const yesterday = () => dayKey(new Date(Date.now() - 864e5));
export function weekId() {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return dayKey(d);
}
export const levelOf = (xp: number) => Math.floor(Math.sqrt(xp / 20)) + 1;
export const xpAt = (l: number) => 20 * (l - 1) * (l - 1);

export const TIERS: [string, number, string][] = [
  ['Bronze', 0, '#cd7f32'], ['Silver', 100, '#94a3b8'], ['Gold', 250, '#eab308'], ['Sapphire', 500, '#3b82f6'],
  ['Ruby', 800, '#ef4444'], ['Emerald', 1200, '#22c55e'], ['Diamond', 1800, '#8b5cf6'],
];
export const tierIdx = (x: number) => TIERS.reduce((i, t, k) => (x >= t[1] ? k : i), 0);

const HEART_MS = 20 * 60e3;

export type State = {
  onboarded: boolean;
  subject: SubjectId;
  xp: number; streak: number; lastDay: string | null;
  hearts: number; heartTs: number; unlimited: boolean;
  gems: number; freezes: number; dblUntil: number;
  week: string; weekXP: number;
  daily: { day: string; xp: number; lessons: number; crams: number };
  goal: number;
  done: Record<string, boolean>; chests: Record<string, string>; badges: Record<string, string>;
  mistakes: { s: SubjectId; q: Question }[];
  best: { lightning: number; ap: Partial<Record<SubjectId, number>> };
  stats: { lessons: number; perfect: number; maxCombo: number; fixed: number };
  sound: boolean; autoRead: boolean; charVoices: boolean; ttsRate: number; ttsPitch: number; voiceName: string;
  frozeUsed?: boolean;
  pro: boolean; proPlan: string | null; proSince: number; proWeek: string;
  name: string; avatar: string; avatarBg: string;
};

type Actions = {
  set: (p: Partial<State> | ((s: State) => Partial<State>)) => void;
  addXP: (n: number) => number;
  syncDay: () => void;
  syncHearts: () => void;
  loseHeart: () => void;
  reset: () => void;
};

const fresh = (): State => ({
  onboarded: false, subject: 'world',
  xp: 0, streak: 0, lastDay: null,
  hearts: 5, heartTs: Date.now(), unlimited: false,
  gems: 50, freezes: 0, dblUntil: 0,
  week: weekId(), weekXP: 0,
  daily: { day: today(), xp: 0, lessons: 0, crams: 0 }, goal: 30,
  done: {}, chests: {}, badges: {}, mistakes: [],
  best: { lightning: 0, ap: {} },
  stats: { lessons: 0, perfect: 0, maxCombo: 0, fixed: 0 },
  pro: false, proPlan: null, proSince: 0, proWeek: '', name: 'Learner', avatar: 'tock', avatarBg: '#ddf4ff',
  sound: true, autoRead: false, charVoices: true, ttsRate: 1, ttsPitch: 1, voiceName: '',
});

export const useGame = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...fresh(),
      set: (p) => set(p as never),
      syncDay: () => {
        const s = get();
        const patch: Partial<State> = {};
        if (s.daily.day !== today()) patch.daily = { day: today(), xp: 0, lessons: 0, crams: 0 };
        if (s.week !== weekId()) { patch.week = weekId(); patch.weekXP = 0; }
        if (s.pro && s.proWeek !== weekId()) { patch.proWeek = weekId(); patch.freezes = Math.min(5, s.freezes + 1); }
        if (s.lastDay && s.lastDay !== today() && s.lastDay !== yesterday()) {
          if (s.freezes > 0 && s.streak > 0) { patch.freezes = s.freezes - 1; patch.lastDay = yesterday(); patch.frozeUsed = true; }
          else patch.streak = 0;
        }
        if (Object.keys(patch).length) set(patch);
      },
      syncHearts: () => {
        const s = get();
        if (s.hearts >= 5) { set({ heartTs: Date.now() }); return; }
        const n = Math.floor((Date.now() - s.heartTs) / HEART_MS);
        if (n > 0) set({ hearts: Math.min(5, s.hearts + n), heartTs: s.heartTs + n * HEART_MS });
      },
      loseHeart: () => {
        const s = get();
        if (s.unlimited || s.pro) return;
        set({ hearts: Math.max(0, s.hearts - 1), heartTs: s.hearts === 5 ? Date.now() : s.heartTs });
      },
      addXP: (n) => {
        if (n <= 0) return 0;
        get().syncDay();
        const s = get();
        if (Date.now() < s.dblUntil) n *= 2;
        const streak = s.lastDay === today() ? s.streak : s.lastDay === yesterday() ? s.streak + 1 : 1;
        set({ xp: s.xp + n, weekXP: s.weekXP + n, daily: { ...s.daily, xp: s.daily.xp + n }, streak, lastDay: today() });
        return n;
      },
      reset: () => set({ ...fresh(), onboarded: true }),
    }),
    { name: 'studytime-v1', partialize: (s) => { const { set: _a, addXP: _b, syncDay: _c, syncHearts: _d, loseHeart: _e, reset: _f, ...rest } = s; return rest as State; } },
  ),
);

export const BADGES: { id: string; name: string; desc: string; val: (s: State) => number; goal: number }[] = [
  { id: 'first', name: 'First Step', desc: 'Finish 1 lesson', val: (s) => s.stats.lessons, goal: 1 },
  { id: 'scholar', name: 'Scholar', desc: 'Finish 10 lessons', val: (s) => s.stats.lessons, goal: 10 },
  { id: 'scholar2', name: 'Historian', desc: 'Finish 40 lessons', val: (s) => s.stats.lessons, goal: 40 },
  { id: 'perfect', name: 'Flawless', desc: '5 perfect lessons', val: (s) => s.stats.perfect, goal: 5 },
  { id: 'combo', name: 'On Fire', desc: 'Hit a 10-answer combo', val: (s) => s.stats.maxCombo, goal: 10 },
  { id: 'streak3', name: 'Habit', desc: 'Reach a 3-day streak', val: (s) => s.streak, goal: 3 },
  { id: 'streak7', name: 'Week Warrior', desc: 'Reach a 7-day streak', val: (s) => s.streak, goal: 7 },
  { id: 'lightning', name: 'Quick Draw', desc: '15 right in one Lightning Round', val: (s) => s.best.lightning, goal: 15 },
  { id: 'ap5', name: 'Five Star', desc: 'Score a 5 on an Exam Sim', val: (s) => Math.max(0, ...Object.values(s.best.ap).map(Number)), goal: 5 },
  { id: 'units', name: 'Unit Master', desc: 'Pass 5 unit tests', val: (s) => Object.keys(s.done).filter((k) => k.endsWith(':test')).length, goal: 5 },
  { id: 'xp1000', name: 'Grinder', desc: 'Earn 1,000 XP', val: (s) => s.xp, goal: 1000 },
  { id: 'fixer', name: 'Fixer', desc: 'Clear 25 mistakes', val: (s) => s.stats.fixed, goal: 25 },
];

/** Award any newly earned badges (20 gems each). Returns their names. */
export function checkBadges(): string[] {
  const s = useGame.getState();
  const got: string[] = [];
  const badges = { ...s.badges };
  let gems = s.gems;
  for (const b of BADGES) if (!badges[b.id] && b.val(s) >= b.goal) { badges[b.id] = today(); gems += 20; got.push(b.name); }
  if (got.length) s.set({ badges, gems });
  return got;
}
