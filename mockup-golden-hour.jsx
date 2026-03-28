import { useState } from "react";

const gold = {
  bg: "#FFF9F0",
  card: "#FFFFFF",
  warmBg: "#FFF3E0",
  header: "#3D2415",
  ink: "#3D2415",
  inkMid: "#6B4C35",
  muted: "#A68B73",
  mutedLight: "#C9B5A0",
  accent: "#E8753A",
  accentLight: "#FFF0E6",
  accentDark: "#C45E28",
  coral: "#F07070",
  coralBg: "#FFF0EF",
  amber: "#F5A623",
  amberBg: "#FFF8EB",
  sage: "#6B9E7A",
  sageBg: "#ECF7EF",
  divider: "#F0E4D4",
  white: "#FFFFFF",
  cream: "#FAF0E2",
};

export default function GoldenHourHome() {
  const [activeTab, setActiveTab] = useState("home");

  const practiceRing = 0.72;

  const insights = [
    { label: "Avg Duration", value: "87 min", icon: "⏱", bg: gold.amberBg, color: gold.amber },
    { label: "Best Streak", value: "42 days", icon: "🔥", bg: gold.coralBg, color: gold.coral },
    { label: "Postures", value: "48", icon: "🧘", bg: gold.sageBg, color: gold.sage },
  ];

  const recentPractices = [
    { day: "Today", series: "Primary", duration: "92 min", mood: "🙏", highlight: true },
    { day: "Yesterday", series: "Primary", duration: "85 min", mood: "😊", highlight: false },
    { day: "Tuesday", series: "Led Class", duration: "75 min", mood: "💪", highlight: false },
  ];

  const community = [
    { name: "Ananya", status: "Practicing now", avatar: "A", ring: gold.sage },
    { name: "Carlos", status: "1h ago", avatar: "C", ring: gold.amber },
    { name: "Mei", status: "Practicing now", avatar: "M", ring: gold.sage },
    { name: "Ollie", status: "3h ago", avatar: "O", ring: gold.coral },
    { name: "+12", status: "", avatar: "👥", ring: gold.mutedLight },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#F0E4D4", padding: 20, fontFamily: "'system-ui', -apple-system, sans-serif" }}>
      <div style={{ width: 390, height: 844, background: gold.bg, borderRadius: 40, overflow: "hidden", boxShadow: "0 25px 80px rgba(61,36,21,0.15)", position: "relative", display: "flex", flexDirection: "column" }}>

        {/* Status bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 28px 0", fontSize: 13, fontWeight: 600, color: gold.ink }}>
          <span>9:41</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ width: 17, height: 11, border: `1.5px solid ${gold.ink}`, borderRadius: 2.5, position: "relative" }}>
              <div style={{ position: "absolute", top: 1.5, left: 1.5, right: 3, bottom: 1.5, background: gold.accent, borderRadius: 1 }} />
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 90 }}>

          {/* Header with warm gradient */}
          <div style={{
            padding: "18px 24px 24px",
            background: `linear-gradient(180deg, ${gold.warmBg} 0%, ${gold.bg} 100%)`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, color: gold.muted, fontWeight: 500 }}>Namaste,</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: gold.ink, marginTop: 2 }}>Dudu ☀️</div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 20, background: gold.card, border: `1px solid ${gold.divider}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔔</div>
                <div style={{ width: 40, height: 40, borderRadius: 20, background: `linear-gradient(135deg, ${gold.accent}, ${gold.amber})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: gold.white, fontSize: 16, fontWeight: 700 }}>D</span>
                </div>
              </div>
            </div>
          </div>

          {/* Practice ring card */}
          <div style={{ margin: "0 20px 20px", background: gold.card, borderRadius: 24, padding: "24px", border: `1px solid ${gold.divider}`, boxShadow: "0 4px 20px rgba(232,117,58,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              {/* Ring */}
              <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke={gold.divider} strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="url(#grad)" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${practiceRing * 264} ${264}`}
                    transform="rotate(-90 50 50)" />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={gold.accent} />
                      <stop offset="100%" stopColor={gold.amber} />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: gold.ink }}>72%</div>
                  <div style={{ fontSize: 9, color: gold.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5 }}>weekly</div>
                </div>
              </div>
              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: gold.ink, marginBottom: 6 }}>Today's Practice</div>
                <div style={{ fontSize: 13, color: gold.muted, lineHeight: 1.5 }}>Primary Series, Mysore style</div>
                <div style={{
                  marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8,
                  background: `linear-gradient(135deg, ${gold.accent}, ${gold.amber})`,
                  borderRadius: 14, padding: "10px 20px",
                  boxShadow: "0 4px 16px rgba(232,117,58,0.3)",
                }}>
                  <span style={{ color: gold.white, fontSize: 14, fontWeight: 600 }}>Log Practice</span>
                  <span style={{ color: gold.white, fontSize: 12 }}>→</span>
                </div>
              </div>
            </div>
          </div>

          {/* Insight chips */}
          <div style={{ display: "flex", gap: 10, margin: "0 20px 22px" }}>
            {insights.map((item, i) => (
              <div key={i} style={{
                flex: 1, background: item.bg, borderRadius: 18, padding: "14px 10px", textAlign: "center",
                border: `1px solid ${item.color}20`,
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{item.icon}</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: gold.ink }}>{item.value}</div>
                <div style={{ fontSize: 10, color: gold.muted, marginTop: 2, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.3 }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Community row */}
          <div style={{ padding: "0 24px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: gold.ink }}>Sangha</span>
              <span style={{ fontSize: 12, color: gold.accent, fontWeight: 600 }}>View all</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, padding: "0 20px", overflowX: "auto", marginBottom: 22 }}>
            {community.map((p, i) => (
              <div key={i} style={{ textAlign: "center", minWidth: 62 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 28,
                  background: `linear-gradient(135deg, ${p.ring}, ${p.ring}90)`,
                  padding: 2.5, margin: "0 auto 6px",
                }}>
                  <div style={{
                    width: "100%", height: "100%", borderRadius: 26, background: gold.card,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: i === 4 ? 18 : 18, fontWeight: 600, color: p.ring }}>{p.avatar}</span>
                  </div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: gold.ink }}>{p.name}</div>
                {p.status && <div style={{ fontSize: 9, color: p.status.includes("now") ? gold.sage : gold.muted, fontWeight: 500, marginTop: 1 }}>{p.status}</div>}
              </div>
            ))}
          </div>

          {/* Recent practices */}
          <div style={{ padding: "0 24px", marginBottom: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: gold.ink }}>Recent Practice</span>
          </div>
          <div style={{ margin: "0 20px" }}>
            {recentPractices.map((p, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                background: p.highlight ? gold.card : "transparent",
                borderRadius: 16,
                border: p.highlight ? `1px solid ${gold.divider}` : "none",
                marginBottom: 4,
                boxShadow: p.highlight ? "0 2px 12px rgba(232,117,58,0.06)" : "none",
              }}>
                <div style={{ fontSize: 24 }}>{p.mood}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: p.highlight ? gold.ink : gold.inkMid }}>{p.day}</div>
                  <div style={{ fontSize: 12, color: gold.muted, marginTop: 2 }}>{p.series}</div>
                </div>
                <div style={{
                  padding: "5px 12px", borderRadius: 12,
                  background: p.highlight ? gold.accentLight : gold.cream,
                  fontSize: 12, fontWeight: 600,
                  color: p.highlight ? gold.accent : gold.muted,
                }}>{p.duration}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tab bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: `${gold.card}F5`,
          backdropFilter: "blur(16px)",
          borderTop: `1px solid ${gold.divider}`,
          display: "flex", justifyContent: "space-around", alignItems: "center",
          paddingTop: 10, paddingBottom: 28,
        }}>
          {[
            { icon: "☀", label: "Home", id: "home" },
            { icon: "🕉", label: "Practice", id: "practice" },
            { icon: "👥", label: "Sangha", id: "sangha" },
            { icon: "🪷", label: "Profile", id: "profile" },
          ].map((tab) => (
            <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ textAlign: "center", cursor: "pointer", opacity: activeTab === tab.id ? 1 : 0.45 }}>
              <div style={{ fontSize: 22, lineHeight: 1 }}>{tab.icon}</div>
              <div style={{ fontSize: 10, fontWeight: activeTab === tab.id ? 600 : 500, marginTop: 3, color: activeTab === tab.id ? gold.accent : gold.muted }}>{tab.label}</div>
            </div>
          ))}
        </div>

        {/* Theme label */}
        <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg, ${gold.accent}, ${gold.amber})`, color: gold.white, fontSize: 10, fontWeight: 700, padding: "3px 14px", borderRadius: 10, letterSpacing: 1 }}>GOLDEN HOUR</div>
      </div>
    </div>
  );
}
