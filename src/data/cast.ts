
/** The study crew: original flat-style characters (drawn in components/Buddy.tsx). They "ask" questions in lessons. */
export const CAST = [
  { id: 'malik', name: 'Malik', line: 'Bet you know this one.' },
  { id: 'sophie', name: 'Sophie', line: 'I just read about this!' },
  { id: 'leo', name: 'Leo', line: 'Okay, quick one:' },
  { id: 'imani', name: 'Imani', line: 'This is my favorite part.' },
  { id: 'kenji', name: 'Kenji', line: 'Hmm, think carefully.' },
  { id: 'amira', name: 'Amira', line: 'Let\'s see if you remember.' },
  { id: 'ms-hart', name: 'Ms. Hart', line: 'This one is on the test.' },
];
export type CastMember = (typeof CAST)[number];

