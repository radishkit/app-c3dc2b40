import { useEffect, useRef, useState, FormEvent, CSSProperties } from 'react';

export type MockUser = { name: string; email: string };

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
  maxWidth: 400,
  color: 'var(--ink)',
};

const titleStyle: CSSProperties = { margin: '0 0 4px', fontSize: '1.35rem', color: 'var(--navy)' };
const leadStyle: CSSProperties = { margin: '0 0 18px', color: 'var(--ink-soft)', fontSize: '0.93rem' };
const errStyle: CSSProperties = { color: '#b3372c', fontSize: '0.88rem', fontWeight: 500 };

const linkBtn: CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  color: 'var(--navy)',
  textDecoration: 'underline',
  cursor: 'pointer',
  font: 'inherit',
  fontSize: '0.88rem',
  fontWeight: 500,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Same rules as the register form (RegisterDialog).
const PASSWORD_RULES: { id: string; label: string; test: (pw: string) => boolean }[] = [
  { id: 'len', label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { id: 'letter', label: 'At least one letter', test: (pw) => /[A-Za-z]/.test(pw) },
  { id: 'number', label: 'At least one number', test: (pw) => /\d/.test(pw) },
];

function PasswordRules({ password }: { password: string }) {
  return (
    <ul
      id="login-pw-rules"
      aria-label="Password requirements"
      style={{ listStyle: 'none', margin: '2px 0 0', padding: 0, display: 'grid', gap: 3, fontSize: '0.84rem' }}
    >
      {PASSWORD_RULES.map((r) => {
        const ok = r.test(password);
        return (
          <li
            key={r.id}
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: ok ? '#1f7a4a' : 'var(--ink-soft)' }}
          >
            <span aria-hidden="true" style={{ width: 14, textAlign: 'center', fontWeight: 700 }}>
              {ok ? '✓' : '○'}
            </span>
            <span>{r.label}</span>
            <span className="radish-sr-only">{ok ? '(met)' : '(not met)'}</span>
          </li>
        );
      })}
    </ul>
  );
}

function nameFromEmail(email: string): string {
  const local = email.split('@')[0] || 'Resident';
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

type View = 'login' | 'reset' | 'resetSent';

export function LoginDialog({
  open,
  onClose,
  onSignIn,
}: {
  open: boolean;
  onClose: () => void;
  onSignIn: (user: MockUser) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<View>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const resetRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setPassword('');
    setBusy(false);
    setView('login');
    setResetError(null);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Move focus to the main control of whichever view is showing.
  useEffect(() => {
    if (!open) return;
    if (view === 'login') emailRef.current?.focus();
    else if (view === 'reset') resetRef.current?.focus();
    else backRef.current?.focus();
  }, [open, view]);

  if (!open) return null;

  const pwOk = PASSWORD_RULES.every((r) => r.test(password));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!pwOk) {
      setError('Password must include a letter and a number.');
      return;
    }
    setError(null);
    setBusy(true);
    // Mock sign-in: no network call, just a short delay.
    window.setTimeout(() => {
      onSignIn({ name: nameFromEmail(trimmed), email: trimmed });
    }, 400);
  };

  const openReset = () => {
    setResetEmail(email.trim());
    setResetError(null);
    setView('reset');
  };

  const backToLogin = () => {
    setError(null);
    setBusy(false);
    setView('login');
  };

  const submitReset = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = resetEmail.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setResetError('Enter a valid email address.');
      return;
    }
    setResetError(null);
    setBusy(true);
    // Mock reset: no network call, just a short delay.
    window.setTimeout(() => {
      setBusy(false);
      setView('resetSent');
    }, 400);
  };

  return (
    <div style={overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="login-title" style={box}>
        {view === 'login' && (
          <>
            <h2 id="login-title" style={titleStyle}>
              Sign in
            </h2>
            <p style={leadStyle}>Sign in to apply for and track your valet permits.</p>
            <form className="formgrid" onSubmit={submit} noValidate>
              <label className={`field${error && !EMAIL_RE.test(email.trim()) ? ' field--error' : ''}`}>
                <span className="field__label">Email</span>
                <input
                  ref={emailRef}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              <label className={`field${error && EMAIL_RE.test(email.trim()) && !pwOk ? ' field--error' : ''}`}>
                <span className="field__label">Password</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  aria-describedby="login-pw-rules"
                  aria-invalid={!!error && !pwOk}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <PasswordRules password={password} />
              </label>
              <div>
                <button type="button" style={linkBtn} onClick={openReset}>
                  Forgot password?
                </button>
              </div>
              {error && (
                <div role="alert" style={errStyle}>
                  {error}
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" className="btn btn--ghost" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={busy}>
                  {busy ? 'Signing in…' : 'Sign in'}
                </button>
              </div>
            </form>
          </>
        )}

        {view === 'reset' && (
          <>
            <h2 id="login-title" style={titleStyle}>
              Reset your password
            </h2>
            <p style={leadStyle}>
              Enter the email you use to sign in and we&apos;ll send you a link to reset your password.
            </p>
            <form className="formgrid" onSubmit={submitReset} noValidate>
              <label className={`field${resetError ? ' field--error' : ''}`}>
                <span className="field__label">Email</span>
                <input
                  ref={resetRef}
                  type="email"
                  autoComplete="email"
                  value={resetEmail}
                  aria-invalid={!!resetError}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              {resetError && (
                <div role="alert" style={errStyle}>
                  {resetError}
                </div>
              )}
              <div
                style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}
              >
                <button type="button" style={linkBtn} onClick={backToLogin}>
                  ← Back to sign in
                </button>
                <button type="submit" className="btn btn--primary" disabled={busy}>
                  {busy ? 'Sending…' : 'Send reset link'}
                </button>
              </div>
            </form>
          </>
        )}

        {view === 'resetSent' && (
          <>
            <h2 id="login-title" style={titleStyle}>
              Check your email
            </h2>
            <p role="status" style={leadStyle}>
              If an account exists for <strong style={{ color: 'var(--ink)' }}>{resetEmail.trim()}</strong>, we&apos;ve
              sent a link to reset your password.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn--ghost" onClick={onClose}>
                Close
              </button>
              <button ref={backRef} type="button" className="btn btn--primary" onClick={backToLogin}>
                Back to sign in
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
