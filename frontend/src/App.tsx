import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { SetupPage } from './pages/SetupPage';
import { ProfilesPage } from './pages/ProfilesPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { ResultsPage } from './pages/ResultsPage';
import { ExportsPage } from './pages/ExportsPage';
import { SettingsPage } from './pages/SettingsPage';
import type { AllowlistEntry, HealthResponse, PolicyResponse } from './types';

function currentPath() { return window.location.hash.replace(/^#/, '') || '/'; }
function navigate(path: string) { window.location.hash = path; }

export default function App() {
  const [path, setPath] = useState(currentPath());
  const [acknowledged, setAck] = useState(() => localStorage.getItem('headerjack.authorizationAcknowledged') === 'true');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [policy, setPolicy] = useState<PolicyResponse | null>(null);
  const [allowlist, setAllowlist] = useState<AllowlistEntry[]>([]);
  useEffect(() => { const onHash = () => setPath(currentPath()); window.addEventListener('hashchange', onHash); return () => window.removeEventListener('hashchange', onHash); }, []);
  function setAcknowledged(value: boolean) { setAck(value); localStorage.setItem('headerjack.authorizationAcknowledged', String(value)); }
  const canExecute = acknowledged && allowlist.length > 0 && !!health;
  let page = <SetupPage acknowledged={acknowledged} setAcknowledged={setAcknowledged} health={health} setHealth={setHealth} policy={policy} setPolicy={setPolicy} allowlist={allowlist} setAllowlist={setAllowlist} />;
  if (path.startsWith('/profiles')) page = <ProfilesPage />;
  if (path.startsWith('/workspace')) page = <WorkspacePage profileId={path.split('/')[2]} health={health} policy={policy} canExecute={canExecute} navigate={navigate} />;
  if (path.startsWith('/results')) page = <ResultsPage runId={path.split('/')[2]} navigate={navigate} />;
  if (path.startsWith('/exports')) page = <ExportsPage />;
  if (path.startsWith('/settings')) page = <SettingsPage health={health} policy={policy} acknowledged={acknowledged} setAcknowledged={setAcknowledged} />;
  return <div className="min-h-screen bg-slate-950 text-slate-100"><Header path={path} acknowledged={acknowledged} health={health} /><div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">{page}</div></div>;
}
