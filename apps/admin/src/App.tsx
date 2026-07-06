import { useEffect, useState, useCallback } from 'react';
import { adminApi, checkToken, setToken, clearToken, getToken } from './api';

type Tab = 'verification' | 'diplomas' | 'categories' | 'review-complaints' | 'tickets' | 'audit-log';

const TABS: { key: Tab; label: string }[] = [
  { key: 'verification', label: 'Верификация' },
  { key: 'diplomas', label: 'Дипломы' },
  { key: 'categories', label: 'Категории' },
  { key: 'review-complaints', label: 'Жалобы на отзывы' },
  { key: 'tickets', label: 'Тикеты' },
  { key: 'audit-log', label: 'Аудит-лог' },
];

export function App() {
  const [authed, setAuthed] = useState(!!getToken());
  return authed ? <Dashboard onLogout={() => { clearToken(); setAuthed(false); }} /> : <Login onOk={() => setAuthed(true)} />;
}

function Login({ onOk }: { onOk: () => void }) {
  const [token, setTok] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (await checkToken(token.trim())) {
      setToken(token.trim());
      onOk();
    } else {
      setError('Неверный токен');
    }
    setLoading(false);
  }

  return (
    <div className="login">
      <form onSubmit={submit} className="loginBox">
        <h1>Zovu — Админка</h1>
        <p className="muted">Введите ADMIN_TOKEN из .env</p>
        <input value={token} onChange={(e) => setTok(e.target.value)} placeholder="dev_admin_token_change_me" autoFocus />
        {error && <div className="err">{error}</div>}
        <button disabled={loading || !token.trim()}>{loading ? '…' : 'Войти'}</button>
      </form>
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('verification');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get(`/${tab}`);
      setRows(data);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { void load(); }, [load]);

  async function act(path: string, body?: object) {
    await adminApi.post(path, body ?? {});
    await load();
  }

  return (
    <div className="app">
      <header>
        <h2>Zovu Admin</h2>
        <button className="ghost" onClick={onLogout}>Выйти</button>
      </header>
      <nav>
        {TABS.map((t) => (
          <button key={t.key} className={t.key === tab ? 'active' : ''} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </nav>
      <main>
        {loading ? <p className="muted">Загрузка…</p> : rows.length === 0 ? <p className="muted">Очередь пуста</p> : <Queue tab={tab} rows={rows} act={act} />}
      </main>
    </div>
  );
}

function Queue({ tab, rows, act }: { tab: Tab; rows: any[]; act: (p: string, b?: object) => void }) {
  const reason = () => window.prompt('Причина?') ?? '';
  return (
    <table>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="mono">{r.id.slice(0, 8)}</td>
            <td>{describe(tab, r)}</td>
            <td className="actions">{actions(tab, r, act, reason)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function describe(tab: Tab, r: any): string {
  switch (tab) {
    case 'verification': return `${r.specialist?.user?.name ?? '—'} · ${r.specialist?.user?.phone ?? ''}`;
    case 'diplomas': return `${r.user?.name ?? '—'} · ${r.user?.phone ?? ''}`;
    case 'categories': return `Категория: «${r.name}»`;
    case 'review-complaints': return `Жалоба: ${r.reason} · отзыв ${r.review?.stars}★`;
    case 'tickets': return `${r.category} · ${r.user?.name ?? ''} · ${r.messages?.[0]?.text ?? ''} [${r.status}]`;
    case 'audit-log': return `${r.action} → ${r.target?.slice(0, 8)} · ${new Date(r.createdAt).toLocaleString('ru-RU')}`;
  }
}

function actions(tab: Tab, r: any, act: (p: string, b?: object) => void, reason: () => string) {
  switch (tab) {
    case 'verification':
      return <><button onClick={() => act(`/verification/${r.id}/approve`)}>✓ Одобрить</button><button className="danger" onClick={() => act(`/verification/${r.id}/reject`, { reason: reason() })}>✕ Отклонить</button></>;
    case 'diplomas':
      return <><button onClick={() => act(`/diplomas/${r.id}`, { action: 'approve' })}>✓ Одобрить</button><button className="danger" onClick={() => act(`/diplomas/${r.id}`, { action: 'reject', reason: reason() })}>✕ Отклонить</button></>;
    case 'categories':
      return <><button onClick={() => act(`/categories/${r.id}/approve`)}>✓ Одобрить (+3 дня)</button><button className="danger" onClick={() => act(`/categories/${r.id}/reject`)}>✕ Отклонить</button></>;
    case 'review-complaints':
      return <><button className="danger" onClick={() => act(`/reviews/${r.reviewId}/hide`)}>Скрыть отзыв</button><button onClick={() => act(`/complaints/${r.id}/resolve`)}>Оставить</button></>;
    case 'tickets':
      return <><button onClick={() => act(`/tickets/${r.id}/take`)}>В работу</button><button onClick={() => act(`/tickets/${r.id}/reply`, { text: reason() })}>Ответить</button><button onClick={() => act(`/tickets/${r.id}/resolve`)}>Решено</button></>;
    case 'audit-log':
      return null;
  }
}
