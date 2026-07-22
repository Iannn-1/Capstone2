"use client";

import { useState, useEffect } from "react";
import styles from "../../styles.module.css";

type NotificationConfig = {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  notifyOnAbsence: boolean;
  notifyOnLateArrival: boolean;
  notifyOnUnauthorizedAccess: boolean;
  notifyOnCapacityAlert: boolean;
  notifyOnSystemError: boolean;
  emailRecipients: string[];
  smsRecipients: string[];
};

export default function NotificationSettings() {
  const [config, setConfig] = useState<NotificationConfig>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notifyOnAbsence: true,
    notifyOnLateArrival: true,
    notifyOnUnauthorizedAccess: true,
    notifyOnCapacityAlert: true,
    notifyOnSystemError: true,
    emailRecipients: [],
    smsRecipients: [],
  });
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/settings/notifications", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config || config);
      }
    } catch (error) {
      console.error("Failed to fetch notification config:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const addEmail = () => {
    if (newEmail && !config.emailRecipients.includes(newEmail)) {
      setConfig({ ...config, emailRecipients: [...config.emailRecipients, newEmail] });
      setNewEmail("");
    }
  };

  const removeEmail = (email: string) => {
    setConfig({ ...config, emailRecipients: config.emailRecipients.filter((e) => e !== email) });
  };

  const addPhone = () => {
    if (newPhone && !config.smsRecipients.includes(newPhone)) {
      setConfig({ ...config, smsRecipients: [...config.smsRecipients, newPhone] });
      setNewPhone("");
    }
  };

  const removePhone = (phone: string) => {
    setConfig({ ...config, smsRecipients: config.smsRecipients.filter((p) => p !== phone) });
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2>Notification Settings</h2>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            Configure alerts and notification preferences
          </div>
        </div>
      </div>
      <div className={styles.cardBody}>
        <div style={{ display: "grid", gap: 16 }}>
          {/* Notification Channels */}
          <div style={{ display: "grid", gap: 12 }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>Notification Channels</label>
            
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input
                type="checkbox"
                id="emailNotif"
                checked={config.emailNotifications}
                onChange={(e) => setConfig({ ...config, emailNotifications: e.target.checked })}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
              <label htmlFor="emailNotif" style={{ fontSize: 14, cursor: "pointer" }}>
                Email Notifications
              </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input
                type="checkbox"
                id="smsNotif"
                checked={config.smsNotifications}
                onChange={(e) => setConfig({ ...config, smsNotifications: e.target.checked })}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
              <label htmlFor="smsNotif" style={{ fontSize: 14, cursor: "pointer" }}>
                SMS Notifications
              </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input
                type="checkbox"
                id="pushNotif"
                checked={config.pushNotifications}
                onChange={(e) => setConfig({ ...config, pushNotifications: e.target.checked })}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
              <label htmlFor="pushNotif" style={{ fontSize: 14, cursor: "pointer" }}>
                Push Notifications
              </label>
            </div>
          </div>

          {/* Alert Types */}
          <div style={{ display: "grid", gap: 12 }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>Alert Types</label>
            
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input
                type="checkbox"
                id="notifyAbsence"
                checked={config.notifyOnAbsence}
                onChange={(e) => setConfig({ ...config, notifyOnAbsence: e.target.checked })}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
              <label htmlFor="notifyAbsence" style={{ fontSize: 14, cursor: "pointer" }}>
                Student Absence
              </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input
                type="checkbox"
                id="notifyLate"
                checked={config.notifyOnLateArrival}
                onChange={(e) => setConfig({ ...config, notifyOnLateArrival: e.target.checked })}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
              <label htmlFor="notifyLate" style={{ fontSize: 14, cursor: "pointer" }}>
                Late Arrival
              </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input
                type="checkbox"
                id="notifyUnauth"
                checked={config.notifyOnUnauthorizedAccess}
                onChange={(e) => setConfig({ ...config, notifyOnUnauthorizedAccess: e.target.checked })}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
              <label htmlFor="notifyUnauth" style={{ fontSize: 14, cursor: "pointer" }}>
                Unauthorized Access
              </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input
                type="checkbox"
                id="notifyCapacity"
                checked={config.notifyOnCapacityAlert}
                onChange={(e) => setConfig({ ...config, notifyOnCapacityAlert: e.target.checked })}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
              <label htmlFor="notifyCapacity" style={{ fontSize: 14, cursor: "pointer" }}>
                Capacity Alerts
              </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input
                type="checkbox"
                id="notifyError"
                checked={config.notifyOnSystemError}
                onChange={(e) => setConfig({ ...config, notifyOnSystemError: e.target.checked })}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
              <label htmlFor="notifyError" style={{ fontSize: 14, cursor: "pointer" }}>
                System Errors
              </label>
            </div>
          </div>

          {/* Email Recipients */}
          {config.emailNotifications && (
            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ fontWeight: 600, fontSize: 14 }}>Email Recipients</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="admin@school.edu"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button className={styles.button} onClick={addEmail}>
                  Add
                </button>
              </div>
              {config.emailRecipients.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {config.emailRecipients.map((email) => (
                    <span
                      key={email}
                      className={styles.badge}
                      style={{
                        background: "#dbeafe",
                        color: "#1e40af",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {email}
                      <button
                        onClick={() => removeEmail(email)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          color: "#1e40af",
                          fontWeight: 700,
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SMS Recipients */}
          {config.smsNotifications && (
            <div style={{ display: "grid", gap: 6 }}>
              <label style={{ fontWeight: 600, fontSize: 14 }}>SMS Recipients</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  className={styles.input}
                  type="tel"
                  placeholder="+63 912 345 6789"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button className={styles.button} onClick={addPhone}>
                  Add
                </button>
              </div>
              {config.smsRecipients.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {config.smsRecipients.map((phone) => (
                    <span
                      key={phone}
                      className={styles.badge}
                      style={{
                        background: "#d1fae5",
                        color: "#065f46",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {phone}
                      <button
                        onClick={() => removePhone(phone)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          color: "#065f46",
                          fontWeight: 700,
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Save Button */}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              className={styles.button}
              onClick={handleSave}
              disabled={saving}
              style={{ background: "#8b3b3b", color: "white" }}
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
            {saved && (
              <span style={{ color: "#10b981", fontSize: 14, display: "flex", alignItems: "center" }}>
                ✓ Settings saved successfully
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
