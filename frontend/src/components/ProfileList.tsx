import type { TargetProfile } from '../types';
import { formatDate } from '../utils/formatters';

interface Props { profiles: TargetProfile[]; selectedId?: string; onSelect: (profile: TargetProfile) => void; onDuplicate: (profile: TargetProfile) => void; onDelete: (profile: TargetProfile) => void }

export function ProfileList({ profiles, selectedId, onSelect, onDuplicate, onDelete }: Props) {
  if (!profiles.length) return <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-slate-300">No profiles are saved yet. Create a profile using an allowlisted base URL.</div>;
  return <div className="space-y-3">
    {profiles.map(profile => <article key={profile.id} className={`rounded-2xl border p-4 ${selectedId === profile.id ? 'border-cyan-400/60 bg-cyan-950/20' : 'border-slate-800 bg-slate-900/70'}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <button className="text-left" onClick={() => onSelect(profile)}><h3 className="font-semibold text-white">{profile.name}</h3><p className="mt-1 break-all text-sm text-slate-300">{profile.method} {profile.baseUrl}</p><p className="mt-1 text-xs text-slate-500">{profile.paths.length} paths · updated {formatDate(profile.updatedAt)}</p></button>
        <div className="flex gap-2"><a className="rounded-lg bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950" href={`#/workspace/${profile.id}`}>Workspace</a><button className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-100" onClick={() => onDuplicate(profile)}>Duplicate</button><button className="rounded-lg border border-red-400/40 px-3 py-2 text-sm text-red-200" onClick={() => onDelete(profile)}>Delete</button></div>
      </div>
    </article>)}
  </div>;
}
