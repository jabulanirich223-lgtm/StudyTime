import malik from '../assets/characters/malik.png';
import sophie from '../assets/characters/sophie.png';
import leo from '../assets/characters/leo.png';
import imani from '../assets/characters/imani.png';
import kenji from '../assets/characters/kenji.png';
import amira from '../assets/characters/amira.png';
import msHart from '../assets/characters/ms-hart.png';

/** The study crew: original characters made in ComfyUI. They "ask" questions in lessons. */
export const CAST = [
  { id: 'malik', name: 'Malik', img: malik, line: 'Bet you know this one.' },
  { id: 'sophie', name: 'Sophie', img: sophie, line: 'I just read about this!' },
  { id: 'leo', name: 'Leo', img: leo, line: 'Okay, quick one:' },
  { id: 'imani', name: 'Imani', img: imani, line: 'This is my favorite part.' },
  { id: 'kenji', name: 'Kenji', img: kenji, line: 'Hmm, think carefully.' },
  { id: 'amira', name: 'Amira', img: amira, line: 'Let\'s see if you remember.' },
  { id: 'ms-hart', name: 'Ms. Hart', img: msHart, line: 'This one is on the test.' },
];
export type CastMember = (typeof CAST)[number];
