import { useState } from "react";

const moss = {
  bg: '#F6F2EC',
  cardBg: '#FFFFFF',
  cardWarm: '#FBF8F3',
  headerBg: '#FFFFFF',
  ink: '#3B3228',
  inkMid: '#5E5245',
  muted: '#9B8E7E',
  mutedLight: '#C4B8A8',
  accent: '#8A9E78',
  accentLight: '#DCE8D3',
  accentFaint: 'rgba(138,158,120,0.08)',
  sage: '#8A9E78',
  sageBg: '#DCE8D3',
  wood: '#D4C4AB',
  woodLight: '#EDE6DA',
  woodMid: '#B8A88E',
  beige: '#F0EAE0',
  beigeDark: '#E4DACE',
  olive: '#8A9E78',
  oliveMid: '#6E8A5C',
  oliveLight: '#DCE8D3',
  amber: '#C4956A',
  amberBg: '#FFF5EC',
  terra: '#8B7355',
  divider: '#E8E0D4',
  orange: '#C4956A',
  orangeLight: '#FFF5EC',
  white: '#FFFFFF',
  ring: '#8A9E78',
  heartRed: '#C4956A',
  blue: '#8A9E78',
  blueBg: '#DCE8D3',
  gold: '#D4C4AB',
  goldBg: '#EDE6DA',
};

