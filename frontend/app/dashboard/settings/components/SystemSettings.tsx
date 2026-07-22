"use client";

import { useState, useEffect } from "react";
import styles from "../../styles.module.css";

type SystemConfig = {
  schoolName: string;
  timezone: string;
  dateFormat: string;
  dataRetention: number;
};

export default function SystemSettings() {
  const [config, setConfig] = useState<SystemConfig>({
    schoolName: "Benedicto College",
    timezone: "Asia/Manila",
    dateFormat: "MM/DD/YYYY",
    dataRetention: 365,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/settings/system", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config || config);
      }
    } catch (error) {
      console.error("Failed to fetch system config:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings/system", {
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

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2>System Settings</h2>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            Configure general system preferences
          </div>
        </div>
      </div>
      <div className={styles.cardBody}>
        <div style={{ display: "grid", gap: 16 }}>
          {/* School Name */}
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>School Name</label>
            <input
              className={styles.input}
              type="text"
              value={config.schoolName}
              onChange={(e) => setConfig({ ...config, schoolName: e.target.value })}
            />
          </div>

          {/* Timezone */}
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>Timezone</label>
            <select
              className={styles.select}
              value={config.timezone}
              onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
            >
              <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
              <option value="America/New_York">America/New York (EST)</option>
              <option value="America/Los_Angeles">America/Los Angeles (PST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
            </select>
          </div>

          {/* Date Format */}
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>Date Format</label>
            <select
              className={styles.select}
              value={config.dateFormat}
              onChange={(e) => setConfig({ ...config, dateFormat: e.target.value })}
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          {/* Data Retention */}
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>
              Data Retention (days)
            </label>
            <input
              className={styles.input}
              type="number"
              min="30"
              max="3650"
              value={config.dataRetention}
              onChange={(e) => setConfig({ ...config, dataRetention: Number(e.target.value) })}
            />
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              How long to keep historical data
            </div>
          </div>

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
