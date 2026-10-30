import { useCallback, useEffect, useRef, useState, CSSProperties } from 'react';
import { LoginDialog, MockUser } from './LoginDialog';
import { RegisterDialog } from './RegisterDialog';

const STORAGE_KEY = 'valet-portal-user';

function loadUser(): MockUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MockUser) : null;
  } catch {
    return null;
  }
}

const menu: CSSProperties = {
  position: 'absolute',
  right: 0,
  top: 'calc(100% + 6px)',
  background: 'var(--card)',
  border: '1px solid var(--line)',
  borderRadius: 10,
  boxShadow: 'var(--shadow)',
  padding: '10px 14px',
  minWidth: 200,
  zIndex: 50,
  color: 'var(--ink)',
  textAlign: 'left',
};

export function LoginButton() {
  const [user, setUser] = useState<MockUser | null>(() => loadUser());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [registerOpen, setRegisterOpen] = useState(false);
  const close = useCallback(() => setDialogOpen(false), []);
  const closeRegister = useCallback(() => setRegisterOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  const signIn = (u: MockUser) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setDialogOpen(false);
    setRegisterOpen(false);
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    setMenuOpen(false);
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn--ghost" onClick={() => setRegisterOpen(true)}>
          Register
        </button>
        <button className="btn btn--primary" onClick={() => setDialogOpen(true)}>
          Log in
        </button>
        <LoginDialog open={dialogOpen} onClose={close} onSignIn={signIn} />
        <RegisterDialog open={registerOpen} onClose={closeRegister} onRegister={signIn} />
      </div>
    );
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        className="btn btn--ghost"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
      >
        {user.name} ▾
      </button>
      {menuOpen && (
        <div role="menu" style={menu}>
          <div style={{ fontWeight: 600 }}>{user.name}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: 10 }}>
            {user.email}
          </div>
          <button role="menuitem" className="linkbtn" onClick={signOut}>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
