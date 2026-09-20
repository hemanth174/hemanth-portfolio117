'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

const TIMELINE = [
  { month: 'Month 1', title: 'Idea and scope', desc: 'Mapped what home automation could mean under the Physical AI theme — sensing a room and acting on it, not just remote switches.' },
  { month: 'Month 2', title: 'First prototype', desc: 'Basic breadboard circuit with ESP32 + DHT11 + PIR. Proved sensing worked, but wiring was fragile.' },
  { month: 'Month 3', title: 'Official deadline', desc: "The college's 3-month mark for the Physical AI track. Demo-able on a good day, not reliable. Build continued anyway.", marker: true },
  { month: 'Month 4', title: 'Rebuild from scratch', desc: 'First version could not hold up to real use. Rewired with proper relay isolation, common ground, and labelled harness.' },
  { month: 'Month 5', title: 'Automation logic', desc: 'Python + MQTT rules engine: occupancy + temperature thresholds, debounce, manual override. Tested edge cases.' },
  { month: 'Month 6', title: 'Full integration', desc: 'Sensors + control logic + React status UI on one network. 12 devices reporting through a single broker.' },
  { month: 'Month 7', title: 'Real-world testing', desc: 'Ran under everyday conditions — power dips, jostled wires, false triggers — and fixed what broke.' },
  { month: 'Month 8', title: 'Final build and demo', desc: "Locked the build and recorded the demo shown at Maker's Conclave.", marker: true },
];

const ROLES = [
  { title: 'Hardware and wiring', desc: 'Designed and wired the ESP32 / Arduino sensor + 4-channel relay setup that reads a room and switches devices safely.' },
  { title: 'Automation logic', desc: 'Wrote the MQTT + Python decision logic with hysteresis and override, so the system acts on its own without flapping.' },
  { title: 'Testing and debugging', desc: 'Ran repeated real-condition tests, traced brownouts and false PIR triggers back to power and placement.' },
  { title: 'Documentation and demo', desc: 'Put together the datasheet-style write-up and the demo video shown at Maker’s Conclave.' },
];

