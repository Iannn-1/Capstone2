"use client";

import { useEffect, useState } from "react";
import styles from "../../styles.module.css";

type AttendanceBucket = {
  label: string;
  group: string;
  present: number;
  absent: number;
  late: number;
};

const GROUP_META: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  "Elementary":  { color: "#065f46", bg: "#d1fae5", border: "#6ee7b7", icon: "🏫" },
  "High School": { color: "#1e40af", bg: "#dbeafe", border: "#93c5fd", icon: "📚" },
  "Senior High": { color: "#5b21b6", bg: "#ede9fe", border: "#c4b5fd", icon: "🎓" },
  "College":     { color: "#92400e", bg: "#fef3c7", border: "#fcd34d", icon: "🏛️" },
};

const GROUP_ORDER = ["Elementary", "High School", "Senior High", "College"];

export default function AttendanceSummary() {
  const [data, setData] = useState<AttendanceBucket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard/attendance", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load attendance");
        const json = await res.json();
        if (mounted) setData(json.buckets || []);
      } catch (e: any) {
        if (mounted) setError(e.message || "Error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    const id = setInterval(fetchData, 30_000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const totalPresent = data.reduce((s, b) => s + b.present, 0);
  const totalAbsent  = data.reduce((s, b) => s + b.absent, 0);
  const totalLate    = data.reduce((s, b) => s + b.late, 0);
  const grandTotal   = totalPresent + totalAbsent + totalLate;
  const presentPct   = grandTotal > 0 ? Math.round((totalPresent / grandTotal) * 100) : 0;

  // Group buckets
  const grouped = GROUP_ORDER.map((g) => ({
    group: g,
    buckets: data.filter((b) => b.group === g),
  })).filter((g) => g.buckets.length > 0);

  const toggleGroup = (g: string) =>
    setCollapsed((prev) => ({ ...prev, [g]: !prev[g] }));

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2>📋 Today's Attendance</h2>
        <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
          Live · updates every 30s
        </span>
      </div>

      <div className={styles.cardBody}>
        {loading && <div style={{ color: "#9ca3af", fontSize: 14 }}>Loading attendance…</div>}
        {error   && <div style={{ color: "#ef4444", fontSize: 14 }}>Error: {error}</div>}

        {!loading && !error && (
          <>
            {/* ── Overall summary pills ── */}
            <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
              <SummaryPill label="Present" value={totalPresent} color="#10b981" bg="#d1fae5" />
              <SummaryPill label="Late"    value={totalLate}    color="#f59e0b" bg="#fef3c7" />
              <SummaryPill label="Absent"  value={totalAbsent}  color="#ef4444" bg="#fee2e2" />
            </div>

            {/* ── Overall rate bar ── */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>Overall Attendance Rate</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: presentPct >= 90 ? "#10b981" : presentPct >= 75 ? "#f59e0b" : "#ef4444" }}>
                  {presentPct}%
                </span>
              </div>
              <div style={{ height: 8, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${presentPct}%`,
                  background: "linear-gradient(90deg, #10b981, #34d399)",
                  borderRadius: 999,
                  transition: "width 0.6s ease",
                }} />
              </div>
            </div>

            {/* ── Grouped sections ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {grouped.map(({ group, buckets }) => {
                const meta       = GROUP_META[group] ?? { color: "#374151", bg: "#f9fafb", border: "#e5e7eb", icon: "📂" };
                const gPresent   = buckets.reduce((s, b) => s + b.present, 0);
                const gAbsent    = buckets.reduce((s, b) => s + b.absent, 0);
                const gLate      = buckets.reduce((s, b) => s + b.late, 0);
                const gTotal     = gPresent + gAbsent + gLate;
                const gPct       = gTotal > 0 ? Math.round((gPresent / gTotal) * 100) : 0;
                const isOpen     = !collapsed[group];

                return (
                  <div key={group} style={{ border: `1px solid ${meta.border}`, borderRadius: 12, overflow: "hidden" }}>
                    {/* Group header — clickable to collapse */}
                    <button
                      onClick={() => toggleGroup(group)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "11px 14px",
                        background: meta.bg,
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{meta.icon}</span>
                      <span style={{ fontWeight: 800, fontSize: 13, color: meta.color, flex: 1 }}>{group}</span>
                      {/* Group totals */}
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981", minWidth: 28, textAlign: "right" }}>{gPresent}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", minWidth: 24, textAlign: "right" }}>{gLate}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", minWidth: 24, textAlign: "right" }}>{gAbsent}</span>
                      <span style={{ fontSize: 12, fontWeight: 800, color: meta.color, minWidth: 38, textAlign: "right" }}>{gPct}%</span>
                      <span style={{ fontSize: 12, color: meta.color, marginLeft: 4, transition: "transform 0.2s", display: "inline-block", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
                    </button>

                    {/* Bucket rows */}
                    {isOpen && (
                      <div style={{ padding: "8px 12px 10px", display: "flex", flexDirection: "column", gap: 6, background: "#fff" }}>
                        {/* Column labels */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 4, borderBottom: "1px solid #f3f4f6" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", width: 72, flexShrink: 0, textTransform: "uppercase" }}>Level</div>
                          <div style={{ flex: 1 }} />
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#10b981", minWidth: 28, textAlign: "right" }}>P</div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", minWidth: 24, textAlign: "right" }}>L</div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", minWidth: 24, textAlign: "right" }}>A</div>
                        </div>

                        {buckets.map((b) => {
                          const tot = b.present + b.absent + b.late;
                          const pct = tot > 0 ? Math.round((b.present / tot) * 100) : 0;
                          return (
                            <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", width: 72, flexShrink: 0 }}>{b.label}</div>
                              <div style={{ flex: 1, height: 6, background: "#f3f4f6", borderRadius: 999, overflow: "hidden" }}>
                                <div style={{
                                  height: "100%",
                                  width: `${pct}%`,
                                  background: pct >= 90 ? "#10b981" : pct >= 75 ? "#f59e0b" : "#ef4444",
                                  borderRadius: 999,
                                  transition: "width 0.5s ease",
                                }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981", minWidth: 28, textAlign: "right" }}>{b.present}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", minWidth: 24, textAlign: "right" }}>{b.late}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", minWidth: 24, textAlign: "right" }}>{b.absent}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryPill({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <div style={{ background: bg, borderRadius: 10, padding: "8px 14px", display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 70 }}>
      <div style={{ fontSize: 20, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color, opacity: 0.8 }}>{label}</div>
    </div>
  );
}
