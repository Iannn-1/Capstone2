"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "../../styles.module.css";

type Event = {
  id: string;
  time: string; // ISO date
  person: string;
  role: "Student" | "Staff" | "Visitor";
  tagId: string;
  door: string;
  direction: "IN" | "OUT";
  status: "allowed" | "denied";
};

const STATUS_COLOR: Record<Event["status"], string> = {
  allowed: "#10b981",
  denied: "#ef4444",
};

export default function EventsFeed() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | Event["status"]>("ALL");

  const filtered = useMemo(() => {
    if (filter === "ALL") return events;
    return events.filter((e) => e.status === filter);
  }, [events, filter]);

  useEffect(() => {
    let mounted = true;
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/dashboard/events", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load events");
        const json = await res.json();
        if (mounted) setEvents(json.events || []);
      } catch (e: any) {
        if (mounted) setError(e.message || "Error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchEvents();

    const id = setInterval(fetchEvents, 10_000); // refresh every 10s
    return () => { mounted = false; clearInterval(id); };
  }, []);

  if (loading) return <section aria-busy>Loading events...</section>;
  if (error) return <section role="alert">Events error: {error}</section>;

  return (
    <section aria-label="Events feed" className={styles.card}>
      <div className={styles.cardHeader}>
        <h2>Recent Events</h2>
        <div className={styles.controls}>
          <label style={{ fontSize: 12, color: "#6b7280" }}>Filter:</label>
          <select className={styles.select} value={filter} onChange={(e) => setFilter(e.target.value as any)}>
            <option value="ALL">All</option>
            <option value="allowed">Allowed</option>
            <option value="denied">Denied</option>
          </select>
        </div>
      </div>

      <div className={styles.cardBody}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
          {filtered.map((ev) => (
            <li key={ev.id} className={styles.card}>
              <div className={styles.cardBody} style={{ display: "grid", gridTemplateColumns: "160px 1fr 140px 100px 100px", gap: 12, alignItems: "center" }}>
                <span style={{ fontVariantNumeric: "tabular-nums", color: "#374151" }}>{new Date(ev.time).toLocaleString()}</span>
                <div>
                  <div style={{ fontWeight: 700 }}>{ev.person} <span style={{ color: "#6b7280", fontWeight: 400 }}>({ev.role})</span></div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Tag: {ev.tagId}</div>
                </div>
                <span style={{ color: "#374151" }}>{ev.door} · {ev.direction}</span>
                <span className={styles.badge + " " + (ev.status === "allowed" ? styles.statusAllowed : styles.statusDenied)}>{ev.status.toUpperCase()}</span>
                <button className={styles.button}>Details</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
