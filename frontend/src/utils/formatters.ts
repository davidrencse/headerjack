export function formatDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function formatMs(ms?: number): string {
  if (ms === undefined || Number.isNaN(ms)) return '—';
  return `${Math.round(ms)} ms`;
}

export function severityClass(severity: string): string {
  if (severity === 'high') return 'bg-red-500/15 text-red-200 border-red-400/40';
  if (severity === 'medium') return 'bg-amber-500/15 text-amber-100 border-amber-400/40';
  if (severity === 'low') return 'bg-blue-500/15 text-blue-100 border-blue-400/40';
  return 'bg-slate-500/20 text-slate-100 border-slate-400/30';
}

export function summarizeError(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) return String((error as { message: unknown }).message);
  return 'Unexpected error';
}
