import { LoginButton } from '../components/LoginButton';

/** Slim site header with the portal name and the Register / Log in buttons (or the signed-in user menu). */
export function TopBar({ onHome }: { onHome?: () => void }) {
  return (
    <div
      style={{
        background: 'var(--navy-deep)',
        color: '#fff',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <button
          onClick={onHome}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            font: 'inherit',
            fontWeight: 700,
            cursor: onHome ? 'pointer' : 'default',
            padding: 0,
          }}
        >
          City of Null Island · Valet Permits
        </button>
        <LoginButton />
      </div>
    </div>
  );
}
