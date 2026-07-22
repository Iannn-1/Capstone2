"use client";

import { useState } from "react";
import styles from "../../styles.module.css";

type SearchResult = {
  studentId: string;
  studentName: string;
  grade: number;
  section: string;
  currentLocation: string | null;
  lastSeen: string;
  status: string;
};

export default function QuickSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/attendance/search?q=${encodeURIComponent(query)}`, {
        cache: "no-store",
      });
      
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2>Quick Student Locator</h2>
      </div>
      <div className={styles.cardBody}>
        <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className={styles.input}
              placeholder="Search by name, ID, or tag UID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Searching..." : "🔍 Search"}
            </button>
          </div>
        </form>

        {searched && !loading && (
          <>
            {results.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>
                No students found matching "{query}"
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {results.map((result) => (
                  <div
                    key={result.studentId}
                    className={styles.card}
                    style={{ background: "#f9fafb" }}
                  >
                    <div className={styles.cardBody}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                            {result.studentName}
                          </h3>
                          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
                            {result.studentId} • Grade {result.grade} - {result.section}
                          </div>
                        </div>
                        <span
                          className={styles.badge}
                          style={{
                            background: result.status === "present" ? "#d1fae5" : "#fee2e2",
                            color: result.status === "present" ? "#065f46" : "#991b1b",
                          }}
                        >
                          {result.status}
                        </span>
                      </div>
                      <div style={{ display: "grid", gap: 6, fontSize: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#6b7280" }}>Current Location:</span>
                          <span style={{ fontWeight: 600 }}>
                            {result.currentLocation || "Unknown"}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#6b7280" }}>Last Seen:</span>
                          <span style={{ fontWeight: 600 }}>
                            {new Date(result.lastSeen).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
