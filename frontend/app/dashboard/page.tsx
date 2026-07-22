"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import HeroClock from "./attendance/components/HeroClock";
import AttendanceSummary from "./attendance/components/AttendanceSummary";
import DoorStatusGrid from "./attendance/components/DoorStatusGrid";
import styles from "./styles.module.css";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  if (typeof window !== "undefined" && !isAuthenticated()) {
    return null;
  }

  return (
    <main className={styles.dashboard}>
      {/* Hero clock banner */}
      <HeroClock />

      {/* Two-column layout: attendance summary + gate monitor */}
      <div className={styles.grid + " cols-2"}>
        <AttendanceSummary />
        <DoorStatusGrid />
      </div>
    </main>
  );
}
