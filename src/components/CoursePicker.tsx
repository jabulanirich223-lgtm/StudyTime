import { useState } from 'react';
import { CATEGORIES, TRACKS, trackOf, courseIcon } from '../data/catalog';
import { hasCourse } from '../data';
import { snd } from '../lib/sound';
import { CourseIcon } from './Icons';

/** "What do you want to learn?" — one column per category; a track opens its levels. */
export function CoursePicker({ current, onPick }: { current?: string; onPick: (courseId: string) => void }) {
  const [open, setOpen] = useState<string | null>(current ? trackOf(current)?.id || null : null);
  return (
    <div className="cat-cols">
      {CATEGORIES.map((cat) => {
        const tracks = TRACKS.filter((t) => t.cat === cat.id);
        return (
          <section className="cat-col" key={cat.id} style={{ ['--cc' as string]: cat.color }}>
            <header><CourseIcon icon={cat.icon} size={44} /><div><h3>{cat.name}</h3><span>{cat.blurb}</span></div></header>
            <div className="cat-list">
              {tracks.map((t) => {
                const avail = t.levels.filter((l) => hasCourse(l.id));
                const isOpen = open === t.id;
                return (
                  <div key={t.id} className={`track ${isOpen ? 'open' : ''} ${avail.length ? '' : 'soon'}`}>
                    <button className="track-btn" disabled={!avail.length} onClick={() => {
                      snd('tap');
                      if (avail.length === 1) onPick(avail[0].id); else setOpen(isOpen ? null : t.id);
                    }}>
                      <CourseIcon icon={t.icon} size={34} /><span>{t.name}</span>
                      <small>{avail.length ? (avail.length > 1 ? `${avail.length} levels` : '') : 'Soon'}</small>
                    </button>
                    {isOpen && avail.length > 1 && (
                      <div className="levels">
                        {avail.map((l) => (
                          <button key={l.id} className={`level ${current === l.id ? 'cur' : ''}`} onClick={() => { snd('tap'); onPick(l.id); }}>
                            <CourseIcon icon={courseIcon(l.id)} size={24} />{l.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
