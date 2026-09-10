import { useState, useCallback } from 'react';
import { Landing } from './views/Landing';
import { Wizard } from './views/Wizard';
import { Confirmation } from './views/Confirmation';
import { MyPermits } from './views/MyPermits';
import { StatusTracker } from './views/StatusTracker';
import { Permit, loadPermits } from './data';

export type View =
  | { name: 'landing' }
  | { name: 'apply' }
  | { name: 'confirmation'; permit: Permit }
  | { name: 'permits' }
  | { name: 'status'; permitId: string };

export default function App() {
  const [view, setView] = useState<View>({ name: 'landing' });
  const [permits, setPermits] = useState<Permit[]>(() => loadPermits());

  const refresh = useCallback(() => setPermits(loadPermits()), []);

  const go = useCallback((v: View) => {
    setView(v);
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="portal">
      {view.name === 'landing' && <Landing go={go} />}
      {view.name === 'apply' && <Wizard go={go} onSubmitted={refresh} />}
      {view.name === 'confirmation' && <Confirmation permit={view.permit} go={go} />}
      {view.name === 'permits' && <MyPermits permits={permits} go={go} />}
      {view.name === 'status' && (
        <StatusTracker
          permit={permits.find((p) => p.id === view.permitId) ?? permits[0]}
          go={go}
        />
      )}

      <footer className="footer">
        <div>
          <strong>City of Null Island</strong> · Department of Transportation & Curb Management
        </div>
        <div className="footer__muted">
          0° 0′ N, 0° 0′ E · Open Mon–Fri, 8am–5pm · (555) 010-0000 · curbs@nullisland.gov
        </div>
      </footer>
    </div>
  );
}