const STACK_PRIMARY = ['ESP32', 'Arduino Uno', 'Python', 'MQTT', 'React'];
const STACK_SECONDARY = ['DHT11', 'PIR sensor', '4-ch Relay', 'Raspberry Pi (broker)', 'JavaScript', 'C++ (firmware)'];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal-on-scroll');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in-view'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in-view');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useCountUp() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = document.querySelectorAll<HTMLElement>('.count');
    const run = (el: HTMLElement) => {
      const target = parseInt(el.dataset.target || '0', 10) || 0;
      if (reduce) {
        el.textContent = String(target);
        return;
      }
      const dur = 900;
      let start: number | null = null;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        el.textContent = String(Math.floor(p * target));
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = String(target);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) {
      els.forEach(run);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            run(e.target as HTMLElement);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useTilt() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const els = document.querySelectorAll<HTMLElement>('.tilt');
    const cleanups: Array<() => void> = [];
    els.forEach((el) => {
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(700px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`;
      };
      const leave = () => {
        el.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg)';
      };
      el.addEventListener('mousemove', move);
      el.addEventListener('mouseleave', leave);
      cleanups.push(() => {
        el.removeEventListener('mousemove', move);
        el.removeEventListener('mouseleave', leave);
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);
}

function useHeroNetwork(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const N = 55;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() - 0.5,
      y: Math.random() - 0.5,
      z: Math.random() - 0.5,
      s: 0.4 + Math.random() * 1.2,
    }));
    let angle = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = parent.clientWidth;
      h = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const hero = canvas.parentElement;
    const onMove = (e: MouseEvent) => {
      if (!hero) return;
      const r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 30;
      ty = -((e.clientY - r.top) / r.height - 0.5) * 22;
    };
    hero?.addEventListener('mousemove', onMove);

    const draw = () => {
      raf = requestAnimationFrame(draw);
      angle += 0.0015;
      cx += (tx - cx) * 0.03;
      cy += (ty - cy) * 0.03;
      ctx.clearRect(0, 0, w, h);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const projected = pts.map((p) => {
        const rx = p.x * cos - p.z * sin;
        const rz = p.x * sin + p.z * cos;
        return {
          x: w / 2 + rx * w * 0.42 + cx,
          y: h / 2 + p.y * h * 0.7 + cy,
          depth: (rz + 0.5) / 1,
          s: p.s,
        };
      });
      ctx.lineWidth = 1;
      for (let a = 0; a < projected.length; a++) {
        for (let b = a + 1; b < projected.length; b++) {
          const dx = projected[a].x - projected[b].x;
          const dy = projected[a].y - projected[b].y;
          const d = Math.hypot(dx, dy);
          if (d < 130) {
            ctx.strokeStyle = `rgba(111,169,122,${(0.22 * (1 - d / 130)).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(projected[a].x, projected[a].y);
            ctx.lineTo(projected[b].x, projected[b].y);
            ctx.stroke();
          }
        }
      }
      projected.forEach((p) => {
        ctx.fillStyle = 'rgba(226,163,84,0.9)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s + p.depth * 1.2, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      hero?.removeEventListener('mousemove', onMove);
    };
  }, [canvasRef]);
}

export default function EventCaseStudyPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme, setTheme } = useTheme();
  // Default to the classic dark look until hydration, then follow the site theme.
  const isDark = theme ? theme !== 'light' : true;
  useReveal();
  useCountUp();
  useTilt();
  useHeroNetwork(canvasRef);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      {/* Floating theme toggle — fixed, so it stays visible while scrolling */}
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="hoas-theme-toggle"
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <main className={isDark ? 'hoas' : 'hoas light'}>
        <section id="hero" aria-label="Project hero" className="hero">
          <div className="hero-3d" aria-hidden="true">
            <canvas ref={canvasRef} />
          </div>
          <div className="wrap hero-content">
            <p className="kicker">
              <Link href="/#section7" className="back">← Events</Link> · Project story · Maker&apos;s Conclave
            </p>
            <h1>Home Automation System</h1>
            <p className="lede">What our college gave three months to build — and what it actually took to get right.</p>
            <section id="stats" aria-label="Key figures" className="stat-strip">
              <div className="stat">
                <span className="stat-value"><span className="count" data-target="3">3</span> months</span>
                <span className="stat-label">given by the college</span>
              </div>
              <div className="stat">
                <span className="stat-value"><span className="count" data-target="8">8</span> months</span>
                <span className="stat-label">actually spent building</span>
              </div>
              <div className="stat">
                <span className="stat-value"><span className="count" data-target="5">5</span> members</span>
                <span className="stat-label">team size</span>
              </div>
              <div className="stat">
                <span className="stat-value"><span className="count" data-target="12">12</span> devices</span>
                <span className="stat-label">sensors + actuators</span>
              </div>
            </section>
          </div>
        </section>

        <section id="story" aria-labelledby="story-h">
          <div className="wrap">
            <h2 id="story-h">Project story</h2>
            <p>The brief for Maker&apos;s Conclave was simple to say and hard to do: build something under the Physical AI theme that actually runs in a real, physical space. We picked home automation — a system that could sense a room and act on it, instead of a switch you still have to walk over and flip.</p>
            <p>The college gave the project three months. That was enough for a version that technically worked on a breadboard, in a demo, under ideal conditions. It was not enough for a version that kept working when wiring got jostled, power dipped, or logic hit an edge case nobody planned for. Getting from &ldquo;it works&rdquo; to &ldquo;it works reliably&rdquo; is where the other five months went.</p>
          </div>
        </section>

        <section id="timeline" aria-labelledby="timeline-h">
          <div className="wrap">
            <h2 id="timeline-h">Build timeline</h2>
            <p className="section-intro">Eight months, month by month — 3-month plan vs 8-month reality.</p>
            <div className="timeline">
              {TIMELINE.map((m, i) => (
                <div key={m.month} className={`timeline-item reveal-on-scroll${m.marker ? ' marker' : ''}`}>
                  <span className="timeline-dot" aria-hidden="true" />
                  <span className="timeline-month mono">{m.month}</span>
                  <div className="timeline-title">{m.title}</div>
                  <div className="timeline-desc">{m.desc}</div>
                  {i === 2 && <div className="timeline-flag mono">planned deadline</div>}
                  {i === TIMELINE.length - 1 && <div className="timeline-flag mono">demo day · maker&apos;s conclave</div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="roles" aria-labelledby="roles-h">
          <div className="wrap">
            <h2 id="roles-h">My contributions</h2>
            <p className="section-intro">The parts I personally owned across the 8-month build.</p>
            <div className="contrib-list">
              {ROLES.map((r) => (
                <div key={r.title} className="contrib-item reveal-on-scroll tilt" tabIndex={0}>
                  <h3>{r.title}</h3>
                  <p>{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="demo" aria-labelledby="demo-h">
          <div className="wrap">
            <h2 id="demo-h">Watch it in action</h2>
            <div className="video-frame reveal-on-scroll">
              <div className="video-screen tilt">
                <button className="play-btn" aria-label="Play demo video (placeholder — add real video URL)">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="#15130f" aria-hidden="true">
                    <path d="M5 3.5v13l11-6.5-11-6.5z" />
                  </svg>
                </button>
              </div>
              <div className="video-caption">
                <span>Demo footage recorded at Maker&apos;s Conclave</span>
                <span className="mono">00:00 / --:--</span>
              </div>
            </div>
            {/* Replace placeholder above with:
                <video controls poster="..."><source src="YOUR_VIDEO_URL" type="video/mp4" /></video>
                or a YouTube <iframe> embed. */}
          </div>
        </section>

        <section id="tech-stack" aria-labelledby="stack-h">
          <div className="wrap">
            <h2 id="stack-h">Built with</h2>
            <p className="section-intro">Primary control path in copper, sensing + firmware in circuit-green.</p>
            <div className="chip-row reveal-on-scroll" role="list">
              {STACK_PRIMARY.map((c) => (
                <span key={c} role="listitem" className="chip chip-primary">{c}</span>
              ))}
              {STACK_SECONDARY.map((c) => (
                <span key={c} role="listitem" className="chip">{c}</span>
              ))}
            </div>
          </div>
        </section>

        <footer>
          <div className="wrap">
            <p>Documented for the portfolio. Presented at Maker&apos;s Conclave. <Link href="/#section7">Back to events</Link>.</p>
          </div>
        </footer>

        <style>{`
          .hoas {
            --bg: #15130f;
            --surface: #1d1a14;
            --surface-2: #262219;
            --border: #3a3326;
            --text: #ede7d9;
            --text-muted: #a79f8c;
            --accent: #c98a3e;
            --accent-strong: #e2a354;
            --accent-green: #6fa97a;
            --radius: 10px;
            background: var(--bg);
            color: var(--text);
            font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif;
            line-height: 1.6;
            min-height: 100vh;
          }
          .hoas .wrap { max-width: 760px; margin: 0 auto; padding: 0 24px; }
          .hoas .mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
          .hoas a { color: var(--accent-strong); }
          .hoas .hero { position: relative; padding: 96px 0 56px; overflow: hidden; border-bottom: 1px solid var(--border); }
          .hoas .hero-3d { position: absolute; inset: 0; pointer-events: none; }
          .hoas .hero-3d canvas { display: block; }
          .hoas .hero-content { position: relative; z-index: 1; }
          .hoas .kicker { color: var(--text-muted); font-size: 0.95rem; margin: 0 0 18px; }
          .hoas .back { text-decoration: none; }
          .hoas h1 {
            font-family: 'Space Grotesk', sans-serif; font-weight: 700;
            font-size: clamp(2.1rem, 6vw, 3.4rem); line-height: 1.08;
            margin: 0 0 20px; max-width: 14ch; color: var(--text);
          }
          .hoas .lede { color: var(--text-muted); font-size: 1.1rem; max-width: 46ch; margin: 0 0 40px; }
          .hoas .stat-strip {
            display: flex; flex-wrap: wrap; border: 1px solid var(--border);
            border-radius: var(--radius); background: rgba(29,26,20,0.82); overflow: hidden;
          }
          .hoas .stat { flex: 1 1 160px; padding: 20px 22px; border-right: 1px solid var(--border); }
          .hoas .stat:last-child { border-right: none; }
          .hoas .stat-value { font-family: 'IBM Plex Mono', monospace; font-weight: 600; font-size: 1.5rem; color: var(--accent-strong); display: block; margin-bottom: 4px; }
          .hoas .stat-label { color: var(--text-muted); font-size: 0.88rem; }
          .hoas section { padding: 64px 0; border-bottom: 1px solid var(--border); }
          .hoas section:last-of-type { border-bottom: none; }
          .hoas h2 { font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 1.5rem; margin: 0 0 22px; color: var(--accent); }
          .hoas .section-intro { color: var(--text-muted); max-width: 62ch; margin: -6px 0 28px; }
          .hoas p { margin: 0 0 18px; max-width: 68ch; }
          .hoas .reveal-on-scroll { opacity: 0; transform: translateY(18px); transition: opacity 0.6s ease, transform 0.6s ease; }
          .hoas .reveal-on-scroll.in-view { opacity: 1; transform: translateY(0); }
          .hoas .timeline { position: relative; margin-left: 6px; padding-left: 30px; border-left: 2px dashed var(--border); }
          .hoas .timeline-item { position: relative; padding-bottom: 34px; }
          .hoas .timeline-item:last-child { padding-bottom: 0; }
          .hoas .timeline-dot { position: absolute; left: -38px; top: 3px; width: 14px; height: 14px; border-radius: 50%; background: var(--bg); border: 2px solid var(--accent); }
          .hoas .timeline-item.marker .timeline-dot { border-color: var(--accent-green); background: var(--accent-green); box-shadow: 0 0 0 4px rgba(111,169,122,0.15); }
          .hoas .timeline-item.in-view .timeline-dot { box-shadow: 0 0 0 5px rgba(201,138,62,0.14); }
          .hoas .timeline-item.marker.in-view .timeline-dot { box-shadow: 0 0 0 5px rgba(111,169,122,0.22); }
          .hoas .timeline-month { display: block; color: var(--text-muted); font-size: 0.82rem; margin-bottom: 4px; text-transform: uppercase; }
          .hoas .timeline-title { font-weight: 600; font-size: 1.05rem; margin-bottom: 6px; }
          .hoas .timeline-item.marker .timeline-title { color: var(--accent-green); }
          .hoas .timeline-desc { color: var(--text-muted); font-size: 0.96rem; max-width: 52ch; }
          .hoas .timeline-flag { display: inline-block; margin-top: 8px; font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent-green); border: 1px dashed var(--border); padding: 2px 8px; border-radius: 4px; }
          .hoas .contrib-list { display: grid; gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
          .hoas .contrib-item { background: var(--surface); padding: 22px 24px; display: grid; gap: 6px; }
          .hoas .contrib-item:hover, .hoas .contrib-item:focus-visible { background: var(--surface-2); outline: 1px solid var(--accent); }
          .hoas .contrib-item h3 { font-size: 1rem; margin: 0; color: var(--text); }
          .hoas .contrib-item p { margin: 0; color: var(--text-muted); font-size: 0.95rem; }
          .hoas .video-frame { border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); padding: 10px; }
          .hoas .video-screen {
            position: relative; aspect-ratio: 16 / 9; border-radius: 6px;
            background: radial-gradient(circle at 30% 20%, rgba(201,138,62,0.16), transparent 55%), repeating-linear-gradient(45deg, var(--surface-2) 0 2px, transparent 2px 22px);
            border: 1px solid var(--border); display: flex; align-items: center; justify-content: center;
          }
          .hoas .play-btn { width: 62px; height: 62px; border-radius: 50%; background: var(--accent); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; }
          .hoas .play-btn:hover { background: var(--accent-strong); transform: scale(1.06); }
          .hoas .video-caption { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 12px 10px 4px; color: var(--text-muted); font-size: 0.86rem; }
          .hoas .chip-row { display: flex; flex-wrap: wrap; gap: 10px; }
          .hoas .chip { font-family: 'IBM Plex Mono', monospace; font-size: 0.85rem; color: var(--text-muted); border: 1px dashed var(--border); border-radius: 6px; padding: 7px 12px; }
          .hoas .chip-primary { border-style: solid; border-color: var(--accent); color: var(--accent-strong); }
          .hoas .chip:hover { transform: translateY(-3px); border-color: var(--accent); color: var(--accent-strong); }
          .hoas footer { padding: 48px 0 72px; color: var(--text-muted); font-size: 0.9rem; }
          /* Light mode — same layout, warm paper palette */
          .hoas.light {
            --bg: #faf7f0;
            --surface: #ffffff;
            --surface-2: #f1eadd;
            --border: #e0d5bf;
            --text: #221c11;
            --text-muted: #6f6452;
            --accent: #b7791f;
            --accent-strong: #a86e14;
            --accent-green: #3f7a4d;
          }
          .hoas.light .stat-strip { background: rgba(255,255,255,0.88); }
          .hoas.light .video-screen {
            background: radial-gradient(circle at 30% 20%, rgba(183,121,31,0.14), transparent 55%), repeating-linear-gradient(45deg, var(--surface-2) 0 2px, transparent 2px 22px);
          }
          /* Floating theme toggle — always on screen, even while scrolling */
          .hoas-theme-toggle {
            position: fixed; top: 18px; right: 18px; z-index: 60;
            width: 40px; height: 40px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            background: #e2a354; color: #15130f; border: none; cursor: pointer;
            box-shadow: 0 6px 20px rgba(0,0,0,0.35);
            transition: transform 0.2s ease, background 0.2s ease;
          }
          .hoas-theme-toggle:hover { transform: scale(1.08); background: #c98a3e; }
          .hoas-theme-toggle:active { transform: scale(0.95); }
          @media (max-width: 600px) {
            .hoas .hero { padding: 64px 0 40px; }
            .hoas section { padding: 48px 0; }
            .hoas .stat { border-right: none; border-bottom: 1px solid var(--border); }
            .hoas .stat:last-child { border-bottom: none; }
          }
          @media (prefers-reduced-motion: reduce) {
            .hoas .reveal-on-scroll { transition: none; opacity: 1; transform: none; }
            .hoas .chip:hover { transform: none; }
          }
        `}</style>
      </main>
    </>
  );
}
