import { useTranslation } from 'react-i18next';
import { EmptyState } from './EmptyState';
import { Button } from './Button';
import type { IconName } from '../Icon';

interface ErrorStateProps {
  onRetry?: () => void;
  title?: string;
  hint?: string;
  icon?: IconName;
  retrying?: boolean;
}

/**
 * Единое состояние сетевой ошибки: иконка + текст + «Повторить».
 * НЕ маскируется под empty — сбой должен выглядеть как сбой, а не «пусто» (критерий ТЗ).
 */
export function ErrorState({ onRetry, title, hint, icon = 'alert', retrying = false }: ErrorStateProps) {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={icon}
      title={title ?? t('common.error')}
      hint={hint ?? t('common.errorHint')}
      action={
        onRetry ? (
          <Button variant="secondary" fullWidth={false} loading={retrying} onClick={onRetry}>
            {t('common.retry')}
          </Button>
        ) : undefined
      }
    />
  );
}
