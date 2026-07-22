"use client";
import React from "react";
import styles from "./modal.module.css";

export default function Modal({ open, title, onClose, children } : { open: boolean; title?: string; onClose: ()=>void; children: React.ReactNode }){
  if(!open) return null;
  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>{title}</h3>
          <button onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}
