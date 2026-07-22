"use client";

import React from "react";
import AdminProfile from "./components/AdminProfile";
import UserManagement from "./components/UserManagement";
import RFIDSettings from "./components/RFIDSettings";
import SystemSettings from "./components/SystemSettings";
import NotificationSettings from "./components/NotificationSettings";
import SecuritySettings from "./components/SecuritySettings";
import styles from "../styles.module.css";

export default function SettingsPage() {
  return (
    <main className={styles.dashboard}>
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0 0" }}>
          Manage your profile, admin accounts, and system configuration.
        </p>
      </div>

      <div style={{ display: "grid", gap: 20 }}>
        {/* My Profile */}
        <AdminProfile />

        {/* Admin Accounts */}
        <UserManagement />

        {/* RFID + System config */}
        <div className={styles.grid + " cols-2"}>
          <RFIDSettings />
          <SystemSettings />
        </div>

        {/* Notification + Security config */}
        <div className={styles.grid + " cols-2"}>
          <NotificationSettings />
          <SecuritySettings />
        </div>
      </div>
    </main>
  );
}
