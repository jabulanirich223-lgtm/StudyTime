export type MC = { t: 'mc'; q: string; o: string[]; a: number; why?: string; ap?: boolean; stim?: string | null; src?: string };
export type TF = { t: 'tf'; q: string; a: boolean; why?: string };
export type Match = { t: 'match'; q: string; pairs: [string, string][] };
export type Order = { t: 'order'; q: string; items: [string, number][] };
export type Year = { t: 'year'; q: string; o: string[]; a: number; why?: string };
export type Card = { t: 'card'; h: string; b: string };
export type Question = MC | TF | Match | Order | Year;
export type Item = Question | Card;

export type Unit = { title: string; period: string; kicker?: string; learn: { h: string; b: string }[]; qs: Question[] };
export type Subject = { name: string; short: string; units: Unit[]; apq: MC[] };
export type SubjectId = 'world' | 'us';

export type NodeKind = 'learn' | 'p1' | 'p2' | 'test';
export type Mood = 'idle' | 'cheer' | 'sad' | 'think' | 'fire' | 'sleepy' | 'trophy';
