import { useState } from "react";

/*
 * ZEN GARDEN — "Stone & Moss" (v3 — social + daily encouragement)
 *
 * Philosophy: No medals in yoga. No timers, no streaks, no hours.
 * The only thing that matters is getting on the mat — every day.
 * The Sangha lifts you up. Seeing others practice inspires you to show up.
 *
 * Palette: Light beige, light wood, light olive green.
 */

const z = {
  bg: "#F6F2EC",
  card: "#FFFFFF",
  cardWarm: "#FBF8F3",
  wood: "#D4C4AB",
  woodLight: "#EDE6DA",
  woodMid: "#B8A88E",
  beige: "#F0EAE0",
  beigeDark: "#E4DACE",
  olive: "#8A9E78",
  oliveLight: "#DCE8D3",
  oliveMid: "#6E8A5C",
  oliveFaint: "rgba(138,158,120,0.08)",
  ink: "#3B3228",
  inkSoft: "#5E5245",
  muted: "#9B8E7E",
  mutedLight: "#C4B8A8",
  divider: "#E8E0D4",
  white: "#FFFFFF",
  warmGlow: "rgba(212,196,171,0.3)",
};

export default function ZenStoneMoss() {
  const [activeTab, setActiveTab] = useState("home");
  const [loggedToday, setLoggedToday] = useState(false);
  const [cheered, setCheered] = useState({});

  // Week — only checkmarks, no durations
  const week = [
    { day: "Mon", onMat: true },
    { day: "Tue", onMat: true },
    { day: "Wed", onMat: false },
    { day: "Thu", onMat: true },
    { day: "Fri", onMat: true },
    { day: "Sat", onMat: false },
    { day: "Sun", onMat: false },
  ];
  const today = 5; // Friday index

  // Sangha activity feed — social and encouraging
  const sangha = [
    { name: "Priya", avatar: "P", status: "on_mat", note: "On the mat right now", time: "3 min ago", cheers: 4 },
    { name: "Marcus", avatar: "M", status: "on_mat", note: "On the mat right now", time: "12 min ago", cheers: 7 },
    { name: "Yuki", avatar: "Y", status: "done", note: "Practiced this morning", time: "2h ago", cheers: 11 },
    { name: "Ava", avatar: "A", status: "done", note: "Practiced this morning", time: "5h ago", cheers: 3 },
    { name: "Lior", avatar: "L", status: "away", note: "Last on mat: yesterday", time: "", cheers: 0 },
    { name: "Sara", avatar: "S", status: "away", note: "Last on mat: 2 days ago", time: "", cheers: 0 },
  ];

  const onMatNow = sangha.filter(p => p.status === "on_mat").length;
  const practicedToday = sangha.filter(p => p.status === "on_mat" || p.status === "done").length;

  const gentleReminders = [
    "Your mat is waiting. No rush.",
    "Even one breath on the mat counts.",
    "You don't need to be perfect. Just present.",
    "Your Sangha is practicing. Join them.",
  ];

  const intentions = [
    { text: "Move with breath", icon: "🌿" },
    { text: "Listen to my body", icon: "🪨" },
    { text: "Let go of expectations", icon: "🍃" },
  ];

  const toggleCheer = (name) => {
    setCheered(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#E4DACE", padding: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: 390, height: 844, background: z.bg, borderRadius: 40, overflow: "hidden", boxShadow: "0 25px 80px rgba(59,50,40,0.12)", position: "relative", display: "flex", flexDirection: "column" }}>

        {/* Status bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 28px 0", fontSize: 13, fontWeight: 600, color: z.ink }}>
          <span>9:41</span>
          <div style={{ width: 17, height: 11, border: `1.5px solid ${z.ink}`, borderRadius: 2.5, position: "relative" }}>
            <div style={{ position: "absolute", top: 1.5, left: 1.5, right: 3, bottom: 1.5, background: z.olive, borderRadius: 1 }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 90 }}>

          {/* Header with live Sangha count */}
          <div style={{ padding: "22px 24px 8px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 12, color: z.muted, fontWeight: 500, letterSpacing: 3, textTransform: "uppercase" }}>Good Morning</div>
              <div style={{ fontSize: 30, fontWeight: 300, color: z.ink, marginTop: 4, letterSpacing: -0.5 }}>Dudu</div>
            </div>
            {/* Live indicator — who's on the mat right now */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: z.oliveLight, borderRadius: 20, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: z.olive, animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: z.oliveMid }}>{onMatNow} on the mat</span>
            </div>
          </div>

          {/* Intention stone — the core message */}
          <div style={{ margin: "14px 20px 20px", padding: "28px 24px", background: z.card, borderRadius: 24, border: `1px solid ${z.divider}`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -30, width: 130, height: 130, borderRadius: 65, background: z.oliveFaint }} />
            <div style={{ position: "absolute", bottom: -50, left: -20, width: 100, height: 100, borderRadius: 50, background: z.warmGlow }} />
            <div style={{ fontSize: 10, color: z.olive, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", marginBottom: 14, position: "relative" }}>Today's Intention</div>
            <div style={{ fontSize: 20, color: z.ink, fontWeight: 300, lineHeight: 1.6, fontStyle: "italic", fontFamily: "'Georgia', serif", position: "relative" }}>
              "Practice and all is coming."
            </div>
            <div style={{ fontSize: 12, color: z.muted, marginTop: 10, fontWeight: 400, position: "relative" }}>— Sri K. Pattabhi Jois</div>
          </div>

          {/* Get on the mat — THE main CTA */}
          {!loggedToday ? (
            <div style={{ margin: "0 20px 22px" }}>
              <div
                onClick={() => setLoggedToday(true)}
                style={{
                  background: `linear-gradient(135deg, ${z.olive} 0%, ${z.oliveMid} 100%)`,
                  borderRadius: 24, padding: "26px 24px",
                  cursor: "pointer", position: "relative", overflow: "hidden",
                  boxShadow: "0 8px 30px rgba(138,158,120,0.2)",
                }}
              >
                <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: 50, background: "rgba(255,255,255,0.08)" }} />
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 500, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, position: "relative" }}>Ready when you are</div>
                <div style={{ fontSize: 22, fontWeight: 600, color: z.white, position: "relative", lineHeight: 1.3 }}>I'm on the mat 🧘</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 8, position: "relative", lineHeight: 1.5 }}>That's all that matters. No timer, no score.</div>
                {/* Social nudge */}
                <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
                  <div style={{ display: "flex" }}>
                    {sangha.filter(p => p.status === "on_mat").slice(0, 3).map((p, i) => (
                      <div key={i} style={{
                        width: 24, height: 24, borderRadius: 12, background: "rgba(255,255,255,0.25)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "1.5px solid rgba(255,255,255,0.4)",
                        marginLeft: i > 0 ? -8 : 0, fontSize: 11, color: z.white, fontWeight: 600,
                      }}>{p.avatar}</div>
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Priya & Marcus are practicing now</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ margin: "0 20px 22px" }}>
              <div style={{
                background: z.card, borderRadius: 24, padding: "26px 24px",
                border: `1px solid ${z.oliveLight}`, textAlign: "center",
              }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🌿</div>
                <div style={{ fontSize: 19, fontWeight: 600, color: z.ink }}>You showed up today</div>
                <div style={{ fontSize: 14, color: z.muted, marginTop: 8, lineHeight: 1.6 }}>That's the whole practice.<br/>Be proud of yourself.</div>
                {/* Social response to your practice */}
                <div style={{ marginTop: 16, padding: "12px 18px", background: z.oliveFaint, borderRadius: 16, display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 15 }}>🙏</span>
                  <span style={{ fontSize: 13, color: z.oliveMid, fontWeight: 500 }}>Your Sangha will see you practiced</span>
                </div>
              </div>
            </div>
          )}

          {/* This week — simple dots, no numbers */}
          <div style={{ padding: "0 24px", marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: z.muted, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" }}>This Week</div>
          </div>
          <div style={{ margin: "0 20px 22px", background: z.card, borderRadius: 20, padding: "16px 14px", border: `1px solid ${z.divider}` }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {week.map((d, i) => {
                const isToday = i === today;
                return (
                  <div key={i} style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ fontSize: 11, color: isToday ? z.ink : z.mutedLight, fontWeight: isToday ? 600 : 400, marginBottom: 10 }}>{d.day}</div>
                    <div style={{
                      width: 32, height: 32, borderRadius: 16, margin: "0 auto",
                      background: d.onMat ? z.olive : isToday ? z.beige : z.beige,
                      border: isToday && !d.onMat ? `2px dashed ${z.olive}` : "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {d.onMat ? (
                        <span style={{ fontSize: 14, color: z.white }}>✓</span>
                      ) : isToday ? (
                        <span style={{ fontSize: 10, color: z.olive }}>today</span>
                      ) : i > today ? (
                        <span style={{ fontSize: 10, color: z.mutedLight }}>·</span>
                      ) : (
                        <span style={{ fontSize: 10, color: z.mutedLight }}>—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: z.muted, fontStyle: "italic", fontFamily: "'Georgia', serif" }}>
              4 days on the mat this week. Keep going 💛
            </div>
          </div>

          {/* Set today's intentions — soft interactive chips */}
          <div style={{ padding: "0 24px", marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: z.muted, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" }}>Set Your Intention</div>
          </div>
          <div style={{ display: "flex", gap: 8, margin: "0 20px 22px", flexWrap: "wrap" }}>
            {intentions.map((item, i) => (
              <div key={i} style={{
                padding: "12px 16px", borderRadius: 16, background: z.card,
                border: `1px solid ${z.divider}`, display: "flex", alignItems: "center", gap: 8,
                cursor: "pointer",
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: z.ink, fontWeight: 500 }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* ─── SOCIAL: Sangha activity feed ─── */}
          <div style={{ padding: "0 24px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 10, color: z.muted, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase" }}>Sangha</span>
              <span style={{ fontSize: 10, color: z.olive, fontWeight: 600, padding: "2px 8px", background: z.oliveLight, borderRadius: 8 }}>{practicedToday} practiced today</span>
            </div>
            <span style={{ fontSize: 11, color: z.olive, fontWeight: 500 }}>See all →</span>
          </div>

          {/* People on the mat RIGHT NOW — highlighted */}
          {sangha.filter(p => p.status === "on_mat").length > 0 && (
            <div style={{ margin: "0 20px 10px", padding: "14px 16px", background: z.oliveLight, borderRadius: 18, border: `1px solid ${z.olive}20` }}>
              <div style={{ fontSize: 10, color: z.oliveMid, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>On the mat right now</div>
              <div style={{ display: "flex", gap: 10 }}>
                {sangha.filter(p => p.status === "on_mat").map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: z.card, borderRadius: 14, border: `1px solid ${z.olive}30` }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 16,
                      background: z.olive,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: z.white }}>{p.avatar}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: z.ink }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: z.olive }}>{p.time}</div>
                    </div>
                    <div
                      onClick={() => toggleCheer(p.name)}
                      style={{
                        padding: "4px 10px", borderRadius: 10, marginLeft: 4,
                        background: cheered[p.name] ? z.olive : z.oliveFaint,
                        border: `1px solid ${z.olive}40`,
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ fontSize: 13 }}>{cheered[p.name] ? "🙏" : "👏"}</span>
                      <span style={{ fontSize: 11, marginLeft: 3, color: cheered[p.name] ? z.white : z.oliveMid, fontWeight: 600 }}>
                        {p.cheers + (cheered[p.name] ? 1 : 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sangha feed — today's activity */}
          <div style={{ margin: "0 20px 8px" }}>
            {sangha.filter(p => p.status === "done").map((p, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                background: z.card, borderRadius: 16, marginBottom: 8,
                border: `1px solid ${z.divider}`,
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 21,
                  background: z.beige,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `2px solid ${z.divider}`,
                }}>
                  <span style={{ fontSize: 16, fontWeight: 400, color: z.muted }}>{p.avatar}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: z.ink }}>{p.name} <span style={{ fontWeight: 400, color: z.muted, fontSize: 12 }}>was on the mat</span></div>
                  <div style={{ fontSize: 12, color: z.muted, marginTop: 2 }}>{p.time}</div>
                </div>
                <div
                  onClick={() => toggleCheer(p.name)}
                  style={{
                    padding: "6px 12px", borderRadius: 12,
                    background: cheered[p.name] ? z.olive : z.oliveFaint,
                    border: `1px solid ${cheered[p.name] ? z.olive : z.oliveLight}`,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                  }}
                >
                  <span style={{ fontSize: 13 }}>🙏</span>
                  <span style={{ fontSize: 11, color: cheered[p.name] ? z.white : z.oliveMid, fontWeight: 600 }}>
                    {p.cheers + (cheered[p.name] ? 1 : 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Gentle nudge for friends who haven't practiced */}
          {sangha.filter(p => p.status === "away").length > 0 && (
            <div style={{ margin: "0 20px 20px", padding: "14px 18px", background: z.cardWarm, borderRadius: 16, border: `1px solid ${z.divider}` }}>
              <div style={{ fontSize: 12, color: z.muted, marginBottom: 10, fontStyle: "italic", fontFamily: "'Georgia', serif" }}>
                Haven't seen them today — send some love?
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {sangha.filter(p => p.status === "away").map((p, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
                    background: z.card, borderRadius: 14, border: `1px solid ${z.divider}`,
                    cursor: "pointer",
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 14, background: z.beige,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontSize: 12, color: z.muted }}>{p.avatar}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: z.ink }}>{p.name}</span>
                    <span style={{ fontSize: 13 }}>💛</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gentle reminder — rotating encouragement */}
          <div style={{ margin: "0 20px 16px", padding: "18px 20px", background: z.woodLight, borderRadius: 18, borderLeft: `3px solid ${z.wood}` }}>
            <div style={{ fontSize: 14, color: z.inkSoft, fontStyle: "italic", fontFamily: "'Georgia', serif", lineHeight: 1.6 }}>
              {gentleReminders[Math.floor(Date.now() / 60000) % gentleReminders.length]}
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: `${z.card}F5`, backdropFilter: "blur(16px)",
          borderTop: `1px solid ${z.divider}`,
          display: "flex", justifyContent: "space-around", paddingTop: 10, paddingBottom: 28,
        }}>
          {[
            { icon: "⌂", label: "Home", id: "home" },
            { icon: "◎", label: "Practice", id: "practice" },
            { icon: "☯", label: "Sangha", id: "sangha" },
            { icon: "◉", label: "Profile", id: "profile" },
          ].map(t => (
            <div key={t.id} onClick={() => setActiveTab(t.id)} style={{ textAlign: "center", cursor: "pointer" }}>
              <div style={{ fontSize: 22, lineHeight: 1, color: activeTab === t.id ? z.olive : z.mutedLight }}>{t.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 500, marginTop: 3, color: activeTab === t.id ? z.olive : z.mutedLight }}>{t.label}</div>
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", background: z.olive, color: z.white, fontSize: 9, fontWeight: 700, padding: "3px 12px", borderRadius: 10, letterSpacing: 1.5 }}>STONE & MOSS</div>
      </div>
    </div>
  );
}
