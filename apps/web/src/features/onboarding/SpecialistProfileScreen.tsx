import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Button, TextField, TextArea, Chip, ProgressBar } from '../../components/ui';
import { fetchCategories } from '../auth/api';
import { saveSpecialistProfile } from './api';
import { useAuthStore } from '../../store/auth';
import { routes } from '../../router/routes';
import styles from './Onboarding.module.scss';

/** S-05 Анкета специалиста (шаг 1/2): ФИО, дата, категории, о себе. */
export function SpecialistProfileScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [mainId, setMainId] = useState('');
  const [extra, setExtra] = useState<string[]>([]);
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(false);

  const valid = name.trim().length >= 2 && mainId && /^\d{2}\.\d{2}\.\d{4}$/.test(dob);

  function toggleExtra(id: string) {
    setExtra((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  }

  async function submit() {
    if (!valid || loading) return;
    setLoading(true);
    try {
      const [d, m, y] = dob.split('.');
      const user = await saveSpecialistProfile({
        name: name.trim(),
        dob: `${y}-${m}-${d}`,
        mainCategoryId: mainId,
        categoryIds: extra,
        about: about.trim() || undefined,
      });
      setUser(user);
      navigate(routes.spVerification);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen footer={<Button onClick={submit} loading={loading} disabled={!valid}>{t('common.next')}</Button>}>
      <AppBar showBack largeTitle={t('onboarding.tellAboutYourself')} />
      <ProgressBar step={1} total={2} />
      <div className={styles.form}>
        <TextField label={t('onboarding.fullName')} required value={name} placeholder="Иван Иванов" onChange={(e) => setName(e.target.value)} />
        <TextField
          label={t('onboarding.birthDate')}
          required
          inputMode="numeric"
          value={dob}
          placeholder="ДД.ММ.ГГГГ"
          onChange={(e) => setDob(maskDate(e.target.value))}
        />
        <div>
          <div className={styles.fieldLabel}>{t('onboarding.mainCategory')} *</div>
          <div className={styles.chips}>
            {categories.map((c) => (
              <Chip key={c.id} selected={mainId === c.id} onClick={() => setMainId(c.id)}>
                {c.name}
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <div className={styles.fieldLabel}>{t('onboarding.extraCategories')}</div>
          <div className={styles.chips}>
            {categories
              .filter((c) => c.id !== mainId)
              .map((c) => (
                <Chip key={c.id} selected={extra.includes(c.id)} onClick={() => toggleExtra(c.id)}>
                  {c.name}
                </Chip>
              ))}
          </div>
        </div>
        <TextArea label={t('onboarding.about')} maxLength={500} value={about} onChange={(e) => setAbout(e.target.value)} />
      </div>
    </Screen>
  );
}

function maskDate(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 8);
  const parts = [d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)].filter(Boolean);
  return parts.join('.');
}
