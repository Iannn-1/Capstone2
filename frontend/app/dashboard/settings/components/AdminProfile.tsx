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

export default function AdminProfile() {
  // We use admin-1 (Super Admin) as the "current" logged-in user for demo
  const CURRENT_ID = "admin-1";

  const [profile,    setProfile]    = useState<AdminUser | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [editing,    setEditing]    = useState(false);
  const [form,       setForm]       = useState({ name: "", email: "", currentPw: "", newPw: "", confirmPw: "" });
  const [showPw,     setShowPw]     = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [toast,      setToast]      = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    fetch(`/api/users/${CURRENT_ID}`, { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setProfile(d.user);
          setForm(f => ({ ...f, name: d.user.name, email: d.user.email }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim()) { setError("Name and email are required."); return; }
    if (form.newPw && form.newPw.length < 6)      { setError("New password must be at least 6 characters."); return; }
    if (form.newPw && form.newPw !== form.confirmPw) { setError("New passwords do not match."); return; }
    if (form.newPw && !form.currentPw)             { setError("Enter your current password to set a new one."); return; }

    setSaving(true);
    try {
      const body: Record<string, string> = { name: form.name, email: form.email };
      if (form.newPw) body.password = form.newPw;

      const res  = await fetch(`/api/users/${CURRENT_ID}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();

      if (!res.ok) { setError(data.error || "Failed to save."); return; }

      setProfile(data.user);
      setEditing(false);
      setForm(f => ({ ...f, currentPw: "", newPw: "", confirmPw: "" }));
      showToast("✅ Profile updated successfully!");
    } catch { setError("Network error. Please try again."); }
    finally { setSaving(false); }
  };

  if (loading) {
    return <div className={styles.card} style={{ height: 120 }}><div className={styles.cardBody} style={{ color: "#9ca3af" }}>Loading profile…</div></div>;
  }

  if (!profile) return null;

  const meta = ROLE_META[profile.role] ?? ROLE_META.viewer;
  const initials = profile.name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1f2937", color: "white", padding: "12px 20px", borderRadius: 12, fontWeight: 700, fontSize: 14, zIndex: 9999, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
          {toast}
        </div>
      )}

      <div className={styles.card} style={{ overflow: "hidden" }}>
        {/* Top accent */}
        <div style={{ height: 4, background: "linear-gradient(90deg,#8b3b3b,#e6c57a)" }} />

        <div className={styles.cardHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Avatar */}
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "linear-gradient(135deg,#8b3b3b,#c0504d)",
              display: "grid", placeItems: "center",
              fontSize: 20, fontWeight: 900, color: "white",
              flexShrink: 0, boxShadow: "0 4px 12px rgba(139,59,59,0.35)",
            }}>
              {initials}
            </div>
            <div>
              <h2 style={{ margin: 0 }}>My Profile</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 999, background: meta.bg, color: meta.color }}>
                  {meta.icon} {meta.label}
                </span>
              </div>
            </div>
          </div>
          {!editing && (
            <button
              className={styles.button}
              onClick={() => setEditing(true)}
              style={{ fontWeight: 700 }}
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>

        <div className={styles.cardBody}>
          {!editing ? (
            /* ── View mode ── */
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "Full Name",  value: profile.name  },
                { label: "Email",      value: profile.email },
                { label: "Role",       value: meta.label    },
                { label: "Account ID", value: profile.id    },
              ].map(row => (
                <div key={row.label} style={{ padding: "12px 14px", background: "#f9fafb", borderRadius: 10, border: "1px solid #f3f4f6" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{row.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1f2937" }}>{row.value}</div>
                </div>
              ))}
            </div>
          ) : (
            /* ── Edit mode ── */
            <form onSubmit={handleSave} style={{ display: "grid", gap: 16 }}>
              {error && (
                <div style={{ padding: "10px 14px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, fontSize: 13, color: "#991b1b", fontWeight: 600 }}>
                  ⚠️ {error}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Full Name *</label>
                  <input className={styles.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required style={{ width: "100%" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Email Address *</label>
                  <input className={styles.input} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required style={{ width: "100%" }} />
                </div>
              </div>

              {/* Password change section */}
              <div style={{ padding: "14px 16px", background: "#f9fafb", borderRadius: 12, border: "1px solid #f3f4f6" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 12 }}>🔒 Change Password <span style={{ fontWeight: 400, color: "#9ca3af" }}>(optional)</span></div>
                <div style={{ display: "grid", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontWeight: 600, fontSize: 12, marginBottom: 5, color: "#6b7280" }}>Current Password</label>
                    <div style={{ position: "relative" }}>
                      <input className={styles.input} type={showPw ? "text" : "password"} value={form.currentPw} onChange={e => setForm(f => ({ ...f, currentPw: e.target.value }))} placeholder="Enter current password" style={{ width: "100%", paddingRight: 40 }} />
                      <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 13, opacity: 0.5 }}>
                        {showPw ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 12, marginBottom: 5, color: "#6b7280" }}>New Password</label>
                      <input className={styles.input} type={showPw ? "text" : "password"} value={form.newPw} onChange={e => setForm(f => ({ ...f, newPw: e.target.value }))} placeholder="Min. 6 characters" style={{ width: "100%" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontWeight: 600, fontSize: 12, marginBottom: 5, color: "#6b7280" }}>Confirm New Password</label>
                      <input className={styles.input} type={showPw ? "text" : "password"} value={form.confirmPw} onChange={e => setForm(f => ({ ...f, confirmPw: e.target.value }))} placeholder="Repeat new password" style={{ width: "100%" }} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className={styles.button} onClick={() => { setEditing(false); setError(""); }} style={{ flex: 1 }} disabled={saving}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.button}
                  disabled={saving}
                  style={{ flex: 1, background: "#8b3b3b", color: "white", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  {saving
                    ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Saving…</>
                    : "💾 Save Changes"
                  }
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
