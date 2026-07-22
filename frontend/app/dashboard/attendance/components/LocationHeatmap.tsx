"use client";

import { useEffect, useState } from "react";
import styles from "../../styles.module.css";

type LocationData = {
  name: string;
  count: number;
  capacity: number;
  status: "normal" | "crowded" | "full";
  recentActivity: number;
};

export default function LocationHeatmap() {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const res = await fetch("/api/locations/heatmap", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setLocations(data.locations || []);
        } else {
          // Fallback to mock data
          setLocations(generateMockLocations());
        }
      } catch (error) {
        console.error("Failed to fetch location data:", error);
        setLocations(generateMockLocations());
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
    const interval = setInterval(fetchLocationData, 15000); // Update every 15s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className={styles.card}><div className={styles.cardBody}>Loading location data...</div></div>;
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2>Live Location Heatmap</h2>
        <span style={{ fontSize: 12, color: "#6b7280" }}>Updates every 15 seconds</span>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.grid} style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          {locations.map((loc) => {
            const occupancyRate = (loc.count / loc.capacity) * 100;
            const bgColor =
              loc.status === "full"
                ? "#fee2e2"
                : loc.status === "crowded"
                ? "#fef3c7"
                : "#d1fae5";
            const textColor =
              loc.status === "full"
                ? "#991b1b"
                : loc.status === "crowded"
                ? "#92400e"
                : "#065f46";

            return (
              <div
                key={loc.name}
                className={styles.card}
                style={{
                  background: bgColor,
                  border: `2px solid ${textColor}20`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div className={styles.cardBody}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: textColor }}>
                      {loc.name}
                    </h3>
                    {loc.recentActivity > 0 && (
                      <span
                        style={{
                          fontSize: 10,
                          background: textColor,
                          color: "white",
                          padding: "2px 6px",
                          borderRadius: 999,
                          fontWeight: 700,
                        }}
                      >
                        +{loc.recentActivity}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: textColor, marginBottom: 4 }}>
                    {loc.count}
                  </div>
                  <div style={{ fontSize: 12, color: textColor, opacity: 0.8 }}>
                    Capacity: {loc.capacity} ({occupancyRate.toFixed(0)}%)
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: textColor,
                      opacity: 0.3,
                      transform: `scaleX(${occupancyRate / 100})`,
                      transformOrigin: "left",
                      transition: "transform 0.3s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function generateMockLocations(): LocationData[] {
  return [
    { name: "Main Gate", count: 45, capacity: 100, status: "normal", recentActivity: 3 },
    { name: "Library", count: 78, capacity: 80, status: "crowded", recentActivity: 5 },
    { name: "Cafeteria", count: 120, capacity: 150, status: "crowded", recentActivity: 12 },
    { name: "Gym", count: 35, capacity: 60, status: "normal", recentActivity: 2 },
    { name: "Science Lab", count: 28, capacity: 30, status: "crowded", recentActivity: 1 },
    { name: "Computer Lab", count: 42, capacity: 50, status: "normal", recentActivity: 0 },
    { name: "Auditorium", count: 200, capacity: 200, status: "full", recentActivity: 8 },
    { name: "Playground", count: 65, capacity: 200, status: "normal", recentActivity: 4 },
  ];
}
