import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { View } from '../App';
import {
  Application,
  BUSINESS_TYPES,
  DAYS,
  EMPTY_APP,
  Permit,
  ZONES,
  calcFee,
  clearDraft,
  fmtDate,
  loadDraft,
  nextPermitNumber,
  saveDraft,
  savePermit,
  zoneLabel,
} from '../data';

const STEPS = ['Business', 'Location & zone', 'Schedule', 'Review'];

export function Wizard({
  go,
  onSubmitted,
}: {
  go: (v: View) => void;
  onSubmitted: () => void;
}) {
  const draft = useMemo(loadDraft, []);
  const [step, setStep] = useState(draft?.step ?? 0);
  const [app, setApp] = useState<Application>(draft?.app ?? EMPTY_APP);
  const [tried, setTried] = useState(false);
  const [certified, setCertified] = useState(false);

  useEffect(() => {
    saveDraft(app, step);
  }, [app, step]);

  const set = (k: keyof Application) => (v: string) => setApp((a) => ({ ...a, [k]: v }));

  const errors = validate(app, step);
  const fee = calcFee(app.zoneId, app.stands);

  const next = () => {
    setTried(true);
    if (errors.length === 0) {
      setTried(false);
      setStep((s) => Math.min(s + 1, 3));
      window.scrollTo({ top: 0 });
    }
  };
  const back = () => {
    setTried(false);
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0 });
  };

  const submit = () => {
    setTried(true);
    if (!certified) return;
    const permit: Permit = {
      id: nextPermitNumber(),
      app,
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
      fee,
    };
    savePermit(permit);
    clearDraft();
    onSubmitted();
    go({ name: 'confirmation', permit });
  };

  return (
    <main className="container container--narrow">
      <div className="wizard__head">
        <h1>Valet Parking Permit Application</h1>
        <p className="muted">Your progress is saved automatically — you can come back anytime.</p>
      </div>

      <ol className="progress">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={i === step ? 'is-current' : i < step ? 'is-done' : ''}
          >
            <button
              type="button"
              disabled={i > step}
              onClick={() => i < step && setStep(i)}
            >
              <span className="progress__dot">{i < step ? '✓' : i + 1}</span>
              <span className="progress__label">{label}</span>
            </button>
          </li>
        ))}
      </ol>

      <section className="panel">
        {step === 0 && (
          <div className="formgrid">
            <h2>About your business</h2>
            <Field label="Business name" required error={tried && !app.businessName.trim()}>
              <input
                value={app.businessName}
                onChange={(e) => set('businessName')(e.target.value)}
                placeholder="e.g. Null Point Brewing Co."
              />
            </Field>
            <Field label="Business type" required error={tried && !app.businessType}>
              <select value={app.businessType} onChange={(e) => set('businessType')(e.target.value)}>
                <option value="">Select a type…</option>
                {BUSINESS_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <div className="formgrid__row">
              <Field label="Contact name" required error={tried && !app.contactName.trim()}>
                <input
                  value={app.contactName}
                  onChange={(e) => set('contactName')(e.target.value)}
                  placeholder="First and last name"
                />
              </Field>
              <Field
                label="Email"
                required
                error={tried && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(app.email)}
                errorText="Enter a valid email"
              >
                <input
                  type="email"
                  value={app.email}
                  onChange={(e) => set('email')(e.target.value)}
                  placeholder="you@business.com"
                />
              </Field>
            </div>
            <Field label="Phone" required error={tried && app.phone.replace(/\D/g, '').length < 10} errorText="Enter a 10-digit phone number">
              <input
                value={app.phone}
                onChange={(e) => set('phone')(e.target.value)}
                placeholder="(555) 010-1234"
              />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="formgrid">
            <h2>Curb location & zone</h2>
            <Field label="Street address of the curb space" required error={tried && !app.address.trim()}>
              <input
                value={app.address}
                onChange={(e) => set('address')(e.target.value)}
                placeholder="e.g. 42 Harborline Ave"
              />
            </Field>
            <div>
              <div className={'field__label' + (tried && !app.zoneId ? ' field__label--error' : '')}>
                Curb management zone <span className="req">*</span>
                {tried && !app.zoneId && <em className="field__errtext"> — pick a zone</em>}
              </div>
              <div className="zonegrid">
                {ZONES.map((z) => (
                  <button
                    type="button"
                    key={z.id}
                    className={'zonecard' + (app.zoneId === z.id ? ' is-selected' : '')}
                    onClick={() => set('zoneId')(z.id)}
                  >
                    <span className="zonecard__id">{z.id}</span>
                    <span className="zonecard__name">{z.name}</span>
                    <span className="zonecard__blurb">{z.blurb}</span>
                    <span className="zonecard__mult">fee ×{z.multiplier.toFixed(1)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="formgrid__row">
              <Field
                label="Curb length needed (feet)"
                required
                error={tried && !(parseInt(app.curbLength, 10) > 0)}
                errorText="Enter a length in feet"
              >
                <input
                  type="number"
                  min={20}
                  value={app.curbLength}
                  onChange={(e) => set('curbLength')(e.target.value)}
                  placeholder="e.g. 60"
                />
              </Field>
              <Field label="Number of valet stands" required error={tried && !(parseInt(app.stands, 10) > 0)}>
                <select value={app.stands} onChange={(e) => set('stands')(e.target.value)}>
                  {['1', '2', '3', '4'].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="formgrid">
            <h2>Operating schedule</h2>
            <div>
              <div className={'field__label' + (tried && app.days.length === 0 ? ' field__label--error' : '')}>
                Days of operation <span className="req">*</span>
                {tried && app.days.length === 0 && <em className="field__errtext"> — pick at least one day</em>}
              </div>
              <div className="daychips">
                {DAYS.map((d) => (
                  <button
                    type="button"
                    key={d}
                    className={'chip' + (app.days.includes(d) ? ' is-on' : '')}
                    onClick={() =>
                      setApp((a) => ({
                        ...a,
                        days: a.days.includes(d) ? a.days.filter((x) => x !== d) : [...a.days, d],
                      }))
                    }
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="formgrid__row">
              <Field label="Daily start time" required error={false}>
                <input type="time" value={app.startTime} onChange={(e) => set('startTime')(e.target.value)} />
              </Field>
              <Field label="Daily end time" required error={tried && app.endTime <= app.startTime} errorText="End must be after start">
                <input type="time" value={app.endTime} onChange={(e) => set('endTime')(e.target.value)} />
              </Field>
            </div>
            <div className="formgrid__row">
              <Field label="Requested start date" required error={tried && !app.startDate}>
                <input type="date" value={app.startDate} onChange={(e) => set('startDate')(e.target.value)} />
              </Field>
              <Field label="Valet operator company" required error={tried && !app.operator.trim()}>
                <input
                  value={app.operator}
                  onChange={(e) => set('operator')(e.target.value)}
                  placeholder="e.g. Meridian Valet Services LLC"
                />
              </Field>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="review">
            <h2>Review your application</h2>
            <ReviewSection title="Business" onEdit={() => setStep(0)}>
              <Row k="Business" v={`${app.businessName} · ${app.businessType}`} />
              <Row k="Contact" v={`${app.contactName} · ${app.email} · ${app.phone}`} />
            </ReviewSection>
            <ReviewSection title="Location & zone" onEdit={() => setStep(1)}>
              <Row k="Curb address" v={app.address} />
              <Row k="Zone" v={zoneLabel(app.zoneId)} />
              <Row k="Curb length" v={`${app.curbLength} ft · ${app.stands} stand${app.stands === '1' ? '' : 's'}`} />
            </ReviewSection>
            <ReviewSection title="Schedule" onEdit={() => setStep(2)}>
              <Row k="Days" v={app.days.join(', ')} />
              <Row k="Hours" v={`${app.startTime} – ${app.endTime}`} />
              <Row k="Start date" v={fmtDate(app.startDate)} />
              <Row k="Operator" v={app.operator} />
            </ReviewSection>

            <div className="feebox">
              <div>
                <div className="feebox__label">Permit fee (due after approval)</div>
                <div className="feebox__detail">
                  Base $150 + $75 × {app.stands} stand{app.stands === '1' ? '' : 's'} × zone
                  factor {ZONES.find((z) => z.id === app.zoneId)?.multiplier.toFixed(1) ?? '1.0'}
                </div>
              </div>
              <div className="feebox__amount">${fee}</div>
            </div>

            <label className={'certify' + (tried && !certified ? ' certify--error' : '')}>
              <input type="checkbox" checked={certified} onChange={(e) => setCertified(e.target.checked)} />
              <span>
                I certify the information above is accurate and I'm authorized to apply on behalf of
                this business.
              </span>
            </label>
          </div>
        )}

        <div className="panel__actions">
          {step > 0 ? (
            <button className="btn btn--ghost" onClick={back}>
              ← Back
            </button>
          ) : (
            <button className="btn btn--ghost" onClick={() => go({ name: 'landing' })}>
              Cancel
            </button>
          )}
          {step < 3 ? (
            <button className="btn btn--primary" onClick={next}>
              Continue →
            </button>
          ) : (
            <button className="btn btn--primary btn--lg" onClick={submit}>
              Submit application
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

function validate(app: Application, step: number): string[] {
  const errs: string[] = [];
  if (step === 0) {
    if (!app.businessName.trim()) errs.push('businessName');
    if (!app.businessType) errs.push('businessType');
    if (!app.contactName.trim()) errs.push('contactName');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(app.email)) errs.push('email');
    if (app.phone.replace(/\D/g, '').length < 10) errs.push('phone');
  }
  if (step === 1) {
    if (!app.address.trim()) errs.push('address');
    if (!app.zoneId) errs.push('zoneId');
    if (!(parseInt(app.curbLength, 10) > 0)) errs.push('curbLength');
  }
  if (step === 2) {
    if (app.days.length === 0) errs.push('days');
    if (app.endTime <= app.startTime) errs.push('endTime');
    if (!app.startDate) errs.push('startDate');
    if (!app.operator.trim()) errs.push('operator');
  }
  return errs;
}

function Field({
  label,
  required,
  error,
  errorText,
  children,
}: {
  label: string;
  required?: boolean;
  error?: boolean;
  errorText?: string;
  children: ReactNode;
}) {
  return (
    <label className={'field' + (error ? ' field--error' : '')}>
      <span className="field__label">
        {label} {required && <span className="req">*</span>}
        {error && <em className="field__errtext"> — {errorText ?? 'required'}</em>}
      </span>
      {children}
    </label>
  );
}

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <div className="review__section">
      <div className="review__head">
        <h3>{title}</h3>
        <button className="linkbtn" onClick={onEdit}>
          Edit
        </button>
      </div>
      <dl>{children}</dl>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="review__row">
      <dt>{k}</dt>
      <dd>{v || '—'}</dd>
    </div>
  );
}
