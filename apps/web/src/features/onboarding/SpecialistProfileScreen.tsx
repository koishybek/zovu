import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Button, TextField, TextArea, Chip, ProgressBar, BottomSheet, Icon } from '../../components/ui';
import { fetchCategories } from '../auth/api';
import { saveSpecialistProfile } from './api';
import { useAuthStore } from '../../store/auth';
import { routes } from '../../router/routes';
import styles from './Onboarding.module.scss';

/** S-05 Анкета специалиста (шаг 1/2): ФИО, дата, категория, о себе, диплом. */
export function SpecialistProfileScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [mainId, setMainId] = useState('');
  const [catSheet, setCatSheet] = useState(false);
  const [extra, setExtra] = useState<string[]>([]);
  const [extraOpen, setExtraOpen] = useState(false);
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(false);

  const mainName = categories.find((c) => c.id === mainId)?.name ?? '';
  const valid = name.trim().length >= 2 && mainId && /^\d{2}\.\d{2}\.\d{4}$/.test(dob);

  function toggleExtra(id: string) {
    setExtra((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  }

  async function submit() {
    if (!valid || loading) return;
    setLoading(true);
    try {
      const [d, m, y] = dob.split('.');
      const user = await saveSpecialistProfile({ name: name.trim(), dob: `${y}-${m}-${d}`, mainCategoryId: mainId, categoryIds: extra, about: about.trim() || undefined });
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
        <TextField label={t('onboarding.fullName')} required value={name} placeholder="Иван Иванов" leadingIcon={<Icon name="profile" size={20} />} onChange={(e) => setName(e.target.value)} />
        <TextField label={t('onboarding.birthDate')} required inputMode="numeric" value={dob} placeholder="ДД.ММ.ГГГГ" leadingIcon={<Icon name="calendar" size={20} />} onChange={(e) => setDob(maskDate(e.target.value))} />

        <div>
          <div className={styles.fieldLabel}>{t('onboarding.mainCategory')} *</div>
          <button className={styles.selector} onClick={() => setCatSheet(true)}>
            <Icon name="menu" size={20} color="#a2a8b4" />
            <span className={mainId ? styles.selVal : styles.selPh}>{mainName || 'Выберите категорию'}</span>
            <Icon name="chevronDown" size={20} color="var(--c-ink-muted)" />
          </button>
        </div>

        {mainId && (
          <div>
            <button className={styles.linkBtn} onClick={() => setExtraOpen((v) => !v)}>
              {t('onboarding.extraCategories')} {extra.length ? `(${extra.length})` : ''}
              <Icon name={extraOpen ? 'chevronDown' : 'chevronRight'} size={16} color="var(--c-primary)" />
            </button>
            {extraOpen && (
              <div className={styles.chips}>
                {categories.filter((c) => c.id !== mainId).map((c) => (
                  <Chip key={c.id} selected={extra.includes(c.id)} onClick={() => toggleExtra(c.id)}>{c.name}</Chip>
                ))}
              </div>
            )}
          </div>
        )}

        <TextArea label={t('onboarding.about')} maxLength={500} value={about} placeholder="Расскажите о своём опыте…" onChange={(e) => setAbout(e.target.value)} />

        <button className={styles.diploma}>
          <Icon name="upload" size={18} color="var(--c-primary)" />
          {t('onboarding.uploadDiploma')}
        </button>
      </div>

      <BottomSheet open={catSheet} onClose={() => setCatSheet(false)} title={t('onboarding.mainCategory')}>
        {categories.map((c) => (
          <button key={c.id} className={styles.catRow} onClick={() => { setMainId(c.id); setExtra((v) => v.filter((x) => x !== c.id)); setCatSheet(false); }}>
            {c.name}
            {mainId === c.id && <Icon name="check" size={20} color="var(--c-primary)" />}
          </button>
        ))}
      </BottomSheet>
    </Screen>
  );
}

function maskDate(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 8);
  const parts = [d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)].filter(Boolean);
  return parts.join('.');
}
