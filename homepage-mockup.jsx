import { useState, useEffect } from "react";

// ── Warm palette ──
const warm = {
  bg: "#FAF8F5",
  card: "#FFFFFF",
  ink: "#3D3229",
  inkMid: "#5C4F42",
  muted: "#8B7D6E",
  mutedLight: "#B5A899",
  accent: "#C47B3F",
  orange: "#E8834A",
  orangeLight: "#FFF0E6",
  divider: "#EDE5D8",
  sage: "#7A8B5E",
  sageBg: "#E8EDDF",
  blue: "#5B8DB8",
  blueBg: "#E8F0F8",
};

// ── Guru quotes (daily rotation) ──
const QUOTES = [
  { quote: "Yoga is 99% practice, 1% theory.", guru: "Sri K. Pattabhi Jois" },
  { quote: "Do your practice and all is coming.", guru: "Sri K. Pattabhi Jois" },
  { quote: "The body is your temple. Keep it pure and clean for the soul to reside in.", guru: "B.K.S. Iyengar" },
  { quote: "Breath is the king of mind.", guru: "B.K.S. Iyengar" },
  { quote: "Anyone can practice. Young man can practice, old man can practice.", guru: "Sri K. Pattabhi Jois" },
];

// ── Mock data ──
const AVATARS = [
  "https://i.pravatar.cc/80?img=11",
  "https://i.pravatar.cc/80?img=12",
  "https://i.pravatar.cc/80?img=14",
  "https://i.pravatar.cc/80?img=32",
  "https://i.pravatar.cc/80?img=44",
  "https://i.pravatar.cc/80?img=52",
  "https://i.pravatar.cc/80?img=59",
  "https://i.pravatar.cc/80?img=68",
];

const PRACTICING_NOW = [
  { name: "Maya", series: "Primary Series", emoji: "🧘‍♀️", avatar: "https://i.pravatar.cc/80?img=5", min: 42 },
  { name: "Arjun", series: "Half Primary", emoji: "💪", avatar: "https://i.pravatar.cc/80?img=33", min: 18 },
  { name: "Liat", series: "Intermediate", emoji: "⚡", avatar: "https://i.pravatar.cc/80?img=23", min: 55 },
];

const FEED = [
  { name: "David", avatar: "https://i.pravatar.cc/80?img=11", action: "finished", series: "Primary Series", emoji: "🔥", time: "12 min ago", hearts: 4 },
  { name: "Sarah", avatar: "https://i.pravatar.cc/80?img=9", action: "finished", series: "Sun Salutations", emoji: "☀️", time: "28 min ago", hearts: 2 },
  { name: "Kobi", avatar: "https://i.pravatar.cc/80?img=60", action: "finished", series: "Short Practice", emoji: "🙏", time: "1h ago", hearts: 6 },
];

const WEEK = ["S", "M", "T", "W", "T", "F", "S"];

