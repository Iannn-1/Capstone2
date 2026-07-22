"use client";

import { useState } from "react";
import styles from "../../styles.module.css";

type ReportType = "attendance" | "students" | "tags";

type Row = Record<string, string | number | null>;

const REPORT_META: Record<ReportType, { label: string; icon: string; desc: string; columns: string[] }> = {
  attendance: {
    label: "Attendance Report",
    icon: "📋",
    desc: "Daily attendance records with check-in times, status, and level breakdown.",
    columns: ["Student ID","Name","Level","Grade","Section","Status","Date"],
  },
  students: {
    label: "Student Directory",
    icon: "👨‍🎓",
    desc: "Full student roster with level, grade, section, tag assignment, and status.",
    columns: ["ID","Name","Email","Level","Grade","Section","Status","Tag ID"],
  },
  tags: {
    label: "RFID Tag Inventory",
    icon: "🏷️",
    desc: "All RFID tags with assignment status, owner, issue date, and last seen.",
    columns: ["Tag ID","UID","Status","Owner","Issued At","Last Seen"],
  },
};

function rowsToCsv(rows: Row[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines   = [
    headers.join(","),
    ...rows.map(r => headers.map(h => {
      const v = r[h] ?? "";
      const s = String(v).replace(/"/g, '""');
      return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
    }).join(",")),
  ];
  return lines.join("\n");
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportGenerator({ onGenerated }: { onGenerated?: () => void }) {
  const [reportType,    setReportType]    = useState<ReportType>("attendance");
  const [dateFrom,      setDateFrom]      = useState(new Date().toISOString().split("T")[0]);
  const [dateTo,        setDateTo]        = useState(new Date().toISOString().split("T")[0]);
  const [filterLevel,   setFilterLevel]   = useState("");
  const [filterStatus,  setFilterStatus]  = useState("");
  const [generating,    setGenerating]    = useState(false);
  const [preview,       setPreview]       = useState<Row[] | null>(null);
  const [previewTotal,  setPreviewTotal]  = useState(0);
  const [error,         setError]         = useState("");

  const meta = REPORT_META[reportType];

  const generate = async (download = false) => {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: reportType, dateFrom, dateTo, filterLevel, filterStatus }),
      });

      if (!res.ok) { setError("Failed to generate report."); return; }

      const { rows, total } = await res.json();
      setPreview(rows.slice(0, 10));
      setPreviewTotal(total);
      onGenerated?.();

      if (download) {
        const csv      = rowsToCsv(rows);
        const filename = `${reportType}-report-${dateFrom}.csv`;
        downloadCsv(csv, filename);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2>📊 Generate Report</h2>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Build and export custom reports</div>
        </div>
      </div>

      <div className={styles.cardBody}>
        <div style={{ display: "grid", gap: 16 }}>

          {/* Report type selector */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {(Object.entries(REPORT_META) as [ReportType, typeof REPORT_META.attendance][]).map(([k, v]) => (
              <button
                key={k}
                onClick={() => { setReportType(k); setPreview(null); }}
                style={{
                  padding: "10px 8px",
                  borderRadius: 10,
                  border: reportType === k ? "2px solid #8b3b3b" : "1px solid #e5e7eb",
                  background: reportType === k ? "#fff5f5" : "#f9fafb",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 20 }}>{v.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: reportType === k ? "#8b3b3b" : "#374151" }}>{v.label}</span>
              </button>
            ))}
          </div>

          {/* Description */}
          <div style={{ padding: "10px 12px", background: "#f9fafb", borderRadius: 8, fontSize: 13, color: "#6b7280", borderLeft: "3px solid #8b3b3b" }}>
            {meta.desc}
          </div>

          {/* Date range */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 5 }}>From Date</label>
              <input className={styles.input} type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 5 }}>To Date</label>
              <input className={styles.input} type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 5 }}>Level</label>
              <select className={styles.select} value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
                <option value="">All Levels</option>
                <option value="elementary">Elementary</option>
                <option value="highschool">High School</option>
                <option value="seniorhigh">Senior High</option>
                <option value="college">College</option>
              </select>
            </div>
            {reportType !== "tags" && (
              <div>
                <label style={{ display: "block", fontWeight: 600, fontSize: 13, marginBottom: 5 }}>Status</label>
                <select className={styles.select} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                  <option value="">All Status</option>
                  {reportType === "attendance"
                    ? <>
                        <option value="present">Present</option>
                        <option value="late">Late</option>
                        <option value="absent">Absent</option>
                        <option value="excused">Excused</option>
                      </>
                    : <>
                        <option value="active">Active</option>
                        <option value="disabled">Disabled</option>
                      </>
                  }
                </select>
              </div>
            )}
          </div>

          {error && (
            <div style={{ padding: "10px 12px", background: "#fee2e2", borderRadius: 8, fontSize: 13, color: "#991b1b", fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className={styles.button}
              onClick={() => generate(false)}
              disabled={generating}
              style={{ flex: 1, background: "#f3f4f6", color: "#374151", fontWeight: 700 }}
            >
              {generating ? "Loading…" : "👁️ Preview"}
            </button>
            <button
              className={styles.button}
              onClick={() => generate(true)}
              disabled={generating}
              style={{ flex: 1, background: "#8b3b3b", color: "white", fontWeight: 700 }}
            >
              {generating ? "Generating…" : "⬇️ Export CSV"}
            </button>
          </div>

          {/* Preview table */}
          {preview && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>
                  Preview — showing {preview.length} of {previewTotal} rows
                </span>
                <button
                  onClick={() => generate(true)}
                  style={{ fontSize: 12, color: "#8b3b3b", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}
                >
                  ⬇️ Download all {previewTotal} rows
                </button>
              </div>
              <div className={styles.tableWrapper} style={{ maxHeight: 260, overflowY: "auto" }}>
                <table className={styles.table} style={{ fontSize: 12 }}>
                  <thead>
                    <tr>
                      {Object.keys(preview[0] || {}).map(col => (
                        <th key={col} style={{ whiteSpace: "nowrap", fontSize: 11 }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className={styles.tableRow}>
                        {Object.values(row).map((v, j) => (
                          <td key={j} style={{ whiteSpace: "nowrap" }}>{v ?? "—"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
