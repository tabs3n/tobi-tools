'use client';

import { useState } from 'react';
import { STATUS_META, previewUrl, faviconUrl, hostOf, colorFor } from '@/lib/data';
import ProjectMenu from './project-menu';

export function ProjectCard({ p, menuOpen, onMenu, onCloseMenu }) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <a className="v1-card" href={p.url} target="_blank" rel="noreferrer">
      <div className="v1-card-thumb">
        {imgOk ? (
          <img
            src={previewUrl(p.url, 640)}
            alt=""
            onError={() => setImgOk(false)}
            loading="lazy"
          />
        ) : (
          <div
            className="v1-thumb-fallback"
            style={{ background: `linear-gradient(135deg, ${colorFor(p.name)} 0%, #0a0a0a 100%)` }}
          >
            {p.name[0]?.toUpperCase()}
          </div>
        )}
        <div className="v1-card-fade" />
      </div>

      <div className="v1-card-body">
        <div className="v1-card-head">
          <img
            className="v1-fav"
            src={faviconUrl(p.url)}
            alt=""
            onError={e => { e.currentTarget.style.opacity = '0'; }}
          />
          <span className="v1-card-name">{p.name}</span>
          <span className="v1-status">
            <span className="tt-dot" style={{ background: STATUS_META[p.status].dot }} />
            {STATUS_META[p.status].label}
          </span>
          <button
            className="v1-more"
            onClick={e => { e.preventDefault(); onMenu(e); }}
            aria-label="Aktionen"
          >⋯</button>
          {menuOpen && <ProjectMenu project={p} onClose={onCloseMenu} />}
        </div>

        <div className="v1-card-desc">
          {p.desc || <span style={{ color: 'var(--dim)' }}>Keine Beschreibung.</span>}
        </div>
        <div className="v1-card-host">{hostOf(p.url)}</div>
      </div>
    </a>
  );
}

export function ProjectRow({ p, menuOpen, onMenu, onCloseMenu }) {
  return (
    <a className="v1-row" href={p.url} target="_blank" rel="noreferrer">
      <img
        className="v1-fav"
        src={faviconUrl(p.url)}
        alt=""
        onError={e => { e.currentTarget.style.opacity = '0'; }}
      />
      <span className="v1-row-name">{p.name}</span>
      <span className="v1-status">
        <span className="tt-dot" style={{ background: STATUS_META[p.status].dot }} />
        {STATUS_META[p.status].label}
      </span>
      <span className="v1-row-desc">{p.desc}</span>
      <span className="v1-row-host">{hostOf(p.url)}</span>
      <button
        className="v1-more"
        onClick={e => { e.preventDefault(); onMenu(e); }}
        aria-label="Aktionen"
      >⋯</button>
      {menuOpen && <ProjectMenu project={p} onClose={onCloseMenu} />}
    </a>
  );
}
