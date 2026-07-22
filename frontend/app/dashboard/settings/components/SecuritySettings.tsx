"use client";

import { useState, useEffect } from "react";
import styles from "../../styles.module.css";

type SecurityConfig = {
  sessionTimeout: number;
  requireMFA: boolean;
  passwordExpiry: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  allowedIPs: string[];
};

export default function SecuritySettings() {
  const [config, setConfig] = useState<SecurityConfig>({
    sessionTimeout: 60,
    requireMFA: false,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    allowedIPs: [],
  });
  const [newIP, setNewIP] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/settings/security", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config || config);
      }
    } catch (error) {
      console.error("Failed to fetch security config:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings/security", {
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

  const addIP = () => {
    if (newIP && !config.allowedIPs.includes(newIP)) {
      setConfig({ ...config, allowedIPs: [...config.allowedIPs, newIP] });
      setNewIP("");
    }
  };

  const removeIP = (ip: string) => {
    setConfig({ ...config, allowedIPs: config.allowedIPs.filter((i) => i !== ip) });
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h2>Security Settings</h2>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            Configure authentication and access control
          </div>
        </div>
      </div>
      <div className={styles.cardBody}>
        <div style={{ display: "grid", gap: 16 }}>
          {/* Session Timeout */}
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>
              Session Timeout (minutes)
            </label>
            <input
              className={styles.input}
              type="number"
              min="15"
              max="480"
              value={config.sessionTimeout}
              onChange={(e) => setConfig({ ...config, sessionTimeout: Number(e.target.value) })}
            />
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Auto logout after inactivity
            </div>
          </div>

          {/* MFA */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="checkbox"
              id="requireMFA"
              checked={config.requireMFA}
              onChange={(e) => setConfig({ ...config, requireMFA: e.target.checked })}
              style={{ width: 18, height: 18, cursor: "pointer" }}
            />
            <label htmlFor="requireMFA" style={{ fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              Require Multi-Factor Authentication
            </label>
          </div>

          {/* Password Expiry */}
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>
              Password Expiry (days)
            </label>
            <input
              className={styles.input}
              type="number"
              min="30"
              max="365"
              value={config.passwordExpiry}
              onChange={(e) => setConfig({ ...config, passwordExpiry: Number(e.target.value) })}
            />
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Force password change after this many days
            </div>
          </div>

          {/* Max Login Attempts */}
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>
              Max Login Attempts
            </label>
            <input
              className={styles.input}
              type="number"
              min="3"
              max="10"
              value={config.maxLoginAttempts}
              onChange={(e) => setConfig({ ...config, maxLoginAttempts: Number(e.target.value) })}
            />
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Lock account after failed attempts
            </div>
          </div>

          {/* Lockout Duration */}
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>
              Lockout Duration (minutes)
            </label>
            <input
              className={styles.input}
              type="number"
              min="5"
              max="120"
              value={config.lockoutDuration}
              onChange={(e) => setConfig({ ...config, lockoutDuration: Number(e.target.value) })}
            />
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              How long to lock account after max attempts
            </div>
          </div>

          {/* IP Whitelist */}
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontWeight: 600, fontSize: 14 }}>
              IP Whitelist (Optional)
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className={styles.input}
                type="text"
                placeholder="192.168.1.1"
                value={newIP}
                onChange={(e) => setNewIP(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className={styles.button} onClick={addIP}>
                Add IP
              </button>
            </div>
            {config.allowedIPs.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {config.allowedIPs.map((ip) => (
                  <span
                    key={ip}
                    className={styles.badge}
                    style={{
                      background: "#dbeafe",
                      color: "#1e40af",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {ip}
                    <button
                      onClick={() => removeIP(ip)}
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
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Leave empty to allow all IPs
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
