import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Screen,
  AppBar,
  Button,
  Card,
  StatusPill,
  Chip,
  Price,
  DiplomaBadge,
  CountBadge,
  Avatar,
  TextField,
  TextArea,
  OtpInput,
  SegmentedControl,
  BottomSheet,
  ProgressBar,
  Switch,
  EmptyState,
  Icon,
} from '../../components/ui';
import { setLang, getLang, type Lang } from '../../i18n';
import { statusPill } from '../../theme/tokens';
import styles from './UiKitPage.module.scss';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.h2}>{title}</h2>
      <div className={styles.body}>{children}</div>
    </section>
  );
}

/** /dev/uikit — витрина UI-кита (M1). Не в проде, только для сверки со standalone. */
export function UiKitPage() {
  const { t, i18n } = useTranslation();
  const [otp, setOtp] = useState('12');
  const [otpErr, setOtpErr] = useState(false);
  const [about, setAbout] = useState('');
  const [seg, setSeg] = useState('deck');
  const [chip, setChip] = useState('new');
  const [sw, setSw] = useState(true);
  const [sheet, setSheet] = useState(false);

  return (
    <Screen>
      <AppBar
        title="UI-kit"
        trailing={
          <SegmentedControl<Lang>
            segments={[
              { value: 'ru', label: 'RU' },
              { value: 'kk', label: 'KZ' },
            ]}
            value={getLang()}
            onChange={setLang}
          />
        }
      />

      <Section title="Язык (i18n)">
        <div className={styles.muted}>
          Текущий: {i18n.language.toUpperCase()} · «{t('auth.welcomeSlogan')}»
        </div>
      </Section>

      <Section title="Buttons">
        <Button>{t('auth.start')}</Button>
        <Button variant="secondary">{t('specialist.proposeOwn')}</Button>
        <Button variant="danger">{t('settings.logout')}</Button>
        <Button disabled>{t('auth.getCode')}</Button>
        <Button loading>{t('common.loading')}</Button>
        <Button variant="ghost" fullWidth={false}>
          {t('specialist.aboutSubscription')}
        </Button>
      </Section>

      <Section title="Status pills">
        <div className={styles.row}>
          {Object.entries(statusPill).map(([k, c]) => (
            <span
              key={k}
              className={styles.pillDemo}
              style={{ background: c.bg, color: c.fg }}
            >
              {k}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Chips">
        <div className={styles.row}>
          <Chip selected={chip === 'new'} onClick={() => setChip('new')} count={4}>
            {t('specialist.filterNew')}
          </Chip>
          <Chip selected={chip === 'near'} onClick={() => setChip('near')}>
            {t('specialist.filterNearby')}
          </Chip>
          <Chip selected={chip === 'all'} onClick={() => setChip('all')}>
            {t('specialist.filterAll')}
          </Chip>
        </div>
      </Section>

      <Section title="Segmented">
        <SegmentedControl
          segments={[
            { value: 'deck', label: t('specialist.viewDeck') },
            { value: 'list', label: t('specialist.viewList') },
            { value: 'map', label: t('specialist.viewMap') },
          ]}
          value={seg}
          onChange={setSeg}
        />
      </Section>

      <Section title="Card заказа">
        <Card>
          <div className={styles.cardTop}>
            <StatusPill kind="new" label={t('status.new')} />
            <span className={styles.time}>2 мин назад</span>
          </div>
          <div className={styles.cardTitle}>Установить розетку</div>
          <div className={styles.cardAddr}>ул. Абая, 150</div>
          <div className={styles.cardBottom}>
            <Price amount={5000} size="md" />
            <span className={styles.dist}>1.2 км</span>
          </div>
        </Card>
        <Card selected pressable>
          <div className={styles.cardRow}>
            <Avatar name="Асхат Нурланов" size={44} />
            <div style={{ flex: 1 }}>
              <div className={styles.cardTitle}>Асхат Нурланов</div>
              <DiplomaBadge label={t('specialist.diplomaBadge')} />
            </div>
            <Price amount={4750} size="sm" />
          </div>
        </Card>
      </Section>

      <Section title="Inputs">
        <TextField label={t('onboarding.fullName')} placeholder="Иван Иванов" required />
        <TextField
          label={t('auth.phoneTitle')}
          prefix="+7"
          placeholder="701 234-56-78"
          inputMode="tel"
        />
        <TextField label="С ошибкой" defaultValue="abc" error="Введите корректный номер" />
        <TextArea label={t('onboarding.about')} maxLength={500} value={about} onChange={(e) => setAbout(e.target.value)} />
      </Section>

      <Section title="OTP">
        <OtpInput value={otp} onChange={setOtp} error={otpErr} />
        <div className={styles.row}>
          <Button fullWidth={false} variant="secondary" onClick={() => setOtpErr((v) => !v)}>
            Toggle error
          </Button>
        </div>
      </Section>

      <Section title="Progress (онбординг)">
        <ProgressBar step={2} total={4} />
      </Section>

      <Section title="Switch / Badge / Avatar">
        <div className={styles.rowBetween}>
          <span>{t('client.certifiedOnly')}</span>
          <Switch checked={sw} onChange={setSw} label={t('client.certifiedOnly')} />
        </div>
        <div className={styles.row}>
          <CountBadge count={3}>
            <Icon name="bell" size={24} />
          </CountBadge>
          <Avatar name="Иван Петров" size={48} />
          <Avatar size={48} />
        </div>
      </Section>

      <Section title="Bottom sheet">
        <Button variant="secondary" onClick={() => setSheet(true)}>
          Открыть шит
        </Button>
        <BottomSheet open={sheet} onClose={() => setSheet(false)} title={t('client.filters')}>
          <div className={styles.rowBetween}>
            <span>{t('client.certifiedOnly')}</span>
            <Switch checked={sw} onChange={setSw} />
          </div>
          <Button onClick={() => setSheet(false)}>{t('client.showNSpecialists', { count: 12 })}</Button>
        </BottomSheet>
      </Section>

      <Section title="Empty state">
        <EmptyState
          icon="orders"
          title="Заказов пока нет"
          hint="Загляните на карту — там могут быть заказы рядом"
          action={
            <Button fullWidth={false} variant="secondary">
              {t('specialist.viewMap')}
            </Button>
          }
        />
      </Section>
    </Screen>
  );
}
