"use client";

import React, { useEffect, useState } from "react";
import styles from "../../styles.module.css";

type Scan = {
  id: string;
  studentName: string;
  studentId: string;
  level: string;
  direction: "in" | "out";
  time: string;
};

type Gate = {
  id: string;
  name: string;
  status: "online" | "offline";
  lastHeartbeat: string;
};

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  "Elementary":  { bg: "#d1fae5", text: "#065f46" },
  "High School": { bg: "#dbeafe", text: "#1e40af" },
  "Senior High": { bg: "#ede9fe", text: "#5b21b6" },
  "College":     { bg: "#fef3c7", text: "#92400e" },
};

export default function DoorStatusGrid() {
  const [gate,     setGate]     = useState<Gate | null>(null);
  const [scans,    setScans]    = useState<Scan[]>([]);
  const [totalIn,  setTotalIn]  = useState(0);
  const [totalOut, setTotalOut] = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [filter,   setFilter]   = useState<"all" | "in" | "out">("all");

  useEffect(() => {
    let mounted = true;
    const fetch_ = async () => {
      try {
        const res = await fetch("/api/dashboard/doors", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load gate data");
        const json = await res.json();
        if (mounted) {
          setGate(json.gate);
          setScans(json.scans || []);
          setTotalIn(json.totalIn ?? 0);
          setTotalOut(json.totalOut ?? 0);
        }
      } catch (e: any) {
        if (mounted) setError(e.message || "Error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch_();
    const id = setInterval(fetch_, 15_000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const isOnline     = gate?.status === "online";
  const visibleScans = filter === "all" ? scans : scans.filter((s) => s.direction === filter);

  return (
    <div className={styles.card}>
      {/* ── Header ── */}
      <div className={styles.cardHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🚪</span>
          <div>
            <h2 style={{ margin: 0 }}>Main Gate Monitor</h2>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
              Live IN / OUT tracking · updates every 15s
            </div>
          </div>
        </div>
        {/* Gate status pill */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 12px",
          borderRadius: 999,
          background: isOnline ? "#d1fae5" : "#fee2e2",
          border: `1px solid ${isOnline ? "#6ee7b7" : "#fca5a5"}`,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: isOnline ? "#10b981" : "#ef4444",
            boxShadow: isOnline ? "0 0 6px rgba(16,185,129,0.7)" : "none",
            animation: isOnline ? "pulse 2s infinite" : "none",
          }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: isOnline ? "#065f46" : "#991b1b" }}>
            {isOnline ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </div>

      <div className={styles.cardBody}>
        {loading && <div style={{ color: "#9ca3af", fontSize: 14 }}>Loading gate data…</div>}
        {error   && <div style={{ color: "#ef4444", fontSize: 14 }}>Error: {error}</div>}

        {!loading && !error && (
          <>
            {/* ── IN / OUT counters ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
              <div style={{
                background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
                borderRadius: 14,
                padding: "16px 18px",
                border: "1px solid #6ee7b7",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}>
                <div style={{ fontSize: 28, lineHeight: 1 }}>🟢</div>
                <div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: "#065f46", lineHeight: 1 }}>{totalIn}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46", opacity: 0.75, marginTop: 3 }}>Entered Today</div>
                </div>
              </div>
              <div style={{
                background: "linear-gradient(135deg, #fee2e2, #fecaca)",
                borderRadius: 14,
                padding: "16px 18px",
                border: "1px solid #fca5a5",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}>
                <div style={{ fontSize: 28, lineHeight: 1 }}>🔴</div>
                <div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: "#991b1b", lineHeight: 1 }}>{totalOut}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#991b1b", opacity: 0.75, marginTop: 3 }}>Exited Today</div>
                </div>
              </div>
            </div>

            {/* ── Filter tabs ── */}
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {(["all", "in", "out"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 999,
                    border: "1px solid",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    borderColor: filter === f
                      ? (f === "in" ? "#10b981" : f === "out" ? "#ef4444" : "#8b3b3b")
                      : "#e5e7eb",
                    background: filter === f
                      ? (f === "in" ? "#10b981" : f === "out" ? "#ef4444" : "#8b3b3b")
                      : "#f9fafb",
                    color: filter === f ? "white" : "#6b7280",
                  }}
                >
                  {f === "all" ? "All" : f === "in" ? "▲ IN" : "▼ OUT"}
                </button>
              ))}
              <span style={{ marginLeft: "auto", fontSize: 12, color: "#9ca3af", alignSelf: "center" }}>
                {visibleScans.length} records
              </span>
            </div>

            {/* ── Scan log ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 320, overflowY: "auto" }}>
              {visibleScans.length === 0 && (
                <div style={{ textAlign: "center", color: "#9ca3af", padding: "24px 0", fontSize: 14 }}>
                  No records found.
                </div>
              )}
              {visibleScans.map((s) => {
                const isIn    = s.direction === "in";
                const lvlMeta = LEVEL_COLORS[s.level] ?? { bg: "#f3f4f6", text: "#374151" };
                return (
                  <div key={s.id} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: isIn ? "#f0fdf4" : "#fff5f5",
                    border: `1px solid ${isIn ? "#bbf7d0" : "#fecaca"}`,
                  }}>
                    {/* Direction badge */}
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: isIn ? "#10b981" : "#ef4444",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 16,
                      flexShrink: 0,
                      color: "white",
                      fontWeight: 900,
                    }}>
                      {isIn ? "▲" : "▼"}
                    </div>

                    {/* Student info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1f2937", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {s.studentName}
                      </div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
                        {s.studentId}
                      </div>
                    </div>

                    {/* Level badge */}
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: lvlMeta.bg,
                      color: lvlMeta.text,
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                    }}>
                      {s.level}
                    </span>

                    {/* Time */}
                    <div style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0, textAlign: "right" }}>
                      {new Date(s.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Last heartbeat */}
            {gate && (
              <div style={{ marginTop: 12, fontSize: 11, color: "#d1d5db", textAlign: "right" }}>
                Reader last ping: {new Date(gate.lastHeartbeat).toLocaleTimeString()}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