export default function HomeMockup() {
  const [isPracticing, setIsPracticing] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [mood, setMood] = useState(null);
  const [feedTab, setFeedTab] = useState("live"); // "live" | "recent"
  const todayIdx = new Date().getDay();
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const guruWisdom = QUOTES[dayOfYear % QUOTES.length];

  // Timer
  useEffect(() => {
    if (!isPracticing) return;
    const iv = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [isPracticing]);

  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // ── Phone Frame ──
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", minHeight: "100vh", background: "#f0ebe4", padding: 32, fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <div style={{
        width: 390, minHeight: 844, background: warm.bg, borderRadius: 40,
        boxShadow: "0 20px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)",
        overflow: "hidden", position: "relative", display: "flex", flexDirection: "column",
      }}>
        {/* ── Status bar ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 28px 0", fontSize: 14, fontWeight: 600, color: warm.ink }}>
          <span>9:41</span>
          <div style={{ width: 120, height: 28, background: "#1a1a1a", borderRadius: 20 }} />
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <svg width="16" height="12" viewBox="0 0 16 12"><path d="M1 8h2v4H1zM5 5h2v7H5zM9 2h2v10H9zM13 0h2v12h-2z" fill={warm.ink} /></svg>
            <svg width="14" height="12" viewBox="0 0 14 12"><path d="M7 3.5a5.5 5.5 0 00-5.5 5.5h2A3.5 3.5 0 017 5.5V3.5z" fill={warm.ink} /><path d="M7 0a8.5 8.5 0 00-8.5 8.5h2A6.5 6.5 0 017 2V0z" fill={warm.ink} opacity={0.5} /></svg>
            <svg width="26" height="12" viewBox="0 0 26 12"><rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke={warm.ink} fill="none" /><rect x="2" y="2" width="16" height="8" rx="1" fill={warm.sage} /><rect x="23.5" y="3.5" width="2" height="5" rx="1" fill={warm.ink} /></svg>
          </div>
        </div>

        {/* ── Nav bar ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px 6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 16, background: "#2d4a2d", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 16 }}>🌿</span>
            </div>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: warm.ink }}>Ashtanga Sangha</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: 17, background: warm.orange, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <span style={{ fontSize: 16 }}>💬</span>
              <div style={{ position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: 8, background: "#d44", border: "2px solid " + warm.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>3</span>
              </div>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 17, overflow: "hidden" }}>
              <img src="https://i.pravatar.cc/80?img=11" alt="" style={{ width: "100%", height: "100%" }} />
            </div>
          </div>
        </div>

        {/* ── Scrollable Content ── */}
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 80 }}>
          {/* ── Welcome ── */}
          <div style={{ textAlign: "center", padding: "12px 20px 8px" }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: warm.ink, margin: "0 0 4px" }}>Welcome back, David</h2>
            <p style={{ fontSize: 14, color: warm.muted, margin: 0 }}>
              <span style={{ color: warm.blue, fontWeight: 600 }}>13 yogis</span> are practicing right now
            </p>
          </div>

          {/* ── Live Avatars ── */}
          <div style={{ display: "flex", justifyContent: "center", gap: -4, padding: "4px 0 12px" }}>
            {AVATARS.map((a, i) => (
              <div key={i} style={{
                width: 38, height: 38, borderRadius: 19,
                border: i < 3 ? `2px solid ${warm.sage}` : `2px solid ${warm.divider}`,
                overflow: "hidden", marginLeft: i > 0 ? -6 : 0,
                boxShadow: i < 3 ? `0 0 0 1px ${warm.sageBg}` : "none",
              }}>
                <img src={a} alt="" style={{ width: "100%", height: "100%" }} />
              </div>
            ))}
          </div>

          {/* ── Guru Quote Banner ── */}
          <div style={{
            margin: "0 16px 12px", padding: "14px 18px",
            background: `linear-gradient(135deg, ${warm.ink} 0%, #5C4F42 100%)`,
            borderRadius: 16, textAlign: "center",
          }}>
            <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: "#FFF5EB", margin: "0 0 4px", lineHeight: 1.35, fontStyle: "italic" }}>
              "{guruWisdom.quote}"
            </p>
            <p style={{ fontSize: 12, color: warm.mutedLight, margin: 0 }}>— {guruWisdom.guru}</p>
          </div>

          {/* ── CTA Button ── */}
          {!isPracticing ? (
            <div style={{ padding: "0 16px 6px" }}>
              <button
                onClick={() => { setIsPracticing(true); setElapsedSec(0); }}
                style={{
                  width: "100%", padding: "16px 0",
                  background: `linear-gradient(135deg, ${warm.orange} 0%, ${warm.accent} 100%)`,
                  border: "none", borderRadius: 16, cursor: "pointer",
                  boxShadow: `0 4px 16px ${warm.orange}44`,
                  transition: "transform 0.15s",
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <span style={{ fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: 0.5, textTransform: "uppercase" }}>
                  I'm Practicing Now
                </span>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", margin: "4px 0 0" }}>
                  Join 13 yogis on the mat
                </p>
              </button>
            </div>
          ) : (
            <div style={{
              margin: "0 16px 6px", padding: "18px",
              background: warm.card, borderRadius: 16,
              border: `2px solid ${warm.sage}`,
              textAlign: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 5, background: warm.sage, animation: "pulse 1.5s infinite" }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: warm.sage }}>You're on the mat</span>
              </div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: warm.ink, margin: "4px 0 12px" }}>
                {fmtTime(elapsedSec)}
              </div>
              <button
                onClick={() => setIsPracticing(false)}
                style={{
                  padding: "10px 28px", background: warm.ink, color: "#fff",
                  border: "none", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}
              >
                Finish Practice
              </button>
              <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }`}</style>
            </div>
          )}

          {/* ── Practice Rhythm ── */}
          <div style={{ margin: "8px 16px 6px", padding: "14px 16px", background: warm.card, borderRadius: 16, border: `1px solid ${warm.divider}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: warm.ink }}>Practice Rhythm</span>
              <span style={{ fontSize: 12, color: warm.muted }}>5 of 6 this week</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {WEEK.map((d, i) => {
                const done = [0, 1, 2, 3, 5].includes(i);
                const isToday = i === todayIdx;
                return (
                  <div key={i} style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ fontSize: 11, color: warm.muted, marginBottom: 6, fontWeight: isToday ? 700 : 400 }}>{d}</div>
                    <div style={{
                      width: 28, height: 28, borderRadius: 14, margin: "0 auto",
                      background: done ? warm.orange : isToday ? warm.orangeLight : "transparent",
                      border: isToday && !done ? `2px solid ${warm.orange}` : done ? "none" : `1px solid ${warm.divider}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {done && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Mood Check ── */}
          <div style={{ margin: "6px 16px 8px", padding: "12px 16px", background: warm.card, borderRadius: 16, border: `1px solid ${warm.divider}` }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: warm.ink, margin: "0 0 10px", textAlign: "center" }}>How was your practice today?</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              {[
                { icon: "🔥", label: "Strong", key: "strong" },
                { icon: "💧", label: "Challenging", key: "challenging" },
                { icon: "🌙", label: "Low energy", key: "low" },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMood(m.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 14px", border: `1.5px solid ${mood === m.key ? warm.orange : warm.divider}`,
                    borderRadius: 24, background: mood === m.key ? warm.orangeLight : warm.card,
                    cursor: "pointer", fontSize: 13, color: mood === m.key ? warm.accent : warm.inkMid,
                    fontWeight: mood === m.key ? 600 : 400,
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 15 }}>{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Practice Feed ── */}
          <div style={{ margin: "6px 16px 12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: warm.ink }}>Practice Feed</span>
              <div style={{ display: "flex", gap: 0, background: warm.divider, borderRadius: 10, padding: 2 }}>
                {["live", "recent"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFeedTab(t)}
                    style={{
                      padding: "5px 14px", border: "none", borderRadius: 8, cursor: "pointer",
                      fontSize: 12, fontWeight: 600, textTransform: "capitalize",
                      background: feedTab === t ? warm.card : "transparent",
                      color: feedTab === t ? warm.ink : warm.muted,
                      boxShadow: feedTab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    }}
                  >{t === "live" ? "🟢 Live" : "Recent"}</button>
                ))}
              </div>
            </div>

            {feedTab === "live" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {PRACTICING_NOW.map((p, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", background: warm.card, borderRadius: 14,
                    border: `1px solid ${warm.divider}`,
                  }}>
                    <div style={{ position: "relative" }}>
                      <img src={p.avatar} alt="" style={{ width: 40, height: 40, borderRadius: 20 }} />
                      <div style={{
                        position: "absolute", bottom: -1, right: -1,
                        width: 12, height: 12, borderRadius: 6,
                        background: warm.sage, border: `2px solid ${warm.card}`,
                      }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: warm.ink }}>{p.name} <span style={{ fontWeight: 400, color: warm.muted }}>is on the mat</span></div>
                      <div style={{ fontSize: 12, color: warm.muted }}>{p.series} · {p.emoji} {p.min}m</div>
                    </div>
                    <button style={{
                      padding: "6px 12px", background: warm.sageBg, border: "none",
                      borderRadius: 20, fontSize: 12, fontWeight: 600, color: warm.sage, cursor: "pointer",
                    }}>🙏</button>
                  </div>
                ))}
                <div style={{
                  textAlign: "center", padding: "10px",
                  background: warm.orangeLight, borderRadius: 12,
                  fontSize: 13, color: warm.accent, fontWeight: 500,
                }}>
                  🧡 6 friends practiced today
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {FEED.map((f, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", background: warm.card, borderRadius: 14,
                    border: `1px solid ${warm.divider}`,
                  }}>
                    <img src={f.avatar} alt="" style={{ width: 40, height: 40, borderRadius: 20 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: warm.ink }}>
                        <span style={{ fontWeight: 600 }}>{f.name}</span> finished {f.series} {f.emoji}
                      </div>
                      <div style={{ fontSize: 12, color: warm.muted }}>{f.time}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: warm.muted }}>
                      <span>🤍</span>{f.hearts}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          display: "flex", justifyContent: "space-around", alignItems: "center",
          padding: "10px 0 28px", background: warm.card,
          borderTop: `1px solid ${warm.divider}`,
        }}>
          {[
            { icon: "🏠", label: "Home", active: true },
            { icon: "👥", label: "Community", active: false },
            { icon: "📊", label: "Log", active: false },
            { icon: "👤", label: "Profile", active: false },
          ].map((t) => (
            <div key={t.label} style={{ textAlign: "center", cursor: "pointer" }}>
              <div style={{ fontSize: 20, marginBottom: 2, opacity: t.active ? 1 : 0.5 }}>{t.icon}</div>
              <div style={{
                fontSize: 10, fontWeight: t.active ? 700 : 400,
                color: t.active ? warm.accent : warm.muted,
              }}>{t.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
