import { type ReactNode, useEffect } from 'react';
import styles from './BottomSheet.module.scss';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/** Bottom sheet: backdrop + slide-up, радиус верхних углов 20, хендл. */
export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className={styles.handle} />
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
