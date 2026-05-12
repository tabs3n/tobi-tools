'use client';

import { useState, useEffect, useMemo } from 'react';
import { useHub } from './hub-context';
import { ProjectCard, ProjectRow } from './project-card';
import AddModal from './add-modal';
import PasswordGate from './password-gate';
import SettingsPanel from './settings-panel';

export default function V1Hub({ theme, density, view, bg, onTheme, onDensity, onView, onBg }) {
  const hub = useHub();
  const [q,            setQ]            = useState('');
  const [filter,       setFilter]       = useState('all');
  const [adding,       setAdding]       = useState(false);
  const [menuFor,      setMenuFor]      = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // ⌘K / Ctrl+K → focus search
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('tt-search')?.focus();
      }
      if (e.key === 'Escape') {
        setMenuFor(null);
        setSettingsOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const close = () => { setMenuFor(null); setSettingsOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const counts = useMemo(() => ({
    all:      hub.projects?.filter(p => !p.hidden).length ?? 0,
    live:     hub.projects?.filter(p => !p.hidden && p.status === 'live').length ?? 0,
    wip:      hub.projects?.filter(p => !p.hidden && p.status === 'wip').length ?? 0,
    archived: hub.projects?.filter(p => !p.hidden && p.status === 'archived').length ?? 0,
    hidden:   hub.projects?.filter(p => p.hidden).length ?? 0,
  }), [hub.projects]);

  const visible = useMemo(() => {
    if (!hub.projects) return [];
    const inHidden = filter === 'hidden';
    let list = hub.projects.filter(p => inHidden ? p.hidden : !p.hidden);
    if (filter !== 'all' && filter !== 'hidden') {
      list = list.filter(p => p.status === filter);
    }
    if (q.trim()) {
      const needle = q.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(needle) ||
        (p.desc  || '').toLowerCase().includes(needle) ||
        (p.url   || '').toLowerCase().includes(needle)
      );
    }
    return list;
  }, [hub.projects, q, filter]);

  const tabs = [
    { k: 'all',      label: 'Alle' },
    { k: 'live',     label: 'Live' },
    { k: 'wip',      label: 'WIP' },
    { k: 'archived', label: 'Archiv' },
    { k: 'hidden',   label: hub.unlocked ? '🔓 Versteckt' : '🔒 Versteckt' },
  ];

  return (
    <div className={`v1 v1-${density}`}>

      {/* ── Top bar ─────────────────────────────────── */}
      <header className="v1-top">
        <div className="v1-brand">
          <span className="v1-logo">▲</span>
          <span className="v1-brand-name">Tobi&apos;s Tools</span>
        </div>

        <div className="v1-search">
          <span className="v1-search-icon">⌕</span>
          <input
            id="tt-search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Projekte durchsuchen…"
          />
          <span className="v1-kbd">⌘K</span>
        </div>

        <div className="v1-actions">
          {hub.unlocked && (
            <button
              className="v1-btn ghost"
              onClick={hub.lock}
              title="Sperren"
            >🔒</button>
          )}

          <div
            className="v1-settings-wrap"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="v1-btn ghost"
              title="Einstellungen"
              onClick={() => setSettingsOpen(o => !o)}
            >⚙</button>
            {settingsOpen && (
              <SettingsPanel
                theme={theme} density={density} bg={bg}
                onTheme={onTheme} onDensity={onDensity} onBg={onBg}
              />
            )}
          </div>

          <button className="v1-btn primary" onClick={() => setAdding(true)}>
            + Neu
          </button>
        </div>
      </header>

      {/* ── Filter tabs ──────────────────────────────── */}
      <nav className="v1-tabs">
        {tabs.map(t => (
          <button
            key={t.k}
            className={'v1-tab ' + (filter === t.k ? 'on' : '')}
            onClick={() => setFilter(t.k)}
          >
            {t.label}
            <span className="v1-tabcount">{counts[t.k]}</span>
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div className="v1-viewtog">
          <button
            className={'v1-vt ' + (view === 'grid' ? 'on' : '')}
            onClick={() => onView('grid')}
            title="Grid"
          >▦</button>
          <button
            className={'v1-vt ' + (view === 'list' ? 'on' : '')}
            onClick={() => onView('list')}
            title="Liste"
          >≡</button>
        </div>
      </nav>

      {/* ── Content ──────────────────────────────────── */}
      <main className="v1-body">
        {filter === 'hidden' && !hub.unlocked ? (
          <PasswordGate />
        ) : visible.length === 0 ? (
          <div className="v1-empty">
            <div className="v1-empty-icon">∅</div>
            <div>Keine Projekte gefunden.</div>
            <button className="tt-btn primary" onClick={() => setAdding(true)}>
              + Erstes Projekt hinzufügen
            </button>
          </div>
        ) : view === 'grid' ? (
          <div className="v1-grid">
            {visible.map(p => (
              <ProjectCard
                key={p.id} p={p}
                menuOpen={menuFor === p.id}
                onMenu={e => { e.stopPropagation(); setMenuFor(menuFor === p.id ? null : p.id); }}
                onCloseMenu={() => setMenuFor(null)}
              />
            ))}
          </div>
        ) : (
          <div className="v1-list">
            {visible.map(p => (
              <ProjectRow
                key={p.id} p={p}
                menuOpen={menuFor === p.id}
                onMenu={e => { e.stopPropagation(); setMenuFor(menuFor === p.id ? null : p.id); }}
                onCloseMenu={() => setMenuFor(null)}
              />
            ))}
          </div>
        )}
      </main>

      <AddModal open={adding} onClose={() => setAdding(false)} />
    </div>
  );
}
