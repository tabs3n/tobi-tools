'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  loadProjects, saveProjects, sha256,
  SEED_PROJECTS, LS_PWHASH,
} from '@/lib/data';

const HubCtx = createContext(null);

async function fetchProjects() {
  const res = await fetch('/api/projects');
  if (!res.ok) throw new Error('fetch failed');
  const data = await res.json();
  return Array.isArray(data) && data.length > 0 ? data : null;
}

async function pushProjects(projects) {
  await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projects }),
  });
}

export function HubProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [pwExists, setPwExists] = useState(false);

  // Load on mount: try API first, fall back to localStorage
  useEffect(() => {
    setPwExists(!!localStorage.getItem(LS_PWHASH));
    fetchProjects()
      .then(remote => {
        if (remote) {
          setProjects(remote);
          saveProjects(remote); // keep local cache in sync
        } else {
          // Nothing in KV yet → use localStorage (or seed)
          const local = loadProjects();
          setProjects(local);
          // Push local/seed data to KV so other devices get it too
          pushProjects(local).catch(() => {});
        }
      })
      .catch(() => {
        // API unreachable → use localStorage
        setProjects(loadProjects());
      })
      .finally(() => setLoading(false));
  }, []);

  // Helper: update state + persist everywhere
  const sync = useCallback((next) => {
    saveProjects(next);          // localStorage (instant)
    pushProjects(next).catch(() => {}); // KV (async, silent fail)
  }, []);

  const add = useCallback((p) => {
    setProjects(prev => {
      const next = [{ ...p, id: 'p' + Math.random().toString(36).slice(2, 8) }, ...prev];
      sync(next);
      return next;
    });
  }, [sync]);

  const update = useCallback((id, patch) => {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...patch } : p);
      sync(next);
      return next;
    });
  }, [sync]);

  const remove = useCallback((id) => {
    setProjects(prev => {
      const next = prev.filter(p => p.id !== id);
      sync(next);
      return next;
    });
  }, [sync]);

  const setupPassword = useCallback(async (pw) => {
    const h = await sha256(pw);
    localStorage.setItem(LS_PWHASH, h);
    setPwExists(true);
    setUnlocked(true);
  }, []);

  const tryUnlock = useCallback(async (pw) => {
    const h = await sha256(pw);
    const stored = localStorage.getItem(LS_PWHASH);
    if (h === stored) { setUnlocked(true); return true; }
    return false;
  }, []);

  const lock = useCallback(() => setUnlocked(false), []);

  return (
    <HubCtx.Provider value={{
      projects, loading, add, update, remove,
      unlocked, pwExists, setupPassword, tryUnlock, lock,
    }}>
      {children}
    </HubCtx.Provider>
  );
}

export const useHub = () => useContext(HubCtx);
