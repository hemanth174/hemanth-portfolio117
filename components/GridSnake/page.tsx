'use client'

import { useEffect, useRef } from 'react'

// Must match the hero grid layer's [background-size:44px_44px]
const CELL = 44
const SPEED = 130 // px per second
const TRAIL_POINTS = 105

type Dir = { x: number; y: number }

type Wanderer = {
  x: number
  y: number
  dir: Dir
  dist: number // px traveled since last turn decision
  trail: { x: number; y: number }[]
  kind: 'gold' | 'soft'
}

const DIRS: Dir[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
]

const isReverse = (a: Dir, b: Dir) => a.x === -b.x && a.y === -b.y

/**
 * Ambient decoration for the hero: glowing snakes that wander the
 * background grid on their own. No input, no game — pure animation.
 * Pauses when off-screen / tab hidden, and stays still if the user
 * prefers reduced motion.
 */
export const GridSnake = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const section = canvas?.parentElement
    if (!canvas || !section) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Track dark mode via the <html> class so theme toggles never
    // restart the animation (no flash, no reload feel).
    const darkRef = { current: document.documentElement.classList.contains('dark') }
    const themeObserver = new MutationObserver(() => {
      darkRef.current = document.documentElement.classList.contains('dark')
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const rect = section.getBoundingClientRect()
      w = Math.max(1, rect.width)
      h = Math.max(1, rect.height)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(section)

    const MARGIN = 24
    const inBounds = (x: number, y: number) =>
      x > MARGIN && x < w - MARGIN && y > MARGIN && y < h - MARGIN

    const spawn = (kind: 'gold' | 'soft', fx: number, fy: number): Wanderer => {
      const x = Math.min(Math.max(w * fx, MARGIN + CELL), w - MARGIN - CELL)
      const y = Math.min(Math.max(h * fy, MARGIN + CELL), h - MARGIN - CELL)
      const trail: { x: number; y: number }[] = []
      for (let i = TRAIL_POINTS; i > 0; i--) {
        trail.push({ x: x - i * 5, y })
      }
      return { x, y, dir: { x: 1, y: 0 }, dist: 0, trail, kind }
    }

    const snakes: Wanderer[] = [
      spawn('gold', 0.3, 0.4),
      spawn('soft', 0.65, 0.65),
    ]
    // Second snake drifts the other way
    snakes[1].dir = { x: -1, y: 0 }

    const pickTurn = (s: Wanderer) => {
      // Candidates: anything except reversing, preferring cells in bounds
      const options = DIRS.filter((d) => !isReverse(d, s.dir))
      const safe = options.filter((d) => inBounds(s.x + d.x * CELL, s.y + d.y * CELL))
      const pool = safe.length > 0 ? safe : DIRS.filter((d) => inBounds(s.x + d.x * CELL, s.y + d.y * CELL))
      if (pool.length === 0) return
      const straight = pool.find((d) => d.x === s.dir.x && d.y === s.dir.y)
      // 62% keep going straight when possible, else wander
      if (straight && Math.random() < 0.62) {
        s.dir = straight
      } else {
        s.dir = pool[Math.floor(Math.random() * pool.length)]
      }
    }

    const step = (s: Wanderer, dt: number) => {
      s.x += s.dir.x * SPEED * dt
      s.y += s.dir.y * SPEED * dt
      s.dist += SPEED * dt

      const last = s.trail[s.trail.length - 1]
      if (!last || Math.hypot(s.x - last.x, s.y - last.y) > 5) {
        s.trail.push({ x: s.x, y: s.y })
        if (s.trail.length > TRAIL_POINTS) s.trail.shift()
      }

      if (s.dist >= CELL) {
        s.dist = 0
        pickTurn(s)
      }

      // Clamp trail points inside the canvas after resizes
      for (const p of s.trail) {
        if (p.x < 0) p.x = 0
        if (p.y < 0) p.y = 0
        if (p.x > w) p.x = w
        if (p.y > h) p.y = h
      }
    }

    const colorFor = (kind: 'gold' | 'soft') =>
      kind === 'gold'
        ? (a: number) => `rgba(250, 204, 21, ${a})`
        : (a: number) =>
            darkRef.current
              ? `rgba(255, 255, 255, ${a * 0.7})`
              : `rgba(120, 113, 108, ${a * 0.8})`

    const drawSnake = (s: Wanderer) => {
      const color = colorFor(s.kind)
      const n = s.trail.length
      if (n < 2) return
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      // Pass 0: wide soft glow, pass 1: bright core
      for (let pass = 0; pass < 2; pass++) {
        for (let i = 1; i < n; i++) {
          const t = i / n
          ctx.strokeStyle = color((pass === 0 ? 0.12 : 0.65) * t)
          ctx.lineWidth = (pass === 0 ? 11 : 4) * (0.35 + 0.65 * t)
          ctx.beginPath()
          ctx.moveTo(s.trail[i - 1].x, s.trail[i - 1].y)
          ctx.lineTo(s.trail[i].x, s.trail[i].y)
          ctx.stroke()
        }
      }
      // Glowing head
      ctx.save()
      ctx.shadowColor = s.kind === 'gold' ? 'rgba(250, 204, 21, 0.9)' : 'rgba(250, 204, 21, 0.4)'
      ctx.shadowBlur = 18
      ctx.fillStyle = color(0.95)
      ctx.beginPath()
      ctx.arc(s.x, s.y, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    let raf = 0
    let last = performance.now()
    let visible = true
    let running = false

    const frame = (now: number) => {
      if (!running) return
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      for (const s of snakes) {
        step(s, dt)
        drawSnake(s)
      }
      raf = requestAnimationFrame(frame)
    }

    const play = () => {
      if (running || !visible || document.hidden) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }

    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    const onVisibility = () => {
      if (document.hidden) stop()
      else play()
    }

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true
        if (visible) play()
        else stop()
      },
      { threshold: 0 }
    )
    io.observe(section)
    document.addEventListener('visibilitychange', onVisibility)
    play()

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      themeObserver.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
    />
  )
}
