import { View } from '../App';
import { Permit, fmtDate, zoneLabel } from '../data';

export function Confirmation({ permit, go }: { permit: Permit; go: (v: View) => void }) {
  return (
    <main className="container container--narrow">
      <div className="confirm">
        <div className="confirm__check" aria-hidden>✓</div>
        <h1>Application received!</h1>
        <p className="confirm__lede">
          Thanks, {permit.app.contactName.split(' ')[0] || 'neighbor'} — your valet parking permit
          application has been submitted to the City of Null Island.
        </p>

        <div className="confirm__number">
          <span>Your permit number</span>
          <strong>{permit.id}</strong>
        </div>

        <div className="confirm__summary">
          <div>
            <span>Business</span>
            <strong>{permit.app.businessName}</strong>
          </div>
          <div>
            <span>Zone</span>
            <strong>{zoneLabel(permit.app.zoneId)}</strong>
          </div>
          <div>
            <span>Requested start</span>
            <strong>{fmtDate(permit.app.startDate)}</strong>
          </div>
          <div>
            <span>Fee due if approved</span>
            <strong>${permit.fee}</strong>
          </div>
        </div>

        <div className="confirm__next">
          <h3>What happens next</h3>
          <ul>
            <li>
              <strong>Within 1 business day</strong> — a curb management reviewer is assigned and
              your application moves to <em>Under Review</em>.
            </li>
            <li>
              <strong>3–5 business days</strong> — we review zone capacity, traffic impact, and your
              operator's insurance on file.
            </li>
            <li>
              <strong>On approval</strong> — you'll receive an invoice for ${permit.fee}; the permit
              activates when paid.
            </li>
          </ul>
        </div>

        <div className="confirm__actions">
          <button className="btn btn--primary" onClick={() => go({ name: 'status', permitId: permit.id })}>
            Track this application
          </button>
          <button className="btn btn--ghost" onClick={() => go({ name: 'permits' })}>
            Go to My Permits
          </button>
        </div>
      </div>
    </main>
  );
}
