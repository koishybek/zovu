import { color } from './theme/tokens';

/**
 * M0-заглушка. В M1 заменяется на RouterProvider со всеми роутами S-XX
 * (см. docs/05-screens.md) и дизайн-системой (docs/06-design-system.md).
 */
export default function App() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: 420,
        minHeight: '100dvh',
        background: color.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: color.primary,
          color: '#fff',
          display: 'grid',
          placeItems: 'center',
          fontSize: 30,
          fontWeight: 800,
        }}
      >
        Z
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: color.ink }}>Zovu</h1>
      <p style={{ color: color.inkSecondary }}>Находим специалистов рядом</p>
      <p style={{ color: color.inkMuted, fontSize: 13 }}>
        M0 — скелет собран. Дизайн-система и экраны — в M1.
      </p>
    </div>
  );
}
