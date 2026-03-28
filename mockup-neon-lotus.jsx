import { useState } from "react";

const neon = {
  bg: "#0D0F1A",
  bgCard: "#161929",
  bgCardHover: "#1C2038",
  surface: "#1E2140",
  ink: "#EAEDF6",
  inkMid: "#B0B8D4",
  muted: "#6B7499",
  mutedDark: "#3D4566",
  accent: "#8B5CF6",
  accentGlow: "rgba(139,92,246,0.25)",
  cyan: "#22D3EE",
  cyanGlow: "rgba(34,211,238,0.2)",
  pink: "#F472B6",
  pinkGlow: "rgba(244,114,182,0.2)",
  green: "#34D399",
  greenGlow: "rgba(52,211,153,0.2)",
  amber: "#FBBF24",
  divider: "#252A42",
  white: "#FFFFFF",
};

export default function NeonLotusHome() {
  const [activeTab, setActiveTab] = useState("home");

  const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
  const weekDone = [true, true, true, true, true, false, false];

  const practiceStats = [
    { label: "Current Streak", value: "42", unit: "days", color: neon.cyan, glow: neon.cyanGlow },
    { label: "This Week", value: "5/7", unit: "sessions", color: neon.green, glow: neon.greenGlow },
    { label: "Total Hours", value: "186", unit: "hrs", color: neon.pink, glow: neon.pinkGlow },
  ];

  const feed = [
    { user: "Kira M.", action: "completed Intermediate Series", time: "2h ago", avatar: "K", color: neon.pink },
    { user: "Raj P.", action: "started a 30-day challenge", time: "4h ago", avatar: "R", color: neon.cyan },
    { user: "Sofia L.", action: "logged 200th practice", time: "6h ago", avatar: "S", color: neon.green },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#06070F", padding: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: 390, height: 844, background: neon.bg, borderRadius: 40, overflow: "hidden", boxShadow: `0 0 80px ${neon.accentGlow}, 0 25px 60px rgba(0,0,0,0.5)`, position: "relative", display: "flex", flexDirection: "column" }}>

        {/* Status bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 28px 0", fontSize: 13, fontWeight: 600, color: neon.ink }}>
          <span>9:41</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ width: 17, height: 11, border: `1.5px solid ${neon.ink}`, borderRadius: 2.5, position: "relative" }}>
              <div style={{ position: "absolute", top: 1.5, left: 1.5, right: 3, bottom: 1.5, background: neon.cyan, borderRadius: 1 }} />
            </div>
          </div>
        </div>

        {/* Scrollable */}
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 90 }}>

          {/* Header */}
          <div style={{ padding: "20px 24px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, color: neon.muted, fontWeight: 500 }}>Welcome back</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: neon.ink, marginTop: 2 }}>Dudu</div>
            </div>
            <div style={{ width: 46, height: 46, borderRadius: 23, background: `linear-gradient(135deg, ${neon.accent}, ${neon.pink})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 20px ${neon.accentGlow}` }}>
              <span style={{ color: neon.white, fontSize: 18, fontWeight: 700 }}>D</span>
            </div>
          </div>

          {/* Week tracker */}
          <div style={{ margin: "0 20px 20px", background: neon.bgCard, borderRadius: 20, padding: "18px 20px", border: `1px solid ${neon.divider}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: neon.inkMid }}>This Week</span>
              <span style={{ fontSize: 12, color: neon.cyan, fontWeight: 500 }}>5 of 7</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {weekDays.map((d, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: neon.muted, marginBottom: 8, fontWeight: 500 }}>{d}</div>
                  <div style={{
                    width: 36, height: 36, borderRadius: 18,
                    background: weekDone[i] ? `linear-gradient(135deg, ${neon.accent}, ${neon.cyan})` : neon.surface,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: weekDone[i] ? `0 0 12px ${neon.accentGlow}` : "none",
                  }}>
                    {weekDone[i] ? (
                      <span style={{ color: neon.white, fontSize: 14, fontWeight: 700 }}>✓</span>
                    ) : (
                      <span style={{ color: neon.mutedDark, fontSize: 14 }}>·</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats cards */}
          <div style={{ display: "flex", gap: 10, margin: "0 20px 20px" }}>
            {practiceStats.map((s, i) => (
              <div key={i} style={{
                flex: 1, background: neon.bgCard, borderRadius: 18, padding: "16px 12px", textAlign: "center",
                border: `1px solid ${neon.divider}`, position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: -15, right: -15, width: 50, height: 50, borderRadius: 25, background: s.glow }} />
                <div style={{ fontSize: 24, fontWeight: 700, color: s.color, position: "relative" }}>{s.value}</div>
                <div style={{ fontSize: 10, color: neon.muted, marginTop: 4, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5, position: "relative" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Practice CTA — glowing card */}
          <div style={{ margin: "0 20px 22px", position: "relative" }}>
            <div style={{ position: "absolute", inset: -2, borderRadius: 22, background: `linear-gradient(135deg, ${neon.accent}, ${neon.cyan}, ${neon.pink})`, opacity: 0.5, filter: "blur(8px)" }} />
            <div style={{
              position: "relative", background: neon.bgCard, borderRadius: 20, padding: "22px 22px",
              border: `1px solid ${neon.divider}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: neon.ink }}>Start Practice</div>
                <div style={{ fontSize: 12, color: neon.muted, marginTop: 4 }}>Primary Series · 90 min</div>
              </div>
              <div style={{
                width: 50, height: 50, borderRadius: 25,
                background: `linear-gradient(135deg, ${neon.accent}, ${neon.cyan})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 24px ${neon.accentGlow}`,
              }}>
                <span style={{ fontSize: 20, color: neon.white, marginLeft: 3 }}>▶</span>
              </div>
            </div>
          </div>

          {/* Live indicator */}
          <div style={{ padding: "0 24px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: neon.green, boxShadow: `0 0 8px ${neon.greenGlow}` }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: neon.inkMid }}>Community Feed</span>
              <span style={{ fontSize: 11, color: neon.muted, fontWeight: 500, marginLeft: "auto" }}>3 practicing now</span>
            </div>
          </div>

          {/* Feed items */}
          <div style={{ margin: "0 20px" }}>
            {feed.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                background: neon.bgCard, borderRadius: 16, marginBottom: 8,
                border: `1px solid ${neon.divider}`,
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 21,
                  background: `${item.color}20`, border: `1.5px solid ${item.color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: item.color }}>{item.avatar}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: neon.ink }}>
                    <span style={{ fontWeight: 600 }}>{item.user}</span>{" "}
                    <span style={{ color: neon.inkMid }}>{item.action}</span>
                  </div>
                  <div style={{ fontSize: 11, color: neon.muted, marginTop: 3 }}>{item.time}</div>
                </div>
                <div style={{ fontSize: 18, color: neon.mutedDark }}>›</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tab bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: `${neon.bg}F0`, backdropFilter: "blur(20px)",
          borderTop: `1px solid ${neon.divider}`,
          display: "flex", justifyContent: "space-around", alignItems: "center",
          paddingTop: 10, paddingBottom: 28,
        }}>
          {[
            { icon: "⌂", label: "Home", id: "home", color: neon.cyan },
            { icon: "◉", label: "Practice", id: "practice", color: neon.accent },
            { icon: "♡", label: "Community", id: "community", color: neon.pink },
            { icon: "◎", label: "Profile", id: "profile", color: neon.green },
          ].map((tab) => (
            <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ textAlign: "center", cursor: "pointer" }}>
              <div style={{
                fontSize: 22, lineHeight: 1,
                color: activeTab === tab.id ? tab.color : neon.mutedDark,
                filter: activeTab === tab.id ? `drop-shadow(0 0 6px ${tab.color}60)` : "none",
              }}>{tab.icon}</div>
              <div style={{
                fontSize: 10, fontWeight: 500, marginTop: 3,
                color: activeTab === tab.id ? tab.color : neon.mutedDark,
              }}>{tab.label}</div>
            </div>
          ))}
        </div>

        {/* Theme label */}
        <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg, ${neon.accent}, ${neon.pink})`, color: neon.white, fontSize: 10, fontWeight: 700, padding: "3px 14px", borderRadius: 10, letterSpacing: 1 }}>NEON LOTUS</div>
      </div>
    </div>
  );
}
