"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "../../styles.module.css";

type Tag = {
  id: string;
  uid: string;
  status: "unassigned" | "assigned" | "lost" | "disabled" | "retired";
  type: "student" | "worker" | "visitor";
  ownerId: string | null;
  ownerType: "student" | "worker" | null;
  issuedAt: string | null;
  revokedAt: string | null;
  lastSeen: string | null;
};

type ResponseList = {
  data: Tag[];
  page: number;
  pageSize: number;
  total: number;
};

export default function TagsTable() {
  const [rows, setRows] = useState<Tag[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  useEffect(() => {
    let mounted = true;
    const fetchTags = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (search) params.set("search", search);
        if (status) params.set("status", status);
        if (type) params.set("type", type);

        const res = await fetch(`/api/tags?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load tags");
        const json: ResponseList = await res.json();
        if (mounted) {
          setRows(json.data);
          setTotal(json.total);
        }
      } catch (e: any) {
        if (mounted) setError(e.message || "Error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchTags();
  }, [page, pageSize, search, status, type]);

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h2>Tags</h2>
        <div className={styles.controls}>
          <input className={styles.input} placeholder="Search UID/Owner" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
          <select className={styles.select} value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
            <option value="">All status</option>
            <option>unassigned</option>
            <option>assigned</option>
            <option>lost</option>
            <option>disabled</option>
            <option>retired</option>
          </select>
          <select className={styles.select} value={type} onChange={(e) => { setPage(1); setType(e.target.value); }}>
            <option value="">All types</option>
            <option>student</option>
            <option>worker</option>
            <option>visitor</option>
          </select>
        </div>
      </div>
      <div className={styles.cardBody}>
        {loading && <div aria-busy>Loading tags...</div>}
        {error && <div role="alert">Error: {error}</div>}

        {!loading && !error && (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>UID</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Owner</th>
                    <th>Issued</th>
                    <th>Last Seen</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => (
                    <tr key={t.id} className={styles.tableRow}>
                      <td style={{ fontWeight: 600 }}>{t.uid}</td>
                      <td>{t.status}</td>
                      <td>{t.type}</td>
                      <td>{t.ownerId ?? "—"}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{t.issuedAt ? new Date(t.issuedAt).toLocaleDateString() : "—"}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{t.lastSeen ? new Date(t.lastSeen).toLocaleString() : "—"}</td>
                      <td>
                        <div className={styles.controls}>
                          <Link className={styles.button} href={`/dashboard/tags/${t.id}`}>View</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
                <div className={styles.controls}>
                  <button className={styles.button} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
                  <span style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>Page {page} / {totalPages}</span>
                  <button className={styles.button} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Next</button>
                </div>
                <div className={styles.controls}>
                  <label style={{ fontSize: 12, color: "#6b7280" }}>Rows:</label>
                  <select className={styles.select} value={pageSize} onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)); }}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={30}>30</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
