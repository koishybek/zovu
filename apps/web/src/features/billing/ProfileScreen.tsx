import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Avatar, Rating, DiplomaBadge, VerifiedBadge, NewSpecialistBadge, Card, Icon, Button } from '../../components/ui';
import { fetchMe } from '../auth/api';
import { useAuthStore } from '../../store/auth';
import { routes } from '../../router/routes';
import styles from './Profile.module.scss';

interface SpecProfile {
  rating: number;
  completedOrdersCount: number;
  diplomaStatus: string;
  verificationStatus: string;
  subscriptionActive: boolean;
  streakDays: number;
  about: string | null;
  categories: { category: { name: string } }[];
}

/** S-18 Профиль специалиста: рейтинг, заказы, бейдж, подписка, категории, streak. */
export function ProfileScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const { data: me } = useQuery({ queryKey: ['me', 'profile'], queryFn: fetchMe });
  const p = me?.specialist_profile as SpecProfile | null;

  return (
    <Screen>
      <AppBar largeTitle={t('tabbar.profile')} trailing={<button onClick={() => { logout(); navigate(routes.welcome, { replace: true }); }}><Icon name="logout" size={22} color="var(--c-danger)" /></button>} />

      <div className={styles.header}>
        <Avatar name={me?.name ?? ''} size={88} />
        <div className={styles.name}>{me?.name}</div>
        {p && p.completedOrdersCount > 0 && p.rating > 0 ? (
          <div className={styles.stats}>
            <Rating value={Math.round(p.rating)} size={16} readOnly />
            <span>{p.rating.toFixed(1)}</span>
            <span>· {t('specialist.ordersCount', { count: p.completedOrdersCount })}</span>
          </div>
        ) : (
          <NewSpecialistBadge label={t('trust.newSpecialist')} />
        )}
        <div className={styles.badges}>
          {p?.verificationStatus === 'approved' && <VerifiedBadge label={t('trust.verified')} />}
          {p?.diplomaStatus === 'approved' && <DiplomaBadge label={t('specialist.diplomaBadge')} />}
          {p && p.streakDays > 0 && <span className={styles.streak}>🔥 {p.streakDays}</span>}
          {p && !p.subscriptionActive && <span className={styles.inactive}>{t('specialist.subscriptionInactive')}</span>}
        </div>
      </div>

      <Card pressable onClick={() => navigate(routes.spBalance)} className={styles.row}>
        <Icon name="wallet" size={22} color="var(--c-primary)" />
        <span className={styles.rowLabel}>{t('specialist.currentBalance')}</span>
        <Icon name="chevronRight" size={20} color="var(--c-ink-muted)" />
      </Card>

      <Card pressable onClick={() => navigate(routes.roleSwitch)} className={styles.row}>
        <Icon name="profile" size={22} color="var(--c-primary)" />
        <span className={styles.rowLabel}>{t('role.switchRole')}</span>
        <Icon name="chevronRight" size={20} color="var(--c-ink-muted)" />
      </Card>

      {p && p.categories.length > 0 && (
        <>
          <div className={styles.sectionTitle}>{t('onboarding.mainCategory')}</div>
          <div className={styles.chips}>
            {p.categories.map((c, i) => (
              <span key={i} className={styles.catChip}>{c.category.name}</span>
            ))}
          </div>
        </>
      )}

      {p?.about && (
        <>
          <div className={styles.sectionTitle}>{t('onboarding.about')}</div>
          <div className={styles.about}>{p.about}</div>
        </>
      )}

      <div style={{ marginTop: 24 }}>
        <Button variant="secondary" onClick={() => navigate(routes.settings)}>{t('settings.title')}</Button>
      </div>
    </Screen>
  );
}
