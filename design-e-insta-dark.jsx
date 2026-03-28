// Design E — "Insta Dark"
// Instagram's dark mode with vibrant gradient neon accents.
// Deep black bg (#000), gradient story rings, glowing cards, neon buttons.
// Colors: IG gradient + jet black #000, charcoal #121212, soft white #F5F5F5
import React from 'react';

const palette = {
  bg:         '#000000',
  card:       '#121212',
  cardHover:  '#1A1A1A',
  ink:        '#F5F5F5',
  muted:      '#A0A0A0',
  mutedDark:  '#666666',
  divider:    '#2A2A2A',
  pink:       '#E1306C',
  purple:     '#833AB4',
  orange:     '#F77737',
  yellow:     '#FCAF45',
  gradient:   'linear-gradient(135deg, #FCAF45, #F77737, #E1306C, #833AB4)',
  gradientSoft: 'linear-gradient(135deg, rgba(252,175,69,0.12), rgba(225,48,108,0.12), rgba(131,58,180,0.12))',
  glow:       '0 0 20px rgba(225,48,108,0.3), 0 0 60px rgba(131,58,180,0.15)',
  heartRed:   '#ED4956',
  white:      '#FFFFFF',
};

export default function InstaDarkHomePreview() {
  const streak = 14;
  const practicesWeek = 5;
  const moonDays = 3;

  const yogis = [
    { name: 'You',    img: null, initials: 'D', practicing: true },
    { name: 'Priya',  img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', practicing: true },
    { name: 'Marco',  img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', practicing: true },
    { name: 'Yuki',   img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80', practicing: false },
    { name: 'Amit',   img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80', practicing: true },
    { name: 'Sofia',  img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80', practicing: true },
    { name: 'Daniel', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80', practicing: false },
  ];

  const week = ['M','T','W','T','F','S','S'];
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
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${palette.divider}`,
        background: palette.bg,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: palette.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>🕉</div>
          <span style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 20, fontWeight: 700,
            background: palette.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Ashtanga Sangha</span>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <span style={{ fontSize: 20 }}>🔔</span>
          <span style={{ fontSize: 20 }}>⚙️</span>
        </div>
      </div>

      <div style={{ padding: '0 0 80px 0' }}>

        {/* ── Stories-style Sangha Row ── */}
        <div style={{ padding: '16px 0 12px', borderBottom: `1px solid ${palette.divider}` }}>
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingLeft: 16, paddingRight: 16 }}>
            {yogis.map((y, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 68 }}>
                <div style={{
                  width: 68, height: 68, borderRadius: 34,
                  background: y.practicing ? palette.gradient : palette.divider,
                  padding: 3, position: 'relative',
                }}>
                  {y.img ? (
                    <img src={y.img} alt={y.name} style={{
                      width: 62, height: 62, borderRadius: 31,
                      objectFit: 'cover', border: `3px solid ${palette.bg}`,
                    }} />
                  ) : (
                    <div style={{
                      width: 62, height: 62, borderRadius: 31,
                      background: palette.card, border: `3px solid ${palette.bg}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, fontWeight: 700,
                      backgroundImage: palette.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>{y.initials}</div>
                  )}
                  {y.practicing && (
                    <div style={{
                      position: 'absolute', bottom: 2, right: 2,
                      width: 14, height: 14, borderRadius: 7,
                      background: '#00D26A', border: `2px solid ${palette.bg}`,
                    }} />
                  )}
                </div>
                <span style={{ fontSize: 11, color: i === 0 ? palette.pink : palette.muted, fontWeight: i === 0 ? 600 : 400 }}>{y.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Practice CTA ── */}
        <div style={{
          margin: '16px 16px 0', borderRadius: 20, overflow: 'hidden',
          position: 'relative', height: 220,
          backgroundImage: 'url(https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80)',
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.85))',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            padding: 20,
          }}>
            <div style={{ fontSize: 13, color: palette.yellow, fontWeight: 600, letterSpacing: 1.2, marginBottom: 4, textTransform: 'uppercase' }}>
              ✨ Daily Wisdom
            </div>
            <div style={{ fontSize: 16, fontStyle: 'italic', color: '#fff', lineHeight: 1.5, marginBottom: 4, opacity: 0.92 }}>
              "Yoga is 99% practice, 1% theory."
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>— Sri K. Pattabhi Jois</div>

            <button style={{
              background: palette.gradient, color: '#fff',
              border: 'none', borderRadius: 24, padding: '14px 0',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
              width: '100%', boxShadow: palette.glow,
              letterSpacing: 0.5,
            }}>
              🧘 Begin Practice
            </button>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, margin: '16px 16px 0' }}>
          {[
            { label: 'Streak', value: streak, icon: '🔥', color: palette.orange },
            { label: 'This Week', value: `${practicesWeek}/7`, icon: '🗓', color: palette.pink },
            { label: 'Moon Day', value: `${moonDays}d`, icon: '🌙', color: palette.purple },
          ].map((s, i) => (
            <div key={i} style={{
              background: palette.card, borderRadius: 16,
              padding: '16px 8px', textAlign: 'center',
              border: `1px solid ${palette.divider}`,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: palette.gradientSoft, opacity: 0.5,
              }} />
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: 22 }}>{s.icon}</div>
                <div style={{
                  fontSize: 26, fontWeight: 800, marginTop: 4,
                  background: palette.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>{s.value}</div>
                <div style={{ fontSize: 11, color: palette.muted, marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Weekly Rhythm ── */}
        <div style={{
          margin: '16px 16px 0', background: palette.card, borderRadius: 16,
          padding: '16px', border: `1px solid ${palette.divider}`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: palette.muted, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
            This Week
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {week.map((d, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 19,
                  background: done[i] ? palette.gradient : 'transparent',
                  border: !done[i] ? `1.5px solid ${palette.divider}` : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: done[i] ? '#fff' : palette.mutedDark,
                  fontSize: 14, fontWeight: 600,
                  boxShadow: done[i] ? '0 0 12px rgba(225,48,108,0.3)' : 'none',
                }}>
                  {done[i] ? '✓' : ''}
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 500,
                  color: i === 6 ? palette.orange : done[i] ? palette.ink : palette.mutedDark,
                }}>{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Community Feed ── */}
        <div style={{ margin: '20px 16px 0' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: palette.muted, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
            Community Feed
          </div>

          <div style={{
            background: palette.card, borderRadius: 16,
            border: `1px solid ${palette.divider}`, overflow: 'hidden', marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
              <div style={{ width: 38, height: 38, borderRadius: 19, background: palette.gradient, padding: 2 }}>
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
                  alt="" style={{ width: 34, height: 34, borderRadius: 17, objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Marco Rossi</div>
                <div style={{ fontSize: 11, color: palette.muted }}>3h ago · Rome</div>
              </div>
            </div>
            <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80"
              alt="" style={{ width: '100%', height: 220, objectFit: 'cover' }} />
            <div style={{ padding: '14px 14px' }}>
              <div style={{ display: 'flex', gap: 18, marginBottom: 10 }}>
                <span style={{ fontSize: 22, cursor: 'pointer' }}>❤️</span>
                <span style={{ fontSize: 22, cursor: 'pointer' }}>💬</span>
                <span style={{ fontSize: 22, cursor: 'pointer' }}>📤</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>42 likes</div>
              <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                <b>marco.rossi</b> Sunrise practice in the eternal city 🌅🧘 Nothing beats primary series as the sun rises over Rome.
              </div>
            </div>
          </div>

          {/* Text post */}
          <div style={{
            background: palette.card, borderRadius: 16,
            border: `1px solid ${palette.divider}`, padding: 14, marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 19, background: palette.gradient, padding: 2 }}>
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80"
                  alt="" style={{ width: 34, height: 34, borderRadius: 17, objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Yuki Tanaka</div>
                <div style={{ fontSize: 11, color: palette.muted }}>5h ago · Tokyo</div>
              </div>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>
              Just completed my 30-day streak! 🎉 The consistency has completely transformed my practice. Body feels lighter, mind is clearer. Grateful for this sangha 🙏
            </div>
            <div style={{ display: 'flex', gap: 18, marginTop: 12 }}>
              <span style={{ fontSize: 13, color: palette.muted }}>❤️ 31</span>
              <span style={{ fontSize: 13, color: palette.muted }}>💬 8</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
