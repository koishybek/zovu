import { useTranslation } from 'react-i18next';
import { Icon } from '../Icon';
import styles from './StatusTimeline.module.scss';

const STEPS = ['published', 'chosen', 'inProgress', 'completed', 'reviewed'] as const;

/** Индекс текущего шага по статусу заказа (docs/07 state machine). */
function currentStep(status: string): number {
  switch (status) {
    case 'active':
      return 0;
    case 'in_progress':
      return 2;
    case 'awaiting_confirmation':
      return 3;
    case 'completed':
    case 'completed_auto':
      return STEPS.length; // терминальное: все шаги «done», без пульсации
    default:
      return 0;
  }
}

/** Таймлайн заказа: Опубликован → Выбран → В работе → Выполнено → Оценено (Uber/DoorDash-стиль). */
export function StatusTimeline({ status }: { status: string }) {
  const { t } = useTranslation();
  // Исключительные/замороженные состояния таймлайн не показывают (banner объясняет отдельно).
  if (status === 'cancelled' || status === 'disputed') return null;
  const cur = currentStep(status);

  return (
    <div className={styles.wrap}>
      {STEPS.map((step, i) => {
        const state = i < cur ? 'done' : i === cur ? 'active' : 'todo';
        return (
          <div key={step} className={[styles.step, styles[state]].join(' ')}>
            <div className={styles.railCol}>
              <span className={styles.dot}>{state === 'done' && <Icon name="check" size={12} strokeWidth={3} color="#fff" />}</span>
              {i < STEPS.length - 1 && <span className={styles.line} />}
            </div>
            <span className={styles.label}>{t(`timeline.${step}` as const)}</span>
          </div>
        );
      })}
    </div>
  );
}
