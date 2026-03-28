import { useState } from "react";

// Design C — "Earth & Warmth"
// Warm terracotta/sand palette, rounded organic shapes, stacked card layout, no hero image

const YOGIS = [
  { id: 1, name: "Priya", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80" },
  { id: 2, name: "Marco", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" },
  { id: 3, name: "Yuki", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80" },
  { id: 4, name: "Amit", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80" },
  { id: 5, name: "Sofia", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80" },
  { id: 6, name: "Daniel", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80" },
  { id: 7, name: "Lena", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80" },
  { id: 8, name: "You", img: null },
];

const RHYTHM = [
  { label: "Sun", done: true },
  { label: "Mon", done: true },
  { label: "Tue", done: true },
  { label: "Wed", done: false },
  { label: "Thu", done: false, today: true },
  { label: "Fri", done: false },
  { label: "Sat", done: false, rest: true },
];

const FEED = [
  { id: 1, name: "Liat", time: "4 min ago", caption: "Just finished practice 🙏", avatar: "https://i.pravatar.cc/100?img=5", series: "Primary Series", likes: 3, mood: "Grateful" },
  { id: 2, name: "David", time: "15 min ago", caption: "Working on my dropbacks!", avatar: "https://i.pravatar.cc/100?img=11", series: "Intermediate", likes: 5, mood: "Strong" },
];

export default function DesignC() {
  const [practicing, setPracticing] = useState(false);

  const sand = "#F5EDE3";
  const terra = "#C2714F";
  const terraLight = "#F3DDD2";
  const ink = "#3B2F25";
  const muted = "#8B7D6E";
  const sage = "#6B8C5A";
  const sageBg = "#E5EDDB";
  const cream = "#FFF9F3";

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", fontFamily: "'Georgia', 'Times New Roman', serif", background: sand, minHeight: "100vh", position: "relative" }}>

      {/* ── Top Bar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: sand }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#3B5C3B", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 16 }}>🪷</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 400, color: ink, fontStyle: "italic" }}>Ashtanga Sangha</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ position: "relative", cursor: "pointer" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={terra} strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <div style={{ position: "absolute", top: -4, right: -6, background: terra, borderRadius: 8, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 700, border: `2px solid ${sand}` }}>3</div>
          </div>
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: `3px solid ${terra}` }} />
        </div>
      </div>

      <div style={{ padding: "0 16px 100px" }}>

        {/* ── Greeting Card ── */}
        <div style={{
          background: `linear-gradient(135deg, ${terra}, #D4855E)`,
          borderRadius: 28, padding: "28px 24px", marginBottom: 16,
          position: "relative", overflow: "hidden",
        }}>
          {/* Decorative circle */}
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
          <div style={{ position: "absolute", bottom: -20, left: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />

          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: "0 0 4px", fontFamily: "system-ui, sans-serif", fontWeight: 500 }}>Welcome back</p>
          <p style={{ fontSize: 28, color: "#fff", margin: "0 0 20px", fontStyle: "italic", lineHeight: 1.2 }}>David</p>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ display: "flex" }}>
              {YOGIS.slice(0, 5).map((u, i) => (
                <div key={u.id} style={{ marginLeft: i === 0 ? 0 : -10, zIndex: 5 - i, width: 38, height: 38, borderRadius: "50%", border: `2.5px solid ${terra}`, overflow: "hidden" }}>
                  {u.img ? (
                    <img src={u.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "#D4855E", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 600 }}>D</div>
                  )}
                </div>
              ))}
            </div>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontFamily: "system-ui, sans-serif" }}>
              <strong>12 yogis</strong> on the mat today
            </span>
          </div>

          <button
            onClick={() => setPracticing(!practicing)}
            style={{
              width: "100%", padding: "16px 0", borderRadius: 16, border: "2px solid rgba(255,255,255,0.3)", cursor: "pointer",
              background: practicing ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.15)",
              color: practicing ? terra : "#fff",
              fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
              fontFamily: "system-ui, sans-serif",
              transition: "all 0.3s ease",
              backdropFilter: "blur(10px)",
            }}
          >
            {practicing ? "✦  ON THE MAT" : "I AM PRACTICING NOW"}
          </button>
        </div>

        {/* ── Quote Strip ── */}
        <div style={{ background: cream, borderRadius: 20, padding: "18px 22px", marginBottom: 16, borderLeft: `4px solid ${terra}` }}>
          <p style={{ fontSize: 17, fontStyle: "italic", color: ink, margin: "0 0 4px", lineHeight: 1.45 }}>
            "Practice, and all is coming."
          </p>
          <p style={{ fontSize: 13, color: muted, margin: 0, fontFamily: "system-ui, sans-serif" }}>— Sri K. Pattabhi Jois</p>
        </div>

        {/* ── Rhythm Card ── */}
        <div style={{ background: cream, borderRadius: 24, padding: "20px 22px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={{ fontSize: 17, fontStyle: "italic", color: ink }}>Weekly Rhythm</span>
            <span style={{ fontSize: 12, background: terraLight, color: terra, padding: "4px 12px", borderRadius: 20, fontWeight: 700, fontFamily: "system-ui, sans-serif" }}>🔥 12 day streak</span>
          </div>

          {/* Rhythm bars instead of dots */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {RHYTHM.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: "100%", height: 44, borderRadius: 12,
                  background: d.done ? `linear-gradient(180deg, ${terra}, #D4855E)` : d.today ? terraLight : "#EDE5D8",
                  border: d.today ? `2px dashed ${terra}` : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {d.done && <span style={{ color: "#fff", fontSize: 16 }}>✓</span>}
                  {d.rest && <span style={{ fontSize: 10, color: muted }}>R</span>}
                </div>
                <span style={{ fontSize: 11, color: muted, fontFamily: "system-ui, sans-serif", fontWeight: 500 }}>{d.label}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: muted, fontFamily: "system-ui, sans-serif" }}>3 of 6 this week</span>
            <span style={{ fontSize: 12, color: muted, fontFamily: "system-ui, sans-serif" }}>🌘 Moon Day: Apr 2</span>
          </div>
        </div>

        {/* ── Feed ── */}
        <p style={{ fontSize: 19, fontStyle: "italic", color: ink, margin: "4px 0 14px" }}>On the Mat</p>
        {FEED.map(post => (
          <div key={post.id} style={{ background: cream, borderRadius: 20, marginBottom: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <img src={post.avatar} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: `2px solid ${terraLight}` }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: ink, fontFamily: "system-ui, sans-serif" }}>{post.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: muted, fontFamily: "system-ui, sans-serif" }}>{post.time}</p>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 11, background: sageBg, color: sage, padding: "2px 8px", borderRadius: 8, fontFamily: "system-ui, sans-serif", fontWeight: 600 }}>{post.series}</span>
                  <span style={{ fontSize: 11, background: terraLight, color: terra, padding: "2px 8px", borderRadius: 8, fontFamily: "system-ui, sans-serif", fontWeight: 600 }}>{post.mood}</span>
                </div>
              </div>
            </div>
            <p style={{ margin: "0 0 10px", fontSize: 15, color: ink, lineHeight: 1.45, fontFamily: "system-ui, sans-serif" }}>{post.caption}</p>
            <div style={{ display: "flex", gap: 16 }}>
              <span style={{ fontSize: 13, color: terra, fontFamily: "system-ui, sans-serif" }}>❤️ {post.likes}</span>
              <span style={{ fontSize: 13, color: muted, fontFamily: "system-ui, sans-serif" }}>💬 1</span>
            </div>
          </div>
        ))}
      </div>

      {/* Design label */}
      <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: terra, color: "#fff", padding: "8px 20px", borderRadius: 20, fontSize: 13, fontWeight: 700, letterSpacing: 0.5, zIndex: 100, fontFamily: "system-ui, sans-serif" }}>
        Design C — Earth & Warmth
      </div>
    </div>
  );
}
