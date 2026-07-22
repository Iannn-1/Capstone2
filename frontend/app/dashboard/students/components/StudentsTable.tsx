"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "../../styles.module.css";

type StudentType = "elementary" | "highschool" | "seniorhigh" | "college";

type Student = {
  id: string;
  name: string;
  email: string;
  studentType: StudentType;
  grade?: number | null;
  section?: string | null;
  college?: string | null;
  course?: string | null;
  status: "active" | "disabled";
  tagId: string | null;
  lastSeen: string | null;
  photoUrl?: string;
};

// Sub-level options per student type
const LEVEL_SUBLEVEL: Record<StudentType, { label: string; value: string }[]> = {
  elementary: [1, 2, 3, 4, 5, 6].map((g) => ({ label: `Grade ${g}`, value: String(g) })),
  highschool: [7, 8, 9, 10].map((g) => ({ label: `Grade ${g}`, value: String(g) })),
  seniorhigh: [11, 12].map((g) => ({ label: `Grade ${g}`, value: String(g) })),
  college: [
    { label: "1st Year", value: "1" },
    { label: "2nd Year", value: "2" },
    { label: "3rd Year", value: "3" },
    { label: "4th Year", value: "4" },
  ],
};

const LEVEL_LABELS: Record<StudentType, string> = {
  elementary: "Elementary",
  highschool: "High School",
  seniorhigh: "Senior High",
  college: "College",
};

const LEVEL_COLORS: Record<StudentType, { bg: string; text: string }> = {
  elementary: { bg: "#d1fae5", text: "#065f46" },
  highschool: { bg: "#dbeafe", text: "#1e40af" },
  seniorhigh: { bg: "#ede9fe", text: "#5b21b6" },
  college:    { bg: "#fef3c7", text: "#92400e" },
};

// All college courses grouped for the filter dropdown
const COLLEGE_COURSES: { group: string; courses: string[] }[] = [
  {
    group: "Computer Studies",
    courses: [
      "BS Information Technology (BSIT)",
      "BS Computer Science (BSCS)",
      "BS Information Systems (BSIS)",
      "BS Computer Engineering (BSCpE)",
    ],
  },
  {
    group: "Engineering",
    courses: [
      "BS Civil Engineering (BSCE)",
      "BS Electrical Engineering (BSEE)",
      "BS Mechanical Engineering (BSME)",
      "BS Electronics Engineering (BSECE)",
      "BS Industrial Engineering (BSIE)",
    ],
  },
  {
    group: "Business",
    courses: [
      "BS Business Administration (BSBA)",
      "BS Accountancy (BSA)",
      "BS Management Accounting (BSMA)",
      "BS Entrepreneurship",
      "BS Marketing Management",
    ],
  },
  {
    group: "Education",
    courses: [
      "Bachelor of Elementary Education (BEEd)",
      "Bachelor of Secondary Education (BSEd)",
      "Bachelor of Physical Education (BPEd)",
      "Bachelor of Special Needs Education (BSNEd)",
    ],
  },
  {
    group: "Health Sciences",
    courses: [
      "BS Nursing (BSN)",
      "BS Pharmacy",
      "BS Medical Technology",
      "BS Physical Therapy",
      "Doctor of Medicine (MD)",
    ],
  },
  {
    group: "Arts & Sciences",
    courses: [
      "BS Psychology (BSPsych)",
      "AB Communication",
      "AB English",
      "BS Biology",
      "BS Mathematics",
    ],
  },
  {
    group: "Architecture & Design",
    courses: [
      "BS Architecture (BSArch)",
      "BS Interior Design",
      "BS Landscape Architecture",
    ],
  },
  {
    group: "Agriculture",
    courses: [
      "BS Agriculture",
      "BS Agricultural Engineering",
      "BS Forestry",
    ],
  },
  {
    group: "Hospitality & Tourism",
    courses: [
      "BS Hospitality Management (BSHM)",
      "BS Tourism Management (BSTM)",
      "BS Hotel and Restaurant Management",
    ],
  },
  {
    group: "Law & Criminology",
    courses: [
      "Bachelor of Laws (LLB)",
      "BS Criminology",
    ],
  },
];

