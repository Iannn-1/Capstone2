"use client";

import { useEffect, useState, useMemo } from "react";
import styles from "../../styles.module.css";

type AttendanceRecord = {
  id: string;
  studentId: string;
  studentName: string;
  grade: number;
  section: string;
  status: "present" | "absent" | "late" | "excused";
  location: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  lastSeen: string | null;
};

type LocationStats = {
  location: string;
  count: number;
  students: string[];
};

export default function AttendanceTracker() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterGrade, setFilterGrade] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "location" | "summary">("summary");

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ date: selectedDate });
        if (filterGrade) params.set("grade", filterGrade);
        if (filterStatus) params.set("status", filterStatus);

        const res = await fetch(`/api/attendance?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch attendance");
        
        const data = await res.json();
        setRecords(data.records || []);
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
        // Fallback to mock data for demo
        const mockData: AttendanceRecord[] = generateMockAttendance();
        setRecords(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
    const interval = setInterval(fetchAttendance, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [selectedDate, filterGrade, filterStatus]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (filterGrade && r.grade !== Number(filterGrade)) return false;
      if (filterStatus && r.status !== filterStatus) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          r.studentName.toLowerCase().includes(query) ||
          r.studentId.toLowerCase().includes(query) ||
          r.section.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [records, filterGrade, filterStatus, searchQuery]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const present = filteredRecords.filter((r) => r.status === "present").length;
    const absent = filteredRecords.filter((r) => r.status === "absent").length;
    const late = filteredRecords.filter((r) => r.status === "late").length;
    const excused = filteredRecords.filter((r) => r.status === "excused").length;
    const attendanceRate = total > 0 ? ((present + late) / total) * 100 : 0;

    return { total, present, absent, late, excused, attendanceRate };
  }, [filteredRecords]);

  // Location statistics
  const locationStats = useMemo(() => {
    const locationMap = new Map<string, LocationStats>();
    
    filteredRecords
      .filter((r) => r.status === "present" && r.location)
      .forEach((r) => {
        const loc = r.location!;
        if (!locationMap.has(loc)) {
          locationMap.set(loc, { location: loc, count: 0, students: [] });
        }
        const stat = locationMap.get(loc)!;
        stat.count++;
        stat.students.push(r.studentName);
      });

    return Array.from(locationMap.values()).sort((a, b) => b.count - a.count);
  }, [filteredRecords]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ["Student ID", "Name", "Grade", "Section", "Status", "Location", "Check In", "Check Out", "Last Seen"];
    const rows = filteredRecords.map((r) => [
      r.studentId,
      r.studentName,
      r.grade,
      r.section,
      r.status,
      r.location || "N/A",
      r.checkInTime || "N/A",
      r.checkOutTime || "N/A",
      r.lastSeen || "N/A",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className={styles.card}><div className={styles.cardBody}>Loading attendance data...</div></div>;
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Summary Cards */}
      <div className={styles.grid + " cols-3"}>
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Total Students</div>
              <div className={styles.statValue}>{stats.total}</div>
            </div>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Present</div>
              <div className={styles.statValue} style={{ color: "#10b981" }}>{stats.present}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                Late: {stats.late} | Excused: {stats.excused}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardBody}>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Attendance Rate</div>
              <div className={styles.statValue} style={{ color: stats.attendanceRate >= 90 ? "#10b981" : "#f59e0b" }}>
                {stats.attendanceRate.toFixed(1)}%
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                Absent: {stats.absent}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Attendance Tracking</h2>
          <div className={styles.controls}>
            <input
              type="date"
              className={styles.input}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button className={styles.button} onClick={exportToCSV}>
              📥 Export CSV
            </button>
          </div>
        </div>
        <div className={styles.cardBody}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <input
              className={styles.input}
              placeholder="Search student name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: "1 1 200px" }}
            />
            <select className={styles.select} value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
              <option value="">All Grades</option>
              {[7, 8, 9, 10, 11, 12].map((g) => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
            <select className={styles.select} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
            </select>
          </div>

          {/* View Mode Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: "1px solid #e5e7eb" }}>
            <button
              className={styles.button}
              onClick={() => setViewMode("summary")}
              style={{
                borderBottom: viewMode === "summary" ? "2px solid #8b3b3b" : "none",
                borderRadius: 0,
                fontWeight: viewMode === "summary" ? 700 : 400,
              }}
            >
              Summary
            </button>
            <button
              className={styles.button}
              onClick={() => setViewMode("location")}
              style={{
                borderBottom: viewMode === "location" ? "2px solid #8b3b3b" : "none",
                borderRadius: 0,
                fontWeight: viewMode === "location" ? 700 : 400,
              }}
            >
              By Location
            </button>
            <button
              className={styles.button}
              onClick={() => setViewMode("list")}
              style={{
                borderBottom: viewMode === "list" ? "2px solid #8b3b3b" : "none",
                borderRadius: 0,
                fontWeight: viewMode === "list" ? 700 : 400,
              }}
            >
              Detailed List
            </button>
          </div>

          {/* Summary View */}
          {viewMode === "summary" && (
            <div className={styles.grid} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
              {[7, 8, 9, 10, 11, 12].map((grade) => {
                const gradeRecords = filteredRecords.filter((r) => r.grade === grade);
                const gradePresent = gradeRecords.filter((r) => r.status === "present" || r.status === "late").length;
                const gradeTotal = gradeRecords.length;
                const gradeRate = gradeTotal > 0 ? (gradePresent / gradeTotal) * 100 : 0;

                return (
                  <div key={grade} className={styles.card}>
                    <div className={styles.cardBody}>
                      <h3 style={{ margin: "0 0 12px 0", fontSize: 16 }}>Grade {grade}</h3>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 14, color: "#6b7280" }}>Present:</span>
                        <span style={{ fontWeight: 700, color: "#10b981" }}>{gradePresent}/{gradeTotal}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 14, color: "#6b7280" }}>Rate:</span>
                        <span style={{ fontWeight: 700, color: gradeRate >= 90 ? "#10b981" : "#f59e0b" }}>
                          {gradeRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Location View */}
          {viewMode === "location" && (
            <div className={styles.grid} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              {locationStats.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "#6b7280" }}>
                  No location data available
                </div>
              ) : (
                locationStats.map((loc) => (
                  <div key={loc.location} className={styles.card}>
                    <div className={styles.cardBody}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <h3 style={{ margin: 0, fontSize: 16 }}>{loc.location}</h3>
                        <span className={styles.badge + " " + styles.statusOnline}>{loc.count}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "#6b7280", maxHeight: 120, overflowY: "auto" }}>
                        {loc.students.slice(0, 10).map((name, i) => (
                          <div key={i} style={{ padding: "4px 0" }}>• {name}</div>
                        ))}
                        {loc.students.length > 10 && (
                          <div style={{ fontStyle: "italic", marginTop: 4 }}>
                            +{loc.students.length - 10} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Grade</th>
                    <th>Section</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Check In</th>
                    <th>Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className={styles.tableRow}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{record.studentName}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>{record.studentId}</div>
                      </td>
                      <td>{record.grade}</td>
                      <td>{record.section}</td>
                      <td>
                        <span
                          className={styles.badge}
                          style={{
                            background:
                              record.status === "present"
                                ? "#d1fae5"
                                : record.status === "late"
                                ? "#fef3c7"
                                : record.status === "excused"
                                ? "#dbeafe"
                                : "#fee2e2",
                            color:
                              record.status === "present"
                                ? "#065f46"
                                : record.status === "late"
                                ? "#92400e"
                                : record.status === "excused"
                                ? "#1e40af"
                                : "#991b1b",
                          }}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td>{record.location || "—"}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : "—"}
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {record.lastSeen ? new Date(record.lastSeen).toLocaleTimeString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Mock data generator - replace with actual API
function generateMockAttendance(): AttendanceRecord[] {
  const locations = ["Main Gate", "Library", "Gym", "Cafeteria", "Science Lab", "Computer Lab", "Auditorium"];
  const sections = ["A", "B", "C"];
  const statuses: Array<"present" | "absent" | "late" | "excused"> = ["present", "absent", "late", "excused"];
  const names = [
    "John Smith", "Emma Johnson", "Michael Brown", "Sophia Davis", "James Wilson",
    "Olivia Martinez", "William Anderson", "Ava Taylor", "Robert Thomas", "Isabella Garcia",
    "David Rodriguez", "Mia Hernandez", "Joseph Moore", "Charlotte Martin", "Daniel Lee",
    "Amelia White", "Matthew Harris", "Harper Clark", "Christopher Lewis", "Evelyn Walker",
  ];

  const records: AttendanceRecord[] = [];
  let idCounter = 1;

  for (let grade = 7; grade <= 12; grade++) {
    for (let i = 0; i < 20; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const isPresent = status === "present" || status === "late";
      const checkInTime = isPresent ? new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000) : null;
      
      records.push({
        id: `att-${idCounter++}`,
        studentId: `STU${grade}${String(i + 1).padStart(3, "0")}`,
        studentName: names[Math.floor(Math.random() * names.length)],
        grade,
        section: sections[Math.floor(Math.random() * sections.length)],
        status,
        location: isPresent ? locations[Math.floor(Math.random() * locations.length)] : null,
        checkInTime: checkInTime?.toISOString() || null,
        checkOutTime: null,
        lastSeen: isPresent ? new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString() : null,
      });
    }
  }

  return records;
}
