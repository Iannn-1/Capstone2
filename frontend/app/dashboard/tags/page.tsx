import React from "react";
import TagsTable from "./components/TagsTable";
import styles from "../styles.module.css";

export const dynamic = "force-dynamic";

export default function TagsIndexPage() {
  return (
    <main className={styles.dashboard}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Tags</h1>
      <TagsTable />
    </main>
  );
}
