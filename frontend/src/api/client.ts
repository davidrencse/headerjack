import type { AllowlistEntry, CookieRecord, CustomMutation, ExportNotesResponse, HealthResponse, MutationCategory, MutationPreviewResponse, PolicyResponse, ReplayConfig, RunResult, RunSummary, StartRunResponse, TargetProfile } from '../types';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:3000';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    method,
    credentials: 'include',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  let data: unknown = undefined;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }
  if (!response.ok) {
    const anyData = data as { error?: { code?: string; message?: string; details?: Record<string, unknown> }; code?: string; message?: string; details?: Record<string, unknown> } | undefined;
    const err = anyData?.error || anyData;
    throw { status: response.status, code: err?.code || `HTTP_${response.status}`, message: err?.message || response.statusText || 'Request failed', details: err?.details };
  }
  return data as T;
}

export const api = {
  health: () => request<HealthResponse>('GET', '/health'),
  policy: () => request<PolicyResponse>('GET', '/policy'),
  getAllowlist: () => request<{ entries: AllowlistEntry[] }>('GET', '/allowlist'),
  validateAllowlist: (entries: Omit<AllowlistEntry, 'id'>[]) => request<{ valid: boolean; errors: { field: string; message: string }[]; normalizedEntries: AllowlistEntry[] }>('POST', '/allowlist/validate', { entries }),
  saveAllowlist: (entries: Omit<AllowlistEntry, 'id'>[]) => request<{ saved: boolean; entries: AllowlistEntry[] }>('PUT', '/allowlist', { entries }),
  profiles: () => request<{ profiles: TargetProfile[] }>('GET', '/profiles'),
  validateProfile: (profile: Omit<TargetProfile, 'id' | 'createdAt' | 'updatedAt'>) => request<{ valid: boolean; errors: { field: string; message: string }[]; normalizedProfile: TargetProfile }>('POST', '/profiles/validate', profile),
  createProfile: (profile: Omit<TargetProfile, 'id' | 'createdAt' | 'updatedAt'>) => request<{ profile: TargetProfile }>('POST', '/profiles', profile),
  updateProfile: (profileId: string, profile: Omit<TargetProfile, 'id' | 'createdAt' | 'updatedAt'>) => request<{ profile: TargetProfile }>('PUT', `/profiles/${encodeURIComponent(profileId)}`, profile),
  deleteProfile: (profileId: string) => request<{ deleted: boolean; profileId: string }>('DELETE', `/profiles/${encodeURIComponent(profileId)}`),
  getCookies: (profileId: string) => request<{ profileId: string; cookies: CookieRecord[] }>('GET', `/cookies/${encodeURIComponent(profileId)}`),
  saveCookies: (profileId: string, cookies: Omit<CookieRecord, 'id' | 'profileId'>[]) => request<{ saved: boolean; profileId: string; cookies: CookieRecord[] }>('PUT', `/cookies/${encodeURIComponent(profileId)}`, { cookies }),
  previewMutations: (payload: { profileId: string; categories: MutationCategory[]; customMutations: CustomMutation[]; paths: string[]; includeBaseline: boolean }) => request<MutationPreviewResponse>('POST', '/mutations/preview', payload),
  startRun: (payload: { profileId: string; planId: string; requestIds: string[]; config: ReplayConfig }) => request<StartRunResponse>('POST', '/runs', payload),
  runs: () => request<{ runs: RunSummary[] }>('GET', '/runs'),
  run: (runId: string) => request<{ run: RunSummary }>('GET', `/runs/${encodeURIComponent(runId)}`),
  cancelRun: (runId: string) => request<{ runId: string; cancelRequested: boolean; status: RunSummary['status'] }>('POST', `/runs/${encodeURIComponent(runId)}/cancel`, {}),
  runResults: (runId: string) => request<{ runId: string; baselineResultId: string | null; results: RunResult[] }>('GET', `/runs/${encodeURIComponent(runId)}/results`),
  exportNotes: (payload: { runId: string; resultIds: string[]; format: 'text' | 'json'; includeFindings: boolean }) => request<ExportNotesResponse>('POST', '/exports/notes', payload)
};
