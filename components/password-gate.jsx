'use client';

import { useState } from 'react';
import { useHub } from './hub-context';

export default function PasswordGate() {
  const { pwExists, setupPassword, tryUnlock } = useHub();
  const [pw,  setPw]  = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (pwExists) {
      const ok = await tryUnlock(pw);
      if (!ok) setErr('Falsches Passwort.');
    } else {
      if (pw.length < 4) { setErr('Mindestens 4 Zeichen.'); return; }
      if (pw !== pw2)    { setErr('Passwörter stimmen nicht überein.'); return; }
      await setupPassword(pw);
    }
  };

  return (
    <div className="tt-gate">
      <form onSubmit={submit} className="tt-gate-card">
        <div className="tt-gate-lock">⌥</div>
        <div className="tt-gate-title">
          {pwExists ? 'Bereich gesperrt' : 'Passwort festlegen'}
        </div>
        <div className="tt-gate-sub">
          {pwExists
            ? 'Gib das Passwort ein, um deine versteckten Projekte zu sehen.'
            : 'Dieses Passwort schützt deinen versteckten Bereich. Es wird lokal als SHA-256-Hash gespeichert.'}
        </div>

        <input
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          placeholder={pwExists ? 'Passwort' : 'Neues Passwort'}
          autoFocus
        />
        {!pwExists && (
          <input
            type="password"
            value={pw2}
            onChange={e => setPw2(e.target.value)}
            placeholder="Passwort wiederholen"
          />
        )}
        {err && <div className="tt-gate-err">{err}</div>}

        <button type="submit" className="tt-btn primary">
          {pwExists ? 'Entsperren' : 'Festlegen'}
        </button>
        <div className="tt-gate-hint">
          Das Passwort bleibt als Hash in deinem Browser (localStorage).
        </div>
      </form>
    </div>
  );
}
