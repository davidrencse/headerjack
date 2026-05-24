import type { RunSummary } from '../types';

interface Props { disabled: boolean; running?: RunSummary | null; selectedCount: number; onStart: () => void; onCancel: () => void }

export function RunControlBar({ disabled, running, selectedCount, onStart, onCancel }: Props) {
  const active = running && (running.status === 'queued' || running.status === 'running');
  return <div className="sticky bottom-4 z-10 rounded-2xl border border-slate-700 bg-slate-950/95 p-4 shadow-2xl"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p className="font-semibold text-white">{active ? `Run ${running.runId} is ${running.status}` : `${selectedCount} variants selected`}</p>{running && <p className="text-sm text-slate-400">Completed {running.completedCount}/{running.queuedCount} · failed {running.failedCount}</p>}</div><div className="flex gap-3">{active ? <button className="rounded-lg border border-red-400/50 px-4 py-2 text-sm font-semibold text-red-200" onClick={onCancel}>Request cancellation</button> : <button className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40" disabled={disabled || selectedCount === 0} onClick={onStart}>Start controlled replay</button>}</div></div></div>;
}
