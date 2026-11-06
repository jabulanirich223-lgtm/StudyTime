import { useGame } from './store';
import type { Item } from './types';

/* Voices
   - Character voices: Kokoro (a free, natural-sounding voice model that runs inside the app, offline after a
     one-time ~90 MB download). Every character has their own voice.
   - Foreign words in language courses: the computer's own voice for that language (native accent).
   Falls back to the computer's voices if character voices are off or can't load. */

export type Seg = { text: string; lang?: string };
type SpeakState = { on: boolean; who: string | null };
let listeners: ((s: SpeakState) => void)[] = [];
export let speaking = false;
let speakingWho: string | null = null;
const emit = (on: boolean, who: string | null) => { speaking = on; speakingWho = on ? who : null; listeners.forEach((l) => l({ on, who: speakingWho })); };
export const onSpeaking = (fn: (s: SpeakState) => void) => { listeners.push(fn); return () => { listeners = listeners.filter((l) => l !== fn); }; };

/** Each character's Kokoro voice. */
export const CHARACTER_VOICE: Record<string, { voice: string; speed?: number; label: string }> = {
  tock: { voice: 'am_puck', speed: 1.05, label: 'Playful' },
  malik: { voice: 'am_michael', label: 'Calm' },
  sophie: { voice: 'af_bella', label: 'Bright' },
  leo: { voice: 'am_liam', speed: 1.08, label: 'Energetic' },
  imani: { voice: 'af_heart', label: 'Warm' },
  kenji: { voice: 'am_eric', label: 'Thoughtful' },
  amira: { voice: 'af_sky', label: 'Gentle' },
  'ms-hart': { voice: 'bf_emma', speed: 0.95, label: 'British teacher' },
};

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;
export function voiceScore(v: SpeechSynthesisVoice) {
  let n = 0;
  if (/natural|neural|online/i.test(v.name)) n += 10;
  if (/premium|enhanced/i.test(v.name)) n += 8;
  if (/Google/i.test(v.name)) n += 5;
  if (/Aria|Jenny|Guy|Ava|Andrew|Emma|Brian|Samantha|Daniel|Serena|Libby|Sonia/i.test(v.name)) n += 3;
  if (/en-US/i.test(v.lang)) n += 1;
  if (/espeak|Albert|Bad News|Bells|Boing|Bubbles|Cellos|Jester|Organ|Trinoids|Whisper|Zarvox|Wobble|Superstar/i.test(v.name)) n -= 20;
  return n;
}
export const enVoices = () => (canSpeak() ? speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang)).sort((a, b) => voiceScore(b) - voiceScore(a)) : []);
export function pickVoice(lang = 'en') {
  if (!canSpeak()) return null;
  if (lang.startsWith('en')) {
    const all = enVoices(), name = useGame.getState().voiceName;
    return (name && all.find((v) => v.name === name)) || all[0] || null;
  }
  const base = lang.slice(0, 2).toLowerCase();
  return speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith(base)).sort((a, b) => voiceScore(b) - voiceScore(a))[0] || null;
}

const clean = (t: string) => t.replace(/→/g, ', then ').replace(/c\. (\d)/g, 'circa $1').replace(/(\d+) BCE/g, '$1 B C E').replace(/\s+/g, ' ').trim();

// ---------- Kokoro ----------
type Kokoro = { generate: (t: string, o: { voice: string; speed?: number }) => Promise<{ audio: Float32Array; sampling_rate: number }> };
let kokoro: Promise<Kokoro | null> | null = null;
export type VoiceStatus = 'off' | 'idle' | 'loading' | 'ready' | 'failed';
let status: VoiceStatus = 'idle';
let statusListeners: ((s: VoiceStatus) => void)[] = [];
const setStatus = (s: VoiceStatus) => { status = s; statusListeners.forEach((l) => l(s)); };
export const voiceStatus = () => status;
export const onVoiceStatus = (fn: (s: VoiceStatus) => void) => { statusListeners.push(fn); return () => { statusListeners = statusListeners.filter((l) => l !== fn); }; };

