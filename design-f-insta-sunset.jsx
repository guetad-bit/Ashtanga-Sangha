// Design F — "Insta Sunset"
// Warm sunset gradient palette: peach, coral, blush, dusty rose on a cream bg.
// Soft rounded everything, pastel gradient accents, warm cozy feel.
// Colors: Peach #FFDAB9, Coral #FF6B6B, Blush #FF8DA1, Rose #C44569, Cream #FFF8F0
import React from 'react';

const palette = {
  bg:         '#FFF8F0',
  card:       '#FFFFFF',
  ink:        '#2D1B14',
  inkMid:     '#5D4037',
  muted:      '#A08070',
  mutedLight: '#D4B8A8',
  divider:    '#F0E0D4',
  coral:      '#FF6B6B',
  rose:       '#C44569',
  blush:      '#FF8DA1',
  peach:      '#FFAB76',
  gold:       '#FFB347',
  cream:      '#FFF0E0',
  warmGrad:   'linear-gradient(135deg, #FFB347, #FF6B6B, #C44569)',
  softGrad:   'linear-gradient(135deg, #FFF0E0, #FFE0EC, #F0E0FF)',
  sunsetGrad: 'linear-gradient(135deg, #FCAF45, #F77737, #E1306C, #C13584)',
  white:      '#FFFFFF',
  sage:       '#7CB69D',
  sageBg:     '#E8F5E8',
};

