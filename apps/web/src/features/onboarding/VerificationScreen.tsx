import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Screen, AppBar, Button, ProgressBar, Icon } from '../../components/ui';
import { submitVerification } from './api';
import { PermissionPrimer } from '../permissions/PermissionPrimer';
import { usePrefsStore } from '../../store/prefs';
import { routes } from '../../router/routes';
import styles from './Onboarding.module.scss';

/** S-06 Подтверждение личности (шаг 2/2): селфи + селфи с документом. */
export function VerificationScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selfie, setSelfie] = useState<File | null>(null);
  const [doc, setDoc] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  // Primer камеры — «зачем» до открытия камеры (один раз).
  const cameraAsked = usePrefsStore((s) => s.perms.cameraAsked);
  const setPerms = usePrefsStore((s) => s.setPerms);
  const [camPrimer, setCamPrimer] = useState(!cameraAsked);
  const closeCam = () => { setCamPrimer(false); setPerms({ cameraAsked: true }); };

  async function submit() {
    if (!selfie || !doc || loading) return;
    setLoading(true);
    try {
      await submitVerification(selfie, doc);
      navigate(routes.spPending, { replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen
      footer={
        <Button onClick={submit} loading={loading} disabled={!selfie || !doc}>
          {t('onboarding.sendForReview')}
        </Button>
      }
    >
      <AppBar showBack largeTitle={t('onboarding.identityConfirm')} />
      <ProgressBar step={2} total={2} />
      <p style={{ color: 'var(--c-ink-secondary)', margin: '16px 0 8px' }}>
        {t('onboarding.uploadPhotosForCheck')}
      </p>
      <div className={styles.uploads}>
        <UploadCard
          file={selfie}
          onPick={setSelfie}
          title={t('onboarding.selfie')}
          hint={t('onboarding.selfieHint')}
        />
        <UploadCard
          file={doc}
          onPick={setDoc}
          title={t('onboarding.selfieWithDoc')}
          hint={t('onboarding.selfieWithDocHint')}
        />
      </div>

      <PermissionPrimer
        open={camPrimer}
        icon="camera"
        title={t('perm.cameraTitle')}
        body={t('perm.cameraBody')}
        onAllow={closeCam}
        onLater={closeCam}
        laterLabel={t('common.close')}
      />
    </Screen>
  );
}

function UploadCard({
  file,
  onPick,
  title,
  hint,
}: {
  file: File | null;
  onPick: (f: File) => void;
  title: string;
  hint: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>();

  return (
    <div
      className={[styles.uploadCard, file ? styles.filled : ''].join(' ')}
      onClick={() => ref.current?.click()}
    >
      <div className={styles.uploadIcon}>
        {preview ? <img src={preview} alt="" /> : <Icon name="camera" size={24} color="var(--c-primary)" />}
      </div>
      <div className={styles.uploadText}>
        <div className={styles.uploadTitle}>{title}</div>
        <div className={styles.uploadHint}>{file ? file.name : hint}</div>
      </div>
      {file && <Icon name="check" size={22} color="var(--c-success)" />}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        capture="user"
        className={styles.hidden}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            onPick(f);
            setPreview(URL.createObjectURL(f));
          }
        }}
      />
    </div>
  );
}
