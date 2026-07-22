"use client";

import { useEffect, useState } from "react";
import styles from "../../styles.module.css";

export default function HeroClock() {
  const [mounted, setMounted] = useState(false);
  const [tick,    setTick]    = useState(0);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now     = mounted ? new Date() : null;
  const timeStr = now
    ? now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--";
  const dateStr = now
    ? now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <div className={styles.heroBanner}>
      <div className={styles.heroLeft}>
        <div className={styles.heroGreeting}>Good day, Admin 👋</div>
        <h1 className={styles.heroTitle}>School RFID Dashboard</h1>
        <p className={styles.heroSub}>{dateStr}</p>
      </div>
      <div className={styles.heroClock}>
        <div className={styles.heroTime}>{timeStr}</div>
        <div className={styles.heroTimeLabel}>Current Time</div>
      </div>
    </div>
  );
}
