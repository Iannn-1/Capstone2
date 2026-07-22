import React from "react";
import styles from "../../styles.module.css";

export const dynamic = "force-dynamic";

async function getTag(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/tags/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load tag");
  return res.json();
}

async function getEvents(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/tags/${id}/events`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load events");
  return res.json();
}

export default async function TagProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ tag }, { events }] = await Promise.all([getTag(id), getEvents(id)]);

  return (
    <main className={styles.dashboard}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Tag {tag.uid}</h1>

      <section className={styles.card}>
        <div className={styles.cardHeader}><h2>Overview</h2></div>
        <div className={styles.cardBody}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <div className={styles.stat}><div className={styles.statLabel}>Status</div><div className={styles.statValue}>{tag.status}</div></div>
            <div className={styles.stat}><div className={styles.statLabel}>Type</div><div className={styles.statValue}>{tag.type}</div></div>
            <div className={styles.stat}><div className={styles.statLabel}>Owner</div><div className={styles.statValue}>{tag.ownerId ?? "—"}</div></div>
            <div className={styles.stat}><div className={styles.statLabel}>Issued</div><div className={styles.statValue}>{tag.issuedAt ? new Date(tag.issuedAt).toLocaleDateString() : "—"}</div></div>
          </div>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}><h2>Recent Activity</h2></div>
        <div className={styles.cardBody}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Door</th>
                <th>Direction</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev: any) => (
                <tr key={ev.id} className={styles.tableRow}>
                  <td>{new Date(ev.time).toLocaleString()}</td>
                  <td>{ev.door}</td>
                  <td>{ev.direction}</td>
                  <td>
                    <span className={styles.badge + " " + (ev.status === "allowed" ? styles.statusAllowed : styles.statusDenied)}>
                      {ev.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
