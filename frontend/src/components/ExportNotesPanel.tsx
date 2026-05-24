import { useState } from 'react';
import { api } from '../api/client';
import type { ExportNotesResponse } from '../types';
import { summarizeError } from '../utils/formatters';

interface Props { runId: string; selectedResultIds: string[] }

export function ExportNotesPanel({ runId, selectedResultIds }: Props) {
  const [format, setFormat] = useState<'text' | 'json'>('text');
  const [includeFindings, setIncludeFindings] = useState(true);
  const [exported, setExported] = useState<ExportNotesResponse | null>(null);
  const [status, setStatus] = useState('');
  async function generate() { setStatus(''); try { setExported(await api.exportNotes({ runId, resultIds: selectedResultIds, format, includeFindings })); } catch (e) { setStatus(summarizeError(e)); } }
  async function copy() { if (!exported) return; await navigator.clipboard.writeText(exported.content); setStatus('Copied export content to clipboard.'); }
  return <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><h2 className="text-lg font-semibold text-white">Export audit notes</h2><div className="mt-4 flex flex-wrap items-center gap-3"><label className="text-sm text-slate-300">Format <select className="ml-2 rounded-lg border border-slate-700 bg-slate-950 p-2" value={format} onChange={e => setFormat(e.target.value as 'text' | 'json')}><option value="text">Text</option><option value="json">JSON</option></select></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={includeFindings} onChange={e => setIncludeFindings(e.target.checked)} /> Include findings</label><button className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40" disabled={!selectedResultIds.length} onClick={generate}>Generate from {selectedResultIds.length} results</button>{exported && <button className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold" onClick={copy}>Copy</button>}</div>{status && <p className="mt-3 text-sm text-cyan-100">{status}</p>}{exported && <div className="mt-4"><p className="text-xs text-slate-500">Generated {exported.generatedAt} · {exported.requestTemplates.length} request templates</p><pre className="codeblock mt-2 max-h-96 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">{exported.content}</pre></div>}</section>;
}
