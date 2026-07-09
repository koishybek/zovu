import { useTranslation } from 'react-i18next';
import { BottomSheet, Button, Icon, type IconName } from '../../components/ui';
import styles from './Permission.module.scss';

interface PermissionPrimerProps {
  open: boolean;
  icon: IconName;
  title: string;
  body: string;
  onAllow: () => void;
  onLater: () => void;
  /** Текст вторичной кнопки (по умолчанию «Позже»). */
  laterLabel?: string;
}

/**
 * Экран-объяснение «зачем» ПЕРЕД системным диалогом разрешения (гео/push/камера).
 * Закрытие бэкдропом = «Позже» (не даём разрешение молча).
 */
export function PermissionPrimer({ open, icon, title, body, onAllow, onLater, laterLabel }: PermissionPrimerProps) {
  const { t } = useTranslation();
  return (
    <BottomSheet open={open} onClose={onLater}>
      <div className={styles.wrap}>
        <div className={styles.icon}>
          <Icon name={icon} size={30} color="var(--c-primary)" />
        </div>
        <div className={styles.title}>{title}</div>
        <div className={styles.body}>{body}</div>
        <div className={styles.actions}>
          <Button onClick={onAllow}>{t('perm.allow')}</Button>
          <button className={styles.later} onClick={onLater}>{laterLabel ?? t('perm.later')}</button>
        </div>
      </div>
    </BottomSheet>
  );
}
