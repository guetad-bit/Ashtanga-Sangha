// Design D — "Insta Glow"
// Instagram gradient palette on a clean white canvas.
// Stories ring around avatars, soft shadows, warm gradient CTAs.
// Colors: IG pink #E1306C, purple #833AB4, orange #F77737, yellow #FCAF45, white bg #FAFAFA
import React from 'react';

const palette = {
  bg:         '#FAFAFA',
  card:       '#FFFFFF',
  ink:        '#262626',
  muted:      '#8E8E8E',
  mutedLight: '#C7C7C7',
  divider:    '#EFEFEF',
  pink:       '#E1306C',
  purple:     '#833AB4',
  orange:     '#F77737',
  yellow:     '#FCAF45',
  gradient:   'linear-gradient(135deg, #FCAF45, #F77737, #E1306C, #833AB4)',
  gradientBg: 'linear-gradient(135deg, #fdf2f8, #faf5ff, #fff7ed)',
  ring:       'linear-gradient(135deg, #FCAF45, #F77737, #E1306C, #833AB4)',
  white:      '#FFFFFF',
  heartRed:   '#ED4956',
  sage:       '#34D399',
};

export default function InstaGlowHomePreview() {
  const streak = 14;
  const practicesWeek = 5;
  const totalMinutes = 4680;
  const moonDays = 3;

  const yogis = [
    { name: 'Priya',  img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80', practicing: true },
    { name: 'Marco',  img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80', practicing: true },
    { name: 'Yuki',   img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80', practicing: false },
    { name: 'Amit',   img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80', practicing: true },
    { name: 'Sofia',  img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80', practicing: false },
    { name: 'Daniel', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80', practicing: true },
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
      overflow: 'hidden',
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
            width: 32, height: 32, borderRadius: 10,
            background: palette.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>🕉</div>
          <span style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 20, fontWeight: 700, color: palette.ink,
          }}>Ashtanga Sangha</span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 22, cursor: 'pointer' }}>🔔</span>
          <div style={{
            width: 34, height: 34, borderRadius: 17,
            background: palette.gradient, padding: 2,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 15, background: palette.white,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: palette.purple,
            }}>D</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 0 80px 0', overflowY: 'auto' }}>

        {/* ── Guru Wisdom Banner ── */}
        <div style={{
          margin: '16px 16px 0',
          background: palette.gradient,
          borderRadius: 16, padding: '20px 18px',
          color: '#fff', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ opacity: 0.15, position: 'absolute', right: -10, top: -10, fontSize: 120 }}>☀️</div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, opacity: 0.85, marginBottom: 6, textTransform: 'uppercase' }}>
              ✨ Daily Wisdom
            </div>
            <div style={{ fontSize: 17, fontStyle: 'italic', lineHeight: 1.5, fontWeight: 500 }}>
              "Practice, and all is coming."
            </div>
            <div style={{ fontSize: 13, marginTop: 6, opacity: 0.8 }}>— Sri K. Pattabhi Jois</div>
          </div>
        </div>

        {/* ── Practice CTA Hero ── */}
        <div style={{
          margin: '16px 16px 0', borderRadius: 16, overflow: 'hidden',
          position: 'relative', height: 200,
          backgroundImage: 'url(https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80)',
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(131,58,180,0.3), rgba(225,48,108,0.7))',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 4, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              Ready for Your Practice?
            </div>
            <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, marginBottom: 16 }}>
              🔥 {streak}-day streak · {practicesWeek}/7 this week
            </div>
            <button style={{
              background: palette.white, color: palette.pink,
              border: 'none', borderRadius: 24, padding: '12px 36px',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(225,48,108,0.3)',
            }}>
              🧘 Begin Practice
            </button>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div style={{
          display: 'flex', gap: 10, margin: '16px 16px 0',
        }}>
          {[
            { label: 'Streak', value: `${streak}`, icon: '🔥', color: palette.orange },
            { label: 'This Week', value: `${practicesWeek}/7`, icon: '📅', color: palette.purple },
            { label: 'Moon Day', value: `${moonDays}d`, icon: '🌙', color: palette.pink },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, background: palette.card, borderRadius: 14,
              padding: '14px 8px', textAlign: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              border: `1px solid ${palette.divider}`,
            }}>
              <div style={{ fontSize: 20 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: palette.muted, marginTop: 2, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Weekly Rhythm ── */}
        <div style={{
          margin: '16px 16px 0', background: palette.card, borderRadius: 14,
          padding: '16px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          border: `1px solid ${palette.divider}`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: palette.ink, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            This Week
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {week.map((d, i) => (
              <div key={d} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 18,
                  background: done[i] ? palette.gradient : palette.bg,
                  border: i === 6 ? `2px solid ${palette.orange}` : done[i] ? 'none' : `1.5px solid ${palette.mutedLight}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: done[i] ? '#fff' : palette.muted,
                  fontSize: 14, fontWeight: 600,
                }}>
                  {done[i] ? '✓' : ''}
                </div>
                <span style={{
                  fontSize: 11, fontWeight: i === 6 ? 700 : 500,
                  color: i === 6 ? palette.orange : palette.muted,
                }}>{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sangha On the Mat (Stories-style) ── */}
        <div style={{ margin: '20px 0 0' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: palette.ink, marginBottom: 12, paddingLeft: 16, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Sangha on the Mat
          </div>
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingLeft: 16, paddingRight: 16, paddingBottom: 4 }}>
            {yogis.map((y, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 68 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 32,
                  background: y.practicing ? palette.gradient : palette.divider,
                  padding: 3,
                }}>
                  <img src={y.img} alt={y.name} style={{
                    width: 58, height: 58, borderRadius: 29,
                    objectFit: 'cover', border: '3px solid #fff',
                  }} />
                </div>
                <span style={{ fontSize: 11, color: palette.ink, fontWeight: 500 }}>{y.name}</span>
                {y.practicing && (
                  <span style={{
                    fontSize: 9, background: '#E8F5E8', color: '#27A844',
                    padding: '2px 8px', borderRadius: 10, fontWeight: 600,
                  }}>LIVE</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Community Feed ── */}
        <div style={{ margin: '20px 16px 0' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: palette.ink, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Community Feed
          </div>
          {/* Feed post */}
          <div style={{
            background: palette.card, borderRadius: 14,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            border: `1px solid ${palette.divider}`, overflow: 'hidden', marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: palette.gradient, padding: 2 }}>
                <img src={yogis[0].img} alt="" style={{ width: 32, height: 32, borderRadius: 16, objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: palette.ink }}>Priya Sharma</div>
                <div style={{ fontSize: 11, color: palette.muted }}>2h ago · Mysore</div>
              </div>
            </div>
            <img src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80"
              alt="" style={{ width: '100%', height: 200, objectFit: 'cover' }} />
            <div style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
                <span style={{ fontSize: 20, cursor: 'pointer' }}>❤️</span>
                <span style={{ fontSize: 20, cursor: 'pointer' }}>💬</span>
                <span style={{ fontSize: 20, cursor: 'pointer' }}>📤</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: palette.ink }}>24 likes</div>
              <div style={{ fontSize: 13, color: palette.ink, marginTop: 4 }}>
                <b>priya.sharma</b> Morning practice complete 🧘‍♀️✨ Primary series felt amazing today!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
