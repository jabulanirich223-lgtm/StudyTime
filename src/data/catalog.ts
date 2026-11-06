/* Every course in the app, grouped the way the "What do you want to learn?" screen shows them:
   five columns (categories) → tracks (a subject) → levels (one course each). */

export type CategoryId = 'academics' | 'languages' | 'coding' | 'money' | 'tech';
export type Level = { id: string; name: string };
/** icon: a PNG name in src/assets/icons, or "flag:xx" / "tile:Label:#color" drawn as SVG */
export type Track = { id: string; name: string; cat: CategoryId; icon: string; levels: Level[]; unitIcons?: string[] };

export const CATEGORIES: { id: CategoryId; name: string; blurb: string; color: string; icon: string }[] = [
  { id: 'academics', name: 'Academics', blurb: 'School subjects, grade by grade', color: '#4f46e5', icon: 'gradcap' },
  { id: 'languages', name: 'Languages', blurb: 'Speak a new language', color: '#14b8a6', icon: 'languages' },
  { id: 'coding', name: 'Coding', blurb: 'Learn to program', color: '#0ea5e9', icon: 'code' },
  { id: 'money', name: 'Money & Business', blurb: 'Finance, stocks and business', color: '#22c55e', icon: 'piggybank' },
  { id: 'tech', name: 'Tech & Computers', blurb: 'How computers really work', color: '#a855f7', icon: 'desktop' },
];

const L = (pairs: [string, string][]): Level[] => pairs.map(([id, name]) => ({ id, name }));
const one = (id: string): Level[] => [{ id, name: 'Full course' }];
const lang = (code: string): Level[] => L([[`${code}-1`, 'Beginner'], [`${code}-2`, 'Intermediate']]);

