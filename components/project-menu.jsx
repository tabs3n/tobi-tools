'use client';

import { useHub } from './hub-context';
import { STATUS_META } from '@/lib/data';

export default function ProjectMenu({ project, onClose }) {
  const { update, remove } = useHub();

  // Every button is inside an <a> card — preventDefault stops the card's
  // link from firing when a menu action is clicked.
  const handle = (fn) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation();
    fn();
  };

  return (
    <div
      className="tt-menu"
      onClick={e => { e.preventDefault(); e.stopPropagation(); e.nativeEvent?.stopImmediatePropagation(); }}
    >
      <div className="tt-menu-sec">Status</div>
      {Object.entries(STATUS_META).map(([k, v]) => (
        <button
          key={k}
          className="tt-menu-item"
          onClick={handle(() => { update(project.id, { status: k }); onClose(); })}
        >
          <span className="tt-dot" style={{ background: v.dot }} />
          {v.label}
          {project.status === k && (
            <span style={{ marginLeft: 'auto', opacity: 0.5, fontSize: 11 }}>✓</span>
          )}
        </button>
      ))}

      <div className="tt-menu-divider" />

      <button
        className="tt-menu-item"
        onClick={handle(() => { update(project.id, { hidden: !project.hidden }); onClose(); })}
      >
        {project.hidden ? '🔓 Sichtbar machen' : '🔒 Verstecken'}
      </button>

      <button
        className="tt-menu-item"
        onClick={handle(() => { window.open(project.url, '_blank'); onClose(); })}
      >
        ↗ Öffnen
      </button>

      <div className="tt-menu-divider" />

      <button
        className="tt-menu-item danger"
        onClick={handle(() => {
          if (confirm('Projekt wirklich löschen?')) { remove(project.id); onClose(); }
        })}
      >
        Löschen
      </button>
    </div>
  );
}
