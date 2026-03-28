import { useState } from "react";

// Design A — "Minimal Zen"
// Clean white space, thin lines, soft shadows, monochrome accents with one pop color

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
  { id: 1, name: "Liat", time: "4 min ago", caption: "Just finished practice 🙏", avatar: "https://i.pravatar.cc/100?img=5", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&q=80", likes: 3 },
  { id: 2, name: "David", time: "15 min ago", caption: "Working on my dropbacks!", avatar: "https://i.pravatar.cc/100?img=11", img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&q=80", likes: 5 },
];

export default function DesignA() {
  const [practicing, setPracticing] = useState(false);

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", fontFamily: "'Inter', system-ui, sans-serif", background: "#FAFAFA", minHeight: "100vh", position: "relative" }}>

      {/* ── Top Bar ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "#FAFAFA" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 14 }}>🪷</span>
          </div>
          <span style={{ fontSize: 17, fontWeight: 600, color: "#1A1A1A", letterSpacing: -0.3 }}>Ashtanga Sangha</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", cursor: "pointer" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <div style={{ position: "absolute", top: -4, right: -6, background: "#E85D3A", borderRadius: 8, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 700, border: "2px solid #FAFAFA" }}>3</div>
          </div>
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "2px solid #E0E0E0" }} />
        </div>
      </div>

      {/* ── Welcome ── */}
      <div style={{ textAlign: "center", padding: "8px 20px 4px" }}>
        <p style={{ fontSize: 20, fontWeight: 300, color: "#1A1A1A", margin: 0, letterSpacing: -0.5 }}>
          Welcome back, <span style={{ fontWeight: 600 }}>David</span>
        </p>
      </div>

      {/* ── Yogis on the Mat ── */}
      <div style={{ textAlign: "center", padding: "16px 20px 12px" }}>
        <p style={{ fontSize: 13, color: "#888", margin: "0 0 12px", fontWeight: 400, letterSpacing: 1.5, textTransform: "uppercase" }}>
          {YOGIS.length} yogis on the mat today
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          {YOGIS.slice(0, 7).map((u, i) => (
            <div key={u.id} style={{ marginLeft: i === 0 ? 0 : -10, zIndex: 7 - i, width: 42, height: 42, borderRadius: "50%", border: "2.5px solid #FAFAFA", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
              {u.img ? (
                <img src={u.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 600 }}>D</div>
              )}
            </div>
          ))}
          <div style={{ marginLeft: -10, width: 42, height: 42, borderRadius: "50%", border: "2.5px solid #FAFAFA", background: "#F0F0F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#888", fontWeight: 600, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>+5</div>
        </div>
      </div>

      {/* ── Hero Card ── */}
      <div style={{ margin: "8px 16px 16px", borderRadius: 24, overflow: "hidden", height: 300, position: "relative", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}>
        <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 28 }}>
          <p style={{ fontStyle: "italic", fontSize: 26, fontWeight: 300, color: "#fff", lineHeight: 1.3, margin: "0 0 4px", textShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
            "Practice, and all is coming."
          </p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", margin: "0 0 24px", fontWeight: 400 }}>— Sri K. Pattabhi Jois</p>
          <button
            onClick={() => setPracticing(!practicing)}
            style={{
              width: "100%", padding: "16px 0", borderRadius: 14, border: "none", cursor: "pointer",
              background: practicing ? "#E85D3A" : "#1A1A1A",
              color: "#fff", fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase",
              transition: "all 0.3s ease",
              boxShadow: practicing ? "0 4px 20px rgba(232,93,58,0.4)" : "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            {practicing ? "✦  ON THE MAT" : "I AM PRACTICING NOW"}
          </button>
        </div>
      </div>

      {/* ── Practice Rhythm ── */}
      <div style={{ margin: "0 16px 16px", background: "#fff", borderRadius: 20, padding: "20px 24px", border: "1px solid #ECECEC" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A", margin: "0 0 16px", letterSpacing: 1, textTransform: "uppercase" }}>Practice Rhythm</p>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {RHYTHM.map((d, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11, color: "#999", fontWeight: 500 }}>{d.label}</span>
              <div style={{
                width: d.today ? 12 : 10, height: d.today ? 12 : 10, borderRadius: "50%",
                background: d.done ? "#1A1A1A" : d.today ? "#E85D3A" : d.rest ? "#DDD" : "#E8E8E8",
                boxShadow: d.today ? "0 0 0 3px rgba(232,93,58,0.2)" : "none",
              }} />
            </div>
          ))}
        </div>
        <div style={{ height: 1, background: "#F0F0F0", margin: "16px 0" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: "#666" }}>3 of 6 this week</span>
          <span style={{ fontSize: 12, background: "#FFF3ED", color: "#E85D3A", padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>🔥 12</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12 }}>
          <span style={{ fontSize: 14 }}>🌘</span>
          <span style={{ fontSize: 12, color: "#999" }}>Next Moon Day: Apr 2</span>
        </div>
      </div>

      {/* ── Feed ── */}
      <div style={{ margin: "0 16px 100px" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#1A1A1A", margin: "0 0 14px", letterSpacing: 1, textTransform: "uppercase" }}>Live Practice Feed</p>
        {FEED.map(post => (
          <div key={post.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #ECECEC", marginBottom: 12, overflow: "hidden" }}>
            <div style={{ display: "flex" }}>
              <div style={{ flex: 1, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <img src={post.avatar} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1A1A1A" }}>{post.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#999" }}>{post.time}</p>
                  </div>
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 14, color: "#444", lineHeight: 1.4 }}>{post.caption}</p>
                <div style={{ display: "flex", gap: 14 }}>
                  <span style={{ fontSize: 13, color: "#E85D3A" }}>❤️ {post.likes}</span>
                  <span style={{ fontSize: 13, color: "#999" }}>💬 1</span>
                </div>
              </div>
              <img src={post.img} style={{ width: 110, objectFit: "cover" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Design label */}
      <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "#1A1A1A", color: "#fff", padding: "8px 20px", borderRadius: 20, fontSize: 13, fontWeight: 600, letterSpacing: 0.5, zIndex: 100 }}>
        Design A — Minimal Zen
      </div>
    </div>
  );
}
