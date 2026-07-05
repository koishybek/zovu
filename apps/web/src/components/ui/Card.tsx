import { type HTMLAttributes, type ReactNode } from 'react';
import styles from './Card.module.scss';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  pressable?: boolean;
  selected?: boolean;
  children: ReactNode;
}

/** Карточка: border 1px, radius 16, еле заметная тень. Selected — primarySoft-фон. */
export function Card({ pressable, selected, children, className, ...rest }: CardProps) {
  return (
    <div
      className={[
        styles.card,
        pressable ? styles.pressable : '',
        selected ? styles.selected : '',
        className ?? '',
      ].join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
