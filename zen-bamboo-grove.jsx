import { useState } from "react";

/*
 * ZEN GARDEN — Variation C: "Bamboo Grove"
 * Cool sage-and-mist palette with tall vertical rhythm.
 * Think Arashiyama bamboo forest — soft greens, fog whites,
 * and gentle vertical lines. Airy, spacious, breathing room.
 */

const b = {
  bg: "#F4F8F4",
  card: "#FFFFFF",
  cardMint: "#F0F7F1",
  ink: "#1A2E22",
  inkMid: "#3B5544",
  muted: "#7A9484",
  mutedLight: "#ACC4B5",
  bamboo: "#5B8A6A",
  bambooLight: "#D4E8DA",
  bambooDark: "#3E6B50",
  bambooFaint: "rgba(91,138,106,0.06)",
  mist: "#E8F0EB",
  mistDark: "#D0DED5",
  sky: "#8BAEB8",
  skyLight: "#E4F0F3",
  blossom: "#D4899B",
  blossomLight: "#FAEDF0",
  divider: "#DBE8DF",
  white: "#FFFFFF",
  shadow: "rgba(26,46,34,0.06)",
};

export default function ZenBambooGrove() {
  const [activeTab, setActiveTab] = useState("home");

  const weekData = [
    { day: "M", mins: 90, done: true },
    { day: "T", mins: 85, done: true },
    { day: "W", mins: 92, done: true },
    { day: "T", mins: 75, done: true },
    { day: "F", mins: 88, done: true },
    { day: "S", mins: 0, done: false },
    { day: "S", mins: 0, done: false },
  ];
  const maxMins = 92;

  const moonPhase = "🌒";

  const postures = [
    { name: "Standing", total: 17, completed: 17, color: b.bamboo },
    { name: "Seated", total: 23, completed: 14, color: b.sky },
    { name: "Finishing", total: 12, completed: 0, color: b.blossom },
  ];

  const sangha = [
    { name: "Priya", location: "Mumbai", avatar: "P", online: true, series: "3rd" },
    { name: "Marcus", location: "Berlin", avatar: "M", online: true, series: "2nd" },
    { name: "Yuki", location: "Kyoto", avatar: "Y", online: false, series: "1st" },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#D0DED5", padding: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: 390, height: 844, background: b.bg, borderRadius: 40, overflow: "hidden", boxShadow: `0 25px 80px ${b.shadow}`, position: "relative", display: "flex", flexDirection: "column" }}>

        {/* Status bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 28px 0", fontSize: 13, fontWeight: 600, color: b.ink }}>
          <span>9:41</span>
          <div style={{ width: 17, height: 11, border: `1.5px solid ${b.ink}`, borderRadius: 2.5, position: "relative" }}>
            <div style={{ position: "absolute", top: 1.5, left: 1.5, right: 3, bottom: 1.5, background: b.bamboo, borderRadius: 1 }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 90 }}>

          {/* Header — airy, spacious */}
          <div style={{ padding: "22px 24px 6px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 13, color: b.muted, fontWeight: 500 }}>Namaste</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: b.ink, marginTop: 4 }}>Dudu</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 24, lineHeight: 1 }}>{moonPhase}</div>
              <div style={{ width: 42, height: 42, borderRadius: 21, background: b.bamboo, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: b.white, fontSize: 16, fontWeight: 700 }}>D</span>
              </div>
            </div>
          </div>

          {/* Week bamboo chart — vertical bars like bamboo stalks */}
          <div style={{ margin: "16px 20px 20px", background: b.card, borderRadius: 22, padding: "20px 18px 16px", border: `1px solid ${b.divider}`, boxShadow: `0 2px 12px ${b.shadow}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, padding: "0 4px" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: b.ink }}>This Week</span>
              <span style={{ fontSize: 12, color: b.bamboo, fontWeight: 500 }}>5 of 7 days</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: 100, padding: "0 4px" }}>
              {weekData.map((d, i) => {
                const h = d.done ? (d.mins / maxMins) * 80 + 10 : 10;
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{
                      width: 28, height: h, borderRadius: 8,
                      background: d.done
                        ? `linear-gradient(180deg, ${b.bamboo} 0%, ${b.bambooLight} 100%)`
                        : b.mist,
                      transition: "height 0.3s ease",
                      position: "relative",
                    }}>
                      {d.done && (
                        <div style={{ position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", fontSize: 9, color: b.white, fontWeight: 700 }}>{d.mins}</div>
                      )}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: d.done ? b.ink : b.mutedLight }}>{d.day}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Practice progress — horizontal bar segments */}
          <div style={{ padding: "0 24px", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: b.ink }}>Today's Progress</span>
          </div>
          <div style={{ margin: "8px 20px 22px" }}>
            {postures.map((p, i) => {
              const pct = (p.completed / p.total) * 100;
              return (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, padding: "0 2px" }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: b.ink }}>{p.name}</span>
                    <span style={{ fontSize: 12, color: b.muted }}>{p.completed}/{p.total}</span>
                  </div>
                  <div style={{ height: 8, background: b.mist, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${pct}%`,
                      background: `linear-gradient(90deg, ${p.color}, ${p.color}90)`,
                      borderRadius: 4,
                      transition: "width 0.4s ease",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sangha — clean list cards */}
          <div style={{ padding: "0 24px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: b.ink }}>Sangha</span>
            <span style={{ fontSize: 12, color: b.bamboo, fontWeight: 500 }}>View all →</span>
          </div>
          <div style={{ margin: "0 20px 20px" }}>
            {sangha.map((p, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
                background: b.card, borderRadius: 16, marginBottom: 8,
                border: `1px solid ${b.divider}`,
              }}>
                <div style={{ position: "relative" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 22,
                    background: b.bambooLight,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 17, fontWeight: 600, color: b.bamboo }}>{p.avatar}</span>
                  </div>
                  {p.online && <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, background: b.bamboo, border: `2px solid ${b.card}` }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: b.ink }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: b.muted, marginTop: 2 }}>{p.location} · {p.series} Series</div>
                </div>
                {p.online && (
                  <div style={{ padding: "4px 10px", borderRadius: 10, background: b.bambooFaint, border: `1px solid ${b.bambooLight}` }}>
                    <span style={{ fontSize: 10, color: b.bamboo, fontWeight: 600 }}>On mat</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Begin Practice — bamboo green CTA */}
          <div style={{ margin: "0 20px 16px" }}>
            <div style={{
              background: `linear-gradient(135deg, ${b.bamboo} 0%, ${b.bambooDark} 100%)`,
              borderRadius: 22, padding: "22px 24px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              boxShadow: `0 6px 24px rgba(91,138,106,0.25)`,
            }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 600, color: b.white }}>Begin Practice</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>Primary Series · Mysore</div>
              </div>
              <div style={{ width: 50, height: 50, borderRadius: 25, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 20, color: b.white, marginLeft: 3 }}>▶</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: `${b.card}F5`, backdropFilter: "blur(16px)",
          borderTop: `1px solid ${b.divider}`,
          display: "flex", justifyContent: "space-around", paddingTop: 10, paddingBottom: 28,
        }}>
          {[
            { icon: "⌂", label: "Home", id: "home" },
            { icon: "◎", label: "Practice", id: "practice" },
            { icon: "☯", label: "Sangha", id: "sangha" },
            { icon: "◉", label: "Profile", id: "profile" },
          ].map(t => (
            <div key={t.id} onClick={() => setActiveTab(t.id)} style={{ textAlign: "center", cursor: "pointer" }}>
              <div style={{ fontSize: 22, lineHeight: 1, color: activeTab === t.id ? b.bamboo : b.mutedLight }}>{t.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 500, marginTop: 3, color: activeTab === t.id ? b.bamboo : b.mutedLight }}>{t.label}</div>
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", background: b.bamboo, color: b.white, fontSize: 9, fontWeight: 700, padding: "3px 12px", borderRadius: 10, letterSpacing: 1.5 }}>BAMBOO GROVE</div>
      </div>
    </div>
  );
}
