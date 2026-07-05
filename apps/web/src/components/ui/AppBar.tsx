import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../Icon';
import styles from './AppBar.module.scss';

interface AppBarProps {
  title?: string;
  largeTitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  trailing?: ReactNode;
}

/** Хедер экрана: назад, заголовок, действие справа. LargeTitle (28/700) — вариант iOS. */
export function AppBar({ title, largeTitle, showBack, onBack, trailing }: AppBarProps) {
  const navigate = useNavigate();
  const back = onBack ?? (() => navigate(-1));

  return (
    <>
      <div className={styles.bar}>
        <div className={styles.side}>
          {showBack && (
            <button className={styles.iconBtn} onClick={back} aria-label="Назад">
              <Icon name="back" size={24} />
            </button>
          )}
        </div>
        {title && <div className={styles.title}>{title}</div>}
        <div className={[styles.side, styles.right].join(' ')}>{trailing}</div>
      </div>
      {largeTitle && <h1 className={styles.large}>{largeTitle}</h1>}
    </>
  );
}