export const TRACKS: Track[] = [
  // ---------- academics ----------
  { id: 'math', name: 'Math', cat: 'academics', icon: 'calculator', levels: L([['math-g3', 'Grade 3'], ['math-g4', 'Grade 4'], ['math-g5', 'Grade 5'], ['math-g6', 'Grade 6'], ['math-g7', 'Grade 7'], ['math-g8', 'Grade 8'], ['math-alg1', 'Algebra 1'], ['math-geo', 'Geometry'], ['math-alg2', 'Algebra 2'], ['math-precalc', 'Precalculus'], ['math-calc', 'Calculus'], ['math-stats', 'Statistics']]) },
  { id: 'ela', name: 'English', cat: 'academics', icon: 'book', levels: L([['ela-g3', 'Grade 3'], ['ela-g4', 'Grade 4'], ['ela-g5', 'Grade 5'], ['ela-g6', 'Grade 6'], ['ela-g7', 'Grade 7'], ['ela-g8', 'Grade 8'], ['ela-g9', 'Grade 9'], ['ela-g10', 'Grade 10'], ['ela-g11', 'Grade 11'], ['ela-g12', 'Grade 12']]) },
  { id: 'science', name: 'Science', cat: 'academics', icon: 'flask', levels: L([['sci-g3', 'Grade 3'], ['sci-g4', 'Grade 4'], ['sci-g5', 'Grade 5'], ['sci-g6', 'Grade 6 · Earth'], ['sci-g7', 'Grade 7 · Life'], ['sci-g8', 'Grade 8 · Physical'], ['sci-bio', 'Biology'], ['sci-chem', 'Chemistry'], ['sci-phys', 'Physics'], ['sci-env', 'Environmental']]) },
  { id: 'history', name: 'History & Social Studies', cat: 'academics', icon: 'globe', levels: L([['hist-us', 'US History'], ['hist-world', 'World History'], ['civics', 'Government & Civics'], ['geography', 'World Geography'], ['world', 'AP World History'], ['us', 'AP US History']]) },
  { id: 'ap', name: 'AP Courses', cat: 'academics', icon: 'gradcap', levels: L([['ap-bio', 'AP Biology'], ['ap-chem', 'AP Chemistry'], ['ap-calc', 'AP Calculus AB'], ['ap-psych', 'AP Psychology'], ['ap-gov', 'AP US Government'], ['ap-lang', 'AP English Language'], ['ap-macro', 'AP Macroeconomics']]) },
  { id: 'psych', name: 'Psychology', cat: 'academics', icon: 'brain', levels: one('psych') },
  // ---------- languages ----------
  { id: 'es', name: 'Spanish', cat: 'languages', icon: 'flag:es', levels: lang('es') },
  { id: 'fr', name: 'French', cat: 'languages', icon: 'flag:fr', levels: lang('fr') },
  { id: 'de', name: 'German', cat: 'languages', icon: 'flag:de', levels: lang('de') },
  { id: 'it', name: 'Italian', cat: 'languages', icon: 'flag:it', levels: lang('it') },
  { id: 'pt', name: 'Portuguese', cat: 'languages', icon: 'flag:pt', levels: lang('pt') },
  { id: 'ru', name: 'Russian', cat: 'languages', icon: 'flag:ru', levels: lang('ru') },
  { id: 'ja', name: 'Japanese', cat: 'languages', icon: 'flag:ja', levels: lang('ja') },
  { id: 'zh', name: 'Mandarin Chinese', cat: 'languages', icon: 'flag:zh', levels: lang('zh') },
  { id: 'ko', name: 'Korean', cat: 'languages', icon: 'flag:ko', levels: lang('ko') },
  { id: 'ar', name: 'Arabic', cat: 'languages', icon: 'tile:ع:#16a34a', levels: lang('ar') },
  { id: 'hi', name: 'Hindi', cat: 'languages', icon: 'flag:hi', levels: lang('hi') },
  { id: 'en', name: 'English (new learners)', cat: 'languages', icon: 'tile:Aa:#2563eb', levels: lang('en') },
  // ---------- coding ----------
  { id: 'code-basics', name: 'Coding Basics', cat: 'coding', icon: 'code', levels: one('code-basics') },
  { id: 'py', name: 'Python', cat: 'coding', icon: 'tile:Py:#3b6ea5', levels: L([['py-1', 'Beginner'], ['py-2', 'Intermediate']]) },
  { id: 'js', name: 'JavaScript', cat: 'coding', icon: 'tile:JS:#e6b800', levels: L([['js-1', 'Beginner'], ['js-2', 'Intermediate']]) },
  { id: 'ts', name: 'TypeScript', cat: 'coding', icon: 'tile:TS:#2f74c0', levels: one('ts') },
  { id: 'web', name: 'HTML & CSS', cat: 'coding', icon: 'tile:</>:#e2552b', levels: one('web') },
  { id: 'java', name: 'Java', cat: 'coding', icon: 'tile:Jv:#c2410c', levels: one('java') },
  { id: 'c', name: 'C', cat: 'coding', icon: 'tile:C:#5c6bc0', levels: one('c') },
  { id: 'cpp', name: 'C++', cat: 'coding', icon: 'tile:C++:#00599c', levels: one('cpp') },
  { id: 'csharp', name: 'C#', cat: 'coding', icon: 'tile:C#:#7b3fbf', levels: one('csharp') },
  { id: 'go', name: 'Go', cat: 'coding', icon: 'tile:Go:#00a7d0', levels: one('go') },
  { id: 'rust', name: 'Rust', cat: 'coding', icon: 'tile:Rs:#b7410e', levels: one('rust') },
  { id: 'swift', name: 'Swift', cat: 'coding', icon: 'tile:Sw:#f05138', levels: one('swift') },
  { id: 'kotlin', name: 'Kotlin', cat: 'coding', icon: 'tile:Kt:#7f52ff', levels: one('kotlin') },
  { id: 'php', name: 'PHP', cat: 'coding', icon: 'tile:php:#6d77b3', levels: one('php') },
  { id: 'ruby', name: 'Ruby', cat: 'coding', icon: 'tile:Rb:#cc342d', levels: one('ruby') },
  { id: 'sql', name: 'SQL', cat: 'coding', icon: 'tile:SQL:#0f766e', levels: one('sql') },
  { id: 'bash', name: 'Bash & Linux', cat: 'coding', icon: 'tile:>_:#334155', levels: one('bash') },
  { id: 'git', name: 'Git & GitHub', cat: 'coding', icon: 'tile:git:#e4572e', levels: one('git') },
  { id: 'luau', name: 'Lua & Roblox Luau', cat: 'coding', icon: 'tile:Lua:#1f4ea8', levels: one('luau') },
  { id: 'r', name: 'R', cat: 'coding', icon: 'tile:R:#2368c4', levels: one('r') },
  { id: 'dsa', name: 'Algorithms & Data Structures', cat: 'coding', icon: 'tile:{ }:#0d9488', levels: one('dsa') },
  // ---------- money & business ----------
  { id: 'fin-personal', name: 'Personal Finance', cat: 'money', icon: 'piggybank', levels: one('fin-personal') },
  { id: 'fin-invest', name: 'Investing & Stocks', cat: 'money', icon: 'stocks', levels: one('fin-invest') },
  { id: 'fin-crypto', name: 'Crypto & Blockchain', cat: 'money', icon: 'cryptocoin', levels: one('fin-crypto') },
  { id: 'econ', name: 'Economics', cat: 'money', icon: 'scales', levels: L([['econ-micro', 'Microeconomics'], ['econ-macro', 'Macroeconomics']]) },
  { id: 'biz-basics', name: 'Business Basics', cat: 'money', icon: 'briefcase', levels: one('biz-basics') },
  { id: 'biz-entre', name: 'Entrepreneurship', cat: 'money', icon: 'rocket', levels: one('biz-entre') },
  { id: 'biz-marketing', name: 'Marketing', cat: 'money', icon: 'megaphone', levels: one('biz-marketing') },
  { id: 'biz-accounting', name: 'Accounting', cat: 'money', icon: 'ledger', levels: one('biz-accounting') },
  { id: 'fin-realestate', name: 'Real Estate', cat: 'money', icon: 'realestate', levels: one('fin-realestate') },
  { id: 'fin-taxes', name: 'Taxes', cat: 'money', icon: 'taxform', levels: one('fin-taxes') },
  // ---------- tech ----------
  { id: 'tech-computers', name: 'Computer Basics', cat: 'tech', icon: 'desktop', levels: one('tech-computers') },
  { id: 'tech-internet', name: 'How the Internet Works', cat: 'tech', icon: 'wifi', levels: one('tech-internet') },
  { id: 'tech-cyber', name: 'Cybersecurity', cat: 'tech', icon: 'shield', levels: one('tech-cyber') },
  { id: 'tech-ai', name: 'AI & Machine Learning', cat: 'tech', icon: 'robot', levels: one('tech-ai') },
  { id: 'tech-network', name: 'Networking', cat: 'tech', icon: 'router', levels: one('tech-network') },
  { id: 'tech-hardware', name: 'PC Hardware', cat: 'tech', icon: 'chip', levels: one('tech-hardware') },
  { id: 'tech-cloud', name: 'Cloud Computing', cat: 'tech', icon: 'cloud', levels: one('tech-cloud') },
];

/** Icon override for a specific course (e.g. a science level), else the track icon. */
export const COURSE_ICON: Record<string, string> = {
  'sci-g6': 'volcano', 'sci-g7': 'microscope', 'sci-g8': 'magnet', 'sci-bio': 'dna', 'sci-chem': 'beaker', 'sci-phys': 'atom', 'sci-env': 'tree',
  'math-g3': 'abacus', 'math-g4': 'abacus', 'math-g5': 'abacus', 'hist-us': 'bell', 'hist-world': 'globe', civics: 'capitol', geography: 'map', world: 'globe', us: 'bell',
  'ap-bio': 'dna', 'ap-chem': 'beaker', 'ap-calc': 'calculator', 'ap-psych': 'brain', 'ap-gov': 'capitol', 'ap-lang': 'book', 'ap-macro': 'scales', 'econ-micro': 'scales', 'econ-macro': 'coins',
};

export const trackOf = (courseId: string) => TRACKS.find((t) => t.levels.some((l) => l.id === courseId));
export const levelName = (courseId: string) => trackOf(courseId)?.levels.find((l) => l.id === courseId)?.name || '';
export const courseIcon = (courseId: string) => COURSE_ICON[courseId] || trackOf(courseId)?.icon || 'book';
