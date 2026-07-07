import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusPill, Price, Icon, Button, EmptyState } from '../../components/ui';
import { formatDistanceKm } from '../../lib/format';
import { fileUrl } from '../../lib/image';
import { haptic } from '../../lib/haptics';
import type { FeedOrder } from './api';
import styles from './OrderDeck.module.scss';

const THRESHOLD = 90; // px до срабатывания свайпа

interface Props {
  orders: FeedOrder[];
  onRespond: (o: FeedOrder) => void;
  onHide: (o: FeedOrder) => void;
  onOpen: (o: FeedOrder) => void;
  onEmptyAction: () => void;
}

/** Колода заказов (§4.3): свайп вправо → отклик, влево → скрыть, тап → карточка. */
export function OrderDeck({ orders, onRespond, onHide, onOpen, onEmptyAction }: Props) {
  const { t } = useTranslation();
  const [idx, setIdx] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [undo, setUndo] = useState<FeedOrder | null>(null);
  const start = useRef({ x: 0, y: 0 });
  const passedThreshold = useRef(false);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const top = orders[idx];
  const next = orders[idx + 1];

  function onPointerDown(e: React.PointerEvent) {
    start.current = { x: e.clientX, y: e.clientY };
    setDrag({ x: 0, y: 0, active: true });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag.active) return;
    const x = e.clientX - start.current.x;
    const y = e.clientY - start.current.y;
    setDrag({ x, y, active: true });
    if (Math.abs(x) > THRESHOLD && !passedThreshold.current) {
      passedThreshold.current = true;
      haptic.light();
    } else if (Math.abs(x) <= THRESHOLD) {
      passedThreshold.current = false;
    }
  }

  function onPointerUp() {
    if (!drag.active) return;
    const { x } = drag;
    if (x > THRESHOLD) commit('right');
    else if (x < -THRESHOLD) commit('left');
    else setDrag({ x: 0, y: 0, active: false });
    passedThreshold.current = false;
  }

  function commit(dir: 'left' | 'right') {
    const order = top;
    setDrag({ x: dir === 'right' ? 500 : -500, y: 0, active: false });
    setTimeout(() => {
      setDrag({ x: 0, y: 0, active: false });
      setIdx((i) => i + 1);
      if (dir === 'right') {
        onRespond(order);
      } else {
        onHide(order);
        setUndo(order);
        clearTimeout(undoTimer.current);
        undoTimer.current = setTimeout(() => setUndo(null), 3000);
      }
    }, 180);
  }

  function undoHide() {
    if (undo) {
      setIdx((i) => Math.max(0, i - 1));
      setUndo(null);
    }
  }

  if (!top) {
    return (
      <EmptyState
        icon="map"
        title={t('common.emptyDefault')}
        hint="Загляните на карту — там могут быть заказы рядом"
        action={<Button fullWidth={false} variant="secondary" onClick={onEmptyAction}>{t('specialist.viewMap')}</Button>}
      />
    );
  }

  const rot = Math.max(-8, Math.min(8, drag.x / 12));
  const likeOp = Math.max(0, Math.min(1, drag.x / THRESHOLD));
  const nopeOp = Math.max(0, Math.min(1, -drag.x / THRESHOLD));

  return (
    <div className={styles.deck}>
      <div className={styles.stack}>
        {next && (
          <div className={[styles.card, styles.behind].join(' ')}>
            <DeckCardBody order={next} />
          </div>
        )}
        <div
          className={styles.card}
          style={{
            transform: `translate(${drag.x}px, ${drag.y}px) rotate(${rot}deg)`,
            transition: drag.active ? 'none' : 'transform 180ms cubic-bezier(0.19,0.91,0.38,1)',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onClick={() => Math.abs(drag.x) < 6 && onOpen(top)}
        >
          <div className={[styles.overlay, styles.like].join(' ')} style={{ opacity: likeOp }}>
            <Icon name="check" size={44} strokeWidth={3} color="#fff" />
          </div>
          <div className={[styles.overlay, styles.nope].join(' ')} style={{ opacity: nopeOp }}>
            <Icon name="close" size={44} strokeWidth={3} color="#fff" />
          </div>
          <DeckCardBody order={top} />
        </div>
      </div>

      <div className={styles.actions}>
        <button className={[styles.fab, styles.fabNope].join(' ')} onClick={() => commit('left')} aria-label="Скрыть">
          <Icon name="close" size={26} strokeWidth={2.5} />
        </button>
        <button className={[styles.fab, styles.fabLike].join(' ')} onClick={() => commit('right')} aria-label="Откликнуться">
          <Icon name="check" size={28} strokeWidth={2.5} />
        </button>
      </div>

      {undo && (
        <div className={styles.snack}>
          <span>Заказ скрыт</span>
          <button onClick={undoHide}>Отменить</button>
        </div>
      )}
    </div>
  );
}

function DeckCardBody({ order }: { order: FeedOrder }) {
  const { t } = useTranslation();
  return (
    <div className={styles.body}>
      <div className={styles.photo}>
        {order.photos.length > 0 ? (
          <img src={fileUrl(order.photos[0])} alt="" className={styles.photoImg} />
        ) : (
          <Icon name="orders" size={40} color="var(--c-primary)" />
        )}
        {order.is_new && (
          <div className={styles.newPill}>
            <StatusPill kind="new" label={t('status.new')} />
          </div>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.chip}>{order.category_name}</div>
        <Price amount={order.budget} size="lg" />
        <div className={styles.meta}>
          <Icon name="pin" size={16} color="var(--c-ink-muted)" />
          {order.distance_m != null ? formatDistanceKm(order.distance_m / 1000) : order.address}
        </div>
        <div className={styles.title}>{order.title}</div>
        <div className={styles.desc}>{order.description}</div>
      </div>
    </div>
  );
}
