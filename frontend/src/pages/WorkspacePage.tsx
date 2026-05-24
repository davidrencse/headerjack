import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { HeaderMatrix } from '../components/HeaderMatrix';
import { MutationPresetPicker } from '../components/MutationPresetPicker';
import { ReplayConfigPanel } from '../components/ReplayConfigPanel';
import { RunControlBar } from '../components/RunControlBar';
import { StatusView } from '../components/StatusView';
import type { HealthResponse, MutationCategory, MutationPreviewResponse, PolicyResponse, ReplayConfig, RunSummary, TargetProfile } from '../types';
import { summarizeError } from '../utils/formatters';

interface Props { profileId?: string; health: HealthResponse | null; policy: PolicyResponse | null; canExecute: boolean; navigate: (path: string) => void }

export function WorkspacePage({ profileId, health, policy, canExecute, navigate }: Props) {
  const [profiles, setProfiles] = useState<TargetProfile[]>([]);
  const [activeId, setActiveId] = useState(profileId || '');
  const [categories, setCategories] = useState<MutationCategory[]>([]);
  const [customHeader, setCustomHeader] = useState('');
  const [customValues, setCustomValues] = useState('');
  const [preview, setPreview] = useState<MutationPreviewResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [run, setRun] = useState<RunSummary | null>(null);
  const [config, setConfig] = useState<ReplayConfig>({ concurrency: 1, delayMs: 250, followRedirects: true, captureBody: false, auditOnly: policy?.auditOnly || false });
  const [error, setError] = useState('');
  useEffect(() => { api.profiles().then(r => { setProfiles(r.profiles); const id = profileId || r.profiles[0]?.id || ''; setActiveId(id); }).catch(e => setError(summarizeError(e))); }, [profileId]);
  useEffect(() => { if (!run || (run.status !== 'queued' && run.status !== 'running')) return; const t = window.setInterval(() => api.run(run.runId).then(r => setRun(r.run)).catch(() => undefined), 1500); return () => clearInterval(t); }, [run]);
  const active = profiles.find(p => p.id === activeId);
  async function generate() { if (!active?.id) return; setError(''); try { const customMutations = customHeader.trim() && customValues.trim() ? [{ headerName: customHeader.trim(), values: customValues.split(',').map(v => v.trim()).filter(Boolean) }] : []; const r = await api.previewMutations({ profileId: active.id, categories, customMutations, paths: active.paths, includeBaseline: true }); setPreview(r); setSelectedIds(r.variants.map(v => v.requestId)); } catch (e) { setError(summarizeError(e)); } }
  async function start() { if (!active?.id || !preview) return; setError(''); try { const r = await api.startRun({ profileId: active.id, planId: preview.planId, requestIds: selectedIds, config }); setRun({ runId: r.runId, profileId: active.id, status: r.status, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), queuedCount: r.queuedCount, completedCount: 0, failedCount: 0, config }); navigate(`/results/${r.runId}`); } catch (e) { setError(summarizeError(e)); } }
  async function cancel() { if (!run) return; const r = await api.cancelRun(run.runId); setRun({ ...run, status: r.status }); }
  if (!canExecute) return <StatusView tone="error" title="Setup required" message="Acknowledge authorization, configure a valid allowlist, and verify backend connectivity before generating mutation plans." actionLabel="Go to setup" onAction={() => navigate('/')} />;
  if (!profiles.length) return <StatusView tone="empty" title="No profiles available" message="Create a validated profile before using the workspace." actionLabel="Create profile" onAction={() => navigate('/profiles')} />;
  return <div className="space-y-6"><section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><label className="text-sm text-slate-300">Active profile<select className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2" value={activeId} onChange={e => { setActiveId(e.target.value); setPreview(null); }}><option value="">Select profile</option>{profiles.map(p => <option key={p.id} value={p.id}>{p.name} — {p.baseUrl}</option>)}</select></label></section>{error && <StatusView tone="error" title="Workspace action failed" message={error} />}<MutationPresetPicker available={policy?.mutationCategories || []} selected={categories} onChange={setCategories} allowCustom={!!health?.policy.allowCustomHeaders} customHeader={customHeader} customValues={customValues} onCustomChange={(h, v) => { setCustomHeader(h); setCustomValues(v); }} /><div className="flex justify-end"><button className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40" disabled={!activeId || (categories.length === 0 && !customHeader)} onClick={generate}>Generate validated preview</button></div><HeaderMatrix baseline={preview?.baseline} variants={preview?.variants || []} selectedIds={selectedIds} onSelectedIdsChange={setSelectedIds} truncated={preview?.truncated} /><ReplayConfigPanel config={config} onChange={setConfig} health={health} policy={policy} /><RunControlBar disabled={!preview} running={run} selectedCount={selectedIds.length} onStart={start} onCancel={cancel} /></div>;
}
