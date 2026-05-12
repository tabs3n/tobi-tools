'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loadProjects, saveProjects, sha256,
  LS_PWHASH,
} from '@/lib/data';

const HubCtx = createContext(null);

export function HubProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [unlocked, setUnlocked] = useState(false);
  const [pwExists, setPwExists] = useState(false);

  useEffect(() => {
    setProjects(loadProjects());
    setPwExists(!!localStorage.getItem(LS_PWHASH));
  }, []);

  useEffect(() => {
    if (projects.length > 0) saveProjects(projects);
  }, [projects]);

  const add = useCallback((p) => {
    setProjects(prev => [
      { ...p, id: 'p' + Math.random().toString(36).slice(2, 8) },
      ...prev,
    ]);
  }, []);

  const update = useCallback((id, patch) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  }, []);

  const remove = useCallback((id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

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
      projects, add, update, remove,
      unlocked, pwExists, setupPassword, tryUnlock, lock,
    }}>
      {children}
    </HubCtx.Provider>
  );
}

export const useHub = () => useContext(HubCtx);
