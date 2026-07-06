import { type InputHTMLAttributes, type ReactNode } from 'react';
import styles from './TextField.module.scss';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  prefix?: ReactNode;
  leadingIcon?: ReactNode;
  trailing?: ReactNode;
  error?: string;
  required?: boolean;
}

/** Инпут: высота 52, радиус 13, inset-border, фокус — primary. Опц. префикс (+7) / иконка слева. */
export function TextField({ label, prefix, leadingIcon, trailing, error, required, className, ...rest }: TextFieldProps) {
  return (
    <label className={styles.wrap}>
      {label && (
        <span className={styles.label}>
          {label}
          {required && <span className={styles.req}> *</span>}
        </span>
      )}
      <div className={[styles.field, error ? styles.errorField : ''].join(' ')}>
        {leadingIcon && <span className={styles.leading}>{leadingIcon}</span>}
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        <input className={[styles.input, className ?? ''].join(' ')} {...rest} />
        {trailing && <span className={styles.leading}>{trailing}</span>}
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
}

interface TextAreaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  maxLength: number;
  value: string;
}

/** Textarea со счётчиком «97/300». */
export function TextArea({ label, maxLength, value, className, ...rest }: TextAreaProps) {
  return (
    <label className={styles.wrap}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.textareaWrap}>
        <textarea
          className={[styles.textarea, className ?? ''].join(' ')}
          maxLength={maxLength}
          value={value}
          rows={4}
          {...rest}
        />
        <span className={styles.counter}>
          {value.length}/{maxLength}
        </span>
      </div>
    </label>
  );
}
