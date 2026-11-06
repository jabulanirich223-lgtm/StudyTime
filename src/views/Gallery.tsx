import { Buddy, LOOKS, MOOD_LIST } from '../components/Buddy';
import { Tock } from '../components/Tock';

/** Dev preview of every character in every mood: open the app with #gallery */
export function Gallery() {
  const who = new URLSearchParams(location.hash.split('?')[1] || '').get('who');
  const people = who ? [who] : Object.keys(LOOKS);
  return (
    <div className="gallery">
      {people.flatMap((w) => MOOD_LIST.map((m) => <figure key={w + m}>{w === 'tock' ? <Tock mood={m} /> : <Buddy who={w} mood={m} />}<figcaption>{w} · {m}</figcaption></figure>))}
    </div>
  );
}
