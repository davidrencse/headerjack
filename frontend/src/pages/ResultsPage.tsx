import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ExportNotesPanel } from '../components/ExportNotesPanel';
import { HeuristicFindingsPanel } from '../components/HeuristicFindingsPanel';
import { ResponseDeltaTable } from '../components/ResponseDeltaTable';
import { StatusView } from '../components/StatusView';
import type { RunResult, RunSummary } from '../types';
import { formatDate, summarizeError } from '../utils/formatters';

interface Props { runId?: string; navigate: (path: string) => void }

export function ResultsPage({ runId, navigate }: Props) {
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [run, setRun] = useState<RunSummary | null>(null);
  const [results, setResults] = useState<RunResult[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  async function load() { setLoading(true); setError(''); try { const list = await api.runs(); setRuns(list.runs); if (runId) { const [summary, res] = await Promise.all([api.run(runId), api.runResults(runId)]); setRun(summary.run); setResults(res.results); setSelectedIds(res.results.map(r => r.resultId)); } } catch (e) { setError(summarizeError(e)); } finally { setLoading(false); } }
  useEffect(() => { load(); }, [runId]);
  useEffect(() => { if (!run || (run.status !== 'queued' && run.status !== 'running')) return; const t = window.setInterval(load, 2000); return () => clearInterval(t); }, [run?.runId, run?.status]);
  if (loading) return <StatusView title="Loading results…" />;
  if (error) return <StatusView tone="error" title="Unable to load results" message={error} actionLabel="Retry" onAction={load} />;
  if (!runId) return <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><h2 className="text-lg font-semibold text-white">Recent runs</h2>{runs.length === 0 ? <p className="mt-3 text-slate-400">No runs have been started yet.</p> : <div className="mt-4 space-y-3">{runs.map(r => <button key={r.runId} className="block w-full rounded-xl border border-slate-800 p-4 text-left hover:border-cyan-500/60" onClick={() => navigate(`/results/${r.runId}`)}><strong className="text-white">{r.runId}</strong><span className="ml-3 text-sm text-slate-400">{r.status}</span><p className="text-sm text-slate-500">{r.completedCount}/{r.queuedCount} completed · {formatDate(r.updatedAt)}</p></button>)}</div>}</section>;
  if (!run) return <StatusView tone="empty" title="Run not found" message="The backend did not return this run." />;
  return <div className="space-y-6"><section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><h1 className="text-xl font-semibold text-white">Run {run.runId}</h1><p className="mt-2 text-sm text-slate-400">Status {run.status} · completed {run.completedCount}/{run.queuedCount} · failed {run.failedCount} · updated {formatDate(run.updatedAt)}</p></section><ResponseDeltaTable results={results} selectedIds={selectedIds} onSelectionChange={setSelectedIds} /><HeuristicFindingsPanel results={results} /><ExportNotesPanel runId={run.runId} selectedResultIds={selectedIds} /></div>;
}
