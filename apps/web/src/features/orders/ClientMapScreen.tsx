import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AppBar, Card, Price, Button, EmptyState, ErrorState } from '../../components/ui';
import { MapView, type MapMarker } from '../../components/MapView';
import { fetchMyOrders, type Order } from './api';
import { formatTenge } from '../../lib/format';
import { routes } from '../../router/routes';
import styles from './MapScreen.module.scss';

/** S-22 Карта заказчика: свои заказы на карте OSM; тап по пину → отклики. */
export function ClientMapScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: orders = [], isLoading, isError, refetch } = useQuery({ queryKey: ['my-orders'], queryFn: fetchMyOrders });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const withGeo = useMemo(
    () => orders.filter((o) => o.lat != null && o.lng != null),
    [orders],
  );
  const selected = withGeo.find((o) => o.id === selectedId) ?? null;

  const markers: MapMarker[] = useMemo(
    () =>
      withGeo.map((o) => ({
        id: o.id,
        lat: o.lat as number,
        lng: o.lng as number,
        label: formatTenge(o.budget),
        variant: 'me',
        onClick: () => setSelectedId(o.id),
      })),
    [withGeo],
  );

  function open(o: Order) {
    navigate(o.status === 'active' ? routes.clientOrderBids(o.id) : routes.clientOrder(o.id));
  }

  return (
    <div className={styles.screen}>
      <div className={styles.head}>
        <AppBar showBack title={t('map.clientTitle')} />
      </div>
      <div className={styles.mapArea}>
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className={styles.mapLoading}>{t('common.loading')}</div>
        ) : withGeo.length === 0 ? (
          <EmptyState icon="map" title={t('map.clientEmptyTitle')} hint={t('map.clientEmptyHint')} />
        ) : (
          <>
            <MapView markers={markers} />
            {selected && (
              <div className={styles.card}>
                <Card>
                  <div className={styles.cardLabel}>{t('client.yourOrder')}</div>
                  <div className={styles.cardTitle}>{selected.title}</div>
                  <div className={styles.cardMeta}>{selected.category_name} · {selected.address}</div>
                  <div className={styles.cardRow}>
                    <Price amount={selected.budget} size="md" />
                    <Button fullWidth={false} onClick={() => open(selected)}>
                      {t('map.open')}
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
