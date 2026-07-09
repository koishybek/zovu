import { useTranslation } from 'react-i18next';
import { usePrefsStore } from '../../store/prefs';
import { PermissionPrimer } from './PermissionPrimer';
import { requestGeo, requestPush } from './actions';

const pushSupported = typeof window !== 'undefined' && 'Notification' in window;

/**
 * Первичный показ permission-primers при входе в приложение: сначала гео, затем push.
 * Каждый — один раз (флаги в prefs). «Разрешить» вызывает реальный системный диалог,
 * «Позже» просто помечает как показанный (гео можно включить позже в Настройках).
 * Серверного web-push нет (локально).
 */
export function PermissionsGate() {
  const { t } = useTranslation();
  const perms = usePrefsStore((s) => s.perms);
  const setPerms = usePrefsStore((s) => s.setPerms);

  // Реактивно: показываем гео, пока не спросили; затем push; затем ничего.
  const step: 'geo' | 'push' | null = !perms.geoAsked
    ? 'geo'
    : !perms.pushAsked && pushSupported
      ? 'push'
      : null;

  const allowGeo = () => requestGeo(setPerms);
  const allowPush = () => requestPush(setPerms);

  return (
    <>
      <PermissionPrimer
        open={step === 'geo'}
        icon="pin"
        title={t('perm.geoTitle')}
        body={t('perm.geoBody')}
        onAllow={allowGeo}
        onLater={() => setPerms({ geoAsked: true })}
      />
      <PermissionPrimer
        open={step === 'push'}
        icon="bell"
        title={t('perm.pushTitle')}
        body={t('perm.pushBody')}
        onAllow={allowPush}
        onLater={() => setPerms({ pushAsked: true })}
      />
    </>
  );
}
