import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AppBar, Icon } from '../../components/ui';
import { OrdersMap } from './OrdersMap';
import { fetchFeed } from './api';
import { ALMATY_FALLBACK, useGeo } from '../../lib/useGeo';
import { routes } from '../../router/routes';
import styles from './MapScreen.module.scss';

/** S-10 Карта специалиста: активные заказы (в категориях специалиста) на карте OSM. */
export function SpecialistMapScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const geo = useGeo();
  const pos = geo ?? ALMATY_FALLBACK;
  const { data: orders = [] } = useQuery({
    queryKey: ['feed'],
    queryFn: () => fetchFeed(pos.lat, pos.lng),
    refetchInterval: 15000,
  });

  return (
    <div className={styles.screen}>
      <div className={styles.head}>
        <AppBar
          title={t('map.specialistTitle')}
          trailing={
            <button onClick={() => navigate(routes.notifications)} aria-label={t('notifications.title')}>
              <Icon name="bell" size={24} />
            </button>
          }
        />
      </div>
      <div className={styles.mapArea}>
        <OrdersMap orders={orders} onOpen={(o) => navigate(routes.spOrder(o.id))} />
      </div>
    </div>
  );
}
