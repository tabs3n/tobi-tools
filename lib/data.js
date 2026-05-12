export const SEED_PROJECTS = [
  { id: 'p1', name: 'next-portfolio',    url: 'https://nextjs.org',       status: 'live',     hidden: false, desc: 'Persönliche Portfolio-Seite, Next.js + MDX.' },
  { id: 'p2', name: 'bookmark-keeper',   url: 'https://vercel.com',       status: 'live',     hidden: false, desc: 'Schnelles Lesezeichen-Tool mit Tags und Volltextsuche.' },
  { id: 'p3', name: 'recipe-converter',  url: 'https://tailwindcss.com',  status: 'wip',      hidden: false, desc: 'Konvertiert Rezepte zwischen metrisch und US-customary.' },
  { id: 'p4', name: 'weather-dash',      url: 'https://open-meteo.com',   status: 'live',     hidden: false, desc: 'Minimalistisches Wetter-Dashboard für die Lieblingsstädte.' },
  { id: 'p5', name: 'ai-sketch',         url: 'https://huggingface.co',   status: 'wip',      hidden: false, desc: 'Skizze hochladen → KI generiert finale Illustration.' },
  { id: 'p6', name: 'old-blog',          url: 'https://ghost.org',        status: 'archived', hidden: false, desc: 'Archiv des alten Blogs aus 2019, nur noch read-only.' },
  { id: 'p7', name: 'finance-tracker',   url: 'https://stripe.com',       status: 'live',     hidden: true,  desc: 'Privater Finanz-Tracker mit Bank-Imports.' },
  { id: 'p8', name: 'client-x-staging',  url: 'https://linear.app',       status: 'wip',      hidden: true,  desc: 'Staging-Umgebung für Kunde X, nicht öffentlich.' },
  { id: 'p9', name: 'experiments',       url: 'https://threejs.org',      status: 'wip',      hidden: true,  desc: 'Sammelbecken für WebGL- und Audio-Experimente.' },
];

export const STATUS_META = {
  live:     { label: 'live',     dot: '#0bce6b' },
  wip:      { label: 'wip',      dot: '#f5a524' },
  archived: { label: 'archived', dot: '#6b6b6b' },
};

export const LS_PROJECTS = 'tt.projects.v1';
export const LS_PWHASH   = 'tt.pwhash.v1';

export function loadProjects() {
  try {
    const raw = localStorage.getItem(LS_PROJECTS);
    if (!raw) return SEED_PROJECTS;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : SEED_PROJECTS;
  } catch {
    return SEED_PROJECTS;
  }
}

export function saveProjects(arr) {
  try { localStorage.setItem(LS_PROJECTS, JSON.stringify(arr)); } catch {}
}

export async function sha256(text) {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function previewUrl(url, w = 640) {
  if (!url) return '';
  return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=${w}&h=${Math.round(w * 0.625)}`;
}

export function faviconUrl(url) {
  try {
    const { hostname } = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch { return ''; }
}

export function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url || ''; }
}

export function colorFor(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360}deg 38% 28%)`;
}
