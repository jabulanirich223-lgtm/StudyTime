import { create } from 'zustand';
import type { ReactNode } from 'react';
import type { Item, NodeKind } from './types';

export type View = 'learn' | 'ap' | 'cram' | 'league' | 'shop' | 'review' | 'profile' | 'courses';

export type SessionKind = 'lesson' | 'drill' | 'apsim' | 'lightning' | 'date' | 'review' | 'flash';
export type SessionCfg = {
  id?: number;
  kind: SessionKind;
  title: string;
  items: Item[];
  color?: string;
  hearts?: boolean;
  requeue?: boolean;
  timer?: number;
  fast?: boolean;
  exam?: boolean;
  endless?: () => Item[];
  nodeId?: string;
  nodeK?: NodeKind;
  unit?: number;
};

type Toast = { id: number; title: string; sub?: string; icon: string };

type UI = {
  view: View;
  modal: ReactNode | null;
  session: SessionCfg | null;
  toasts: Toast[];
  go: (v: View) => void;
  open: (n: ReactNode) => void;
  close: () => void;
  start: (s: SessionCfg) => void;
  endSession: () => void;
  toast: (title: string, sub: string | undefined, icon: string, delay?: number) => void;
};

let tid = 0;
export const useUI = create<UI>()((set, get) => ({
  view: 'learn', modal: null, session: null, toasts: [],
  go: (view) => { set({ view }); window.scrollTo(0, 0); },
  open: (modal) => set({ modal }),
  close: () => set({ modal: null }),
  start: (session) => set({ session: { ...session, id: Date.now() }, modal: null }),
  endSession: () => set({ session: null }),
  toast: (title, sub, icon, delay = 0) => {
    setTimeout(() => {
      const id = ++tid;
      set({ toasts: [...get().toasts, { id, title, sub, icon }] });
      setTimeout(() => set({ toasts: get().toasts.filter((t) => t.id !== id) }), 3200);
    }, delay);
  },
}));
