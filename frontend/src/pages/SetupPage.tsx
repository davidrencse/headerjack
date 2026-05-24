import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { AllowlistEditor } from '../components/AllowlistEditor';
import { AuthorizationBanner } from '../components/AuthorizationBanner';
import { SafetyStatusPanel } from '../components/SafetyStatusPanel';
import { StatusView } from '../components/StatusView';
import type { AllowlistEntry, HealthResponse, PolicyResponse } from '../types';
import { summarizeError } from '../utils/formatters';

interface Props { acknowledged: boolean; setAcknowledged: (v: boolean) => void; health: HealthResponse | null; setHealth: (h: HealthResponse | null) => void; policy: PolicyResponse | null; setPolicy: (p: PolicyResponse | null) => void; allowlist: AllowlistEntry[]; setAllowlist: (e: AllowlistEntry[]) => void }

export function SetupPage(props: Props) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function refresh() { setLoading(true); setError(''); try { const [h, p, a] = await Promise.all([api.health(), api.policy(), api.getAllowlist()]); props.setHealth(h); props.setPolicy(p); props.setAllowlist(a.entries); } catch (e) { setError(summarizeError(e)); props.setHealth(null); } finally { setLoading(false); } }
  useEffect(() => { refresh(); }, []);
  return <div className="grid gap-6 lg:grid-cols-[1fr_22rem]"><main className="space-y-6"><AuthorizationBanner acknowledged={props.acknowledged} onAcknowledge={props.setAcknowledged} />{error && <StatusView tone="error" title="Backend check failed" message={error} actionLabel="Retry" onAction={refresh} />} {!error && <StatusView title={loading ? 'Checking backend…' : 'Backend connectivity'} message={props.health ? `${props.health.service} ${props.health.version} is reachable.` : 'Use Retry to verify the backend before executing workflows.'} actionLabel="Retry" onAction={refresh} />}<AllowlistEditor entries={props.allowlist} onSaved={props.setAllowlist} /></main><SafetyStatusPanel acknowledged={props.acknowledged} allowlist={props.allowlist} health={props.health} policy={props.policy} /></div>;
}
