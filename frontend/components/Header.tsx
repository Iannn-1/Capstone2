import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <span className={styles.rfidWave}>📡</span>
            </div>
            <div className={styles.logoText}>
              <span className={styles.schoolText}>SCHOOL</span>
              <span className={styles.rfidText}>RFID</span>
            </div>
          </div>
        </div>

        <nav aria-label="Main navigation" className={styles.nav}>
          <Link href="#login" className={styles.signInBtn}>
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
