import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ExportNotesPanel } from '../components/ExportNotesPanel';
import { StatusView } from '../components/StatusView';
import type { RunSummary } from '../types';
import { formatDate, summarizeError } from '../utils/formatters';

export function ExportsPage() {
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [selectedRun, setSelectedRun] = useState('');
  const [resultIds, setResultIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  async function load() { setError(''); try { const r = await api.runs(); setRuns(r.runs); if (!selectedRun && r.runs[0]) setSelectedRun(r.runs[0].runId); } catch (e) { setError(summarizeError(e)); } }
  useEffect(() => { load(); }, []);
  useEffect(() => { if (!selectedRun) return; api.runResults(selectedRun).then(r => setResultIds(r.results.map(x => x.resultId))).catch(e => setError(summarizeError(e))); }, [selectedRun]);
  if (error) return <StatusView tone="error" title="Unable to load export data" message={error} actionLabel="Retry" onAction={load} />;
  return <div className="space-y-6"><section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><h1 className="text-xl font-semibold text-white">Exports</h1><p className="mt-2 text-sm text-slate-400">Generate copyable audit notes and request templates from backend run results.</p><label className="mt-4 block text-sm text-slate-300">Run<select className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2" value={selectedRun} onChange={e => setSelectedRun(e.target.value)}><option value="">Select a run</option>{runs.map(r => <option key={r.runId} value={r.runId}>{r.runId} — {r.status} — {formatDate(r.updatedAt)}</option>)}</select></label></section>{selectedRun ? <ExportNotesPanel runId={selectedRun} selectedResultIds={resultIds} /> : <StatusView tone="empty" title="No run selected" message="Start a replay run or choose a recent run to generate exports." />}</div>;
}
