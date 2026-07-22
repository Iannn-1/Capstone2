"use client";

import React, { useState } from "react";
import ReportGenerator from "./components/ReportGenerator";
import ReportHistory from "./components/ReportHistory";
import QuickStats from "./components/QuickStats";
import styles from "../styles.module.css";

export default function ReportsPage() {
  const [historyKey, setHistoryKey] = useState(0);

  return (
    <main className={styles.dashboard}>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Reports & Analytics</h1>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0 0" }}>
          Generate, preview, and export reports from live school data.
        </p>
      </div>

      <QuickStats />

      <div className={styles.grid + " cols-2"}>
        <ReportGenerator onGenerated={() => setHistoryKey(k => k + 1)} />
        <ReportHistory refreshKey={historyKey} />
      </div>
    </main>
  );
}
