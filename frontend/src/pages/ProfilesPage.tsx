import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { CookieJarEditor } from '../components/CookieJarEditor';
import { ProfileList } from '../components/ProfileList';
import { StatusView } from '../components/StatusView';
import { TargetProfileForm } from '../components/TargetProfileForm';
import type { TargetProfile } from '../types';
import { summarizeError } from '../utils/formatters';

export function ProfilesPage() {
  const [profiles, setProfiles] = useState<TargetProfile[]>([]);
  const [selected, setSelected] = useState<TargetProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function load() { setLoading(true); setError(''); try { const r = await api.profiles(); setProfiles(r.profiles); if (!selected && r.profiles[0]) setSelected(r.profiles[0]); } catch (e) { setError(summarizeError(e)); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  async function remove(profile: TargetProfile) { if (!profile.id || !confirm(`Delete profile ${profile.name}?`)) return; try { await api.deleteProfile(profile.id); if (selected?.id === profile.id) setSelected(null); await load(); } catch (e) { setError(summarizeError(e)); } }
  function duplicate(profile: TargetProfile) { setSelected({ ...profile, id: undefined, name: `${profile.name} copy` }); }
  if (loading) return <StatusView title="Loading profiles…" />;
  if (error) return <StatusView tone="error" title="Unable to load profiles" message={error} actionLabel="Retry" onAction={load} />;
  return <div className="grid gap-6 xl:grid-cols-[24rem_1fr]"><aside className="space-y-4"><button className="w-full rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950" onClick={() => setSelected(null)}>New profile</button><ProfileList profiles={profiles} selectedId={selected?.id} onSelect={setSelected} onDuplicate={duplicate} onDelete={remove} /></aside><main className="space-y-6"><TargetProfileForm profile={selected} onSaved={p => { setSelected(p); load(); }} /><CookieJarEditor profileId={selected?.id} /></main></div>;
}
