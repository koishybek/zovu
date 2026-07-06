import styles from './StatusBar.module.scss';

/** iOS-статусбар: 9:41 + сеть/wifi/батарея. Часть рамки телефона (единый вид всех экранов). */
export function StatusBar() {
  return (
    <div className={styles.bar}>
      <span className={styles.time}>9:41</span>
      <div className={styles.icons}>
        {/* Сеть */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        {/* Wi-Fi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
          <path d="M8 2.5c2.6 0 5 1 6.8 2.7l1.2-1.3C13.8 1.7 11 .5 8 .5S2.2 1.7 0 3.9l1.2 1.3C3 3.5 5.4 2.5 8 2.5Z" />
          <path d="M8 6c1.4 0 2.7.5 3.7 1.4l1.2-1.3C11.6 4.9 9.9 4.2 8 4.2s-3.6.7-4.9 1.9l1.2 1.3C5.3 6.5 6.6 6 8 6Z" />
          <path d="M8 9.4 9.9 7.5C9.4 7 8.7 6.7 8 6.7s-1.4.3-1.9.8L8 9.4Z" />
        </svg>
        {/* Батарея */}
        <div className={styles.battery}>
          <div className={styles.batteryFill} />
        </div>
      </div>
    </div>
  );
}
