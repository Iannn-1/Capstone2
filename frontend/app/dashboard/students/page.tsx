import React from "react";
import StudentsTable from "./components/StudentsTable";
import styles from "../styles.module.css";

export const dynamic = "force-dynamic";

export default function StudentsIndexPage() {
  return (
    <main className={styles.dashboard}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Students</h1>
      <StudentsTable />
    </main>
  );
}
