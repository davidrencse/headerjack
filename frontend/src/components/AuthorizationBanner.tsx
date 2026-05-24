interface Props { acknowledged: boolean; onAcknowledge: (value: boolean) => void }

export function AuthorizationBanner({ acknowledged, onAcknowledge }: Props) {
  return <section className={`rounded-2xl border p-5 ${acknowledged ? 'border-emerald-500/30 bg-emerald-950/20' : 'border-amber-400/50 bg-amber-950/30'}`}>
    <h2 className="text-lg font-semibold text-white">Authorized-use requirement</h2>
    <p className="mt-2 text-sm leading-6 text-slate-200">HeaderJack can generate and replay crafted HTTP headers. Use it only for systems you own or have explicit written permission to assess. Execution workflows stay disabled until this confirmation and a backend-validated allowlist are in place.</p>
    <label className="mt-4 flex items-start gap-3 text-sm text-slate-100">
      <input className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-400" type="checkbox" checked={acknowledged} onChange={e => onAcknowledge(e.target.checked)} />
      <span>I confirm I will only use this tool against explicitly authorized targets.</span>
    </label>
  </section>;
}
