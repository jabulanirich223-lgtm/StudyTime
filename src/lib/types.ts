export type MC = { t: 'mc'; q: string; o: string[]; a: number; why?: string; ap?: boolean; stim?: string | null; src?: string; code?: string };
/** Type the answer. Any string in `a` is accepted (case, spaces and punctuation are ignored). */
export type Input = { t: 'input'; q: string; a: string[]; why?: string; hint?: string; code?: string };
/** Put lines of code in the right order. `lines` is the correct order. */
export type Parsons = { t: 'parsons'; q: string; lines: string[]; why?: string };
/** Write real code; it is run and must print `expect` for every test. */
export type Code = { t: 'code'; lang: 'python' | 'javascript' | 'lua' | 'sql'; q: string; starter?: string; setup?: string; tests: { pre?: string; post?: string; expect: string }[]; hint?: string; solution: string; why?: string };
export type TF = { t: 'tf'; q: string; a: boolean; why?: string };
export type Match = { t: 'match'; q: string; pairs: [string, string][] };
export type Order = { t: 'order'; q: string; items: [string, number][] };
export type Year = { t: 'year'; q: string; o: string[]; a: number; why?: string };
export type Card = { t: 'card'; h: string; b: string; code?: string };
export type Question = MC | TF | Match | Order | Year | Input | Parsons | Code;
export type Item = Question | Card;

export type Unit = { title: string; period: string; kicker?: string; learn: { h: string; b: string; code?: string }[]; qs: Question[]; lab?: Question[] };
export type Subject = { name: string; short: string; units: Unit[]; apq: MC[] };
export type SubjectId = string;

export type NodeKind = 'learn' | 'p1' | 'p2' | 'lab' | 'test';
export type Mood = 'idle' | 'cheer' | 'sad' | 'think' | 'fire' | 'sleepy' | 'trophy';
