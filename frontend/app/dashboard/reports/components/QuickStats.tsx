"use client";

import { useEffect, useState } from "react";
import styles from "../../styles.module.css";

type Stats = {
  totalStudents: number;
  activeStudents: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  attendanceRate: number;
  totalScans: number;
  totalTags: number;
  assignedTags: number;
  totalHolidays: number;
  adminUsers: number;
};

const CARDS = [
  { key: "attendanceRate",  label: "Attendance Rate",    icon: "📋", color: "#10b981", fmt: (v: number) => `${v}%`,              sub: (s: Stats) => `${s.presentToday} present · ${s.lateToday} late · ${s.absentToday} absent` },
  { key: "totalStudents",   label: "Total Students",     icon: "👨‍🎓", color: "#3b82f6", fmt: (v: number) => v.toLocaleString(),    sub: (s: Stats) => `${s.activeStudents} active` },
  { key: "totalScans",      label: "Gate Scans Today",   icon: "📡", color: "#8b3b3b", fmt: (v: number) => v.toLocaleString(),    sub: () => "Main Gate IN/OUT" },
  { key: "assignedTags",    label: "Assigned Tags",      icon: "🏷️", color: "#f59e0b", fmt: (v: number) => v.toLocaleString(),    sub: (s: Stats) => `of ${s.totalTags} total` },
] as const;

export default function QuickStats() {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/stats", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setStats(d.stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {[1,2,3,4].map(i => (
          <div key={i} className={styles.card} style={{ height: 100, background: "#f9fafb", animation: "pulse 1.5s infinite" }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
      {CARDS.map(c => {
        const val = stats[c.key as keyof Stats] as number;
        return (
          <div key={c.key} className={styles.card} style={{ overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: c.color }} />
            <div className={styles.cardBody} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${c.color}18`, display: "grid", placeItems: "center", fontSize: 22, flexShrink: 0 }}>
                {c.icon}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>{c.label}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: c.color, lineHeight: 1.1, letterSpacing: "-0.02em" }}>{c.fmt(val)}</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 3 }}>{c.sub(stats)}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
