import type { RunResult } from '../types';
import { severityClass } from '../utils/formatters';

export function HeuristicFindingsPanel({ results }: { results: RunResult[] }) {
  const findings = results.flatMap(r => r.findings.map(f => ({ ...f, label: r.label, resultId: r.resultId })));
  return <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><h2 className="text-lg font-semibold text-white">Heuristic findings</h2>{findings.length === 0 ? <p className="mt-3 text-sm text-slate-400">No heuristic findings were returned for these results.</p> : <div className="mt-4 space-y-3">{findings.map((f, i) => <article key={`${f.resultId}-${i}`} className={`rounded-xl border p-4 ${severityClass(f.severity)}`}><div className="flex flex-wrap items-center gap-2"><strong>{f.severity.toUpperCase()}</strong><span className="text-xs opacity-80">{f.type}</span><span className="text-xs opacity-80">confidence: {f.confidence}</span></div><p className="mt-2 text-sm">{f.message}</p><p className="mt-2 text-xs opacity-80">Result: {f.label}</p></article>)}</div>}</section>;
}
