import { useRef, useEffect } from 'react';
import { haptic } from '../../lib/haptics';
import styles from './OtpInput.module.scss';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
  autoFocus?: boolean;
}

/**
 * OTP-поле (S-03): 4 ячейки. Ячейка подпрыгивает при вводе (scale 1→1.08→1),
 * ошибка — shake + heavy haptic (docs/06 §4.2).
 */
export function OtpInput({ length = 4, value, onChange, error, autoFocus }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (error) haptic.heavy();
  }, [error]);

  function setDigit(i: number, digit: string) {
    const clean = digit.replace(/\D/g, '').slice(-1);
    const next = value.split('');
    next[i] = clean;
    const joined = next.join('').slice(0, length);
    onChange(joined);
    if (clean) {
      haptic.light();
      refs.current[i + 1]?.focus();
    }
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !value[i]) refs.current[i - 1]?.focus();
  }

  function onPaste(e: React.ClipboardEvent) {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (digits) {
      onChange(digits);
      refs.current[Math.min(digits.length, length - 1)]?.focus();
      e.preventDefault();
    }
  }

  return (
    <div className={[styles.row, error ? styles.shake : ''].join(' ')} onPaste={onPaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={[styles.cell, value[i] ? styles.filled : '', error ? styles.error : ''].join(' ')}
          inputMode="numeric"
          maxLength={1}
          placeholder="–"
          value={value[i] ?? ''}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          aria-label={`Цифра ${i + 1}`}
        />
      ))}
    </div>
  );
}
