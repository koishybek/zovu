import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Button, TextField, TextArea, BottomSheet, Icon, Switch, Slider, Chip } from '../../components/ui';
import { fetchCategories } from '../auth/api';
import { createOrder, type OrderFilters } from './api';
import { useGeo, ALMATY_FALLBACK } from '../../lib/useGeo';
import { routes } from '../../router/routes';
import { formatDistanceKm, formatTenge } from '../../lib/format';
import styles from './CreateOrder.module.scss';

// Ориентировочный бюджет по категории (₸) — якорь против «пустого поля». Редактируемо.
const SUGGESTED_BUDGET: Record<string, number> = {
  Электрика: 5000,
  Сантехника: 6000,
  Уборка: 8000,
  Ремонт: 15000,
  'Сборка мебели': 7000,
  'Бытовая техника': 6000,
  Отделка: 20000,
  Грузоперевозки: 10000,
  'Клининг после ремонта': 15000,
  'Компьютерная помощь': 5000,
  Красота: 8000,
  Репетиторство: 4000,
};

const DRAFT_KEY = 'zovu.orderDraft';
interface OrderDraft {
  catId?: string;
  catName?: string;
  title?: string;
  desc?: string;
  budget?: string;
  address?: string;
  filters?: OrderFilters;
}
function loadDraft(): OrderDraft {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}') as OrderDraft;
  } catch {
    return {};
  }
}

/** S-20 Создание заказа: категория, описание, бюджет, адрес, гео. Черновик переживает выход. */
export function CreateOrderScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const geo = useGeo();
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });

  const [draft] = useState(loadDraft);
  const [catId, setCatId] = useState(draft.catId ?? '');
  const [catName, setCatName] = useState(draft.catName ?? '');
  const [catSheet, setCatSheet] = useState(false);
  const [title, setTitle] = useState(draft.title ?? '');
  const [desc, setDesc] = useState(draft.desc ?? '');
  const [budget, setBudget] = useState(draft.budget ?? '');
  const [address, setAddress] = useState(draft.address ?? '');
  const [loading, setLoading] = useState(false);

  // S-21 фильтры подбора (Ф-02…Ф-05)
  const [filterSheet, setFilterSheet] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>(draft.filters ?? {});

  // Черновик заказа: переживает случайный выход/навигацию (очищается после публикации).
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ catId, catName, title, desc, budget, address, filters }));
  }, [catId, catName, title, desc, budget, address, filters]);

  const suggested = SUGGESTED_BUDGET[catName] ?? 5000;
  const budgetNum = Number(budget);
  const valid = catId && title.trim().length >= 3 && desc.trim() && budgetNum > 0 && address.trim().length >= 2;

  async function submit() {
    if (!valid || loading) return;
    setLoading(true);
    try {
      const pos = geo ?? ALMATY_FALLBACK;
      const order = await createOrder({
        categoryId: catId,
        title: title.trim(),
        description: desc.trim(),
        budget: Number(budget),
        address: address.trim(),
        lat: pos.lat,
        lng: pos.lng,
        filters: Object.keys(filters).length ? filters : undefined,
      });
      localStorage.removeItem(DRAFT_KEY);
      navigate(routes.clientOrderBids(order.id), { replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen footer={<Button onClick={submit} loading={loading} disabled={!valid}>{t('client.publish')}</Button>}>
      <AppBar
        showBack
        largeTitle={t('client.createOrder')}
        trailing={<button onClick={() => setFilterSheet(true)} aria-label={t('client.filters')}><Icon name="filter" size={22} color="var(--c-primary)" /></button>}
      />
      <div className={styles.form}>
        <button className={styles.selector} onClick={() => setCatSheet(true)}>
          <span className={catId ? styles.selVal : styles.selPh}>{catName || 'Категория *'}</span>
          <Icon name="chevronDown" size={20} color="var(--c-ink-muted)" />
        </button>
        <TextField label={t('client.whatToDo')} required value={title} placeholder="Установить розетку" onChange={(e) => setTitle(e.target.value)} />
        <TextArea label={t('specialist.description')} maxLength={2000} value={desc} placeholder="Опишите задачу…" onChange={(e) => setDesc(e.target.value)} />
        <div>
          <TextField label={t('client.budget')} required inputMode="numeric" value={budget} placeholder={String(suggested)} onChange={(e) => setBudget(e.target.value.replace(/\D/g, '').slice(0, 8))} />
          <div className={styles.budgetHints}>
            {catId && <span>{t('client.suggestedBudget', { amount: formatTenge(suggested) })}</span>}
            <span>{t('client.budgetHint')}</span>
            {catId && budgetNum > 0 && budgetNum < suggested * 0.5 && (
              <span className={styles.budgetWarn}>{t('client.budgetLow')}</span>
            )}
          </div>
        </div>
        <TextField label={t('client.address')} required value={address} placeholder="ул. Абая, 150" onChange={(e) => setAddress(e.target.value)} />
        <div className={styles.geoNote}>
          <Icon name="pin" size={16} color="var(--c-primary)" />
          {geo ? 'Геолокация определена' : 'Гео по умолчанию (Алматы)'}
        </div>
      </div>

      <BottomSheet open={catSheet} onClose={() => setCatSheet(false)} title={t('onboarding.mainCategory')}>
        {categories.map((c) => (
          <button
            key={c.id}
            className={styles.catRow}
            onClick={() => {
              setCatId(c.id);
              setCatName(c.name);
              if (!budget) setBudget(String(SUGGESTED_BUDGET[c.name] ?? 5000));
              setCatSheet(false);
            }}
          >
            {c.name}
            {catId === c.id && <Icon name="check" size={20} color="var(--c-primary)" />}
          </button>
        ))}
      </BottomSheet>

      {/* S-21 Фильтры подбора (Ф-02…Ф-05) */}
      <BottomSheet open={filterSheet} onClose={() => setFilterSheet(false)} title={t('client.filters')}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{t('client.certifiedOnly')}</span>
          <Switch checked={!!filters.certifiedOnly} onChange={(v) => setFilters((f) => ({ ...f, certifiedOnly: v || undefined }))} />
        </div>
        <Slider label={t('client.minRating')} value={filters.minRating ?? 1} min={1} max={5} step={0.5} onChange={(v) => setFilters((f) => ({ ...f, minRating: v > 1 ? v : undefined }))} formatValue={(v) => `${v.toFixed(1)}★`} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{t('client.experience')}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[5, 20, 50].map((n) => (
              <Chip key={n} selected={filters.minOrders === n} onClick={() => setFilters((f) => ({ ...f, minOrders: f.minOrders === n ? undefined : n }))}>≥ {n}</Chip>
            ))}
          </div>
        </div>
        <Slider label={t('client.distance')} value={filters.maxDistanceKm ?? 50} min={1} max={50} onChange={(v) => setFilters((f) => ({ ...f, maxDistanceKm: v < 50 ? v : undefined }))} formatValue={(v) => formatDistanceKm(v)} />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <Button variant="secondary" onClick={() => setFilters({})}>{t('client.reset')}</Button>
          <Button onClick={() => setFilterSheet(false)}>{t('common.done')}</Button>
        </div>
      </BottomSheet>
    </Screen>
  );
}
