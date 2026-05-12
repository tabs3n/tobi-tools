'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useHub } from './hub-context';
import { ProjectCard, ProjectRow } from './project-card';
import AddModal from './add-modal';
import PasswordGate from './password-gate';
import SettingsPanel from './settings-panel';

// Stop both React's synthetic bubbling AND the native DOM event so the
// document-level "close all menus" listener doesn't fire immediately.
function stopAll(e) {
  e.stopPropagation();
  e.nativeEvent?.stopImmediatePropagation();
}

// Mini password prompt shown inside the settings popup position
function SettingsAuth({ onSuccess, onClose }) {
  const { pwExists, tryUnlock, setupPassword } = useHub();
  const [pw,  setPw]  = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 30); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (pwExists) {
      const ok = await tryUnlock(pw);
      if (ok) onSuccess();
      else setErr('Falsches Passwort.');
    } else {
      if (pw.length < 4) { setErr('Mindestens 4 Zeichen.'); return; }
      if (pw !== pw2)    { setErr('Passwörter stimmen nicht überein.'); return; }
      await setupPassword(pw);
      onSuccess();
    }
  };

  return (
    <div className="v1-settings-panel v1-settings-auth" onClick={stopAll}>
      <div className="v1-sett-auth-title">
        {pwExists ? 'Einstellungen entsperren' : 'Passwort festlegen'}
      </div>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input
          ref={inputRef}
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          placeholder={pwExists ? 'Passwort' : 'Neues Passwort'}
          className="v1-sett-input"
        />
        {!pwExists && (
          <input
            type="password"
            value={pw2}
            onChange={e => setPw2(e.target.value)}
            placeholder="Wiederholen"
            className="v1-sett-input"
          />
        )}
        {err && <div className="v1-sett-err">{err}</div>}
        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
          <button type="button" className="v1-sett-btn" onClick={onClose}
            style={{ flex: 1, textAlign: 'center' }}>
            Abbrechen
          </button>
          <button type="submit" className="v1-sett-btn v1-sett-btn-primary"
            style={{ flex: 1, textAlign: 'center' }}>
            {pwExists ? 'Entsperren' : 'Festlegen'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function V1Hub({ theme, density, view, bg, onTheme, onDensity, onView, onBg }) {
  const hub = useHub();
  const [q,            setQ]            = useState('');
  const [filter,       setFilter]       = useState('all');
  const [adding,       setAdding]       = useState(false);
  const [menuFor,      setMenuFor]      = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // 'closed' | 'auth' | 'open'
  const settingsState = settingsOpen
    ? (hub.unlocked ? 'open' : 'auth')
    : 'closed';

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

  // Close all popups when clicking anywhere outside them
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
            <button className="v1-btn ghost" onClick={hub.lock} title="Sperren">
              🔒
            </button>
          )}

          <div className="v1-settings-wrap" onClick={stopAll}>
            <button
              className="v1-btn ghost"
              title="Einstellungen"
              onClick={() => setSettingsOpen(o => !o)}
            >⚙</button>

            {settingsState === 'auth' && (
              <SettingsAuth
                onSuccess={() => {/* hub.unlocked is now true, re-render shows 'open' */}}
                onClose={() => setSettingsOpen(false)}
              />
            )}
            {settingsState === 'open' && (
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
                onMenu={e => { stopAll(e); setMenuFor(menuFor === p.id ? null : p.id); }}
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
                onMenu={e => { stopAll(e); setMenuFor(menuFor === p.id ? null : p.id); }}
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
