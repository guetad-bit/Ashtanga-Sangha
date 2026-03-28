import { useState } from "react";

/*
 * ZEN GARDEN — Variation B: "Wabi-Sabi"
 * Embracing imperfection. Warm parchment tones, hand-drawn feel,
 * asymmetric layouts, ink-wash inspired accents. Think tea-stained
 * paper with brush-stroke dividers and organic shapes.
 */

const w = {
  bg: "#F5EDE0",
  card: "#FFFDF8",
  cardWarm: "#FBF5EB",
  ink: "#2E2219",
  inkSoft: "#5C4A38",
  muted: "#9B8872",
  mutedLight: "#C4B49D",
  brushInk: "#3D2E1E",
  rust: "#B56B45",
  rustLight: "#FAE8DD",
  rustFaint: "rgba(181,107,69,0.08)",
  indigo: "#4A5980",
  indigoLight: "#E8ECF4",
  clay: "#C49070",
  clayLight: "#F4E6D8",
  sage: "#7A8B6F",
  sageFaint: "rgba(122,139,111,0.1)",
  divider: "#E0D5C4",
  white: "#FFFDF8",
  cream: "#F0E6D4",
};

export default function ZenWabiSabi() {
  const [activeTab, setActiveTab] = useState("home");

  const stats = [
    { value: "127", unit: "days", label: "unbroken", color: w.rust },
    { value: "284", unit: "hrs", label: "on the mat", color: w.indigo },
    { value: "2nd", unit: "", label: "series", color: w.sage },
  ];

  const todayFlow = [
    { posture: "Sūrya Namaskāra A", count: "5×", done: true },
    { posture: "Sūrya Namaskāra B", count: "5×", done: true },
    { posture: "Standing Sequence", count: "17 āsana", done: false },
    { posture: "Primary Seated", count: "23 āsana", done: false },
    { posture: "Finishing", count: "12 āsana", done: false },
  ];

  const sangha = [
    { name: "Priya", avatar: "प", streak: 340, practicing: true },
    { name: "Marcus", avatar: "M", streak: 89, practicing: true },
    { name: "Yuki", avatar: "幸", streak: 210, practicing: false },
    { name: "Ava", avatar: "A", streak: 55, practicing: false },
  ];

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#E0D5C4", padding: 20, fontFamily: "'Georgia', 'Palatino', serif" }}>
      <div style={{ width: 390, height: 844, background: w.bg, borderRadius: 40, overflow: "hidden", boxShadow: "0 25px 80px rgba(46,34,25,0.18)", position: "relative", display: "flex", flexDirection: "column" }}>

        {/* Status bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 28px 0", fontSize: 13, fontWeight: 600, color: w.ink, fontFamily: "system-ui" }}>
          <span>9:41</span>
          <div style={{ width: 17, height: 11, border: `1.5px solid ${w.ink}`, borderRadius: 2.5, position: "relative" }}>
            <div style={{ position: "absolute", top: 1.5, left: 1.5, right: 3, bottom: 1.5, background: w.rust, borderRadius: 1 }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 90 }}>

          {/* Header — hand-lettered feel */}
          <div style={{ padding: "24px 26px 8px" }}>
            <div style={{ fontSize: 11, color: w.muted, letterSpacing: 4, textTransform: "uppercase", fontFamily: "system-ui", fontWeight: 500 }}>Thursday Morning</div>
            <div style={{ fontSize: 34, fontWeight: 400, color: w.ink, marginTop: 6, fontStyle: "italic", lineHeight: 1.1 }}>Dudu</div>
          </div>

          {/* Brush-stroke divider */}
          <div style={{ margin: "8px 26px 16px", height: 2, background: `linear-gradient(90deg, ${w.brushInk} 0%, ${w.brushInk}40 30%, transparent 70%)`, borderRadius: 2 }} />

          {/* Intention — parchment card with torn-edge feel */}
          <div style={{ margin: "0 20px 22px", position: "relative" }}>
            <div style={{ padding: "28px 26px", background: w.card, borderRadius: 4, borderLeft: `3px solid ${w.rust}`, boxShadow: "2px 3px 12px rgba(46,34,25,0.06)" }}>
              <div style={{ fontSize: 19, color: w.ink, fontWeight: 400, lineHeight: 1.7, fontStyle: "italic" }}>
                "Do your practice<br/>and all is coming."
              </div>
              <div style={{ marginTop: 14, fontSize: 12, color: w.muted, fontFamily: "system-ui", fontStyle: "normal" }}>— Guruji</div>
            </div>
          </div>

          {/* Stats — organic, offset cards */}
          <div style={{ display: "flex", gap: 10, margin: "0 20px 24px", alignItems: "flex-start" }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                flex: 1, background: w.card, borderRadius: 4, padding: "20px 12px",
                textAlign: "center", marginTop: i === 1 ? 10 : i === 2 ? 4 : 0,
                boxShadow: "1px 2px 8px rgba(46,34,25,0.05)",
                borderTop: `2px solid ${s.color}`,
              }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 3 }}>
                  <span style={{ fontSize: 28, fontWeight: 300, color: w.ink }}>{s.value}</span>
                  {s.unit && <span style={{ fontSize: 12, color: w.muted, fontFamily: "system-ui" }}>{s.unit}</span>}
                </div>
                <div style={{ fontSize: 10, color: w.muted, marginTop: 6, fontFamily: "system-ui", fontWeight: 500, letterSpacing: 1.5, textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Today's Flow — checklist with ink-brush marks */}
          <div style={{ padding: "0 26px", marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: w.muted, letterSpacing: 4, textTransform: "uppercase", fontFamily: "system-ui", fontWeight: 500 }}>Today's Flow</div>
          </div>
          <div style={{ margin: "8px 20px 22px", background: w.card, borderRadius: 4, overflow: "hidden", boxShadow: "1px 2px 8px rgba(46,34,25,0.05)" }}>
            {todayFlow.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 20px",
                borderBottom: i < todayFlow.length - 1 ? `1px solid ${w.divider}` : "none",
                opacity: item.done ? 0.5 : 1,
              }}>
                {/* Brush checkmark */}
                <div style={{
                  width: 26, height: 26, borderRadius: 3,
                  border: `1.5px solid ${item.done ? w.rust : w.divider}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: item.done ? w.rustFaint : "transparent",
                }}>
                  {item.done && <span style={{ fontSize: 16, color: w.rust, fontWeight: 700, marginTop: -2 }}>✓</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 14, color: w.ink, fontWeight: 400,
                    textDecoration: item.done ? "line-through" : "none",
                    textDecorationColor: w.mutedLight,
                  }}>{item.posture}</div>
                </div>
                <div style={{ fontSize: 11, color: w.muted, fontFamily: "system-ui", fontWeight: 500 }}>{item.count}</div>
              </div>
            ))}
          </div>

          {/* Sangha — circular with brush-ring */}
          <div style={{ padding: "0 26px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: w.muted, letterSpacing: 4, textTransform: "uppercase", fontFamily: "system-ui", fontWeight: 500 }}>Sangha</span>
            <span style={{ fontSize: 11, color: w.rust, fontFamily: "system-ui", fontWeight: 500 }}>See all →</span>
          </div>
          <div style={{ display: "flex", gap: 18, padding: "0 26px", marginBottom: 24 }}>
            {sangha.map((p, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ position: "relative", width: 60, height: 60, margin: "0 auto 8px" }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: 30,
                    border: `2px solid ${p.practicing ? w.sage : w.divider}`,
                    background: p.practicing ? w.sageFaint : w.card,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 22, fontWeight: 300, color: p.practicing ? w.sage : w.muted }}>{p.avatar}</span>
                  </div>
                  {p.practicing && (
                    <div style={{ position: "absolute", bottom: -2, right: -2, width: 14, height: 14, borderRadius: 7, background: w.sage, border: `2.5px solid ${w.bg}` }} />
                  )}
                </div>
                <div style={{ fontSize: 11, fontWeight: 500, color: w.ink, fontFamily: "system-ui" }}>{p.name}</div>
                <div style={{ fontSize: 10, color: w.muted, fontFamily: "system-ui" }}>{p.streak}d</div>
              </div>
            ))}
          </div>

          {/* Begin Practice — warm rust CTA */}
          <div style={{ margin: "0 20px 16px" }}>
            <div style={{
              background: w.rust, borderRadius: 4, padding: "22px 24px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              boxShadow: "0 4px 20px rgba(181,107,69,0.2)",
            }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 400, color: w.white, fontStyle: "italic" }}>Begin Practice</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "system-ui", marginTop: 4, fontStyle: "normal" }}>Primary Series · Mysore</div>
              </div>
              <div style={{ width: 46, height: 46, borderRadius: 23, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 20, color: w.white, marginLeft: 3 }}>▶</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: w.card, borderTop: `1px solid ${w.divider}`,
          display: "flex", justifyContent: "space-around", paddingTop: 10, paddingBottom: 28,
        }}>
          {[
            { icon: "⌂", label: "Home", id: "home" },
            { icon: "◉", label: "Practice", id: "practice" },
            { icon: "☯", label: "Sangha", id: "sangha" },
            { icon: "◎", label: "Profile", id: "profile" },
          ].map(t => (
            <div key={t.id} onClick={() => setActiveTab(t.id)} style={{ textAlign: "center", cursor: "pointer" }}>
              <div style={{ fontSize: 22, lineHeight: 1, color: activeTab === t.id ? w.rust : w.mutedLight }}>{t.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 500, marginTop: 3, color: activeTab === t.id ? w.rust : w.mutedLight, fontFamily: "system-ui" }}>{t.label}</div>
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", background: w.rust, color: w.white, fontSize: 9, fontWeight: 700, padding: "3px 12px", borderRadius: 10, letterSpacing: 1.5, fontFamily: "system-ui" }}>WABI-SABI</div>
      </div>
    </div>
  );
}
