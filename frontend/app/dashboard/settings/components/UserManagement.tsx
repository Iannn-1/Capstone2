"use client";

import { useState, useEffect } from "react";
import styles from "../../styles.module.css";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "superadmin" | "admin" | "viewer";
};

const ROLE_META = {
  superadmin: { label: "Super Admin", bg: "#fee2e2", color: "#991b1b", icon: "👑" },
  admin:      { label: "Admin",       bg: "#dbeafe", color: "#1e40af", icon: "🛡️" },
  viewer:     { label: "Viewer",      bg: "#f3f4f6", color: "#374151", icon: "👁️" },
};

const EMPTY_FORM = { name: "", email: "", password: "", role: "viewer" as AdminUser["role"] };

export default function UserManagement() {
  const [users,       setUsers]       = useState<AdminUser[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState<"add" | "edit" | null>(null);
  const [editTarget,  setEditTarget]  = useState<AdminUser | null>(null);
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [showPw,      setShowPw]      = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const [deleteId,    setDeleteId]    = useState<string | null>(null);
  const [toast,       setToast]       = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      if (res.ok) { const d = await res.json(); setUsers(d.data || []); }
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setEditTarget(null); setError(""); setShowPw(false); setModal("add"); };
  const openEdit = (u: AdminUser) => { setForm({ name: u.name, email: u.email, password: "", role: u.role }); setEditTarget(u); setError(""); setShowPw(false); setModal("edit"); };
  const closeModal = () => { setModal(null); setEditTarget(null); setError(""); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim()) { setError("Name and email are required."); return; }
    if (modal === "add" && !form.password) { setError("Password is required for new accounts."); return; }
    if (form.password && form.password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setSaving(true);
    try {
      const url    = modal === "edit" && editTarget ? `/api/users/${editTarget.id}` : "/api/users";
      const method = modal === "edit" ? "PATCH" : "POST";
      const body   = modal === "edit" && !form.password
        ? { name: form.name, email: form.email, role: form.role }
        : form;

      const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();

      if (!res.ok) { setError(data.error || "Failed to save."); return; }

      await fetchUsers();
      closeModal();
      showToast(modal === "edit" ? "✅ Account updated!" : "✅ Account created!");
    } catch { setError("Network error. Please try again."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) { await fetchUsers(); showToast("🗑️ Account deleted."); }
    } finally { setDeleteId(null); }
  };

  return (
    <>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1f2937", color: "white", padding: "12px 20px", borderRadius: 12, fontWeight: 700, fontSize: 14, zIndex: 9999, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", animation: "fadeUp 0.3s ease" }}>
          {toast}
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>👥 Admin Accounts</h2>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              Manage who can access the dashboard and their permission level.
            </div>
          </div>
          <button
            className={styles.button}
            onClick={openAdd}
            style={{ background: "#8b3b3b", color: "white", fontWeight: 700 }}
          >
            + Add Account
          </button>
        </div>

        <div className={styles.cardBody}>
          {loading ? (
            <div style={{ color: "#9ca3af", fontSize: 14 }}>Loading accounts…</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Admin</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const meta = ROLE_META[u.role] ?? ROLE_META.viewer;
                    return (
                      <tr key={u.id} className={styles.tableRow}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: meta.bg, display: "grid", placeItems: "center", fontSize: 16, flexShrink: 0, border: `1px solid ${meta.color}30` }}>
                              {meta.icon}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</div>
                          </div>
                        </td>
                        <td style={{ fontSize: 13, color: "#6b7280" }}>{u.email}</td>
                        <td>
                          <span className={styles.badge} style={{ background: meta.bg, color: meta.color }}>
                            {meta.label}
                          </span>
                        </td>
                        <td>
                          <div className={styles.controls} style={{ justifyContent: "flex-end" }}>
                            <button className={styles.button} onClick={() => openEdit(u)} style={{ fontSize: 12, padding: "5px 12px" }}>
                              ✏️ Edit
                            </button>
                            <button
                              className={styles.button}
                              onClick={() => setDeleteId(u.id)}
                              style={{ fontSize: 12, padding: "5px 12px", color: "#dc2626", borderColor: "#fca5a5" }}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={closeModal}>
          <div style={{ background: "white", borderRadius: 20, maxWidth: 480, width: "100%", boxShadow: "0 24px 64px rgba(0,0,0,0.25)", overflow: "hidden" }} onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg,#fff5f5,#fff)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "#fee2e2", display: "grid", placeItems: "center", fontSize: 18 }}>
                  {modal === "edit" ? "✏️" : "➕"}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{modal === "edit" ? "Edit Account" : "Add New Account"}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>{modal === "edit" ? `Editing ${editTarget?.name}` : "Create a new admin account"}</div>
                </div>
              </div>
              <button onClick={closeModal} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#9ca3af", lineHeight: 1 }}>×</button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} style={{ padding: 24, display: "grid", gap: 16 }}>
              {error && (
                <div style={{ padding: "10px 14px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, fontSize: 13, color: "#991b1b", fontWeight: 600 }}>
                  ⚠️ {error}
                </div>
              )}

              <div>
                <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6, color: "#374151" }}>Full Name *</label>
                <input className={styles.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Juan dela Cruz" required style={{ width: "100%" }} />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6, color: "#374151" }}>Email Address *</label>
                <input className={styles.input} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="admin@school.edu" required style={{ width: "100%" }} />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6, color: "#374151" }}>
                  Password {modal === "edit" && <span style={{ fontWeight: 400, color: "#9ca3af" }}>(leave blank to keep current)</span>}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className={styles.input}
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder={modal === "edit" ? "••••••••" : "Min. 6 characters"}
                    required={modal === "add"}
                    minLength={form.password ? 6 : undefined}
                    style={{ width: "100%", paddingRight: 40 }}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 14, opacity: 0.5 }}>
                    {showPw ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6, color: "#374151" }}>Role *</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  {(Object.entries(ROLE_META) as [AdminUser["role"], typeof ROLE_META.admin][]).map(([k, v]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, role: k }))}
                      style={{
                        padding: "10px 8px",
                        borderRadius: 10,
                        border: form.role === k ? `2px solid ${v.color}` : "1px solid #e5e7eb",
                        background: form.role === k ? v.bg : "#f9fafb",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                        transition: "all 0.15s",
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{v.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: form.role === k ? v.color : "#6b7280" }}>{v.label}</span>
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>
                  {form.role === "superadmin" && "Full access — can manage all settings and accounts."}
                  {form.role === "admin"      && "Can manage students, tags, and reports."}
                  {form.role === "viewer"     && "Read-only access to dashboard and reports."}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button type="button" className={styles.button} onClick={closeModal} style={{ flex: 1 }} disabled={saving}>Cancel</button>
                <button
                  type="submit"
                  className={styles.button}
                  disabled={saving}
                  style={{ flex: 1, background: "#8b3b3b", color: "white", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  {saving
                    ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Saving…</>
                    : modal === "edit" ? "Save Changes" : "Create Account"
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }} onClick={() => setDeleteId(null)}>
          <div style={{ background: "white", borderRadius: 16, maxWidth: 380, width: "100%", padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🗑️</div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 18, fontWeight: 800 }}>Delete Account?</h3>
            <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 24px 0" }}>This will permanently remove the admin account. This cannot be undone.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className={styles.button} onClick={() => setDeleteId(null)} style={{ flex: 1 }}>Cancel</button>
              <button className={styles.button} onClick={() => handleDelete(deleteId)} style={{ flex: 1, background: "#dc2626", color: "white", fontWeight: 700, border: "none" }}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
