import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Button, TextField } from '../../components/ui';
import { switchRole, updateMe } from './api';
import { useAuthStore } from '../../store/auth';
import { routes } from '../../router/routes';

/** ФИО заказчика (после S-04, перед S-20). */
export function ClientNameScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (name.trim().length < 2 || loading) return;
    setLoading(true);
    try {
      await updateMe({ name: name.trim() });
      const user = await switchRole('client');
      setUser(user);
      navigate(routes.clientOrderNew, { replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen
      footer={
        <Button onClick={submit} loading={loading} disabled={name.trim().length < 2}>
          {t('common.next')}
        </Button>
      }
    >
      <AppBar showBack largeTitle={t('onboarding.tellAboutYourself')} />
      <TextField
        label={t('onboarding.fullName')}
        required
        autoFocus
        value={name}
        placeholder="Иван Иванов"
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
    </Screen>
  );
}
