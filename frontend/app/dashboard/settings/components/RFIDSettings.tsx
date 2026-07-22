"use client";

import { useState, useEffect } from "react";
import styles from "../../styles.module.css";

type RFIDConfig = {
  readerTimeout: number;
  autoCheckout: boolean;
  checkoutDelay: number;
  duplicateReadDelay: number;
  enableVisitorMode: boolean;
  maxDailyScans: number;
};

export default function RFIDSettings() {
  const [config, setConfig] = useState<RFIDConfig>({
    readerTimeout: 30,
    autoCheckout: true,
    checkoutDelay: 480,
    duplicateReadDelay: 5,
    enableVisitorMode: true,
    maxDailyScans: 100,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/settings/rfid", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config || config);
      }
    } catch (error) {
      console.error("Failed to fetch RFID config:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings/rfid", {
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
          <h2>RFID Reader Settings</h2>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            Configure RFID reader behavior and scanning rules
          </div>
        </div>
      </div>
      <div className={styles.cardBody}>
        <div style={{ display: "grid", gap: 16 }}>
          {/* Reader Timeout */}
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>
              Reader Timeout (seconds)
            </label>
            <input
              className={styles.input}
              type="number"
              min="10"
              max="120"
              value={config.readerTimeout}
              onChange={(e) => setConfig({ ...config, readerTimeout: Number(e.target.value) })}
            />
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Time before reader connection times out
            </div>
          </div>

          {/* Auto Checkout */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="checkbox"
              id="autoCheckout"
              checked={config.autoCheckout}
              onChange={(e) => setConfig({ ...config, autoCheckout: e.target.checked })}
              style={{ width: 18, height: 18, cursor: "pointer" }}
            />
            <label htmlFor="autoCheckout" style={{ fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              Enable Auto Check-out
            </label>
          </div>

          {/* Checkout Delay */}
          {config.autoCheckout && (
            <div style={{ display: "grid", gap: 6, marginLeft: 30 }}>
              <label style={{ fontWeight: 600, fontSize: 14 }}>
                Auto Check-out Delay (minutes)
              </label>
              <input
                className={styles.input}
                type="number"
                min="60"
                max="720"
                value={config.checkoutDelay}
                onChange={(e) => setConfig({ ...config, checkoutDelay: Number(e.target.value) })}
              />
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                Automatically check out after this many minutes (default: 8 hours)
              </div>
            </div>
          )}

          {/* Duplicate Read Delay */}
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>
              Duplicate Read Delay (seconds)
            </label>
            <input
              className={styles.input}
              type="number"
              min="1"
              max="60"
              value={config.duplicateReadDelay}
              onChange={(e) => setConfig({ ...config, duplicateReadDelay: Number(e.target.value) })}
            />
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Ignore duplicate scans within this time window
            </div>
          </div>

          {/* Visitor Mode */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="checkbox"
              id="visitorMode"
              checked={config.enableVisitorMode}
              onChange={(e) => setConfig({ ...config, enableVisitorMode: e.target.checked })}
              style={{ width: 18, height: 18, cursor: "pointer" }}
            />
            <label htmlFor="visitorMode" style={{ fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              Enable Visitor Mode
            </label>
          </div>

          {/* Max Daily Scans */}
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>
              Max Daily Scans per Tag
            </label>
            <input
              className={styles.input}
              type="number"
              min="10"
              max="500"
              value={config.maxDailyScans}
              onChange={(e) => setConfig({ ...config, maxDailyScans: Number(e.target.value) })}
            />
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Alert if a tag is scanned more than this many times per day
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
