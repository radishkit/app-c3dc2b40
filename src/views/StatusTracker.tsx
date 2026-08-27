import { View } from '../App';
import { Permit, fmtDate, fmtDateTime, zoneLabel } from '../data';

const STAGES = ['Submitted', 'Under Review', 'Approved'] as const;

function stageIndex(p: Permit): number {
  return STAGES.indexOf(p.status);
}

function addBusinessDays(iso: string, n: number): Date {
  const d = new Date(iso);
  let added = 0;
  while (added < n) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return d;
}

export function StatusTracker({ permit, go }: { permit: Permit; go: (v: View) => void }) {
  const idx = stageIndex(permit);
  const expectedReview = addBusinessDays(permit.submittedAt, 1);
  const expectedDecision = addBusinessDays(permit.submittedAt, 5);

  const stageMeta = [
    {
      name: 'Submitted',
      done: true,
      stamp: fmtDateTime(permit.submittedAt),
      note: `Application ${permit.id} received online.`,
    },
    {
      name: 'Under Review',
      done: idx >= 1,
      stamp:
        idx >= 1
          ? fmtDateTime(permit.reviewStartedAt) || 'In progress'
          : `Expected by ${fmtDateTime(expectedReview.toISOString())}`,
      note:
        idx >= 1
          ? 'A curb management reviewer is checking zone capacity and traffic impact.'
          : 'Waiting for a reviewer to be assigned.',
    },
    {
      name: 'Approved',
      done: idx >= 2,
      stamp:
        idx >= 2
          ? fmtDateTime(permit.approvedAt)
          : `Decision expected by ${fmtDate(expectedDecision.toISOString().slice(0, 10))}`,
      note:
        idx >= 2
          ? `Approved — invoice for $${permit.fee} sent to ${permit.app.email}.`
          : 'You will be emailed the moment a decision is made.',
    },
  ];

  return (
    <main className="container container--narrow">
      <button className="linkbtn" onClick={() => go({ name: 'permits' })}>
        ← Back to My Permits
      </button>

      <div className="tracker__head">
        <div>
          <h1>{permit.id}</h1>
          <p className="muted">
            {permit.app.businessName} · {zoneLabel(permit.app.zoneId)} · {permit.app.address}
          </p>
        </div>
        <span className={`badge badge--${permit.status.replace(/\s/g, '').toLowerCase()}`}>
          {permit.status}
        </span>
      </div>

      <section className="panel">
        <ol className="timeline">
          {stageMeta.map((s, i) => (
            <li key={s.name} className={s.done ? 'is-done' : i === idx + 1 ? 'is-next' : ''}>
              <span className="timeline__dot">{s.done ? '✓' : ''}</span>
              <div className="timeline__body">
                <div className="timeline__title">
                  <strong>{s.name}</strong>
                  <span className="timeline__stamp">{s.stamp}</span>
                </div>
                <p>{s.note}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel">
        <h3 className="panel__title">Application details</h3>
        <dl className="detailgrid">
          <div><dt>Business</dt><dd>{permit.app.businessName} · {permit.app.businessType}</dd></div>
          <div><dt>Contact</dt><dd>{permit.app.contactName} · {permit.app.phone}</dd></div>
          <div><dt>Curb</dt><dd>{permit.app.curbLength} ft · {permit.app.stands} stand{permit.app.stands === '1' ? '' : 's'}</dd></div>
          <div><dt>Schedule</dt><dd>{permit.app.days.join(', ')} · {permit.app.startTime}–{permit.app.endTime}</dd></div>
          <div><dt>Operator</dt><dd>{permit.app.operator}</dd></div>
          <div><dt>Permit fee</dt><dd>${permit.fee}{permit.status === 'Approved' ? ' (invoiced)' : ' (due after approval)'}</dd></div>
        </dl>
      </section>

      <p className="muted center">
        Questions about this application? Call (555) 010-0000 and reference {permit.id}.
      </p>
    </main>
  );
}
