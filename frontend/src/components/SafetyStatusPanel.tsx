import type { AllowlistEntry, HealthResponse, PolicyResponse } from '../types';

interface Props { acknowledged: boolean; allowlist: AllowlistEntry[]; health: HealthResponse | null; policy: PolicyResponse | null }

export function SafetyStatusPanel({ acknowledged, allowlist, health, policy }: Props) {
  const ready = acknowledged && allowlist.length > 0 && !!health;
  return <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
    <h3 className="font-semibold text-white">Safety status</h3>
    <dl className="mt-4 space-y-3 text-sm">
      <div className="flex justify-between gap-4"><dt className="text-slate-400">Authorization</dt><dd className={acknowledged ? 'text-emerald-300' : 'text-amber-300'}>{acknowledged ? 'confirmed' : 'required'}</dd></div>
      <div className="flex justify-between gap-4"><dt className="text-slate-400">Allowlist entries</dt><dd className={allowlist.length ? 'text-emerald-300' : 'text-amber-300'}>{allowlist.length}</dd></div>
      <div className="flex justify-between gap-4"><dt className="text-slate-400">Backend</dt><dd className={health ? 'text-emerald-300' : 'text-red-300'}>{health ? 'online' : 'unavailable'}</dd></div>
      <div className="flex justify-between gap-4"><dt className="text-slate-400">Audit-only</dt><dd className="text-cyan-200">{policy?.auditOnly || health?.policy.auditOnly ? 'active' : 'optional'}</dd></div>
      <div className="flex justify-between gap-4"><dt className="text-slate-400">Max run size</dt><dd className="text-slate-200">{policy?.limits.maxRequestsPerRun ?? health?.policy.maxRequestsPerRun ?? '—'}</dd></div>
    </dl>
    <div className={`mt-4 rounded-xl px-3 py-2 text-sm ${ready ? 'bg-emerald-500/10 text-emerald-200' : 'bg-amber-500/10 text-amber-100'}`}>{ready ? 'Execution workflows are available.' : 'Complete setup before running previews or replays.'}</div>
  </aside>;
}
