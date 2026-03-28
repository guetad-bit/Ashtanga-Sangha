import { useState } from "react";

// Design B — "Bold Gradient"
// Deep indigo-to-purple gradient header, glassmorphism cards, vibrant accents, modern feel

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
  { label: "S", done: true },
  { label: "M", done: true },
  { label: "T", done: true },
  { label: "W", done: false },
  { label: "T", done: false, today: true },
  { label: "F", done: false },
  { label: "S", done: false, rest: true },
];

const FEED = [
  { id: 1, name: "Liat", time: "4m", caption: "Just finished practice 🙏", avatar: "https://i.pravatar.cc/100?img=5", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&q=80", likes: 3 },
  { id: 2, name: "David", time: "15m", caption: "Working on my dropbacks!", avatar: "https://i.pravatar.cc/100?img=11", img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&q=80", likes: 5 },
];

export default function DesignB() {
  const [practicing, setPracticing] = useState(false);

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", fontFamily: "'Inter', system-ui, sans-serif", background: "#0F0B1E", minHeight: "100vh", position: "relative", color: "#fff" }}>

      {/* ── Gradient Header Section ── */}
      <div style={{ background: "linear-gradient(135deg, #1B0F3B 0%, #3B1D7A 40%, #6C3BAA 70%, #A855F7 100%)", borderRadius: "0 0 32px 32px", paddingBottom: 24 }}>

        {/* Top Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 12, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 16 }}>🪷</span>
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>Sangha</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative", cursor: "pointer", width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <div style={{ position: "absolute", top: -3, right: -3, background: "#F97316", borderRadius: 8, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 700, border: "2px solid #3B1D7A" }}>3</div>
            </div>
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" style={{ width: 38, height: 38, borderRadius: 12, objectFit: "cover", border: "2px solid rgba(255,255,255,0.3)" }} />
          </div>
        </div>

        {/* Welcome & Yogis */}
        <div style={{ padding: "8px 24px 0" }}>
          <p style={{ fontSize: 26, fontWeight: 300, margin: "0 0 4px", color: "rgba(255,255,255,0.9)" }}>
            Good morning,
          </p>
          <p style={{ fontSize: 30, fontWeight: 800, margin: "0 0 20px", background: "linear-gradient(90deg, #fff, #E0C3FC)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            David ✨
          </p>

          {/* Yogis row */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex" }}>
              {YOGIS.slice(0, 5).map((u, i) => (
                <div key={u.id} style={{ marginLeft: i === 0 ? 0 : -12, zIndex: 5 - i, width: 40, height: 40, borderRadius: "50%", border: "2.5px solid #3B1D7A", overflow: "hidden" }}>
                  {u.img ? (
                    <img src={u.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "#A855F7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>D</div>
                  )}
                </div>
              ))}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff" }}>12 yogis</p>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>on the mat today</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ padding: "20px 16px 100px" }}>

        {/* ── Hero / Practice Card ── */}
        <div style={{
          borderRadius: 24, overflow: "hidden", height: 260, position: "relative", marginBottom: 16,
          boxShadow: "0 8px 40px rgba(168,85,247,0.2)",
        }}>
          <img src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,11,30,0.2) 0%, rgba(15,11,30,0.85) 100%)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 24 }}>
            <p style={{ fontStyle: "italic", fontSize: 22, fontWeight: 300, color: "rgba(255,255,255,0.95)", lineHeight: 1.35, margin: "0 0 4px" }}>
              "Practice, and all is coming."
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "0 0 20px" }}>— Sri K. Pattabhi Jois</p>
            <button
              onClick={() => setPracticing(!practicing)}
              style={{
                width: "100%", padding: "15px 0", borderRadius: 16, border: "none", cursor: "pointer",
                background: practicing ? "linear-gradient(135deg, #F97316, #EA580C)" : "linear-gradient(135deg, #A855F7, #7C3AED)",
                color: "#fff", fontSize: 14, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase",
                transition: "all 0.3s ease",
                boxShadow: practicing ? "0 4px 24px rgba(249,115,22,0.4)" : "0 4px 24px rgba(168,85,247,0.4)",
              }}
            >
              {practicing ? "✦  ON THE MAT" : "I AM PRACTICING NOW"}
            </button>
          </div>
        </div>

        {/* ── Rhythm Card (glass) ── */}
        <div style={{
          background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)",
          borderRadius: 20, padding: "18px 20px", marginBottom: 16,
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>Practice Rhythm</span>
            <span style={{ fontSize: 12, background: "rgba(249,115,22,0.15)", color: "#F97316", padding: "4px 10px", borderRadius: 20, fontWeight: 700 }}>🔥 12</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            {RHYTHM.map((d, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{d.label}</span>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: d.done ? "linear-gradient(135deg, #A855F7, #7C3AED)" : d.today ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.05)",
                  border: d.today ? "2px solid #F97316" : d.done ? "none" : "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {d.done && <span style={{ fontSize: 14 }}>✓</span>}
                  {d.today && <span style={{ fontSize: 8, color: "#F97316" }}>●</span>}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>3 of 6 this week</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 4 }}>🌘 Moon Day: Apr 2</span>
          </div>
        </div>

        {/* ── Feed ── */}
        <p style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.9)", margin: "0 0 14px" }}>Live Feed</p>
        {FEED.map(post => (
          <div key={post.id} style={{
            background: "rgba(255,255,255,0.06)", borderRadius: 18, marginBottom: 12, overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{ display: "flex" }}>
              <div style={{ flex: 1, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <img src={post.avatar} style={{ width: 34, height: 34, borderRadius: 10, objectFit: "cover" }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{post.name}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{post.time}</p>
                  </div>
                </div>
                <p style={{ margin: "0 0 10px", fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>{post.caption}</p>
                <div style={{ display: "flex", gap: 14 }}>
                  <span style={{ fontSize: 13, color: "#F97316" }}>❤️ {post.likes}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>💬 1</span>
                </div>
              </div>
              <img src={post.img} style={{ width: 100, objectFit: "cover", borderRadius: "0 18px 18px 0" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Design label */}
      <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #A855F7, #7C3AED)", color: "#fff", padding: "8px 20px", borderRadius: 20, fontSize: 13, fontWeight: 700, letterSpacing: 0.5, zIndex: 100 }}>
        Design B — Bold Gradient
      </div>
    </div>
  );
}
