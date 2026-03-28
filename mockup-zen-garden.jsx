import { useState } from "react";

const zen = {
  bg: "#F7F3EE",
  card: "#FFFFFF",
  cardAlt: "#FAF8F5",
  header: "#2C2418",
  ink: "#2C2418",
  inkMid: "#5C4F3D",
  muted: "#9C8E7A",
  mutedLight: "#C4B8A6",
  accent: "#7B8C5E",
  accentLight: "#EDF2E4",
  accentDark: "#5A6B42",
  terracotta: "#C4755B",
  terracottaLight: "#FAE8E0",
  sand: "#D4C5A9",
  sandLight: "#F0EBE0",
  divider: "#E8E0D4",
  green: "#7B8C5E",
  heart: "#C4755B",
  white: "#FFFFFF",
  stone: "#8B7D6B",
};

export default function ZenGardenHome() {
  const [activeTab, setActiveTab] = useState("home");

  const stats = [
    { label: "Days", value: "127", sub: "streak" },
    { label: "Hours", value: "284", sub: "total" },
    { label: "Series", value: "2nd", sub: "current" },
  ];

  const schedule = [
    { time: "5:30 AM", label: "Mysore Practice", active: true, tag: "Primary" },
    { time: "6:45 AM", label: "Pranayama", active: false, tag: "Breath" },
    { time: "7:15 AM", label: "Meditation", active: false, tag: "Stillness" },
  ];

  const sangha = [
    { name: "Priya", series: "3rd", streak: 340, avatar: "P", color: zen.accent },
    { name: "Marcus", series: "2nd", streak: 89, avatar: "M", color: zen.terracotta },
    { name: "Yuki", series: "1st", streak: 210, avatar: "Y", color: zen.stone },
    { name: "Ava", series: "2nd", streak: 55, avatar: "A", color: zen.accent },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#E8E0D4", padding: 20, fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      <div style={{ width: 390, height: 844, background: zen.bg, borderRadius: 40, overflow: "hidden", boxShadow: "0 25px 80px rgba(44,36,24,0.2)", position: "relative", display: "flex", flexDirection: "column" }}>

        {/* Status bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 28px 0", fontSize: 13, fontWeight: 600, color: zen.ink, fontFamily: "system-ui" }}>
          <span>9:41</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ width: 17, height: 11, border: `1.5px solid ${zen.ink}`, borderRadius: 2.5, position: "relative" }}>
              <div style={{ position: "absolute", top: 1.5, left: 1.5, right: 3, bottom: 1.5, background: zen.ink, borderRadius: 1 }} />
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 90 }}>

          {/* Header */}
          <div style={{ padding: "20px 24px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, color: zen.muted, letterSpacing: 2, textTransform: "uppercase", fontFamily: "system-ui", fontWeight: 500 }}>Good Morning</div>
                <div style={{ fontSize: 28, color: zen.ink, fontWeight: 400, marginTop: 2, fontStyle: "italic" }}>Dudu</div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 22, background: zen.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: zen.white, fontSize: 18, fontFamily: "system-ui", fontWeight: 600 }}>D</span>
              </div>
            </div>
          </div>

          {/* Inspirational quote card */}
          <div style={{ margin: "0 20px 20px", padding: "24px 28px", background: zen.card, borderRadius: 20, border: `1px solid ${zen.divider}`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: 50, background: zen.accentLight, opacity: 0.5 }} />
            <div style={{ position: "absolute", bottom: -30, left: -10, width: 80, height: 80, borderRadius: 40, background: zen.sandLight, opacity: 0.4 }} />
            <div style={{ fontSize: 11, color: zen.accent, letterSpacing: 3, textTransform: "uppercase", fontFamily: "system-ui", fontWeight: 600, marginBottom: 10 }}>Today's Intention</div>
            <div style={{ fontSize: 18, color: zen.ink, lineHeight: 1.5, fontStyle: "italic", position: "relative" }}>
              "Practice and all is coming."
            </div>
            <div style={{ fontSize: 13, color: zen.muted, marginTop: 8, fontFamily: "system-ui" }}>— Sri K. Pattabhi Jois</div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 10, margin: "0 20px 20px" }}>
            {stats.map((s, i) => (
              <div key={i} style={{ flex: 1, background: i === 0 ? zen.accent : zen.card, borderRadius: 18, padding: "18px 14px", textAlign: "center", border: i === 0 ? "none" : `1px solid ${zen.divider}` }}>
                <div style={{ fontSize: 26, fontWeight: 300, color: i === 0 ? zen.white : zen.ink, fontFamily: "system-ui" }}>{s.value}</div>
                <div style={{ fontSize: 11, color: i === 0 ? "rgba(255,255,255,0.7)" : zen.muted, marginTop: 4, fontFamily: "system-ui", fontWeight: 500, letterSpacing: 1, textTransform: "uppercase" }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Today's Practice Schedule */}
          <div style={{ padding: "0 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: zen.muted, letterSpacing: 2, textTransform: "uppercase", fontFamily: "system-ui", fontWeight: 600 }}>Today's Practice</span>
              <span style={{ fontSize: 12, color: zen.accent, fontFamily: "system-ui", fontWeight: 500 }}>Moon Day</span>
            </div>
          </div>

          <div style={{ margin: "0 20px 22px" }}>
            {schedule.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 16, padding: "16px 18px",
                background: item.active ? zen.card : "transparent",
                borderRadius: 16,
                border: item.active ? `1px solid ${zen.divider}` : "none",
                marginBottom: 4,
                boxShadow: item.active ? "0 2px 12px rgba(44,36,24,0.06)" : "none",
              }}>
                <div style={{ width: 48, textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: item.active ? zen.ink : zen.mutedLight, fontFamily: "system-ui" }}>{item.time}</div>
                </div>
                <div style={{ width: 2, height: 36, background: item.active ? zen.accent : zen.divider, borderRadius: 1 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, color: item.active ? zen.ink : zen.muted, fontWeight: item.active ? 500 : 400, fontFamily: "system-ui" }}>{item.label}</div>
                </div>
                <div style={{ padding: "4px 12px", borderRadius: 20, background: item.active ? zen.accentLight : zen.sandLight, fontSize: 11, color: item.active ? zen.accent : zen.stone, fontFamily: "system-ui", fontWeight: 500 }}>{item.tag}</div>
              </div>
            ))}
          </div>

          {/* Sangha section */}
          <div style={{ padding: "0 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: zen.muted, letterSpacing: 2, textTransform: "uppercase", fontFamily: "system-ui", fontWeight: 600 }}>Sangha</span>
              <span style={{ fontSize: 12, color: zen.accent, fontFamily: "system-ui", fontWeight: 500 }}>See all →</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 14, padding: "0 20px", overflowX: "auto" }}>
            {sangha.map((p, i) => (
              <div key={i} style={{ minWidth: 80, textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: 32, border: `2.5px solid ${p.color}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", background: zen.card }}>
                  <div style={{ width: 54, height: 54, borderRadius: 27, background: `${p.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 20, color: p.color, fontWeight: 500, fontFamily: "system-ui" }}>{p.avatar}</span>
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: zen.ink, fontFamily: "system-ui" }}>{p.name}</div>
                <div style={{ fontSize: 10, color: zen.muted, fontFamily: "system-ui", marginTop: 2 }}>{p.streak}d streak</div>
              </div>
            ))}
          </div>

          {/* Log Practice CTA */}
          <div style={{ margin: "24px 20px 10px" }}>
            <div style={{
              background: `linear-gradient(135deg, ${zen.accent} 0%, ${zen.accentDark} 100%)`,
              borderRadius: 20, padding: "22px 24px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 600, color: zen.white, fontFamily: "system-ui" }}>Begin Practice</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: "system-ui", marginTop: 4 }}>Primary Series · Mysore</div>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 24, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 22, color: zen.white }}>▶</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom tab bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: zen.card, borderTop: `1px solid ${zen.divider}`,
          display: "flex", justifyContent: "space-around", alignItems: "center",
          paddingTop: 10, paddingBottom: 28,
        }}>
          {[
            { icon: "⌂", label: "Home", id: "home" },
            { icon: "◉", label: "Practice", id: "practice" },
            { icon: "☯", label: "Sangha", id: "sangha" },
            { icon: "◎", label: "Profile", id: "profile" },
          ].map((tab) => (
            <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ textAlign: "center", cursor: "pointer", opacity: activeTab === tab.id ? 1 : 0.4 }}>
              <div style={{ fontSize: 22, color: activeTab === tab.id ? zen.accent : zen.muted, lineHeight: 1 }}>{tab.icon}</div>
              <div style={{ fontSize: 10, color: activeTab === tab.id ? zen.accent : zen.muted, fontFamily: "system-ui", fontWeight: 500, marginTop: 3 }}>{tab.label}</div>
            </div>
          ))}
        </div>

        {/* Decorative label */}
        <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", background: zen.accent, color: zen.white, fontSize: 10, fontFamily: "system-ui", fontWeight: 600, padding: "3px 14px", borderRadius: 10, letterSpacing: 1 }}>ZEN GARDEN</div>
      </div>
    </div>
  );
}
