export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
export type RunStatus = 'queued' | 'running' | 'completed' | 'cancelled' | 'failed';
export type Severity = 'info' | 'low' | 'medium' | 'high';
export type Confidence = 'low' | 'medium' | 'high';
export type SameSiteMode = 'Strict' | 'Lax' | 'None' | 'Unknown';
export type MutationCategory = 'host' | 'x_forwarded_for' | 'x_forwarded_host' | 'x_forwarded_proto' | 'x_original_url' | 'x_rewrite_url' | 'origin' | 'referer' | 'method_override';

export interface ApiError { code: string; message: string; details?: Record<string, unknown>; status?: number }
export interface HeaderPair { name: string; value: string }
export interface FieldError { field: string; message: string }
export interface AllowlistEntry { id?: string; protocol: 'http' | 'https'; host: string; port: number | null; pathPrefixes: string[]; notes: string }
export interface TargetProfile { id?: string; name: string; baseUrl: string; paths: string[]; method: HttpMethod; headers: HeaderPair[]; body: string | null; cookieRefs: string[]; createdAt?: string; updatedAt?: string }
export interface CookieRecord { id?: string; profileId?: string; name: string; value: string; domain: string; path: string; secure: boolean; httpOnly: boolean; sameSite: SameSiteMode; expiresAt: string | null }
export interface CustomMutation { headerName: string; values: string[] }
export interface PreparedRequest { requestId: string; label: string; category: string; method: HttpMethod; url: string; headers: HeaderPair[]; bodyPreview?: string | null; safetyNotes?: string[] }
export interface ReplayConfig { concurrency: number; delayMs: number; followRedirects: boolean; captureBody: boolean; auditOnly: boolean }
export interface ResponseSnapshot { status: number; durationMs: number; contentLength: number | null; bodyLength: number; headerMap: Record<string, string | string[]>; redirectChain: string[]; bodyHash: string | null; bodyPreview: string | null }
export interface HeaderDifference { name: string; before: string | null; after: string | null }
export interface ResponseDiff { statusChanged: boolean; lengthChanged: boolean; timingDeltaMs: number; headerDifferences: HeaderDifference[] }
export interface Finding { type: string; severity: Severity; confidence: Confidence; message: string }
export interface RunResult { resultId: string; requestId: string; label: string; category: string; request: { method: HttpMethod; url: string; headers: HeaderPair[] }; response: ResponseSnapshot; diffFromBaseline: ResponseDiff; findings: Finding[]; error: string | null }
export interface HealthResponse { status: 'ok'; service: string; version: string; policy: { auditOnly: boolean; maxConcurrency: number; maxRequestsPerRun: number; allowCustomHeaders: boolean } }
export interface PolicyResponse { allowlistRequired: boolean; auditOnly: boolean; restrictedMethods: string[]; requiredHeaderNormalization: boolean; mutationCategories: string[]; limits: { maxPathsPerProfile?: number; maxMutationsPerPlan?: number; maxRequestsPerRun?: number; maxConcurrency?: number } }
export interface MutationPreviewResponse { planId: string; baseline: PreparedRequest; variants: PreparedRequest[]; truncated: boolean }
export interface RunSummary { runId: string; profileId: string; status: RunStatus; createdAt: string; updatedAt: string; queuedCount: number; completedCount: number; failedCount: number; config?: ReplayConfig }
export interface StartRunResponse { runId: string; status: RunStatus; queuedCount: number; policyApplied: { auditOnly: boolean; concurrency: number; captureBody: boolean } }
export interface ExportNotesResponse { format: 'text' | 'json'; generatedAt: string; content: string; requestTemplates: { label: string; method: HttpMethod; url: string; headers: HeaderPair[]; body: string | null }[] }
