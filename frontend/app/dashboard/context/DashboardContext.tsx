"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type Tag = { id: string; assignedTo: string; status: "Active" | "Inactive" };

type Profile = { name: string; email: string };

type DashboardState = {
  tags: Tag[];
  profile: Profile;
  updateProfile: (p: Profile) => void;
  changePassword: (current: string, next: string) => boolean;
  registerTag: (tagId: string) => void;
  deactivateTag: (tagId: string) => void;
};

const defaultTags: Tag[] = [
  { id: "TAG-002", assignedTo: "Samuel Dela", status: "Active" },
  { id: "TAG-017", assignedTo: "Maria Cruz", status: "Active" },
  { id: "TAG-034", assignedTo: "Jose Ramos", status: "Active" },
  { id: "TAG-055", assignedTo: "", status: "Inactive" },
];

const ctx = createContext<DashboardState | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [tags, setTags] = useState<Tag[]>(() => {
    try {
      const raw = localStorage.getItem("rfid_tags");
      return raw ? JSON.parse(raw) : defaultTags;
    } catch {
      return defaultTags;
    }
  });

  /* profile & password (demo only: stored in localStorage) */
  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const raw = localStorage.getItem("rfid_profile");
      return raw ? JSON.parse(raw) : { name: "Administrator", email: "admin@school.test" };
    } catch {
      return { name: "Administrator", email: "admin@school.test" };
    }
  });

  const [password, setPassword] = useState<string>(() => {
    try {
      return localStorage.getItem("rfid_admin_password") || "admin123";
    } catch {
      return "admin123";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("rfid_tags", JSON.stringify(tags));
      localStorage.setItem("rfid_profile", JSON.stringify(profile));
      localStorage.setItem("rfid_admin_password", password);
    } catch (e) {
      // ignore
    }
  }, [tags, profile, password]);

  const registerTag = (tagId: string) => {
    setTags((prev) => [{ id: tagId, assignedTo: "", status: "Active" }, ...prev]);
  };

  const deactivateTag = (tagId: string) => {
    setTags((prev: Tag[]) => prev.map((t: Tag) => (t.id === tagId ? { ...t, status: "Inactive", assignedTo: "" } : t)));
  };

  const updateProfile = (p: Profile) => {
    setProfile(p);
  };

  const changePassword = (current: string, next: string) => {
    if (current !== password) return false;
    setPassword(next);
    return true;
  };

  const value: DashboardState = {
    tags,
    profile,
    updateProfile,
    changePassword,
    registerTag,
    deactivateTag,
  };

  return <ctx.Provider value={value}>{children}</ctx.Provider>;
}

export function useDashboard() {
  const v = useContext(ctx);
  if (!v) throw new Error("useDashboard must be used within DashboardProvider");
  return v;
}
