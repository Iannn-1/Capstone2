"use client";

import { useEffect, useState } from "react";
import styles from "../../styles.module.css";

type Alert = {
  id: string;
  type: "missing" | "late" | "unauthorized" | "capacity";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  studentName?: string;
  location?: string;
  timestamp: string;
};

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "critical" | "high">("all");

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("/api/attendance/alerts", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setAlerts(data.alerts || []);
        } else {
          setAlerts(generateMockAlerts());
        }
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
        setAlerts(generateMockAlerts());
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 20000); // Update every 20s
    return () => clearInterval(interval);
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "all") return true;
    return alert.severity === filter;
  });

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const highCount = alerts.filter((a) => a.severity === "high").length;

  if (loading) {
    return <div className={styles.card}><div className={styles.cardBody}>Loading alerts...</div></div>;
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2>Active Alerts</h2>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            {criticalCount} critical • {highCount} high priority
          </div>
        </div>
        <div className={styles.controls}>
          <select className={styles.select} value={filter} onChange={(e) => setFilter(e.target.value as any)}>
            <option value="all">All Alerts</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Priority</option>
          </select>
        </div>
      </div>
      <div className={styles.cardBody}>
        {filteredAlerts.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>
            ✓ No active alerts
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10, maxHeight: 400, overflowY: "auto" }}>
            {filteredAlerts.map((alert) => {
              const severityColors = {
                critical: { bg: "#fee2e2", border: "#991b1b", text: "#991b1b" },
                high: { bg: "#fed7aa", border: "#c2410c", text: "#c2410c" },
                medium: { bg: "#fef3c7", border: "#92400e", text: "#92400e" },
                low: { bg: "#dbeafe", border: "#1e40af", text: "#1e40af" },
              };

              const colors = severityColors[alert.severity];

              return (
                <div
                  key={alert.id}
                  style={{
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderLeft: `4px solid ${colors.border}`,
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 6 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: colors.text,
                        letterSpacing: 0.5,
                      }}
                    >
                      {alert.severity} • {alert.type}
                    </span>
                    <span style={{ fontSize: 11, color: "#6b7280" }}>
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.text, marginBottom: 4 }}>
                    {alert.message}
                  </div>
                  {(alert.studentName || alert.location) && (
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {alert.studentName && <span>Student: {alert.studentName}</span>}
                      {alert.studentName && alert.location && <span> • </span>}
                      {alert.location && <span>Location: {alert.location}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function generateMockAlerts(): Alert[] {
  return [
    {
      id: "alert-1",
      type: "missing",
      severity: "critical",
      message: "Student has not checked in today",
      studentName: "John Smith",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: "alert-2",
      type: "capacity",
      severity: "high",
      message: "Location at full capacity",
      location: "Auditorium",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    {
      id: "alert-3",
      type: "late",
      severity: "medium",
      message: "Late arrival detected",
      studentName: "Emma Johnson",
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: "alert-4",
      type: "unauthorized",
      severity: "high",
      message: "Unauthorized access attempt",
      location: "Science Lab",
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
  ];
}
