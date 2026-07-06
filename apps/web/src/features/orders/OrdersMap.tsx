import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapView, type MapMarker } from '../../components/MapView';
import { Card, Price, EmptyState, Button } from '../../components/ui';
import { formatTenge, formatDistanceKm } from '../../lib/format';
import type { FeedOrder } from './api';
import styles from './OrdersMap.module.scss';

interface OrdersMapProps {
  orders: FeedOrder[];
  onOpen: (o: FeedOrder) => void;
}

/** Карта заказов (S-10 / сегмент «Карта» ленты). Пин = цена; тап → мини-карточка → «Открыть». */
export function OrdersMap({ orders, onOpen }: OrdersMapProps) {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const withGeo = useMemo(() => orders.filter((o) => o.lat != null && o.lng != null), [orders]);
  const selected = withGeo.find((o) => o.id === selectedId) ?? null;

  const markers: MapMarker[] = useMemo(
    () =>
      withGeo.map((o) => ({
        id: o.id,
        lat: o.lat as number,
        lng: o.lng as number,
        label: formatTenge(o.budget),
        variant: 'price',
        onClick: () => setSelectedId(o.id),
      })),
    [withGeo],
  );

  if (withGeo.length === 0) {
    return <EmptyState icon="map" title={t('map.emptyTitle')} hint={t('map.emptyHint')} />;
  }

  return (
    <div className={styles.wrap}>
      <MapView markers={markers} />
      {selected && (
        <div className={styles.card}>
          <Card>
            <div className={styles.cat}>{selected.category_name}</div>
            <div className={styles.title}>{selected.title}</div>
            <div className={styles.meta}>
              {selected.distance_m != null && (
                <span>{formatDistanceKm(selected.distance_m / 1000)}</span>
              )}
              <span>·</span>
              <span>{selected.address}</span>
            </div>
            <div className={styles.row}>
              <Price amount={selected.budget} size="md" />
              <Button fullWidth={false} onClick={() => onOpen(selected)}>
                {t('map.open')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
