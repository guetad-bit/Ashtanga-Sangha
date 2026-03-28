import { useState } from "react";

const warm = {
  bg: "#FAF6F0",
  ink: "#3D3229",
  inkMid: "#5C4F42",
  muted: "#8B7D6E",
  accent: "#C47B3F",
  sage: "#7A8B5E",
  gold: "#B8944A",
  terra: "#A0704C",
  orange: "#E8834A",
  divider: "#EDE5D8",
  cardBg: "#FFFFFF",
};

const YOGIS = [
  { name: "David", img: "https://i.pravatar.cc/100?img=11" },
  { name: "Priya", img: "https://i.pravatar.cc/100?img=5" },
  { name: "Marco", img: "https://i.pravatar.cc/100?img=12" },
  { name: "Yuki", img: "https://i.pravatar.cc/100?img=9" },
  { name: "Amit", img: "https://i.pravatar.cc/100?img=33" },
  { name: "Sofia", img: "https://i.pravatar.cc/100?img=32" },
  { name: "Lena", img: "https://i.pravatar.cc/100?img=25" },
  { name: "Ravi", img: "https://i.pravatar.cc/100?img=53" },
  { name: "Mia", img: "https://i.pravatar.cc/100?img=47" },
  { name: "Omar", img: "https://i.pravatar.cc/100?img=59" },
];

const DAYS = [
  { label: "Sun", color: "#E8834A", active: true },
  { label: "Mon", color: "#B8944A", active: true },
  { label: "Tue", color: "#7A8B5E", active: true },
  { label: "Wed", color: "#7A8B5E", active: false },
  { label: "Thu", color: "#7A8B5E", active: true },
  { label: "Fri", color: "#7A8B5E", active: false },
  { label: "Sat", color: "#8B7D6E", active: false, rest: true },
];

