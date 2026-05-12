import { kv } from '@vercel/kv';

const KEY = 'tt:projects';

export async function GET() {
  try {
    const projects = await kv.get(KEY);
    return Response.json(projects ?? []);
  } catch {
    // KV not configured (e.g. local dev without env vars) → return empty
    return Response.json([]);
  }
}

export async function POST(request) {
  try {
    const { projects } = await request.json();
    await kv.set(KEY, projects);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
