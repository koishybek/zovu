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
  Rating,
  Slider,
  RadioRow,
  CheckboxRow,
  Celebration,
  Icon,
} from '../../components/ui';
import { setLang, getLang, type Lang } from '../../i18n';
import { formatDistanceKm } from '../../lib/format';
import styles from './UiKitPage.module.scss';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.h2}>{title}</h2>
      <div className={styles.body}>{children}</div>
    </section>
  );
}

// Русские подписи статус-пиллов (то, что видит юзер). Ключи enum — только в коде.
const PILLS: { kind: 'new' | 'inProgress' | 'waiting' | 'review' | 'accepted' | 'done' | 'notSelected'; key: string }[] = [
  { kind: 'new', key: 'status.new' },
  { kind: 'inProgress', key: 'status.inProgress' },
  { kind: 'waiting', key: 'status.waiting' },
  { kind: 'review', key: 'status.review' },
  { kind: 'accepted', key: 'status.accepted' },
  { kind: 'done', key: 'status.done' },
  { kind: 'notSelected', key: 'status.notSelected' },
];

/** /dev/uikit — витрина UI-кита. Не в проде, только для сверки со standalone. */
export function UiKitPage() {
  const { t, i18n } = useTranslation();
  const [otp, setOtp] = useState('12');
  const [otpErr, setOtpErr] = useState(false);
  const [about, setAbout] = useState('');
  const [seg, setSeg] = useState('deck');
  const [chip, setChip] = useState('new');
  const [sw, setSw] = useState(true);
  const [sheet, setSheet] = useState(false);
  const [stars, setStars] = useState(4);
  const [dist, setDist] = useState(15);
  const [pay, setPay] = useState('kaspi');
  const [cats, setCats] = useState<string[]>(['Электрика']);

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

      <Section title="Статус-пиллы (русские подписи)">
        <div className={styles.row}>
          {PILLS.map((p) => (
            <StatusPill key={p.kind} kind={p.kind} label={t(p.key as never)} />
          ))}
        </div>
        <div className={styles.hint}>«Принят» soft ↔ «Выполнен» fill; «Ожидание» soft ↔ «На рассмотрении» fill.</div>
      </Section>

      <Section title="Chips (тап-таргет 44pt)">
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
            <span className={styles.dist}>{formatDistanceKm(1.2)}</span>
          </div>
        </Card>
      </Section>

      <Section title="Card отклика — обычная и выбранная">
        <BidCard selected={false} />
        <BidCard selected />
      </Section>

      <Section title="Inputs">
        <TextField label={t('onboarding.fullName')} placeholder="Иван Иванов" required />
        <TextField label={t('auth.phoneTitle')} prefix="+7" placeholder="701 234-56-78" inputMode="tel" />
        <TextField label="С ошибкой" defaultValue="abc" error={t('auth.phoneInvalid')} />
        <TextArea
          label={t('onboarding.about')}
          maxLength={500}
          value={about}
          placeholder="Расскажите о себе…"
          onChange={(e) => setAbout(e.target.value)}
        />
      </Section>

      <Section title="OTP — все состояния">
        <OtpStatesDemo />
        <div style={{ marginTop: 12 }}>
          <div className={styles.hint}>Интерактивно (ввод → bounce, «Toggle error» → shake):</div>
          <OtpInput value={otp} onChange={setOtp} error={otpErr} />
          <div className={styles.row} style={{ marginTop: 12 }}>
            <Button fullWidth={false} variant="secondary" onClick={() => setOtpErr((v) => !v)}>
              Toggle error
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Rating (S-27)">
        <Rating value={stars} onChange={setStars} />
        <div className={styles.muted}>Выбрано: {stars}★ · read-only: <Rating value={4} size={20} readOnly /></div>
      </Section>

      <Section title="Slider (S-21 «Расстояние»)">
        <Slider value={dist} min={1} max={50} onChange={setDist} label={t('client.distance')} formatValue={(v) => formatDistanceKm(v)} />
      </Section>

      <Section title="Radio (способ оплаты)">
        <RadioRow checked={pay === 'kaspi'} onChange={() => setPay('kaspi')}>{t('specialist.kaspi')}</RadioRow>
        <RadioRow checked={pay === 'card'} onChange={() => setPay('card')}>{t('specialist.bankCard')}</RadioRow>
      </Section>

      <Section title="Checkbox (мультивыбор категорий)">
        {['Электрика', 'Сантехника', 'Уборка'].map((c) => (
          <CheckboxRow key={c} checked={cats.includes(c)} onChange={() => setCats((v) => (v.includes(c) ? v.filter((x) => x !== c) : [...v, c]))}>
            {c}
          </CheckboxRow>
        ))}
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
          <DiplomaBadge label={t('specialist.diplomaBadge')} />
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

      <Section title="Success (S-08 / S-26)">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '16px 0' }}>
          <Celebration />
          <div style={{ fontSize: 20, fontWeight: 700 }}>{t('onboarding.verificationPassed')}</div>
        </div>
      </Section>

      <Section title="Empty state">
        <EmptyState
          icon="orders"
          title="Заказов пока нет"
          hint="Загляните на карту — там могут быть заказы рядом"
          action={<Button fullWidth={false} variant="secondary">{t('specialist.viewMap')}</Button>}
        />
      </Section>
    </Screen>
  );
}

function BidCard({ selected }: { selected: boolean }) {
  const { t } = useTranslation();
  return (
    <Card selected={selected} pressable>
      <div className={styles.cardRow}>
        <Avatar name="Асхат Нурланов" size={44} />
        <div style={{ flex: 1 }}>
          <div className={styles.cardTitle}>Асхат Нурланов</div>
          <div className={styles.bidMeta}>
            <Rating value={5} size={14} readOnly />
            <span className={styles.dist}>· {t('specialist.diplomaBadge')}</span>
          </div>
        </div>
        <Price amount={4750} size="sm" />
      </div>
    </Card>
  );
}

// Статичная витрина 4 состояний OTP-ячейки (без клика).
function OtpStatesDemo() {
  const cells: { label: string; content: string; cls: string }[] = [
    { label: 'Пустая', content: '–', cls: styles.otpEmpty },
    { label: 'Активная', content: '', cls: styles.otpActive },
    { label: 'Заполнена', content: '5', cls: styles.otpFilled },
    { label: 'Ошибка', content: '3', cls: styles.otpError },
  ];
  return (
    <div className={styles.otpStates}>
      {cells.map((c) => (
        <div key={c.label} className={styles.otpCol}>
          <div className={[styles.otpCell, c.cls].join(' ')}>
            {c.content || <span className={styles.caret} />}
          </div>
          <span className={styles.otpLabel}>{c.label}</span>
        </div>
      ))}
    </div>
  );
}