export default function HomePageMockup() {
  const [selectedTab, setSelectedTab] = useState("Home");
  const [onTheMat, setOnTheMat] = useState(false);

  return (
    <div style={{
      width: 393,
      height: 852,
      margin: "20px auto",
      borderRadius: 44,
      overflow: "hidden",
      background: warm.bg,
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      position: "relative",
      boxShadow: "0 25px 80px rgba(61,50,41,0.25), 0 0 0 8px #E8E0D4",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Status bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 28px 6px",
        fontSize: 14,
        fontWeight: 600,
        color: warm.ink,
      }}>
        <span>9:41</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <svg width="18" height="12" viewBox="0 0 18 12"><path d="M1 8h2v4H1zM5 5h2v7H5zM9 3h2v9H9zM13 0h2v12h-2z" fill={warm.ink}/></svg>
          <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 3.6a5.8 5.8 0 0 1 4.1 1.7l1.4-1.4A8 8 0 0 0 8 1.2a8 8 0 0 0-5.5 2.2L3.9 4.8A5.8 5.8 0 0 1 8 3.1z" fill={warm.ink}/><circle cx="8" cy="10" r="2" fill={warm.ink}/></svg>
          <svg width="27" height="13" viewBox="0 0 27 13"><rect x="0" y="1" width="23" height="11" rx="3" stroke={warm.ink} strokeWidth="1.2" fill="none"/><rect x="2" y="3" width="16" height="7" rx="1.5" fill={warm.sage}/><rect x="24" y="4.5" width="2.5" height="4" rx="1" fill={warm.muted}/></svg>
        </div>
      </div>

      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6px 20px 12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 17,
            background: "linear-gradient(135deg, #7A8B5E, #5A6B4E)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>🪷</div>
          <span style={{ fontSize: 17, fontWeight: 600, color: warm.ink, letterSpacing: -0.3 }}>Ashtanga Sangha</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 18,
              background: warm.divider, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, cursor: "pointer",
            }}>💬</div>
            <div style={{
              position: "absolute", top: -2, right: -2,
              width: 18, height: 18, borderRadius: 9,
              background: warm.orange, color: "#fff", fontSize: 10, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `2px solid ${warm.bg}`,
            }}>3</div>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: 18,
            background: warm.orange,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 15, fontWeight: 700,
          }}>D</div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        paddingBottom: 80,
      }}>
        {/* Welcome */}
        <div style={{
          textAlign: "center",
          padding: "4px 20px 14px",
          fontSize: 22,
          fontWeight: 400,
          fontFamily: "'DM Serif Display', Georgia, serif",
          color: warm.ink,
        }}>
          Welcome back, David
        </div>

        {/* Yogis on the mat */}
        <div style={{
          textAlign: "center", padding: "0 20px 8px",
        }}>
          <div style={{
            fontSize: 15, color: warm.ink, marginBottom: 10,
          }}>
            <strong style={{ color: "#3B6FC0", fontWeight: 700 }}>12 yogis</strong> on the mat right now
          </div>
          <div style={{
            display: "flex", justifyContent: "center",
          }}>
            {YOGIS.slice(0, 7).map((y, i) => (
              <div key={y.name} style={{
                width: 44, height: 44, borderRadius: 22,
                border: "2.5px solid #fff",
                marginLeft: i === 0 ? 0 : -10,
                overflow: "hidden",
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                position: "relative",
                zIndex: 7 - i,
              }}>
                <img src={y.img} alt={y.name} style={{
                  width: "100%", height: "100%", objectFit: "cover",
                }} />
              </div>
            ))}
          </div>
        </div>

        {/* Hero Card */}
        <div style={{
          margin: "0 16px 16px",
          borderRadius: 20,
          overflow: "hidden",
          position: "relative",
          height: 320,
          boxShadow: "0 6px 24px rgba(61,50,41,0.18)",
        }}>
          <img
            src="https://picsum.photos/id/1057/800/600"
            alt="yoga shala"
            style={{
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center 20%",
            }}
          />
          {/* Dark gradient overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.65) 100%)",
          }} />
          {/* Content */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "20px 24px",
            textAlign: "center",
          }}>
            <div style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 36, lineHeight: 1.15,
              color: "#fff", fontStyle: "italic",
              fontWeight: 400,
              textShadow: "0 2px 12px rgba(0,0,0,0.4)",
              marginBottom: 6,
            }}>Practice, and all is coming</div>
            <div style={{
              fontSize: 16, color: "rgba(255,255,255,0.9)",
              fontWeight: 400, marginBottom: 24,
              textShadow: "0 1px 6px rgba(0,0,0,0.3)",
            }}>Join me on the mat!</div>
            <button onClick={() => setOnTheMat(!onTheMat)} style={{
              background: onTheMat ? "#E8834A" : "#3B6FC0", color: "#fff",
              border: "none", borderRadius: 28, padding: "14px 44px",
              fontSize: 16, fontWeight: 700, cursor: "pointer",
              letterSpacing: 1.5, textTransform: "uppercase",
              boxShadow: onTheMat ? "0 4px 16px rgba(232,131,74,0.4)" : "0 4px 16px rgba(59,111,192,0.4)",
              transition: "background 0.3s, box-shadow 0.3s",
            }}>{onTheMat ? "ON THE MAT" : "LOG MY PRACTICE"}</button>
          </div>
        </div>

        {/* Practice Rhythm */}
        <div style={{
          margin: "0 16px 16px",
          background: warm.cardBg,
          borderRadius: 16,
          padding: "18px 20px",
          border: `1px solid ${warm.divider}`,
        }}>
          <div style={{
            fontSize: 17, fontWeight: 600, color: warm.ink, marginBottom: 16,
          }}>Practice Rhythm</div>
          <div style={{
            display: "flex", justifyContent: "space-between", marginBottom: 16,
          }}>
            {DAYS.map((d) => (
              <div key={d.label} style={{ textAlign: "center", flex: 1 }}>
                <div style={{
                  fontSize: 12, color: warm.muted, marginBottom: 8, fontWeight: 500,
                }}>{d.label}</div>
                <div style={{
                  width: 10, height: 10, borderRadius: 5,
                  margin: "0 auto",
                  background: d.rest ? "transparent" : d.active ? d.color : warm.divider,
                  border: d.rest ? `1.5px solid ${warm.muted}` : "none",
                }} />
              </div>
            ))}
          </div>
          <div style={{
            textAlign: "center", fontSize: 13, color: warm.inkMid,
            paddingTop: 12, borderTop: `1px solid ${warm.divider}`,
          }}>
            <strong>4 of 6</strong> practices completed this week &nbsp;
            <span style={{ filter: "grayscale(0.3)" }}>🌗</span>
          </div>
          <div style={{
            textAlign: "center", fontSize: 12, color: warm.muted, marginTop: 6,
          }}>
            🌙 Next Moon Day: Apr 30
          </div>
        </div>

        {/* Live Practice Feed */}
        <div style={{ margin: "0 16px 16px" }}>
          <div style={{
            fontSize: 20, fontWeight: 600, color: warm.ink, marginBottom: 14,
            fontFamily: "'DM Serif Display', Georgia, serif",
          }}>Live Practice Feed</div>

          {/* Feed Card - Liat */}
          <div style={{
            background: warm.cardBg, borderRadius: 16,
            border: `1px solid ${warm.divider}`,
            marginBottom: 12, overflow: "hidden",
          }}>
            <div style={{ display: "flex" }}>
              <div style={{ flex: 1, padding: "16px 16px 10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <img src="https://i.pravatar.cc/100?img=5" alt="Liat" style={{
                    width: 40, height: 40, borderRadius: 20, objectFit: "cover",
                  }} />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 15, color: warm.ink }}>Liat</span>
                    <span style={{ fontSize: 13, color: warm.muted, marginLeft: 6 }}>4 min ago</span>
                  </div>
                </div>
                <div style={{ fontSize: 15, color: warm.ink, marginBottom: 10 }}>Just finished practice 🙏</div>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, color: "#E05A5A" }}>❤️ 1</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, color: warm.muted }}>💬 1</span>
                </div>
              </div>
              <img src="https://picsum.photos/id/1027/200/200" alt="practice" style={{
                width: 130, height: "auto", objectFit: "cover",
              }} />
            </div>
          </div>

          {/* Feed Card - David */}
          <div style={{
            background: warm.cardBg, borderRadius: 16,
            border: `1px solid ${warm.divider}`,
            marginBottom: 12, overflow: "hidden",
          }}>
            <div style={{ display: "flex" }}>
              <div style={{ flex: 1, padding: "16px 16px 10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <img src="https://i.pravatar.cc/100?img=11" alt="David" style={{
                    width: 40, height: 40, borderRadius: 20, objectFit: "cover",
                  }} />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 15, color: warm.ink }}>David</span>
                    <span style={{ fontSize: 13, color: warm.muted, marginLeft: 6 }}>15 min ago</span>
                  </div>
                </div>
                <div style={{ fontSize: 15, color: warm.ink, marginBottom: 10 }}>Working on my dropbacks!</div>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, color: "#E05A5A" }}>❤️ 1</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, color: warm.muted }}>💬 1</span>
                </div>
              </div>
              <img src="https://picsum.photos/id/1074/200/200" alt="dropback" style={{
                width: 130, height: "auto", objectFit: "cover",
              }} />
            </div>
          </div>
        </div>

        {/* How was your practice? */}
        <div style={{
          margin: "0 16px 16px", textAlign: "center",
        }}>
          <div style={{
            fontSize: 18, fontWeight: 600, color: warm.ink, marginBottom: 14,
            fontFamily: "'DM Serif Display', Georgia, serif",
          }}>How was your practice today?</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            {[
              { emoji: "🙌", label: "Strong", color: "#E8834A" },
              { emoji: "😌", label: "Challenging", color: warm.ink },
              { emoji: "😴", label: "Low energy", color: warm.ink },
            ].map((m) => (
              <button key={m.label} style={{
                flex: 1, background: warm.cardBg,
                border: `1px solid ${warm.divider}`, borderRadius: 28,
                padding: "10px 8px", fontSize: 14, fontWeight: 600,
                color: m.color, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              }}>{m.emoji} {m.label}</button>
            ))}
          </div>
        </div>

        {/* Pose of the Day */}
        <div style={{
          margin: "0 16px 16px",
          borderRadius: 16,
          overflow: "hidden",
          position: "relative",
          height: 160,
          boxShadow: "0 2px 12px rgba(61,50,41,0.08)",
        }}>
          <img
            src="https://picsum.photos/id/1039/800/400"
            alt="beach"
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
            }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to right, rgba(255,255,255,0.92) 55%, rgba(255,255,255,0.2))",
            padding: "20px 20px",
            display: "flex", flexDirection: "column", justifyContent: "center",
          }}>
            <div style={{
              fontSize: 11, fontWeight: 600, letterSpacing: 0.8,
              color: warm.muted, textTransform: "uppercase", marginBottom: 4,
            }}>Pose of the Day</div>
            <div style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 19, color: warm.ink, marginBottom: 2,
            }}>Ardha Matsyendrasana</div>
            <div style={{
              fontSize: 13, color: warm.inkMid, marginBottom: 14,
            }}>Half Lord of the Fishes Pose</div>
            <button style={{
              background: warm.accent, color: "#fff",
              border: "none", borderRadius: 20, padding: "8px 22px",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              alignSelf: "flex-start",
            }}>View Retreat</button>
          </div>
        </div>

        {/* Quote */}
        <div style={{
          margin: "0 16px 20px",
          background: warm.cardBg,
          borderRadius: 16,
          padding: "22px 24px",
          textAlign: "center",
          border: `1px solid ${warm.divider}`,
        }}>
          <div style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 16, fontStyle: "italic", color: warm.ink,
            lineHeight: 1.5, marginBottom: 8,
          }}>
            "Practice, and all is coming."
          </div>
          <div style={{ fontSize: 13, color: warm.muted }}>
            — Sri K. Pattabhi Jois
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(20px)",
        borderTop: `1px solid ${warm.divider}`,
        display: "flex",
        justifyContent: "space-around",
        padding: "8px 0 28px",
      }}>
        {[
          { icon: "🏠", label: "Home" },
          { icon: "💬", label: "Community" },
          { icon: "🧘", label: "Practice" },
          { icon: "🔍", label: "Explore" },
          { icon: "📚", label: "Retreats" },
        ].map((tab) => (
          <button
            key={tab.label}
            onClick={() => setSelectedTab(tab.label)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              opacity: selectedTab === tab.label ? 1 : 0.5,
              padding: "4px 8px",
            }}
          >
            <span style={{
              fontSize: 22,
              filter: selectedTab === tab.label ? "none" : "grayscale(0.8)",
            }}>{tab.icon}</span>
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: selectedTab === tab.label ? warm.orange : warm.muted,
            }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
