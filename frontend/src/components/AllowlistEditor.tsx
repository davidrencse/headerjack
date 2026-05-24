import { useState } from 'react';
import { api } from '../api/client';
import type { AllowlistEntry, FieldError } from '../types';
import { summarizeError } from '../utils/formatters';

interface Props { entries: AllowlistEntry[]; onSaved: (entries: AllowlistEntry[]) => void }

const blank = (): Omit<AllowlistEntry, 'id'> => ({ protocol: 'https', host: '', port: null, pathPrefixes: ['/'], notes: '' });

export function AllowlistEditor({ entries, onSaved }: Props) {
  const [draft, setDraft] = useState<Omit<AllowlistEntry, 'id'>[]>(entries.length ? entries.map(({ protocol, host, port, pathPrefixes, notes }) => ({ protocol, host, port, pathPrefixes, notes })) : [blank()]);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  function update(i: number, patch: Partial<Omit<AllowlistEntry, 'id'>>) { setDraft(rows => rows.map((r, idx) => idx === i ? { ...r, ...patch } : r)); }
  function add() { setDraft(rows => [...rows, blank()]); }
  function remove(i: number) { setDraft(rows => rows.filter((_, idx) => idx !== i)); }
  async function validate(save: boolean) {
    setLoading(true); setErrors([]); setStatus('');
    try {
      const normalizedInput = draft.map(row => ({ ...row, host: row.host.trim(), pathPrefixes: row.pathPrefixes.map(p => p.trim()).filter(Boolean), port: row.port === null || Number.isNaN(row.port) ? null : Number(row.port) }));
      const validation = await api.validateAllowlist(normalizedInput);
      setErrors(validation.errors || []);
      if (!validation.valid) { setStatus('Validation failed. Review highlighted fields.'); return; }
      if (save) {
        const saved = await api.saveAllowlist(validation.normalizedEntries.map(({ protocol, host, port, pathPrefixes, notes }) => ({ protocol, host, port, pathPrefixes, notes })));
        onSaved(saved.entries);
        setStatus('Allowlist saved and active.');
      } else setStatus('Allowlist is valid.');
    } catch (e) { setStatus(summarizeError(e)); }
    finally { setLoading(false); }
  }

  return <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
    <div className="flex items-center justify-between gap-4"><h2 className="text-lg font-semibold text-white">Allowlist</h2><button className="focus-ring rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-100 hover:bg-slate-700" onClick={add}>Add entry</button></div>
    <div className="mt-4 space-y-4">
      {draft.map((row, i) => <div key={i} className="grid gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4 md:grid-cols-6">
        <label className="text-sm text-slate-300">Protocol<select className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2" value={row.protocol} onChange={e => update(i, { protocol: e.target.value as 'http' | 'https' })}><option>https</option><option>http</option></select></label>
        <label className="text-sm text-slate-300 md:col-span-2">Host<input className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2" value={row.host} onChange={e => update(i, { host: e.target.value })} placeholder="app.example.test" /></label>
        <label className="text-sm text-slate-300">Port<input className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2" type="number" value={row.port ?? ''} onChange={e => update(i, { port: e.target.value ? Number(e.target.value) : null })} placeholder="default" /></label>
        <label className="text-sm text-slate-300 md:col-span-2">Path prefixes<input className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2" value={row.pathPrefixes.join(', ')} onChange={e => update(i, { pathPrefixes: e.target.value.split(',').map(v => v.trim()).filter(Boolean) })} placeholder="/, /api" /></label>
        <label className="text-sm text-slate-300 md:col-span-5">Notes<input className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2" value={row.notes} onChange={e => update(i, { notes: e.target.value })} /></label>
        <button className="focus-ring self-end rounded-lg border border-red-400/40 px-3 py-2 text-sm text-red-200 disabled:opacity-40" disabled={draft.length === 1} onClick={() => remove(i)}>Remove</button>
      </div>)}
    </div>
    {errors.length > 0 && <ul className="mt-4 rounded-xl border border-red-400/40 bg-red-950/30 p-3 text-sm text-red-100">{errors.map((e, i) => <li key={i}>{e.field}: {e.message}</li>)}</ul>}
    {status && <p className="mt-4 text-sm text-cyan-100">{status}</p>}
    <div className="mt-4 flex flex-wrap gap-3"><button className="focus-ring rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600" disabled={loading} onClick={() => validate(false)}>{loading ? 'Checking…' : 'Validate'}</button><button className="focus-ring rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300" disabled={loading} onClick={() => validate(true)}>Save allowlist</button></div>
  </section>;
}