const FAKE_YOGIS = [
  { id: 'f1', name: 'Priya', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80' },
  { id: 'f2', name: 'Marco', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80' },
  { id: 'f3', name: 'Yuki', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80' },
  { id: 'f4', name: 'Amit', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
  { id: 'f5', name: 'Sofia', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
  { id: 'f6', name: 'Daniel', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
  { id: 'f7', name: 'Lena', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80' },
];

const weekDays = [
  { label: 'S', done: true },
  { label: 'M', done: true },
  { label: 'T', done: true },
  { label: 'W', done: false },
  { label: 'T', done: false },
  { label: 'F', done: false },
  { label: 'S', done: false },
];

const CIRCLE_MEMBERS = [
  { name: 'Liat', avatar: 'https://i.pravatar.cc/200?img=5', badge: 'practiced', badgeText: 'Practiced today' },
  { name: 'David', avatar: 'https://i.pravatar.cc/200?img=11', badge: 'streak', badgeText: '5-day streak' },
  { name: 'Emma', avatar: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&q=80', badge: 'series', badgeText: 'Primary' },
  { name: 'Noah', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80', badge: 'practiced', badgeText: 'Practiced today' },
  { name: 'Priya', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', badge: 'streak', badgeText: '3-day streak' },
];

export default function HomeScreenMock() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: '#2a2a2a', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '24px 0', fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>
      {/* Phone Frame */}
      <div style={{
        width: 390,
        height: 844,
        background: moss.bg,
        borderRadius: 44,
        overflow: 'hidden',
        boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
        border: '8px solid #1a1a1a',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Status Bar */}
        <div style={{
          height: 54,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          padding: '0 28px 6px',
          background: moss.bg,
        }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: moss.ink }}>9:41</span>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <svg width="17" height="12" viewBox="0 0 17 12"><rect x="0" y="3" width="3" height="9" rx="1" fill={moss.ink}/><rect x="4.5" y="2" width="3" height="10" rx="1" fill={moss.ink}/><rect x="9" y="0" width="3" height="12" rx="1" fill={moss.ink}/><rect x="13.5" y="0" width="3" height="12" rx="1" fill={moss.mutedLight}/></svg>
            <svg width="15" height="12" viewBox="0 0 15 12"><path d="M7.5 2.5C9.5 2.5 11 3.5 12 4.5L7.5 10 3 4.5C4 3.5 5.5 2.5 7.5 2.5Z" fill={moss.ink}/></svg>
            <svg width="27" height="13" viewBox="0 0 27 13"><rect x="0" y="0" width="24" height="13" rx="3" stroke={moss.ink} strokeWidth="1" fill="none"/><rect x="25" y="4" width="2" height="5" rx="1" fill={moss.mutedLight}/><rect x="1.5" y="1.5" width="18" height="10" rx="2" fill={moss.accent}/></svg>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {/* Top Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            background: moss.bg,
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* App Logo */}
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `linear-gradient(135deg, ${moss.accent}, ${moss.oliveMid})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 18, fontWeight: 700,
              }}>
                AS
              </div>
              <span style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 18, color: moss.ink, lineHeight: '22px',
              }}>Ashtanga Sangha</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              {/* Notification */}
              <div style={{ position: 'relative', cursor: 'pointer' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={moss.accent} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <div style={{
                  position: 'absolute', top: -4, right: -6,
                  background: moss.orange, borderRadius: 8,
                  width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1.5px solid ${moss.bg}`,
                }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>3</span>
                </div>
              </div>
              {/* Avatar */}
              <div
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                  width: 38, height: 38, borderRadius: 19,
                  border: `2px solid ${moss.ring}`,
                  background: moss.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}>
                <span style={{ fontSize: 16, color: '#fff', fontWeight: 600 }}>D</span>
              </div>
            </div>
          </div>

          {/* Menu dropdown */}
          {menuOpen && (
            <div style={{
              position: 'absolute', top: 95, right: 20, zIndex: 100,
              background: moss.cardBg, borderRadius: 16, width: 220,
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              border: `1px solid ${moss.divider}`,
              overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 20,
                  background: moss.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 16, color: '#fff', fontWeight: 600 }}>D</span>
                </div>
                <div>
                  <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 16, color: moss.ink }}>Dudu</div>
                  <div style={{ fontSize: 12, color: moss.muted }}>gueta.d@gmail.com</div>
                </div>
              </div>
              <div style={{ height: 1, background: moss.divider }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={moss.ink} strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span style={{ fontSize: 15, color: moss.ink }}>My Profile</span>
              </div>
              <div style={{ height: 1, background: moss.divider }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                <span style={{ fontSize: 15, color: '#C0392B' }}>Sign Out</span>
              </div>
            </div>
          )}

          {/* Welcome */}
          <div style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 22, lineHeight: '28px', color: moss.ink,
            textAlign: 'center', padding: '12px 0',
          }}>
            Welcome back, Dudu
          </div>

          {/* Yogis on the mat */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 15, color: moss.ink, marginBottom: 10 }}>
              <span style={{ fontWeight: 700, color: moss.accent }}>{FAKE_YOGIS.length + 1} yogis</span> on the mat today
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {/* "You" avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: 22,
                border: `2.5px solid ${moss.cardBg}`,
                overflow: 'hidden',
                background: moss.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 1px 4px ${moss.accent}26`,
                zIndex: 8,
              }}>
                <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>Y</span>
              </div>
              {FAKE_YOGIS.map((u, i) => (
                <div key={u.id} style={{
                  width: 44, height: 44, borderRadius: 22,
                  border: `2.5px solid ${moss.cardBg}`,
                  overflow: 'hidden',
                  marginLeft: -10,
                  zIndex: 7 - i,
                  boxShadow: `0 1px 4px ${moss.accent}26`,
                }}>
                  <img src={u.avatar} alt={u.name} style={{ width: '100%', height: '100%', borderRadius: 22, objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Hero Card */}
          <div style={{
            margin: '0 16px 16px',
            borderRadius: 20,
            overflow: 'hidden',
            height: 288,
            position: 'relative',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          }}>
            <img
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80"
              alt="yoga"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(138,158,120,0.75)',
              display: 'flex', flexDirection: 'column',
              justifyContent: 'center', alignItems: 'center',
              padding: '0 24px',
              borderRadius: 20,
            }}>
              <div style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 30, lineHeight: '36px',
                color: '#fff', fontStyle: 'italic',
                textAlign: 'center', marginBottom: 6,
                textShadow: '0 2px 12px rgba(0,0,0,0.4)',
              }}>
                Practice, and all is coming.
              </div>
              <div style={{
                fontSize: 16, color: 'rgba(255,255,255,0.9)',
                textAlign: 'center', marginBottom: 24,
                textShadow: '0 1px 6px rgba(0,0,0,0.3)',
              }}>
                — Sri K. Pattabhi Jois
              </div>
              <button style={{
                borderRadius: 28,
                padding: '14px 44px',
                background: moss.amber,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(196,149,106,0.45)',
              }}>
                <span style={{
                  fontWeight: 700, fontSize: 16, color: '#fff',
                  letterSpacing: 1.5, textTransform: 'uppercase',
                }}>
                  Start your practice 🧘
                </span>
              </button>
            </div>
          </div>

          {/* This Week + Goal Card */}
          <div style={{
            margin: '0 16px 16px',
            background: moss.cardBg,
            borderRadius: 20,
            padding: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: `1px solid ${moss.divider}`,
          }}>
            <div style={{ display: 'flex', gap: 20 }}>
              {/* Left: This Week */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: 16, color: moss.ink, marginBottom: 12, fontWeight: 600,
                }}>
                  This Week
                </div>
                <div style={{ display: 'flex', gap: 0, justifyContent: 'space-between' }}>
                  {weekDays.map((day, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, color: moss.muted, fontWeight: 500 }}>{day.label}</span>
                      <div style={{
                        width: 28, height: 28, borderRadius: 14,
                        background: day.done ? moss.accent : moss.beige,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {day.done && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Right: Goal progress */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                  <span style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: 28, fontWeight: 700, color: moss.ink, lineHeight: 1,
                  }}>3</span>
                  <span style={{ fontSize: 16, color: moss.muted }}>/</span>
                  <span style={{ fontSize: 16, color: moss.muted }}>5</span>
                  <span style={{ fontSize: 15, color: moss.ink, fontWeight: 500 }}>practices</span>
                </div>
                {/* Progress bar */}
                <div style={{
                  width: '100%', height: 8, borderRadius: 4,
                  background: moss.beige, overflow: 'hidden', marginBottom: 8,
                }}>
                  <div style={{
                    width: '60%', height: '100%', borderRadius: 4,
                    background: `linear-gradient(90deg, ${moss.accent}, ${moss.oliveMid})`,
                  }} />
                </div>
                <span style={{ fontSize: 13, color: moss.muted }}>You're 2 away from your goal!</span>
              </div>
            </div>
          </div>

          {/* Your Circle */}
          <div style={{ margin: '0 16px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div>
                <div style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: 20, color: moss.ink, lineHeight: '26px',
                }}>
                  Your Circle
                </div>
                <div style={{ fontSize: 13, color: moss.muted, marginTop: 2 }}>
                  Practice together, stay motivated
                </div>
              </div>
              <span style={{ fontSize: 14, color: moss.muted, fontWeight: 500, cursor: 'pointer', marginTop: 4 }}>
                View all →
              </span>
            </div>
            <div style={{
              display: 'flex', gap: 6, overflowX: 'auto',
              paddingTop: 12, paddingBottom: 4,
              scrollbarWidth: 'none',
            }}>
              {CIRCLE_MEMBERS.map((m, i) => (
                <div key={i} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  minWidth: 72, gap: 6,
                }}>
                  {/* Avatar with ring */}
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: 32,
                      border: `2.5px solid ${m.badge === 'practiced' ? moss.accent : m.badge === 'streak' ? moss.amber : moss.wood}`,
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}>
                      <img src={m.avatar} alt={m.name} style={{
                        width: '100%', height: '100%', objectFit: 'cover', borderRadius: 32,
                      }} />
                    </div>
                    {/* Badge */}
                    <div style={{
                      position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
                      background: m.badge === 'practiced' ? moss.accentLight
                        : m.badge === 'streak' ? moss.amberBg
                        : moss.blueBg,
                      borderRadius: 10,
                      padding: '2px 7px',
                      whiteSpace: 'nowrap',
                      display: 'flex', alignItems: 'center', gap: 3,
                      border: `1px solid ${moss.cardBg}`,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    }}>
                      {m.badge === 'practiced' && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={moss.accent} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                      {m.badge === 'streak' && <span style={{ fontSize: 9 }}>🔥</span>}
                      {m.badge === 'series' && <span style={{ fontSize: 9 }}>🧘</span>}
                      <span style={{
                        fontSize: 9, fontWeight: 600,
                        color: m.badge === 'practiced' ? moss.accent
                          : m.badge === 'streak' ? moss.amber
                          : moss.inkMid,
                      }}>{m.badgeText}</span>
                    </div>
                  </div>
                  {/* Name */}
                  <span style={{
                    fontSize: 13, color: moss.ink, fontWeight: 500,
                    marginTop: 4,
                  }}>{m.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sangha Feed */}
          <div style={{ margin: '0 16px 16px' }}>
            <div style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 20, color: moss.ink, marginBottom: 14,
            }}>
              Sangha Feed
            </div>

            {/* Feed Card 1 */}
            <div style={{
              background: moss.cardBg, borderRadius: 16,
              border: `1px solid ${moss.divider}`,
              marginBottom: 12, overflow: 'hidden',
            }}>
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <img src="https://i.pravatar.cc/100?img=5" alt="" style={{ width: 40, height: 40, borderRadius: 20 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: moss.ink }}>Liat</div>
                      <div style={{ fontSize: 13, color: moss.muted }}>4 min ago</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 15, color: moss.ink, marginBottom: 10 }}>Just finished practice 🙏</div>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: moss.heartRed }}>🙏 1</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: moss.muted }}>💬 1</span>
                  </div>
                </div>
                <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&q=80" alt="" style={{ width: 130, minHeight: 120, objectFit: 'cover' }} />
              </div>
            </div>

            {/* Feed Card 2 */}
            <div style={{
              background: moss.cardBg, borderRadius: 16,
              border: `1px solid ${moss.divider}`,
              marginBottom: 12, overflow: 'hidden',
            }}>
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <img src="https://i.pravatar.cc/100?img=11" alt="" style={{ width: 40, height: 40, borderRadius: 20 }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: moss.ink }}>David</div>
                      <div style={{ fontSize: 13, color: moss.muted }}>15 min ago</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 15, color: moss.ink, marginBottom: 10 }}>Working on my dropbacks!</div>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: moss.heartRed }}>🙏 1</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: moss.muted }}>💬 1</span>
                  </div>
                </div>
                <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&q=80" alt="" style={{ width: 130, minHeight: 120, objectFit: 'cover' }} />
              </div>
            </div>
          </div>

          {/* Asana of the Day */}
          <div style={{
            margin: '0 16px 16px',
            background: moss.cardBg,
            borderRadius: 20,
            overflow: 'hidden',
            border: `1px solid ${moss.divider}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <div style={{ padding: '18px 20px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: 18, color: moss.ink,
                }}>
                  Asana of the Day
                </div>
                <div style={{
                  background: moss.accentFaint,
                  borderRadius: 999,
                  padding: '3px 10px',
                }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: moss.accent }}>Primary Series</span>
                </div>
              </div>
              <div style={{ fontSize: 13, color: moss.muted, marginBottom: 14 }}>
                Focus on this posture during today's practice
              </div>
            </div>

            {/* Asana image */}
            <div style={{
              position: 'relative',
              height: 180,
              background: `linear-gradient(135deg, ${moss.accentLight}, ${moss.beige})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <img
                src="https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=600&q=80"
                alt="Marichyasana C"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(59,50,40,0.7) 0%, transparent 60%)',
              }} />
              <div style={{
                position: 'absolute', bottom: 14, left: 20, right: 20,
              }}>
                <div style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: 22, color: '#fff', lineHeight: '26px',
                  textShadow: '0 1px 8px rgba(0,0,0,0.4)',
                }}>
                  Marichyasana C
                </div>
                <div style={{
                  fontSize: 13, color: 'rgba(255,255,255,0.85)',
                  textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }}>
                  Pose Dedicated to the Sage Marichi
                </div>
              </div>
            </div>

            {/* Details */}
            <div style={{ padding: '16px 20px' }}>
              {/* Benefits row */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                {['Spinal twist', 'Digestion', 'Shoulder opening', 'Hip flexibility'].map((tag) => (
                  <span key={tag} style={{
                    background: moss.beige,
                    borderRadius: 999,
                    padding: '4px 10px',
                    fontSize: 11, fontWeight: 500, color: moss.inkMid,
                  }}>{tag}</span>
                ))}
              </div>

              {/* Key tips */}
              <div style={{
                background: moss.accentFaint,
                borderRadius: 12,
                padding: 14,
                marginBottom: 14,
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: moss.accent, marginBottom: 6 }}>
                  Key tips
                </div>
                <div style={{ fontSize: 13, color: moss.inkMid, lineHeight: '18px' }}>
                  Ground through both sit bones. Lengthen the spine before twisting. Use the exhale to deepen the rotation. Keep the bound shoulder relaxed.
                </div>
              </div>

              {/* Hold & Breaths */}
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{
                  flex: 1, background: moss.beige, borderRadius: 12,
                  padding: '10px 14px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: moss.ink }}>5</div>
                  <div style={{ fontSize: 11, color: moss.muted, fontWeight: 500 }}>breaths</div>
                </div>
                <div style={{
                  flex: 1, background: moss.beige, borderRadius: 12,
                  padding: '10px 14px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: moss.ink }}>Both</div>
                  <div style={{ fontSize: 11, color: moss.muted, fontWeight: 500 }}>sides</div>
                </div>
                <div style={{
                  flex: 1, background: moss.amberBg, borderRadius: 12,
                  padding: '10px 14px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: moss.amber }}>Int.</div>
                  <div style={{ fontSize: 11, color: moss.muted, fontWeight: 500 }}>difficulty</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom padding for tab bar */}
          <div style={{ height: 100 }} />
        </div>

        {/* Tab Bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 82,
          background: moss.cardBg,
          borderTop: `1px solid ${moss.divider}`,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'flex-start',
          paddingTop: 10,
        }}>
          {[
            { icon: '🏠', label: 'Home', active: true },
            { icon: '📖', label: 'Learn', active: false },
            { icon: '🧘', label: 'Practice', active: false },
            { icon: '👤', label: 'Profile', active: false },
          ].map((tab) => (
            <div key={tab.label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              opacity: tab.active ? 1 : 0.5,
            }}>
              <span style={{ fontSize: 22 }}>{tab.icon}</span>
              <span style={{
                fontSize: 11,
                fontWeight: tab.active ? 600 : 400,
                color: tab.active ? moss.accent : moss.muted,
              }}>{tab.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}