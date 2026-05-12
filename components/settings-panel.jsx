'use client';

import { LS_PWHASH } from '@/lib/data';

export default function SettingsPanel({ theme, density, bg, onTheme, onDensity, onBg }) {
  const resetPassword = () => {
    if (confirm('Passwort und Sperre wirklich zurücksetzen?')) {
      localStorage.removeItem(LS_PWHASH);
      location.reload();
    }
  };

  const resetProjects = () => {
    if (confirm('Alle Projekte löschen und Demo-Daten laden?')) {
      localStorage.removeItem('tt.projects.v1');
      location.reload();
    }
  };

  return (
    <div className="v1-settings-panel" onClick={e => e.stopPropagation()}>
      <div className="v1-sett-row">
        <span className="v1-sett-label">Theme</span>
        <div className="v1-sett-seg">
          {[['dark', 'Dark'], ['light', 'Light']].map(([v, l]) => (
            <button
              key={v}
              className={'v1-sett-segbtn ' + (theme === v ? 'on' : '')}
              onClick={() => onTheme(v)}
            >{l}</button>
          ))}
        </div>
      </div>

      <div className="v1-sett-row">
        <span className="v1-sett-label">Dichte</span>
        <div className="v1-sett-seg">
          {[['compact', 'Kompakt'], ['cozy', 'Luftig']].map(([v, l]) => (
            <button
              key={v}
              className={'v1-sett-segbtn ' + (density === v ? 'on' : '')}
              onClick={() => onDensity(v)}
            >{l}</button>
          ))}
        </div>
      </div>

      <div className="v1-sett-row">
        <span className="v1-sett-label">Hintergrund</span>
        <select
          className="v1-sett-select"
          value={bg}
          onChange={e => onBg(e.target.value)}
        >
          <option value="none">Keiner</option>
          <option value="grid">Grid</option>
          <option value="dots">Punkte</option>
          <option value="grain">Grain</option>
        </select>
      </div>

      <div className="v1-sett-divider" />

      <button className="v1-sett-btn" onClick={resetPassword}>
        Passwort zurücksetzen
      </button>
      <button className="v1-sett-btn danger" onClick={resetProjects}>
        Auf Demo-Daten zurücksetzen
      </button>
    </div>
  );
}