type ResponseList = {
  data: Student[];
  page: number;
  pageSize: number;
  total: number;
};

export default function StudentsTable() {
  const [rows, setRows] = useState<Student[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<StudentType | "">("");
  const [subLevelFilter, setSubLevelFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState<Student | null>(null);
  const [signature, setSignature] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  useEffect(() => {
    let mounted = true;
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (search) params.set("search", search);
        if (levelFilter) params.set("studentType", levelFilter);
        if (subLevelFilter) params.set("grade", subLevelFilter);
        if (courseFilter) params.set("course", courseFilter);
        if (status) params.set("status", status);

        const res = await fetch(`/api/students?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load students");
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
    fetchStudents();
  }, [page, pageSize, search, levelFilter, subLevelFilter, courseFilter, status]);

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setEditForm(student);
    setIsEditing(false);
    setIsAdding(false);
    setSignature("");
    setPhotoPreview(student.photoUrl || null);
  };

  const handleAddNew = () => {
    // Generate tag ID with year and sequential number: YYYY-XXXX
    const currentYear = new Date().getFullYear();
    const enrollmentNumber = Math.floor(1 + Math.random() * 9999).toString().padStart(4, '0');
    const randomTagId = `${currentYear}-${enrollmentNumber}`;
    
    const newStudent: Student = {
      id: `temp-${Date.now()}`,
      name: "",
      email: "",
      studentType: "elementary",
      grade: 1,
      section: "A",
      college: "",
      course: "",
      status: "active",
      tagId: randomTagId,
      lastSeen: null,
    };
    setEditForm(newStudent);
    setSelectedStudent(newStudent);
    setIsAdding(true);
    setIsEditing(true);
    setSignature("");
    setPhotoPreview(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Photo size must be less than 5MB");
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        if (editForm) {
          setEditForm({ ...editForm, photoUrl: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    if (editForm) {
      setEditForm({ ...editForm, photoUrl: undefined });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editForm) {
      setShowSaveConfirm(true);
    }
  };

  const confirmSave = () => {
    if (editForm) {
      if (isAdding) {
        // Add new student to the list
        const newStudent = { ...editForm, id: `student-${Date.now()}` };
        setRows([newStudent, ...rows]);
        setTotal(total + 1);
      } else {
        // Update existing student
        setRows(rows.map(s => s.id === editForm.id ? editForm : s));
        setSelectedStudent(editForm);
      }
      setShowSaveConfirm(false);
      setIsEditing(false);
      setIsAdding(false);
      handleClose();
      
      // Show success message
      setTimeout(() => {
        alert(isAdding ? "✅ Student added successfully!" : "✅ Student updated successfully!");
      }, 100);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (selectedStudent) {
      // Remove student from the list
      setRows(rows.filter(s => s.id !== selectedStudent.id));
      setTotal(total - 1);
      setShowDeleteConfirm(false);
      handleClose();
      
      // Show success message
      setTimeout(() => {
        alert("🗑️ Student deleted successfully!");
      }, 100);
    }
  };

  const handleClose = () => {
    setSelectedStudent(null);
    setIsEditing(false);
    setIsAdding(false);
    setEditForm(null);
    setSignature("");
    setPhotoPreview(null);
    setShowDeleteConfirm(false);
    setShowSaveConfirm(false);
  };

  return (
    <>
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Students</h2>
          <div className={styles.controls}>
            <input className={styles.input} placeholder="Search name/email/tag" value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
            {/* Level dropdown */}
            <select
              className={styles.select}
              value={levelFilter}
              onChange={(e) => {
                setPage(1);
                setLevelFilter(e.target.value as StudentType | "");
                setSubLevelFilter("");
                setCourseFilter("");
              }}
            >
              <option value="">All Levels</option>
              <option value="elementary">Elementary</option>
              <option value="highschool">High School</option>
              <option value="seniorhigh">Senior High</option>
              <option value="college">College</option>
            </select>
            {/* Sub-level dropdown — only shown when a level is selected */}
            {levelFilter && (
              <select
                className={styles.select}
                value={subLevelFilter}
                onChange={(e) => { setPage(1); setSubLevelFilter(e.target.value); }}
              >
                <option value="">
                  {levelFilter === "college" ? "All Years" : "All Grades"}
                </option>
                {LEVEL_SUBLEVEL[levelFilter].map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
            {/* Course dropdown — only shown when College is selected */}
            {levelFilter === "college" && (
              <select
                className={styles.select}
                value={courseFilter}
                onChange={(e) => { setPage(1); setCourseFilter(e.target.value); }}
              >
                <option value="">All Courses</option>
                {COLLEGE_COURSES.map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.courses.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}
            <select className={styles.select} value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
              <option value="">All status</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
            <button 
              className={styles.button} 
              onClick={handleAddNew}
              style={{ background: "#8b3b3b", color: "white", fontWeight: 600 }}
            >
              + Add Student
            </button>
          </div>
        </div>
        <div className={styles.cardBody}>
          {loading && <div aria-busy>Loading students...</div>}
          {error && <div role="alert">Error: {error}</div>}

          {!loading && !error && (
            <>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Grade/Year</th>
                      <th>Section/Course</th>
                      <th>Status</th>
                      <th>Tag</th>
                      <th>Last Seen</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((s) => (
                      <tr key={s.id} className={styles.tableRow}>
                        <td>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", minWidth: 180 }}>
                            {s.photoUrl ? (
                              <img 
                                src={s.photoUrl} 
                                alt={s.name}
                                style={{ 
                                  width: 36, 
                                  height: 36, 
                                  borderRadius: "50%", 
                                  objectFit: "cover",
                                  flexShrink: 0,
                                  border: "2px solid #e5e7eb"
                                }}
                              />
                            ) : (
                              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e5e7eb", display: "grid", placeItems: "center", fontSize: 12, flexShrink: 0, fontWeight: 600 }}>
                                {s.name.split(" ").map((p) => p[0]).join("")}
                              </div>
                            )}
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                              <div style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={styles.badge} style={{ background: LEVEL_COLORS[s.studentType]?.bg ?? "#f3f4f6", color: LEVEL_COLORS[s.studentType]?.text ?? "#374151" }}>
                            {LEVEL_LABELS[s.studentType] ?? s.studentType}
                          </span>
                        </td>
                        <td>
                          {s.studentType === "college"
                            ? (s.grade ? `Year ${s.grade}` : "—")
                            : (s.grade ? `Grade ${s.grade}` : "—")}
                        </td>
                        <td>{s.studentType === "college" ? (s.course || "—") : (s.section || "—")}</td>
                        <td>
                          <span className={styles.badge + " " + (s.status === "active" ? styles.statusOnline : styles.statusOffline)}>
                            {s.status}
                          </span>
                        </td>
                        <td>{s.tagId || "—"}</td>
                        <td style={{ whiteSpace: "nowrap" }}>{s.lastSeen ? new Date(s.lastSeen).toLocaleString() : "—"}</td>
                        <td>
                          <div className={styles.controls}>
                            <button className={styles.button} onClick={() => handleView(s)}>View</button>
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

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 20,
          overflowY: "auto"
        }} onClick={handleClose}>
          <div style={{
            background: "white",
            borderRadius: 16,
            maxWidth: 700,
            width: "100%",
            maxHeight: "95vh",
            overflow: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            margin: "auto"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: 24,
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 28 }}>👨‍🎓</span>
                {isAdding ? "Add New Student" : "Student Profile"}
              </h2>
              <button onClick={handleClose} style={{
                background: "none",
                border: "none",
                fontSize: 24,
                cursor: "pointer",
                color: "#6b7280"
              }}>×</button>
            </div>

            <div style={{ padding: 24 }}>
              {/* Profile Picture */}
              {!isAdding && (
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                  {selectedStudent.photoUrl ? (
                    <img 
                      src={selectedStudent.photoUrl} 
                      alt={selectedStudent.name}
                      style={{ 
                        width: 120, 
                        height: 120, 
                        borderRadius: "50%", 
                        objectFit: "cover",
                        border: "4px solid #e5e7eb"
                      }}
                    />
                  ) : (
                    <div style={{ 
                      width: 120, 
                      height: 120, 
                      borderRadius: "50%", 
                      background: "#e5e7eb", 
                      display: "grid", 
                      placeItems: "center", 
                      fontSize: 36, 
                      fontWeight: 700 
                    }}>
                      {selectedStudent.name.split(" ").map((p) => p[0]).join("")}
                    </div>
                  )}
                </div>
              )}

              {/* Information Form */}
              {isEditing && editForm ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {/* Photo Upload Section */}
                  <div>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Profile Photo</label>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      {photoPreview ? (
                        <div style={{ position: "relative" }}>
                          <img 
                            src={photoPreview} 
                            alt="Preview"
                            style={{ 
                              width: 100, 
                              height: 100, 
                              borderRadius: "50%", 
                              objectFit: "cover",
                              border: "3px solid #e5e7eb"
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            style={{
                              position: "absolute",
                              top: -5,
                              right: -5,
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              background: "#ef4444",
                              color: "white",
                              border: "2px solid white",
                              cursor: "pointer",
                              fontSize: 14,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div style={{ 
                          width: 100, 
                          height: 100, 
                          borderRadius: "50%", 
                          background: "#f3f4f6", 
                          display: "grid", 
                          placeItems: "center", 
                          fontSize: 40,
                          border: "2px dashed #d1d5db"
                        }}>
                          📷
                        </div>
                      )}
                      <label style={{ cursor: "pointer" }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          style={{ display: "none" }}
                        />
                        <span className={styles.button} style={{ display: "inline-block", background: "#6b7280", color: "white", padding: "6px 12px", fontSize: 13 }}>
                          {photoPreview ? "Change" : "Upload"}
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  <div style={{ borderTop: "1px solid #e5e7eb", margin: "8px 0" }} />
                  
                  <div>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Student Level</label>
                    <select 
                      className={styles.select}
                      value={editForm.studentType}
                      onChange={(e) => {
                        const t = e.target.value as StudentType;
                        const defaultGrade = t === "elementary" ? 1
                          : t === "highschool" ? 7
                          : t === "seniorhigh" ? 11
                          : 1;
                        setEditForm({ 
                          ...editForm, 
                          studentType: t,
                          grade: t !== "college" ? defaultGrade : null,
                          section: t !== "college" ? "A" : null,
                          college: t === "college" ? "" : null,
                          course: t === "college" ? "" : null,
                        });
                      }}
                    >
                      <option value="elementary">Elementary</option>
                      <option value="highschool">High School</option>
                      <option value="seniorhigh">Senior High</option>
                      <option value="college">College</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Full Name</label>
                    <input 
                      className={styles.input}
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Email</label>
                    <input 
                      className={styles.input}
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                  
                  {editForm.studentType !== "college" ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>
                          {editForm.studentType === "elementary" ? "Grade (1–6)" : editForm.studentType === "seniorhigh" ? "Grade (11–12)" : "Grade (7–10)"}
                        </label>
                        <select 
                          className={styles.select}
                          value={editForm.grade ?? LEVEL_SUBLEVEL[editForm.studentType][0].value}
                          onChange={(e) => setEditForm({ ...editForm, grade: Number(e.target.value) })}
                        >
                          {LEVEL_SUBLEVEL[editForm.studentType].map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Section</label>
                        <input 
                          className={styles.input}
                          value={editForm.section || ""}
                          onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 12 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Year Level</label>
                          <select
                            className={styles.select}
                            value={editForm.grade ?? 1}
                            onChange={(e) => setEditForm({ ...editForm, grade: Number(e.target.value) })}
                          >
                            {LEVEL_SUBLEVEL.college.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>College</label>
                          <select 
                            className={styles.select}
                            value={editForm.college || ""}
                            onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                          >
                            <option value="">Select College</option>
                            <option value="College of Engineering">College of Engineering</option>
                            <option value="College of Computer Studies">College of Computer Studies</option>
                            <option value="College of Arts and Sciences">College of Arts and Sciences</option>
                            <option value="College of Business Administration">College of Business Administration</option>
                            <option value="College of Education">College of Education</option>
                            <option value="College of Nursing">College of Nursing</option>
                            <option value="College of Architecture">College of Architecture</option>
                            <option value="College of Law">College of Law</option>
                            <option value="College of Medicine">College of Medicine</option>
                            <option value="College of Agriculture">College of Agriculture</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Course</label>
                        <select 
                          className={styles.select}
                          value={editForm.course || ""}
                          onChange={(e) => setEditForm({ ...editForm, course: e.target.value })}
                        >
                          <option value="">Select Course</option>
                          <optgroup label="Computer Studies">
                            <option value="BS Information Technology (BSIT)">BS Information Technology (BSIT)</option>
                            <option value="BS Computer Science (BSCS)">BS Computer Science (BSCS)</option>
                            <option value="BS Information Systems (BSIS)">BS Information Systems (BSIS)</option>
                            <option value="BS Computer Engineering (BSCpE)">BS Computer Engineering (BSCpE)</option>
                          </optgroup>
                          <optgroup label="Engineering">
                            <option value="BS Civil Engineering (BSCE)">BS Civil Engineering (BSCE)</option>
                            <option value="BS Electrical Engineering (BSEE)">BS Electrical Engineering (BSEE)</option>
                            <option value="BS Mechanical Engineering (BSME)">BS Mechanical Engineering (BSME)</option>
                            <option value="BS Electronics Engineering (BSECE)">BS Electronics Engineering (BSECE)</option>
                            <option value="BS Industrial Engineering (BSIE)">BS Industrial Engineering (BSIE)</option>
                          </optgroup>
                          <optgroup label="Business">
                            <option value="BS Business Administration (BSBA)">BS Business Administration (BSBA)</option>
                            <option value="BS Accountancy (BSA)">BS Accountancy (BSA)</option>
                            <option value="BS Management Accounting (BSMA)">BS Management Accounting (BSMA)</option>
                            <option value="BS Entrepreneurship">BS Entrepreneurship</option>
                            <option value="BS Marketing Management">BS Marketing Management</option>
                          </optgroup>
                          <optgroup label="Education">
                            <option value="Bachelor of Elementary Education (BEEd)">Bachelor of Elementary Education (BEEd)</option>
                            <option value="Bachelor of Secondary Education (BSEd)">Bachelor of Secondary Education (BSEd)</option>
                            <option value="Bachelor of Physical Education (BPEd)">Bachelor of Physical Education (BPEd)</option>
                            <option value="Bachelor of Special Needs Education (BSNEd)">Bachelor of Special Needs Education (BSNEd)</option>
                          </optgroup>
                          <optgroup label="Health Sciences">
                            <option value="BS Nursing (BSN)">BS Nursing (BSN)</option>
                            <option value="BS Pharmacy">BS Pharmacy</option>
                            <option value="BS Medical Technology">BS Medical Technology</option>
                            <option value="BS Physical Therapy">BS Physical Therapy</option>
                            <option value="Doctor of Medicine (MD)">Doctor of Medicine (MD)</option>
                          </optgroup>
                          <optgroup label="Arts & Sciences">
                            <option value="BS Psychology (BSPsych)">BS Psychology (BSPsych)</option>
                            <option value="AB Communication">AB Communication</option>
                            <option value="AB English">AB English</option>
                            <option value="BS Biology">BS Biology</option>
                            <option value="BS Mathematics">BS Mathematics</option>
                          </optgroup>
                          <optgroup label="Architecture & Design">
                            <option value="BS Architecture (BSArch)">BS Architecture (BSArch)</option>
                            <option value="BS Interior Design">BS Interior Design</option>
                            <option value="BS Landscape Architecture">BS Landscape Architecture</option>
                          </optgroup>
                          <optgroup label="Agriculture">
                            <option value="BS Agriculture">BS Agriculture</option>
                            <option value="BS Agricultural Engineering">BS Agricultural Engineering</option>
                            <option value="BS Forestry">BS Forestry</option>
                          </optgroup>
                          <optgroup label="Hospitality & Tourism">
                            <option value="BS Hospitality Management (BSHM)">BS Hospitality Management (BSHM)</option>
                            <option value="BS Tourism Management (BSTM)">BS Tourism Management (BSTM)</option>
                            <option value="BS Hotel and Restaurant Management">BS Hotel and Restaurant Management</option>
                          </optgroup>
                          <optgroup label="Law & Criminology">
                            <option value="Bachelor of Laws (LLB)">Bachelor of Laws (LLB)</option>
                            <option value="BS Criminology">BS Criminology</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Tag ID</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input 
                        className={styles.input}
                        value={editForm.tagId || ""}
                        readOnly
                        style={{ flex: 1, background: "#f9fafb", cursor: "not-allowed" }}
                      />
                      <button
                        type="button"
                        className={styles.button}
                        onClick={() => {
                          const currentYear = new Date().getFullYear();
                          const enrollmentNumber = Math.floor(1 + Math.random() * 9999).toString().padStart(4, '0');
                          const newTagId = `${currentYear}-${enrollmentNumber}`;
                          setEditForm({ ...editForm, tagId: newTagId });
                        }}
                        style={{ background: "#6b7280", color: "white", whiteSpace: "nowrap" }}
                      >
                        🔄 Regenerate
                      </button>
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                      Format: YEAR-NUMBER (e.g., 2024-0001)
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Status</label>
                    <select 
                      className={styles.select}
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as "active" | "disabled" })}
                    >
                      <option value="active">Active</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>
                      <span style={{ marginRight: 6 }}>✍️</span>Signature
                    </label>
                    <input 
                      className={styles.input}
                      placeholder="Type your signature"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      style={{ fontFamily: "cursive", fontSize: 18 }}
                    />
                    {signature && (
                      <div style={{ 
                        marginTop: 8, 
                        padding: 12, 
                        background: "#f9fafb", 
                        borderRadius: 8,
                        fontFamily: "cursive",
                        fontSize: 24,
                        textAlign: "center",
                        border: "1px solid #e5e7eb"
                      }}>
                        {signature}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8, alignItems: "center" }}>
                    <span style={{ fontWeight: 600, color: "#6b7280" }}>Full Name:</span>
                    <span style={{ fontWeight: 700 }}>{selectedStudent.name}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8, alignItems: "center" }}>
                    <span style={{ fontWeight: 600, color: "#6b7280" }}>Email:</span>
                    <span>{selectedStudent.email}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8, alignItems: "center" }}>
                    <span style={{ fontWeight: 600, color: "#6b7280" }}>Type:</span>
                    <span className={styles.badge} style={{ background: LEVEL_COLORS[selectedStudent.studentType]?.bg ?? "#f3f4f6", color: LEVEL_COLORS[selectedStudent.studentType]?.text ?? "#374151", width: "fit-content" }}>
                      {LEVEL_LABELS[selectedStudent.studentType] ?? selectedStudent.studentType}
                    </span>
                  </div>
                  {selectedStudent.studentType !== "college" ? (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8, alignItems: "center" }}>
                        <span style={{ fontWeight: 600, color: "#6b7280" }}>Grade:</span>
                        <span>{selectedStudent.grade ? `Grade ${selectedStudent.grade}` : "—"}</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8, alignItems: "center" }}>
                        <span style={{ fontWeight: 600, color: "#6b7280" }}>Section:</span>
                        <span>{selectedStudent.section || "—"}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8, alignItems: "center" }}>
                        <span style={{ fontWeight: 600, color: "#6b7280" }}>Year:</span>
                        <span>{selectedStudent.grade ? `${selectedStudent.grade}${["st","nd","rd","th"][Math.min(selectedStudent.grade - 1, 3)]} Year` : "—"}</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8, alignItems: "center" }}>
                        <span style={{ fontWeight: 600, color: "#6b7280" }}>College:</span>
                        <span>{selectedStudent.college || "—"}</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8, alignItems: "center" }}>
                        <span style={{ fontWeight: 600, color: "#6b7280" }}>Course:</span>
                        <span>{selectedStudent.course || "—"}</span>
                      </div>
                    </>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8, alignItems: "center" }}>
                    <span style={{ fontWeight: 600, color: "#6b7280" }}>Tag ID:</span>
                    <span>{selectedStudent.tagId || "—"}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8, alignItems: "center" }}>
                    <span style={{ fontWeight: 600, color: "#6b7280" }}>Status:</span>
                    <span className={styles.badge + " " + (selectedStudent.status === "active" ? styles.statusOnline : styles.statusOffline)}>
                      {selectedStudent.status}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8, alignItems: "center" }}>
                    <span style={{ fontWeight: 600, color: "#6b7280" }}>Last Seen:</span>
                    <span>{selectedStudent.lastSeen ? new Date(selectedStudent.lastSeen).toLocaleString() : "—"}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "space-between", flexWrap: "wrap" }}>
                {isEditing ? (
                  <>
                    <div style={{ display: "flex", gap: 12 }}>
                      {!isAdding && (
                        <button 
                          className={styles.button}
                          onClick={handleDelete}
                          style={{ background: "#ef4444", color: "white", border: "none" }}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <button 
                        className={styles.button}
                        onClick={() => setIsEditing(false)}
                        style={{ background: "#f3f4f6" }}
                      >
                        Cancel
                      </button>
                      <button 
                        className={styles.button}
                        onClick={handleSave}
                        style={{ background: "#8b3b3b", color: "white", display: "flex", alignItems: "center", gap: 6 }}
                        disabled={!editForm?.name || !editForm?.email}
                      >
                        <span>💾</span> {isAdding ? "Add Student" : "Save Changes"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button 
                      className={styles.button}
                      onClick={handleDelete}
                      style={{ background: "#ef4444", color: "white", border: "none" }}
                    >
                      🗑️ Delete
                    </button>
                    <button 
                      className={styles.button}
                      onClick={handleEdit}
                      style={{ background: "#8b3b3b", color: "white", display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <span>✏️</span> Edit Profile
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation Modal */}
      {showSaveConfirm && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1100,
          padding: 20
        }} onClick={() => setShowSaveConfirm(false)}>
          <div style={{
            background: "white",
            borderRadius: 16,
            maxWidth: 400,
            width: "100%",
            padding: 24,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}>💾</div>
            <h3 style={{ margin: "0 0 12px 0", fontSize: 20, fontWeight: 800, textAlign: "center" }}>
              {isAdding ? "Add Student?" : "Save Changes?"}
            </h3>
            <p style={{ margin: "0 0 24px 0", color: "#6b7280", textAlign: "center", fontSize: 14 }}>
              {isAdding 
                ? "Are you sure you want to add this student to the system?" 
                : "Are you sure you want to save these changes?"}
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button 
                className={styles.button}
                onClick={() => setShowSaveConfirm(false)}
                style={{ flex: 1, background: "#f3f4f6" }}
              >
                Cancel
              </button>
              <button 
                className={styles.button}
                onClick={confirmSave}
                style={{ flex: 1, background: "#10b981", color: "white", border: "none" }}
              >
                {isAdding ? "Yes, Add" : "Yes, Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1100,
          padding: 20
        }} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{
            background: "white",
            borderRadius: 16,
            maxWidth: 400,
            width: "100%",
            padding: 24,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}>⚠️</div>
            <h3 style={{ margin: "0 0 12px 0", fontSize: 20, fontWeight: 800, textAlign: "center", color: "#ef4444" }}>
              Delete Student?
            </h3>
            <p style={{ margin: "0 0 24px 0", color: "#6b7280", textAlign: "center", fontSize: 14 }}>
              Are you sure you want to delete <strong>{selectedStudent?.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button 
                className={styles.button}
                onClick={() => setShowDeleteConfirm(false)}
                style={{ flex: 1, background: "#f3f4f6" }}
              >
                Cancel
              </button>
              <button 
                className={styles.button}
                onClick={confirmDelete}
                style={{ flex: 1, background: "#ef4444", color: "white", border: "none" }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
