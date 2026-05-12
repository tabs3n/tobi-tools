'use client';

import { useState, useEffect } from 'react';
import { HubProvider } from '@/components/hub-context';
import V1Hub from '@/components/v1-hub';

const LS = {
  theme:   'tt.theme',
  density: 'tt.density',
  view:    'tt.view',
  bg:      'tt.bg',
};

export default function Page() {
  const [theme,   setTheme]   = useState('dark');
  const [density, setDensity] = useState('cozy');
  const [view,    setView]    = useState('grid');
  const [bg,      setBg]      = useState('grid');
  const [ready,   setReady]   = useState(false);

  // Hydrate from localStorage on first mount
  useEffect(() => {
    setTheme(localStorage.getItem(LS.theme)     || 'dark');
    setDensity(localStorage.getItem(LS.density) || 'cozy');
    setView(localStorage.getItem(LS.view)       || 'grid');
    setBg(localStorage.getItem(LS.bg)           || 'grid');
    setReady(true);
  }, []);

  // Apply theme to <html data-theme>
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(LS.theme, theme);
  }, [theme]);

  // Apply bg effect to <body data-bg>
  useEffect(() => {
    document.body.dataset.bg = bg;
    localStorage.setItem(LS.bg, bg);
  }, [bg]);

  useEffect(() => { localStorage.setItem(LS.density, density); }, [density]);
  useEffect(() => { localStorage.setItem(LS.view, view); }, [view]);

  if (!ready) return null;

  return (
    <div id="app-shell">
      <HubProvider>
        <V1Hub
          theme={theme}   density={density}  view={view}    bg={bg}
          onTheme={setTheme} onDensity={setDensity} onView={setView} onBg={setBg}
        />
      </HubProvider>
    </div>
  );
}
