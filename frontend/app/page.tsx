"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import s from "./LandingPage.module.css";

/* ── animated counter hook ── */
function useCounter(target: number, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(start);
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return val;
}

export default function Home() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);
  const [mounted,  setMounted]  = useState(false);

  // Only run time-dependent code after mount to avoid SSR/client mismatch
  useEffect(() => {
    setMounted(true);
    // Force re-render every second so the clock updates
    const id = setInterval(() => setMounted(true), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = mounted
    ? new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "00:00:00";
  const dateStr = mounted
    ? new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    : "";

  const c1 = useCounter(1248);
  const c2 = useCounter(99);
  const c3 = useCounter(18);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      // Use the backend API directly via the configured api base URL
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // Persist token and user for auth lib
        if (data.data?.token) {
          localStorage.setItem("rfid_attendance_token", data.data.token);
        }
        if (data.data?.user) {
          localStorage.setItem("rfid_attendance_user", JSON.stringify(data.data.user));
        }
        router.push("/dashboard");
        return;
      }
      setError(data?.error || data?.data?.error || "Invalid email or password");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className={s.root}>

      {/* ══════════════════════════════════════
          FLOATING PARTICLES (pure CSS)
      ══════════════════════════════════════ */}
      <div className={s.particles} aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className={s.particle} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>

      {/* ══════════════════════════════════════
          NAV
      ══════════════════════════════════════ */}
      <nav className={s.nav}>
        <div className={s.navBrand}>
          <div className={s.navLogoWrap}>
            <img src="/bc-logo.png" alt="School logo" className={s.navLogo} />
          </div>
          <div>
            <div className={s.navTitle}>Benedicto College</div>
            <div className={s.navSub}>RFID Campus System</div>
          </div>
        </div>
        <div className={s.navRight}>
          <div className={s.navClock}>
            <div className={s.navTime}>{timeStr}</div>
            <div className={s.navDate}>{dateStr}</div>
          </div>
          <div className={s.navOnline}>
            <span className={s.onlineDot} />
            System Online
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className={s.hero}>
        <div className={s.heroLeft}>
          <div className={s.heroBadge}>
            <span className={s.badgeDot} />
            Live Campus Monitoring
          </div>

          <h1 className={s.heroTitle}>
            Smart RFID<br />
            <span className={s.heroAccent}>Attendance</span><br />
            Management
          </h1>

          <p className={s.heroDesc}>
            Real-time student tracking, automated attendance logging,
            and instant gate monitoring — all in one secure platform.
          </p>

          {/* Live stats ticker */}
          <div className={s.ticker}>
            <div className={s.tickerItem}>
              <div className={s.tickerNum} style={{ color: "#10b981" }}>{c1.toLocaleString()}</div>
              <div className={s.tickerLbl}>Students Enrolled</div>
            </div>
            <div className={s.tickerDivider} />
            <div className={s.tickerItem}>
              <div className={s.tickerNum} style={{ color: "#e6c57a" }}>{c2}%</div>
              <div className={s.tickerLbl}>Attendance Rate</div>
            </div>
            <div className={s.tickerDivider} />
            <div className={s.tickerItem}>
              <div className={s.tickerNum} style={{ color: "#60a5fa" }}>{c3}</div>
              <div className={s.tickerLbl}>RFID Readers</div>
            </div>
          </div>

          {/* Feature pills */}
          <div className={s.featurePills}>
            {["Elementary","High School","Senior High","College"].map(l => (
              <span key={l} className={s.pill}>{l}</span>
            ))}
          </div>
        </div>

        {/* ── Login card ── */}
        <div className={s.loginCard}>
          <div className={s.loginCardTop}>
            <div className={s.loginCardIcon}>🔐</div>
            <div>
              <div className={s.loginCardTitle}>Admin Portal</div>
              <div className={s.loginCardSub}>Sign in to access the dashboard</div>
            </div>
          </div>

          <form onSubmit={handleLogin} className={s.loginForm}>
            <div className={s.field}>
              <label className={s.fieldLabel}>Email Address</label>
              <div className={s.fieldWrap}>
                <span className={s.fieldIcon}>✉️</span>
                <input
                  type="email"
                  className={s.fieldInput}
                  placeholder="admin@school.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className={s.field}>
              <label className={s.fieldLabel}>Password</label>
              <div className={s.fieldWrap}>
                <span className={s.fieldIcon}>🔒</span>
                <input
                  type={showPw ? "text" : "password"}
                  className={s.fieldInput}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className={s.eyeBtn} onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && (
              <div className={s.errorBox}>
                <span>⚠️</span> {error}
              </div>
            )}

            <button type="submit" className={s.submitBtn} disabled={loading}>
              {loading ? (
                <span className={s.spinner} />
              ) : (
                <>Enter Dashboard →</>
              )}
            </button>
          </form>

          <div className={s.loginFooter}>
            <span className={s.secureTag}>🔒 Secured · Role-based access</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════ */}
      <section className={s.howSection}>
        <div className={s.howInner}>
          <div className={s.sectionLabel}>How It Works</div>
          <h2 className={s.sectionTitle}>From scan to report in seconds</h2>
          <div className={s.steps}>
            {[
              { n: "01", icon: "🏷️", title: "Tap RFID Tag",    desc: "Students tap their RFID card at the Main Gate reader on entry and exit." },
              { n: "02", icon: "⚡", title: "Instant Logging",  desc: "The system records the scan, timestamps it, and updates attendance in real time." },
              { n: "03", icon: "📊", title: "Live Dashboard",   desc: "Admins see live IN/OUT counts, attendance rates per level, and holiday calendars." },
            ].map(step => (
              <div key={step.n} className={s.stepCard}>
                <div className={s.stepNum}>{step.n}</div>
                <div className={s.stepIcon}>{step.icon}</div>
                <h3 className={s.stepTitle}>{step.title}</h3>
                <p className={s.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          LEVELS SECTION
      ══════════════════════════════════════ */}
      <section className={s.levelsSection}>
        <div className={s.howInner}>
          <div className={s.sectionLabel}>Coverage</div>
          <h2 className={s.sectionTitle}>All school levels, one system</h2>
          <div className={s.levelsGrid}>
            {[
              { icon: "🏫", label: "Elementary",  sub: "Grades 1 – 6",    color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)" },
              { icon: "📚", label: "High School",  sub: "Grades 7 – 10",   color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)" },
              { icon: "🎓", label: "Senior High",  sub: "Grades 11 – 12",  color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.25)" },
              { icon: "🏛️", label: "College",      sub: "Years 1 – 4",     color: "#e6c57a", bg: "rgba(230,197,122,0.1)", border: "rgba(230,197,122,0.25)" },
            ].map(lv => (
              <div key={lv.label} className={s.levelCard} style={{ background: lv.bg, border: `1px solid ${lv.border}` }}>
                <div className={s.levelIcon}>{lv.icon}</div>
                <div className={s.levelLabel} style={{ color: lv.color }}>{lv.label}</div>
                <div className={s.levelSub}>{lv.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div className={s.footerBrand}>
            <img src="/bc-logo.png" alt="Logo" className={s.footerLogo} />
            <div>
              <div className={s.footerName}>Benedicto College</div>
              <div className={s.footerTagline}>RFID Campus Management System</div>
            </div>
          </div>
          <div className={s.footerRight}>
            <span className={s.footerOnline}><span className={s.onlineDot} /> System Online</span>
            <span className={s.footerCopy}>© {mounted ? new Date().getFullYear() : "2026"} All rights reserved</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