export function loadVoices() {
  if (kokoro) return kokoro;
  setStatus('loading');
  kokoro = import('kokoro-js')
    .then(({ KokoroTTS }) => KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8', device: 'wasm' }) as unknown as Promise<Kokoro>)
    .then((k) => { setStatus('ready'); return k; })
    .catch((e) => { console.warn('Character voices failed to load', e); setStatus('failed'); kokoro = null; return null; });
  return kokoro;
}

let ctx: AudioContext | null = null;
let current: AudioBufferSourceNode | null = null;
let runId = 0;

function playPCM(pcm: Float32Array, rate: number, id: number) {
  return new Promise<void>((res) => {
    if (id !== runId) return res();
    ctx = ctx || new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    const buf = ctx.createBuffer(1, pcm.length, rate);
    buf.copyToChannel(pcm as Float32Array<ArrayBuffer>, 0);
    const src = ctx.createBufferSource();
    src.buffer = buf; src.connect(ctx.destination);
    src.onended = () => { if (current === src) current = null; res(); };
    current = src; src.start();
  });
}

function browserSay(text: string, lang: string, id: number) {
  return new Promise<void>((res) => {
    if (!canSpeak() || id !== runId) return res();
    const s = useGame.getState();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = s.ttsRate; u.pitch = s.ttsPitch; u.lang = lang;
    const v = pickVoice(lang); if (v) u.voice = v;
    u.onend = u.onerror = () => res();
    speechSynthesis.speak(u);
  });
}

/** Split into short sentences so the first one plays quickly. */
const sentences = (t: string) => t.match(/[^.!?。！？]+[.!?。！？]*\s*/g)?.map((x) => x.trim()).filter(Boolean) || [t];

export async function speakSegs(segs: Seg[], who = 'tock') {
  stopSpeak();
  const id = ++runId;
  const s = useGame.getState();
  emit(true, who);
  const useKokoro = s.charVoices !== false;
  const k = useKokoro ? await loadVoices() : null;
  for (const seg of segs) {
    if (id !== runId) break;
    const text = clean(seg.text);
    if (!text) continue;
    const lang = seg.lang || 'en-US';
    if (k && lang.startsWith('en')) {
      const v = CHARACTER_VOICE[who] || CHARACTER_VOICE.tock;
      for (const line of sentences(text)) {
        if (id !== runId) break;
        try {
          const out = await k.generate(line, { voice: v.voice, speed: (v.speed || 1) * s.ttsRate });
          await playPCM(out.audio, out.sampling_rate, id);
        } catch { await browserSay(line, lang, id); }
      }
    } else await browserSay(text, lang, id);
  }
  if (id === runId) emit(false, null);
}

export const speak = (text: string, who = 'tock') => speakSegs([{ text }], who);

export function stopSpeak() {
  runId++;
  try { current?.stop(); } catch { /* already stopped */ }
  current = null;
  if (canSpeak()) speechSynthesis.cancel();
  if (speaking) emit(false, null);
}

/** Read-aloud script for a lesson item. Foreign-language options are tagged so a native voice reads them. */
export function itemSegs(it: Item, order?: number[], lang?: string): Seg[] {
  if (it.t === 'card') return [{ text: `${it.h}. ${it.b}` }];
  const segs: Seg[] = [];
  if ('stim' in it && it.stim) segs.push({ text: `Source: ${it.stim} From ${'src' in it ? it.src : ''}.` });
  segs.push(...splitForeign(it.q, lang));
  if (it.t === 'mc' || it.t === 'year') (order || it.o.map((_, i) => i)).forEach((oi, n) => { segs.push({ text: `Option ${'ABCD'[n]}.` }); segs.push(...splitForeign(it.o[oi], lang, true)); });
  if (it.t === 'tf') segs.push({ text: 'True or false?' });
  if (it.t === 'match') segs.push({ text: `Match these: ${it.pairs.map((p) => p[0]).join(', ')}. With: ${it.pairs.map((p) => p[1]).join(', ')}.` });
  if (it.t === 'order') segs.push({ text: `Events: ${it.items.map((x) => x[0]).join('. ')}.` });
  return segs;
}
export const itemText = (it: Item, order?: number[]) => itemSegs(it, order).map((s) => s.text).join(' ');

const NON_LATIN = /[Ѐ-ӿ؀-ۿऀ-ॿ぀-ヿ㐀-鿿가-힯]/;
/** In a language course, read quoted / foreign text with the native voice and the rest in English. */
function splitForeign(text: string, lang?: string, wholeIsForeign = false): Seg[] {
  if (!lang || lang.startsWith('en')) return [{ text }];
  const noRoman = (t: string) => t.replace(/\s*\([^)]*\)/g, '').trim();
  if (wholeIsForeign) {
    // options: foreign unless it looks like a plain English phrase
    const looksEnglish = !NON_LATIN.test(text) && /^[A-Za-z0-9 ,.'?!-]+$/.test(text) && /\b(the|a|an|is|are|I|you|to|of|and|my|it|good|hello|thank|yes|no)\b/i.test(text);
    return looksEnglish ? [{ text }] : [{ text: noRoman(text), lang }];
  }
  const parts: Seg[] = [];
  const re = /'([^']+)'|"([^"]+)"|“([^”]+)”|([Ѐ-ӿ؀-ۿऀ-ॿ぀-ヿ㐀-鿿가-힯][^\s,.?!()]*(?:\s+[Ѐ-ӿ؀-ۿऀ-ॿ぀-ヿ㐀-鿿가-힯][^\s,.?!()]*)*)/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push({ text: text.slice(last, m.index) });
    const inner = m[1] || m[2] || m[3] || m[4];
    // quoted English words (e.g. "How do you say 'good morning'") stay English
    const foreign = NON_LATIN.test(inner) || !/^[A-Za-z ,.'?!-]+$/.test(inner) || /[áéíóúñàèìòùâêîôûçäöüßãõ]/i.test(inner);
    parts.push(foreign ? { text: noRoman(inner), lang } : { text: inner });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last).replace(/^\s*\([^)]*\)/, '') });
  return parts.filter((p) => p.text.trim());
}

/** BCP-47 language for language-course ids like "es-1". */
export function courseLang(courseId: string) {
  const m = courseId.match(/^(es|fr|de|it|pt|ru|ja|zh|ko|ar|hi|en)-\d$/);
  return m ? ({ es: 'es-ES', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', pt: 'pt-BR', ru: 'ru-RU', ja: 'ja-JP', zh: 'zh-CN', ko: 'ko-KR', ar: 'ar-SA', hi: 'hi-IN', en: 'en-US' } as Record<string, string>)[m[1]] : undefined;
}
