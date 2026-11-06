import raw from './subjects.json';
import type { Subject, SubjectId } from '../lib/types';

export const SUBJECTS = raw as unknown as Record<SubjectId, Subject>;

/** Look and icon for every unit, in course order. Icons are file names in src/assets/icons. */
export const UNIT_STYLE: Record<SubjectId, { c: string; d: string; icon: string }[]> = {
  world: [
    { c: '#14b8a6', d: '#0f8f82', icon: 'globe' },
    { c: '#f59e0b', d: '#c27c06', icon: 'caravan' },
    { c: '#8b5cf6', d: '#6d3fd6', icon: 'palace' },
    { c: '#3b82f6', d: '#2563c9', icon: 'ship' },
    { c: '#ef4444', d: '#c42f2f', icon: 'flag' },
    { c: '#84a33a', d: '#647e27', icon: 'factory' },
    { c: '#64748b', d: '#475569', icon: 'helmet' },
    { c: '#ec4899', d: '#c22d76', icon: 'rocket' },
    { c: '#06b6d4', d: '#0891b2', icon: 'satellite' },
    { c: '#d4a017', d: '#a67c0d', icon: 'pyramid' },
    { c: '#c2410c', d: '#9a3409', icon: 'temple' },
  ],
  us: [
    { c: '#3b82f6', d: '#2563c9', icon: 'ship' },
    { c: '#f59e0b', d: '#c27c06', icon: 'house' },
    { c: '#ef4444', d: '#c42f2f', icon: 'bell' },
    { c: '#8b5cf6', d: '#6d3fd6', icon: 'scroll' },
    { c: '#64748b', d: '#475569', icon: 'cannon' },
    { c: '#d4a017', d: '#a67c0d', icon: 'train' },
    { c: '#14b8a6', d: '#0f8f82', icon: 'bulb' },
    { c: '#ec4899', d: '#c22d76', icon: 'rocket' },
    { c: '#06b6d4', d: '#0891b2', icon: 'laptop' },
  ],
};

export const SUBJECT_META: Record<SubjectId, { color: string; blurb: string; icon: string }> = {
  world: { color: '#14b8a6', blurb: '9 AP units, c. 1200 to today, plus 2 ancient bonus units', icon: 'globe' },
  us: { color: '#3b82f6', blurb: 'All 9 AP periods, 1491 to today', icon: 'bell' },
};

export const unitName = (s: Subject, i: number) => s.units[i].kicker || `Unit ${i + 1}`;
