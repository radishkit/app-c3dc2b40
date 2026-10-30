import { LoginButton } from '../components/LoginButton';

/**
 * Slim site header in the City and County of Denver style: deep navy bar with a gold rule,
 * a text wordmark (no logo image), and the Register / Log in buttons (or the signed-in user menu).
 */
export function TopBar({ onHome }: { onHome?: () => void }) {
  return (
    <div
      style={{
        background: 'var(--navy-deep)',
        color: '#fff',
        borderBottom: '4px solid var(--gold)',
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
          aria-label="City and County of Denver — Valet Permits home"
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            font: 'inherit',
            cursor: onHome ? 'pointer' : 'default',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            textAlign: 'left',
          }}
        >
          <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
              }}
            >
              City and County of
            </span>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Denver
            </span>
          </span>
          <span
            aria-hidden
            style={{ width: 1, alignSelf: 'stretch', background: 'rgba(255,255,255,0.3)' }}
          />
          <span style={{ fontSize: '0.95rem', fontWeight: 600, opacity: 0.92 }}>Valet Permits</span>
        </button>
        <LoginButton />
      </div>
    </div>
  );
}
