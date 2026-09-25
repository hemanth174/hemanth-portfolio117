'use client'

import { FaGithub, FaInstagram, FaLinkedin, FaWhatsapp } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import { transition } from '../Skills/page'

// ─── Edit your links here ─────────────────────────────────────────────
// Replace WHATSAPP_NUMBER with your full international number (no +, no spaces).
// e.g. "919876543210" → https://wa.me/919876543210
const WHATSAPP_NUMBER = '918143276940'
const INSTAGRAM_USERNAME = 'hemanthatthuluri'

export const SOCIAL_LINKS = {
  github: 'https://github.com/hemanth174',
  linkedin: 'https://www.linkedin.com/in/hemanth-atthuluri/',
  email: 'mailto:ramasaiahemanth@gmail.com',
  whatsapp: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Hemanth! I saw your portfolio and want to connect!")}`,
  instagram: `https://instagram.com/${INSTAGRAM_USERNAME}`,
}

const socialItems = [
  { label: 'GitHub', href: SOCIAL_LINKS.github, Icon: FaGithub },
  { label: 'LinkedIn', href: SOCIAL_LINKS.linkedin, Icon: FaLinkedin },
  { label: 'Email', href: SOCIAL_LINKS.email, Icon: MdEmail },
  { label: 'WhatsApp', href: SOCIAL_LINKS.whatsapp, Icon: FaWhatsapp },
  { label: 'Instagram', href: SOCIAL_LINKS.instagram, Icon: FaInstagram },
]

const quickNav = [
  { label: 'ABOUT', id: 'section2' },
  { label: 'PROJECTS', id: 'section3' },
  { label: 'SKILLS', id: 'section4' },
  { label: 'EXPERIENCE', id: 'section5' },
  { label: 'CONTACT', id: 'section8' },
]

export const Footer = () => {
  const year = new Date().getFullYear()

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="relative overflow-hidden bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white px-6 md:px-10 pt-10 pb-6 font-mono border-t border-zinc-200 dark:border-zinc-900">
      {/* subtle glow decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-40 w-[42rem] -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl dark:bg-yellow-300/10"
      />

      <div className="relative mx-auto max-w-6xl flex flex-col items-center gap-6">
        {/* Brand */}
        <a
          href="#section1"
          onClick={(e) => {
            e.preventDefault()
            scrollTo('section1')
          }}
          className="inline-flex items-center gap-2 rounded-full border border-yellow-400 dark:border-yellow-300/70 bg-yellow-400 dark:bg-yellow-300 px-6 py-2 text-black shadow-[0_0_28px_rgba(250,204,21,0.35)] transition-transform hover:-translate-y-0.5"
        >
          <span className="text-lg font-extrabold tracking-tight">Built by</span>
          <span className="text-sm font-bold tracking-wide">Hemanth Atthuluri</span>
        </a>

        <p className="text-xs tracking-[0.2em] text-zinc-500 dark:text-zinc-400 text-center">
          OPEN TO INTERNSHIPS · FREELANCE · COLLABORATION
        </p>

        {/* Social icons — proper brand icons from react-icons, no inline SVG */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {socialItems.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target={label === 'Email' ? undefined : '_blank'}
              rel={label === 'Email' ? undefined : 'noopener noreferrer'}
              aria-label={`Connect on ${label}`}
              title={label}
              className="group flex h-11 w-11 items-center justify-center rounded-full border border-yellow-500/70 dark:border-yellow-400/70 text-zinc-600 dark:text-zinc-300 transition-all duration-300 hover:-translate-y-1 hover:bg-yellow-400 dark:hover:bg-yellow-300 hover:text-black dark:hover:text-black hover:border-yellow-400 dark:hover:border-yellow-300 hover:shadow-[0_8px_24px_rgba(250,204,21,0.35)]"
            >
              <Icon size={19} aria-hidden="true" />
              <span className="sr-only">{label}</span>
            </a>
          ))}
        </div>

        {/* Quick nav */}
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] font-bold tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
          {quickNav.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`${transition} cursor-pointer hover:text-zinc-900 dark:hover:text-white`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom bar */}
        <div className="w-full border-t border-zinc-200 dark:border-zinc-900 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] tracking-widest text-zinc-500 dark:text-zinc-600">
          <p>© {year} HEMANTH ATTHULURI · ALL RIGHTS RESERVED</p>
          <p className="hidden sm:block">DESIGNED & BUILT WITH NEXT.JS</p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="cursor-pointer font-bold tracking-[0.25em] text-amber-600 dark:text-yellow-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            BACK TO TOP ↑
          </button>
        </div>
      </div>
    </footer>
  )
}
