"use client";

import { useEffect, useRef, useState } from "react";

type Notif = {
  id: string;
  type: "missing" | "late" | "unauthorized" | "capacity";
  severity: "critical" | "high" | "medium" | "low";
  message: string;
  studentName?: string;
  level?: string;
  location?: string;
  timestamp: string;
  read: boolean;
};

const SEVERITY_META = {
  critical: { bg: "#fee2e2", border: "#fca5a5", text: "#991b1b", dot: "#ef4444", icon: "🚨" },
  high:     { bg: "#fff7ed", border: "#fed7aa", text: "#c2410c", dot: "#f97316", icon: "⚠️" },
  medium:   { bg: "#fefce8", border: "#fde68a", text: "#92400e", dot: "#f59e0b", icon: "🔔" },
  low:      { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af", dot: "#3b82f6", icon: "ℹ️" },
};

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
  const [notifs,  setNotifs]  = useState<Notif[]>([]);
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unread = notifs.filter(n => !n.read).length;

  // Fetch alerts and merge with read state
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/attendance/alerts", { cache: "no-store" });
      if (!res.ok) return;
      const { alerts } = await res.json();
      setNotifs(prev => {
        const readIds = new Set(prev.filter(n => n.read).map(n => n.id));
        return (alerts as Omit<Notif, "read">[]).map(a => ({
          ...a,
          read: readIds.has(a.id),
        }));
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const id = setInterval(fetchAlerts, 30_000);
    return () => clearInterval(id);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => setNotifs(p => p.map(n => ({ ...n, read: true })));
  const markRead    = (id: string) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const clearAll    = () => setNotifs([]);

  return (
    <div ref={panelRef} style={{ position: "relative" }}>
      {/* ── Bell button ── */}
      <button
        aria-label="Notifications"
        title="Notifications"
        onClick={() => { setOpen(o => !o); if (!open) markAllRead(); }}
        style={{
          position: "relative",
          width: 38, height: 38,
          borderRadius: 10,
          border: open ? "1px solid #8b3b3b" : "1px solid #e5e7eb",
          background: open ? "#fff5f5" : "#f9fafb",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          fontSize: 16,
          transition: "all 0.2s ease",
        }}
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: "absolute",
            top: 5, right: 5,
            width: 16, height: 16,
            borderRadius: "50%",
            background: "#ef4444",
            border: "2px solid white",
            fontSize: 9,
            fontWeight: 800,
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 10px)",
          right: 0,
          width: 360,
          maxHeight: 480,
          background: "white",
          borderRadius: 16,
          border: "1px solid #e5e7eb",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)",
          zIndex: 200,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 16px",
            borderBottom: "1px solid #f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #fff5f5, #fff)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>🔔</span>
              <span style={{ fontWeight: 800, fontSize: 14, color: "#1f2937" }}>Notifications</span>
              {unread > 0 && (
                <span style={{ background: "#ef4444", color: "white", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 999 }}>
                  {unread} new
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {notifs.length > 0 && (
                <>
                  <button
                    onClick={markAllRead}
                    style={{ fontSize: 11, color: "#6b7280", background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: "3px 6px", borderRadius: 6 }}
                  >
                    Mark all read
                  </button>
                  <button
                    onClick={clearAll}
                    style={{ fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontWeight: 600, padding: "3px 6px", borderRadius: 6 }}
                  >
                    Clear all
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Body */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {loading && notifs.length === 0 && (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                Loading…
              </div>
            )}

            {!loading && notifs.length === 0 && (
              <div style={{ padding: "40px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                <div style={{ fontWeight: 700, color: "#374151", fontSize: 14 }}>All clear</div>
                <div style={{ color: "#9ca3af", fontSize: 12, marginTop: 4 }}>No active alerts right now</div>
              </div>
            )}

            {notifs.map(n => {
              const meta = SEVERITY_META[n.severity];
              return (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f9fafb",
                    background: n.read ? "white" : meta.bg,
                    cursor: "pointer",
                    transition: "background 0.15s",
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                  }}
                >
                  {/* Severity icon */}
                  <div style={{
                    width: 32, height: 32,
                    borderRadius: 8,
                    background: n.read ? "#f3f4f6" : meta.bg,
                    border: `1px solid ${n.read ? "#e5e7eb" : meta.border}`,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 14,
                    flexShrink: 0,
                  }}>
                    {meta.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                      <span style={{
                        fontSize: 9, fontWeight: 800, textTransform: "uppercase",
                        color: n.read ? "#9ca3af" : meta.text,
                        letterSpacing: "0.5px",
                      }}>
                        {n.severity} · {n.type}
                      </span>
                      {!n.read && (
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: meta.dot, flexShrink: 0 }} />
                      )}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: n.read ? "#6b7280" : "#1f2937", marginBottom: 3 }}>
                      {n.message}
                    </div>
                    {(n.studentName || n.location) && (
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>
                        {n.studentName && <span>👤 {n.studentName}</span>}
                        {n.studentName && n.location && <span> · </span>}
                        {n.location && <span>📍 {n.location}</span>}
                        {n.level && <span> · {n.level}</span>}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: "#d1d5db", marginTop: 4 }}>
                      {timeAgo(n.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{
            padding: "10px 16px",
            borderTop: "1px solid #f3f4f6",
            background: "#fafafa",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>
              {notifs.length} alert{notifs.length !== 1 ? "s" : ""} · auto-refreshes every 30s
            </span>
            <button
              onClick={fetchAlerts}
              style={{ fontSize: 11, color: "#8b3b3b", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}
            >
              ↻ Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
