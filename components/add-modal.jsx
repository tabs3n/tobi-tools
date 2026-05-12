'use client';

import { useState, useEffect, useRef } from 'react';
import { useHub } from './hub-context';
import { STATUS_META } from '@/lib/data';

export default function AddModal({ open, onClose }) {
  const { add } = useHub();
  const [url,    setUrl]    = useState('');
  const [name,   setName]   = useState('');
  const [desc,   setDesc]   = useState('');
  const [status, setStatus] = useState('live');
  const [hidden, setHidden] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setUrl(''); setName(''); setDesc(''); setStatus('live'); setHidden(false);
    }
  }, [open]);

  // Auto-derive name from URL
  useEffect(() => {
    if (!url || name) return;
    try {
      const u = new URL(url.startsWith('http') ? url : 'https://' + url);
      setName(u.hostname.replace(/^www\./, '').split('.')[0]);
    } catch {}
  }, [url, name]);

  if (!open) return null;

  const submit = (e) => {
    e?.preventDefault();
    if (!url.trim() || !name.trim()) return;
    const finalUrl = url.trim().startsWith('http') ? url.trim() : 'https://' + url.trim();
    add({ url: finalUrl, name: name.trim(), desc: desc.trim(), status, hidden });
    onClose();
  };

  return (
    <div className="tt-modal-back" onClick={onClose}>
      <form className="tt-modal" onClick={e => e.stopPropagation()} onSubmit={submit}>
        <div className="tt-modal-head">
          <div className="tt-modal-title">Neues Projekt</div>
          <button type="button" className="tt-iconbtn" onClick={onClose}>✕</button>
        </div>

        <label className="tt-field">
          <span>URL</span>
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://my-project.vercel.app"
            autoComplete="off"
          />
        </label>

        <label className="tt-field">
          <span>Name</span>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="project-name"
          />
        </label>

        <label className="tt-field">
          <span>Beschreibung</span>
          <textarea
            rows={2}
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Kurze Beschreibung, was das Projekt macht…"
          />
        </label>

        <div className="tt-field">
          <span>Status</span>
          <div className="tt-segment">
            {Object.entries(STATUS_META).map(([k, v]) => (
              <button
                type="button" key={k}
                className={'tt-segbtn ' + (status === k ? 'on' : '')}
                onClick={() => setStatus(k)}
              >
                <span className="tt-dot" style={{ background: v.dot }} />
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <label className="tt-check">
          <input
            type="checkbox"
            checked={hidden}
            onChange={e => setHidden(e.target.checked)}
          />
          <span>Im versteckten Bereich speichern</span>
        </label>

        <div className="tt-modal-foot">
          <button type="button" className="tt-btn ghost" onClick={onClose}>
            Abbrechen
          </button>
          <button type="submit" className="tt-btn primary">
            Hinzufügen
          </button>
        </div>
      </form>
    </div>
  );
}
