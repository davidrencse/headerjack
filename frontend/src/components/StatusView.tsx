interface Props { title: string; message?: string; actionLabel?: string; onAction?: () => void; tone?: 'info' | 'error' | 'empty' }

export function StatusView({ title, message, actionLabel, onAction, tone = 'info' }: Props) {
  const toneClass = tone === 'error' ? 'border-red-400/40 bg-red-950/30 text-red-100' : tone === 'empty' ? 'border-slate-700 bg-slate-900/70 text-slate-200' : 'border-cyan-400/30 bg-cyan-950/20 text-cyan-50';
  return <div className={`rounded-2xl border p-6 ${toneClass}`}>
    <h3 className="text-lg font-semibold">{title}</h3>
    {message && <p className="mt-2 text-sm opacity-85">{message}</p>}
    {actionLabel && onAction && <button className="focus-ring mt-4 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300" onClick={onAction}>{actionLabel}</button>}
  </div>;
}
