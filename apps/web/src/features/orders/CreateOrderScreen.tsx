import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Button, TextField, TextArea, BottomSheet, Icon, Switch, Slider, Chip } from '../../components/ui';
import { fetchCategories } from '../auth/api';
import { createOrder, type OrderFilters } from './api';
import { useGeo, ALMATY_FALLBACK } from '../../lib/useGeo';
import { routes } from '../../router/routes';
import { formatDistanceKm } from '../../lib/format';
import styles from './CreateOrder.module.scss';

/** S-20 Создание заказа: категория, описание, бюджет, адрес, гео. */
export function CreateOrderScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const geo = useGeo();
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });

  const [catId, setCatId] = useState('');
  const [catName, setCatName] = useState('');
  const [catSheet, setCatSheet] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [budget, setBudget] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  // S-21 фильтры подбора (Ф-02…Ф-05)
  const [filterSheet, setFilterSheet] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>({});

  const valid = catId && title.trim().length >= 3 && desc.trim() && Number(budget) > 0 && address.trim().length >= 2;

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
        <TextField label={t('client.budget')} required inputMode="numeric" value={budget} placeholder="5000" onChange={(e) => setBudget(e.target.value.replace(/\D/g, '').slice(0, 8))} />
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