export default function InstaSunsetHomePreview() {
  const streak = 14;
  const practicesWeek = 5;
  const moonDays = 3;

  const yogis = [
    { name: 'You',    img: null, initials: 'D', practicing: true },
    { name: 'Priya',  img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', practicing: true },
    { name: 'Marco',  img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', practicing: true },
    { name: 'Yuki',   img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80', practicing: false },
    { name: 'Amit',   img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80', practicing: true },
    { name: 'Sofia',  img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80', practicing: false },
  ];

  const week = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const done = [true,true,false,true,true,true,false];

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: palette.bg,
      minHeight: '100vh',
      maxWidth: 430,
      margin: '0 auto',
      color: palette.ink,
    }}>
      {/* ── Header ── */}
      <div style={{
        background: palette.white,
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${palette.divider}`,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 12,
            background: palette.warmGrad,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: '#fff',
            boxShadow: '0 2px 8px rgba(255,107,107,0.25)',
          }}>🕉</div>
          <span style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 20, fontWeight: 700, color: palette.ink,
          }}>Ashtanga Sangha</span>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: 18,
          background: palette.sunsetGrad, padding: 2,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 16, background: palette.white,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: palette.rose,
          }}>D</div>
        </div>
      </div>

      <div style={{ padding: '0 0 80px 0' }}>

        {/* ── Hero + Guru Wisdom ── */}
        <div style={{
          margin: '16px 16px 0', borderRadius: 20, overflow: 'hidden',
          position: 'relative', height: 240,
          backgroundImage: 'url(https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80)',
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(252,175,69,0.15), rgba(225,48,108,0.65), rgba(196,69,105,0.85))',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            padding: 22,
          }}>
            {/* Wisdom */}
            <div style={{
              background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)',
              borderRadius: 14, padding: '14px 16px', marginBottom: 16,
              border: '1px solid rgba(255,255,255,0.25)',
            }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 600, letterSpacing: 1.2, marginBottom: 4, textTransform: 'uppercase' }}>
                ☀️ Daily Wisdom
              </div>
              <div style={{ fontSize: 15, fontStyle: 'italic', color: '#fff', lineHeight: 1.5 }}>
                "Practice, and all is coming."
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>— Sri K. Pattabhi Jois</div>
            </div>

            {/* CTA */}
            <button style={{
              background: palette.white, color: palette.rose,
              border: 'none', borderRadius: 24, padding: '14px 0',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
              width: '100%',
              boxShadow: '0 4px 16px rgba(196,69,105,0.25)',
            }}>
              🧘 Begin Your Practice
            </button>
          </div>
        </div>

        {/* ── Stats Ribbon ── */}
        <div style={{
          display: 'flex', margin: '16px 16px 0',
          background: palette.white, borderRadius: 18,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: `1px solid ${palette.divider}`,
          overflow: 'hidden',
        }}>
          {[
            { label: 'Streak', value: streak, icon: '🔥', color: palette.peach },
            { label: 'Week', value: `${practicesWeek}/7`, icon: '📅', color: palette.coral },
            { label: 'Moon', value: `${moonDays}d`, icon: '🌙', color: palette.rose },
            { label: 'Hours', value: '78', icon: '⏱', color: palette.gold },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: '14px 4px', textAlign: 'center',
              borderRight: i < 3 ? `1px solid ${palette.divider}` : 'none',
            }}>
              <div style={{ fontSize: 18 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color, marginTop: 2 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: palette.muted, fontWeight: 500, marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Weekly Rhythm ── */}
        <div style={{
          margin: '16px 16px 0', background: palette.white, borderRadius: 18,
          padding: '16px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: `1px solid ${palette.divider}`,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: palette.muted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
            This Week
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {week.map((d, i) => (
              <div key={d} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 18,
                  background: done[i] ? palette.warmGrad : palette.cream,
                  border: i === 6 ? `2px solid ${palette.peach}` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: done[i] ? '#fff' : palette.mutedLight,
                  fontSize: 13, fontWeight: 600,
                  boxShadow: done[i] ? '0 2px 8px rgba(255,107,107,0.2)' : 'none',
                }}>
                  {done[i] ? '✓' : '·'}
                </div>
                <span style={{
                  fontSize: 10, fontWeight: i === 6 ? 700 : 500,
                  color: i === 6 ? palette.peach : palette.muted,
                }}>{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sangha On the Mat (Stories-style) ── */}
        <div style={{ margin: '20px 0 0' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: palette.muted, marginBottom: 12, paddingLeft: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
            Sangha on the Mat
          </div>
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingLeft: 16, paddingRight: 16, paddingBottom: 4 }}>
            {yogis.map((y, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, minWidth: 68 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 32,
                  background: y.practicing ? palette.sunsetGrad : palette.divider,
                  padding: 3,
                }}>
                  {y.img ? (
                    <img src={y.img} alt={y.name} style={{
                      width: 58, height: 58, borderRadius: 29,
                      objectFit: 'cover', border: `3px solid ${palette.white}`,
                    }} />
                  ) : (
                    <div style={{
                      width: 58, height: 58, borderRadius: 29,
                      background: palette.cream, border: `3px solid ${palette.white}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, fontWeight: 700, color: palette.rose,
                    }}>{y.initials}</div>
                  )}
                </div>
                <span style={{ fontSize: 11, color: i === 0 ? palette.rose : palette.inkMid, fontWeight: i === 0 ? 600 : 400 }}>{y.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Community Feed ── */}
        <div style={{ margin: '20px 16px 0' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: palette.muted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
            Community
          </div>

          {/* Photo post */}
          <div style={{
            background: palette.white, borderRadius: 18,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: `1px solid ${palette.divider}`, overflow: 'hidden', marginBottom: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
              <div style={{ width: 38, height: 38, borderRadius: 19, background: palette.sunsetGrad, padding: 2 }}>
                <img src={yogis[1].img} alt="" style={{ width: 34, height: 34, borderRadius: 17, objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: palette.ink }}>Priya Sharma</div>
                <div style={{ fontSize: 11, color: palette.muted }}>2h ago · Mysore</div>
              </div>
            </div>
            <img src="https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=800&q=80"
              alt="" style={{ width: '100%', height: 200, objectFit: 'cover' }} />
            <div style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>❤️</span>
                <span style={{ fontSize: 20 }}>💬</span>
                <span style={{ fontSize: 20 }}>📤</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>36 likes</div>
              <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                <b>priya.sharma</b> Golden hour practice complete ☀️🧘‍♀️ The shala was absolutely magical this morning!
              </div>
            </div>
          </div>

          {/* Text post */}
          <div style={{
            background: palette.white, borderRadius: 18,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: `1px solid ${palette.divider}`, padding: 14, marginBottom: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 19, background: palette.sunsetGrad, padding: 2 }}>
                <img src={yogis[2].img} alt="" style={{ width: 34, height: 34, borderRadius: 17, objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Marco Rossi</div>
                <div style={{ fontSize: 11, color: palette.muted }}>5h ago</div>
              </div>
            </div>
            <div style={{
              background: palette.softGrad, borderRadius: 14, padding: 14,
              fontSize: 14, lineHeight: 1.5, color: palette.inkMid,
            }}>
              Reached kapotasana today for the first time 🎉 After months of patient work, the hips finally opened. Remember — every impossible posture eventually becomes possible 🙏
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
              <span style={{ fontSize: 12, color: palette.muted }}>❤️ 28</span>
              <span style={{ fontSize: 12, color: palette.muted }}>💬 12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
