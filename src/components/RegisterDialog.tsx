import { useEffect, useRef, useState, FormEvent, CSSProperties, ReactNode } from 'react';
import type { MockUser } from './LoginDialog';

const overlay: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(7, 42, 64, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  zIndex: 1000,
};

const box: CSSProperties = {
  background: 'var(--card)',
  borderRadius: 'var(--radius)',
  boxShadow: 'var(--shadow)',
  border: '1px solid var(--line)',
  padding: 28,
  width: '100%',
  maxWidth: 420,
  color: 'var(--ink)',
};

const errText: CSSProperties = { color: '#b3372c', fontSize: '0.82rem', fontWeight: 500 };

type Errors = Partial<Record<'name' | 'email' | 'password' | 'confirm', string>>;

function validate(name: string, email: string, password: string, confirm: string): Errors {
  const errs: Errors = {};
  if (name.trim().length < 2) errs.name = 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Enter a valid email address.';
  if (password.length < 8) errs.password = 'Password must be at least 8 characters.';
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
    errs.password = 'Password must include a letter and a number.';
  if (!confirm) errs.confirm = 'Confirm your password.';
  else if (confirm !== password) errs.confirm = 'Passwords do not match.';
  return errs;
}

export function RegisterDialog({
  open,
  onClose,
  onRegister,
}: {
  open: boolean;
  onClose: () => void;
  onRegister: (user: MockUser) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSubmitted(false);
    setPassword('');
    setConfirm('');
    setBusy(false);
    nameRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Re-validate live once the user has tried to submit.
  useEffect(() => {
    if (submitted) setErrors(validate(name, email, password, confirm));
  }, [submitted, name, email, password, confirm]);

  if (!open) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(name, email, password, confirm);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    // Mock registration: no network call, just a short delay.
    window.setTimeout(() => {
      onRegister({ name: name.trim(), email: email.trim() });
    }, 400);
  };

  const field = (
    key: keyof Errors,
    label: string,
    input: ReactNode,
  ) => (
    <label className={`field${errors[key] ? ' field--error' : ''}`}>
      <span className="field__label">{label}</span>
      {input}
      {errors[key] && (
        <span id={`reg-${key}-err`} style={errText}>
          {errors[key]}
        </span>
      )}
    </label>
  );

  return (
    <div style={overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="register-title" style={box}>
        <h2 id="register-title" style={{ margin: '0 0 4px', fontSize: '1.35rem', color: 'var(--navy)' }}>
          Create an account
        </h2>
        <p style={{ margin: '0 0 18px', color: 'var(--ink-soft)', fontSize: '0.93rem' }}>
          Register to apply for and track your valet permits.
        </p>
        <form className="formgrid" onSubmit={submit} noValidate>
          {field(
            'name',
            'Full name',
            <input
              ref={nameRef}
              type="text"
              autoComplete="name"
              value={name}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'reg-name-err' : undefined}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
            />,
          )}
          {field(
            'email',
            'Email',
            <input
              type="email"
              autoComplete="email"
              value={email}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'reg-email-err' : undefined}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />,
          )}
          {field(
            'password',
            'Password',
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'reg-password-err' : undefined}
              onChange={(e) => setPassword(e.target.value)}
            />,
          )}
          {field(
            'confirm',
            'Confirm password',
            <input
              type="password"
              autoComplete="new-password"
              value={confirm}
              aria-invalid={!!errors.confirm}
              aria-describedby={errors.confirm ? 'reg-confirm-err' : undefined}
              onChange={(e) => setConfirm(e.target.value)}
            />,
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={busy}>
              {busy ? 'Creating account…' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
