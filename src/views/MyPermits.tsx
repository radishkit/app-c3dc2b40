import { View } from '../App';
import { Permit, fmtDateTime, zoneLabel } from '../data';

export function MyPermits({ permits, go }: { permits: Permit[]; go: (v: View) => void }) {
  return (
    <main className="container container--narrow">
      <div className="permits__head">
        <div>
          <h1>My Permits</h1>
          <p className="muted">Applications and active valet permits for your account.</p>
        </div>
        <button className="btn btn--primary" onClick={() => go({ name: 'apply' })}>
          + New application
        </button>
      </div>

      <div className="permitlist">
        {permits.map((p) => (
          <button
            key={p.id}
            className="permitcard"
            onClick={() => go({ name: 'status', permitId: p.id })}
          >
            <div className="permitcard__main">
              <div className="permitcard__id">{p.id}</div>
              <div className="permitcard__biz">{p.app.businessName}</div>
              <div className="permitcard__meta">
                {zoneLabel(p.app.zoneId)} · {p.app.address} · submitted {fmtDateTime(p.submittedAt)}
              </div>
            </div>
            <div className="permitcard__side">
              <span className={`badge badge--${p.status.replace(/\s/g, '').toLowerCase()}`}>
                {p.status}
              </span>
              <span className="permitcard__go" aria-hidden>→</span>
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}
