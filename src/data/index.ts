import raw from './subjects.json';
import type { Subject } from '../lib/types';
import { courseIcon, trackOf } from './catalog';

/** Every course file in ./courses is merged in automatically: { "<course id>": { name, units } } */
const files = import.meta.glob('./courses/*.json', { eager: true, import: 'default' }) as Record<string, Record<string, Partial<Subject>>>;

export const SUBJECTS: Record<string, Subject> = { ...(raw as unknown as Record<string, Subject>) };
for (const file of Object.values(files))
  for (const [id, c] of Object.entries(file))
    SUBJECTS[id] = { name: c.name || id, short: (c.name || id).slice(0, 2).toUpperCase(), units: c.units || [], apq: c.apq || [] };

export const hasCourse = (id: string) => !!SUBJECTS[id]?.units?.length;

const PALETTE: [string, string][] = [
  ['#14b8a6', '#0f8f82'], ['#f59e0b', '#c27c06'], ['#8b5cf6', '#6d3fd6'], ['#3b82f6', '#2563c9'],
  ['#ef4444', '#c42f2f'], ['#84a33a', '#647e27'], ['#ec4899', '#c22d76'], ['#06b6d4', '#0891b2'],
];

/** The two original AP history courses keep their hand-picked unit icons. */
const HISTORY_ICONS: Record<string, string[]> = {
  world: ['globe', 'caravan', 'palace', 'ship', 'flag', 'factory', 'helmet', 'rocket', 'satellite', 'pyramid', 'temple'],
  us: ['ship', 'house', 'bell', 'scroll', 'cannon', 'train', 'bulb', 'rocket', 'laptop'],
};

export function unitStyle(course: string, i: number) {
  const [c, d] = PALETTE[(i + (trackOf(course)?.id.length || 0)) % PALETTE.length];
  return { c, d, icon: HISTORY_ICONS[course]?.[i] || courseIcon(course) };
}

export const unitName = (s: Subject, i: number) => s.units[i].kicker || `Unit ${i + 1}`;
