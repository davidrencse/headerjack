import { API_BASE_URL } from '../api/client';
import type { HealthResponse, PolicyResponse } from '../types';

interface Props { health: HealthResponse | null; policy: PolicyResponse | null; acknowledged: boolean; setAcknowledged: (v: boolean) => void }

export function SettingsPage({ health, policy, acknowledged, setAcknowledged }: Props) {
  function clearPrefs() { localStorage.removeItem('headerjack.authorizationAcknowledged'); setAcknowledged(false); }
  return <div className="space-y-6"><section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><h1 className="text-xl font-semibold text-white">Settings</h1><div className="mt-4 grid gap-4 md:grid-cols-2"><label className="text-sm text-slate-300">API base URL<input readOnly className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-400" value={API_BASE_URL} /></label><label className="flex items-center gap-3 rounded-xl border border-slate-800 p-3 text-sm"><input type="checkbox" checked={acknowledged} onChange={e => setAcknowledged(e.target.checked)} /> Authorization acknowledged</label></div><button className="mt-4 rounded-lg border border-red-400/40 px-4 py-2 text-sm text-red-200" onClick={clearPrefs}>Clear local preferences</button></section><section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><h2 className="text-lg font-semibold text-white">Backend policy</h2><pre className="codeblock mt-3 rounded-xl bg-slate-950 p-4 text-xs text-slate-200">{JSON.stringify({ health, policy }, null, 2)}</pre></section></div>;
}
