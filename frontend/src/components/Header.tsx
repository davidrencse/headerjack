import type { HealthResponse } from '../types';

interface Props { path: string; acknowledged: boolean; health?: HealthResponse | null }

const links = [
  ['/', 'Setup'], ['/profiles', 'Profiles'], ['/workspace', 'Workspace'], ['/results', 'Results'], ['/exports', 'Exports'], ['/settings', 'Settings']
];

export function Header({ path, acknowledged, health }: Props) {
  return <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
      <a href="#/" className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 font-black text-slate-950">HJ</span>
        <span><span className="block text-lg font-bold text-white">HeaderJack</span><span className="text-xs text-slate-400">Authorized HTTP header assessment</span></span>
      </a>
      <nav className="flex flex-wrap gap-2" aria-label="Primary navigation">
        {links.map(([href, label]) => {
          const active = href === '/' ? path === '/' : path.startsWith(href);
          const disabled = !acknowledged && href !== '/' && href !== '/settings';
          return <a key={href} aria-disabled={disabled} className={`rounded-lg px-3 py-2 text-sm font-medium ${active ? 'bg-cyan-400 text-slate-950' : disabled ? 'pointer-events-none bg-slate-900 text-slate-600' : 'bg-slate-900 text-slate-200 hover:bg-slate-800'}`} href={`#${href}`}>{label}</a>;
        })}
      </nav>
      <div className="text-xs text-slate-400">Backend: <span className={health ? 'text-emerald-300' : 'text-amber-300'}>{health ? `${health.version} online` : 'not verified'}</span></div>
    </div>
  </header>;
}
