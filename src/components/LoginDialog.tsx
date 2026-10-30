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

function nameFromEmail(email: string): string {
  const local = email.split('@')[0] || 'Resident';
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
}

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
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setPassword('');
    setBusy(false);
    emailRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    setBusy(true);
    // Mock sign-in: no network call, just a short delay.
    window.setTimeout(() => {
      onSignIn({ name: nameFromEmail(trimmed), email: trimmed });
    }, 400);
  };

  return (
    <div style={overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-labelledby="login-title" style={box}>
        <h2 id="login-title" style={{ margin: '0 0 4px', fontSize: '1.35rem', color: 'var(--navy)' }}>
          Sign in
        </h2>
        <p style={{ margin: '0 0 18px', color: 'var(--ink-soft)', fontSize: '0.93rem' }}>
          Sign in to apply for and track your valet permits.
        </p>
        <form className="formgrid" onSubmit={submit} noValidate>
          <label className={`field${error && !email ? ' field--error' : ''}`}>
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
          <label className="field">
            <span className="field__label">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && (
            <div role="alert" style={{ color: '#b3372c', fontSize: '0.88rem', fontWeight: 500 }}>
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
      </div>
    </div>
  );
}
