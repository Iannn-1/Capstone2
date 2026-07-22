"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "../../styles.module.css";

type HistoryRecord = {
  id: string;
  type: string;
  generatedAt: string;
  rows: number;
  generatedBy: string;
};

const TYPE_META: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  attendance: { icon: "📋", label: "Attendance",  color: "#065f46", bg: "#d1fae5" },
  students:   { icon: "👨‍🎓", label: "Students",   color: "#1e40af", bg: "#dbeafe" },
  tags:       { icon: "🏷️", label: "Tags",        color: "#92400e", bg: "#fef3c7" },
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function ReportHistory({ refreshKey }: { refreshKey?: number }) {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [redownloading, setRedownloading] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/reports/history", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory, refreshKey]);

  const redownload = async (record: HistoryRecord) => {
    setRedownloading(record.id);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: record.type }),
      });
      if (!res.ok) return;
      const { rows } = await res.json();
      if (!rows?.length) return;

      const headers = Object.keys(rows[0]);
      const csv = [
        headers.join(","),
        ...rows.map((r: Record<string, unknown>) =>
          headers.map(h => {
            const v = String(r[h] ?? "").replace(/"/g, '""');
            return v.includes(",") ? `"${v}"` : v;
          }).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${record.type}-report-${new Date(record.generatedAt).toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setRedownloading(null);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2>🗂️ Report History</h2>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Previously generated reports</div>
        </div>
        <button
          className={styles.button}
          onClick={fetchHistory}
          style={{ fontSize: 12, padding: "5px 12px" }}
        >
          ↻ Refresh
        </button>
      </div>

      <div className={styles.cardBody}>
        {loading ? (
          <div style={{ color: "#9ca3af", fontSize: 14 }}>Loading history…</div>
        ) : history.length === 0 ? (
          <div style={{ padding: "32px 0", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
            <div style={{ fontWeight: 700, color: "#374151", fontSize: 14 }}>No reports yet</div>
            <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 4 }}>Generate your first report using the form.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 480, overflowY: "auto" }}>
            {history.map(r => {
              const meta = TYPE_META[r.type] ?? { icon: "📄", label: r.type, color: "#374151", bg: "#f3f4f6" };
              return (
                <div key={r.id} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  background: "#f9fafb",
                  borderRadius: 12,
                  border: "1px solid #f3f4f6",
                  transition: "all 0.15s",
                }}>
                  {/* Icon */}
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: meta.bg, display: "grid", placeItems: "center", fontSize: 18, flexShrink: 0 }}>
                    {meta.icon}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#1f2937" }}>{meta.label} Report</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: meta.bg, color: meta.color }}>
                        {r.rows.toLocaleString()} rows
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>
                      By {r.generatedBy} · {timeAgo(r.generatedAt)}
                    </div>
                  </div>

                  {/* Download */}
                  <button
                    onClick={() => redownload(r)}
                    disabled={redownloading === r.id}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                      background: redownloading === r.id ? "#f3f4f6" : "white",
                      cursor: redownloading === r.id ? "not-allowed" : "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#8b3b3b",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      flexShrink: 0,
                      transition: "all 0.15s",
                    }}
                  >
                    {redownloading === r.id
                      ? <><span style={{ width: 12, height: 12, border: "2px solid #d1d5db", borderTopColor: "#8b3b3b", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Downloading…</>
                      : <>⬇️ CSV</>
                    }
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
