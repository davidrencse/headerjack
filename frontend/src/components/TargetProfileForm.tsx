import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { FieldError, HeaderPair, HttpMethod, TargetProfile } from '../types';
import { summarizeError } from '../utils/formatters';

interface Props { profile?: TargetProfile | null; onSaved: (profile: TargetProfile) => void }
const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const emptyProfile: Omit<TargetProfile, 'id' | 'createdAt' | 'updatedAt'> = { name: '', baseUrl: '', paths: ['/'], method: 'GET', headers: [], body: null, cookieRefs: [] };

export function TargetProfileForm({ profile, onSaved }: Props) {
  const [draft, setDraft] = useState<Omit<TargetProfile, 'id' | 'createdAt' | 'updatedAt'>>(emptyProfile);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => { setDraft(profile ? { name: profile.name, baseUrl: profile.baseUrl, paths: profile.paths, method: profile.method, headers: profile.headers, body: profile.body, cookieRefs: profile.cookieRefs } : emptyProfile); setErrors([]); setStatus(''); }, [profile]);
  function setHeader(i: number, patch: Partial<HeaderPair>) { setDraft(d => ({ ...d, headers: d.headers.map((h, idx) => idx === i ? { ...h, ...patch } : h) })); }
  async function submit(save: boolean) {
    setLoading(true); setErrors([]); setStatus('');
    try {
      const payload = { ...draft, name: draft.name.trim(), baseUrl: draft.baseUrl.trim(), paths: draft.paths.map(p => p.trim()).filter(Boolean), headers: draft.headers.filter(h => h.name.trim()).map(h => ({ name: h.name.trim(), value: h.value })), cookieRefs: draft.cookieRefs.map(c => c.trim()).filter(Boolean), body: draft.body && draft.body.length ? draft.body : null };
      const validation = await api.validateProfile(payload);
      setErrors(validation.errors || []);
      if (!validation.valid) { setStatus('Profile validation failed.'); return; }
      if (save) {
        const result = profile?.id ? await api.updateProfile(profile.id, payload) : await api.createProfile(payload);
        onSaved(result.profile);
        setStatus('Profile saved.');
      } else setStatus('Profile is valid.');
    } catch (e) { setStatus(summarizeError(e)); }
    finally { setLoading(false); }
  }
  return <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
    <h2 className="text-lg font-semibold text-white">{profile?.id ? 'Edit target profile' : 'Create target profile'}</h2>
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <label className="text-sm text-slate-300">Name<input className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></label>
      <label className="text-sm text-slate-300">Method<select className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2" value={draft.method} onChange={e => setDraft({ ...draft, method: e.target.value as HttpMethod })}>{methods.map(m => <option key={m}>{m}</option>)}</select></label>
      <label className="text-sm text-slate-300 md:col-span-2">Base URL<input className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2" value={draft.baseUrl} onChange={e => setDraft({ ...draft, baseUrl: e.target.value })} placeholder="https://app.example.test" /></label>
      <label className="text-sm text-slate-300 md:col-span-2">Paths<textarea className="mt-1 min-h-20 w-full rounded-lg border border-slate-700 bg-slate-950 p-2" value={draft.paths.join('\n')} onChange={e => setDraft({ ...draft, paths: e.target.value.split('\n') })} aria-describedby="paths-help" /><span id="paths-help" className="text-xs text-slate-500">One path per line.</span></label>
      <label className="text-sm text-slate-300 md:col-span-2">Cookie references<input className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2" value={draft.cookieRefs.join(', ')} onChange={e => setDraft({ ...draft, cookieRefs: e.target.value.split(',') })} placeholder="session-cookie, test-user" /></label>
      <label className="text-sm text-slate-300 md:col-span-2">Body preset<textarea className="mt-1 min-h-24 w-full rounded-lg border border-slate-700 bg-slate-950 p-2" value={draft.body ?? ''} onChange={e => setDraft({ ...draft, body: e.target.value || null })} /></label>
    </div>
    <div className="mt-5"><div className="flex items-center justify-between"><h3 className="font-medium text-white">Default headers</h3><button className="rounded-lg bg-slate-800 px-3 py-2 text-sm" onClick={() => setDraft({ ...draft, headers: [...draft.headers, { name: '', value: '' }] })}>Add header</button></div><div className="mt-3 space-y-2">{draft.headers.map((h, i) => <div key={i} className="grid gap-2 md:grid-cols-5"><input aria-label="Header name" className="rounded-lg border border-slate-700 bg-slate-950 p-2 md:col-span-2" value={h.name} onChange={e => setHeader(i, { name: e.target.value })} placeholder="Header name" /><input aria-label="Header value" className="rounded-lg border border-slate-700 bg-slate-950 p-2 md:col-span-2" value={h.value} onChange={e => setHeader(i, { value: e.target.value })} placeholder="Value" /><button className="rounded-lg border border-red-400/40 px-3 py-2 text-sm text-red-200" onClick={() => setDraft({ ...draft, headers: draft.headers.filter((_, idx) => idx !== i) })}>Remove</button></div>)}</div></div>
    {errors.length > 0 && <ul className="mt-4 rounded-xl border border-red-400/40 bg-red-950/30 p-3 text-sm text-red-100">{errors.map((e, i) => <li key={i}>{e.field}: {e.message}</li>)}</ul>}
    {status && <p className="mt-4 text-sm text-cyan-100">{status}</p>}
    <div className="mt-4 flex gap-3"><button className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold" disabled={loading} onClick={() => submit(false)}>Validate</button><button className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950" disabled={loading} onClick={() => submit(true)}>{loading ? 'Saving…' : 'Save profile'}</button></div>
  </section>;
}
