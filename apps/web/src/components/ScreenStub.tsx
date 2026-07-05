import { useLocation, useNavigate } from 'react-router-dom';
import { Screen, AppBar, Button } from './ui';

/**
 * Заглушка экрана для M1 — реальная реализация приходит в M3–M7.
 * Показывает S-номер, название и роут, чтобы каркас навигации был проверяем.
 */
export function ScreenStub({ code, name, milestone }: { code: string; name: string; milestone: string }) {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <Screen
      footer={
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Назад
        </Button>
      }
    >
      <AppBar title={code} showBack={location.key !== 'default'} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '24px 0' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--c-ink)' }}>{name}</div>
        <div style={{ fontSize: 14, color: 'var(--c-ink-secondary)' }}>
          Экран {code}. Реализация — {milestone}.
        </div>
        <code
          style={{
            fontSize: 13,
            color: 'var(--c-primary)',
            background: 'var(--c-primary-soft)',
            padding: '8px 12px',
            borderRadius: 12,
            marginTop: 8,
            wordBreak: 'break-all',
          }}
        >
          {location.pathname}
        </code>
      </div>
    </Screen>
  );
}
