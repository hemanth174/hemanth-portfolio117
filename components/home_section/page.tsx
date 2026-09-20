'use client'
import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { transition } from "../Skills/page"
import { useTheme } from "next-themes"
import { Sun, Moon, Menu, ChevronDown } from "lucide-react"
import { GridSnake } from "../GridSnake/page"

let isHydrated = false
const hydrationListeners = new Set<() => void>()

function subscribeToHydration(listener: () => void) {
    hydrationListeners.add(listener)
    return () => hydrationListeners.delete(listener)
}

function getHydrationSnapshot() {
    return isHydrated
}

function getServerHydrationSnapshot() {
    return false
}

function markHydrated() {
    if (isHydrated) {
        return
    }

    isHydrated = true
    hydrationListeners.forEach((listener) => listener())
}

export const HomeSection = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [dragY, setDragY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartY = useRef(0);
    const sectionRef = useRef<HTMLElement | null>(null);
    const hoverFxRef = useRef<HTMLDivElement | null>(null);
    const [isHoveringHero, setIsHoveringHero] = useState(false);
    const { theme, setTheme } = useTheme();
    const hydrated = useSyncExternalStore(subscribeToHydration, getHydrationSnapshot, getServerHydrationSnapshot);
    const isDarkTheme = hydrated ? theme === 'dark' : true;

    const navItems = [
        { id: 'section2', label: 'ABOUT' },
        { id: 'section3', label: 'SKILLS' },
        { id: 'section4', label: 'PROJECTS' },
        { id: 'section5', label: 'EXPERIENCE' },
        { id: 'section6', label: 'CERTIFICATION' },
        { id: 'section7', label: 'EVENTS' },
        { id: 'section8', label: 'CONTACT' },
    ];

    useEffect(() => {
        markHydrated();
        const handleScroll = () => {
            if (window.scrollY > 80) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }

            const sections = ['section2', 'section3', 'section4', 'section5', 'section6', 'section7', 'section8'];
            const scrollPosition = window.scrollY + 140;

            let currentSection = '';
            for (const sectionId of sections) {
                const el = document.getElementById(sectionId);
                if (el) {
                    const top = el.offsetTop;
                    const height = el.offsetHeight;
                    if (scrollPosition >= top && scrollPosition < top + height) {
                        currentSection = sectionId;
                        break;
                    }
                }
            }

            // Bottom of page fallback for Contact section
            if ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight - 50) {
                currentSection = 'section8';
            }

            setActiveSection(currentSection);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(id);
        }
    };

    const handleSheetNavClick = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
        e.preventDefault();
        setIsMenuOpen(false);
        setDragY(0);
        const el = document.getElementById(id);
        if (el) {
            // Wait for the sheet to slide away before scrolling
            setTimeout(() => {
                el.scrollIntoView({ behavior: 'smooth' });
                setActiveSection(id);
            }, 150);
        }
    };

    // Drag-to-close handlers for the mobile bottom sheet (only way to dismiss it)
    const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDragging(true);
        dragStartY.current = e.clientY;
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handleDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        const dy = e.clientY - dragStartY.current;
        setDragY(dy > 0 ? dy : 0);
    };

    const handleDragEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);
        if (dragY > 90) {
            setIsMenuOpen(false);
        }
        setDragY(0);
    };

    // Cursor spotlight — paints a golden glow + illuminated grid around the pointer.
    // Updates the layer directly via refs (no re-render per mousemove).
    const paintHeroHover = (clientX: number, clientY: number) => {
        const section = sectionRef.current;
        const fx = hoverFxRef.current;
        if (!section || !fx) return;
        const rect = section.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        fx.style.backgroundImage = `radial-gradient(220px circle at ${x}px ${y}px, rgba(250, 204, 21, 0.22), transparent 70%), linear-gradient(to right, rgba(234, 179, 8, 0.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(234, 179, 8, 0.45) 1px, transparent 1px)`;
        fx.style.backgroundSize = 'auto, 44px 44px, 44px 44px';
        const mask = `radial-gradient(280px circle at ${x}px ${y}px, black, transparent 75%)`;
        fx.style.maskImage = mask;
        fx.style.webkitMaskImage = mask;
    };

    const handleHeroMouseMove = (e: React.MouseEvent) => {
        paintHeroHover(e.clientX, e.clientY);
    };

    // Lock background scroll while the sheet is open
    useEffect(() => {
        if (!isMenuOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [isMenuOpen]);

    return (
        <>
            <div className="main-container">
                <header className="fixed z-50 flex flex-row justify-between items-center min-h-16 md:min-h-20 w-full bg-zinc-50/70 dark:bg-black/60 backdrop-blur-xl text-zinc-900 dark:text-white px-4 sm:px-6 py-3 md:py-2 border-b border-zinc-200 dark:border-zinc-900">
                    <a
                        href="#section1"
                        aria-label="Hemanth Atthuluri home"
                        className={`group inline-flex h-12 items-center overflow-hidden rounded-full border border-yellow-400 dark:border-yellow-300/70 bg-yellow-400 dark:bg-yellow-300 text-black transition-[width,box-shadow] duration-500 ease-out ${
                            isScrolled 
                                ? 'w-[220px] shadow-[0_0_34px_rgba(250,204,21,0.28)]' 
                                : 'w-12 hover:w-[220px] shadow-[0_0_24px_rgba(250,204,21,0.18)] hover:shadow-[0_0_34px_rgba(250,204,21,0.28)]'
                        } focus-visible:w-[220px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200`}
                    >
                        <span className="grid h-12 min-w-12 place-items-center text-xl font-black tracking-tight">
                            HA
                        </span>
                        <span className={`whitespace-nowrap pr-3 font-mono text-lg font-bold tracking-wide transition-opacity duration-300 ${
                            isScrolled 
                                ? 'opacity-100' 
                                : 'opacity-0 group-hover:opacity-100'
                        }`}>
                            Hemanth Atthuluri
                        </span>
                    </a>
                    
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Desktop nav — hidden on mobile, replaced by the menu button */}
                        <nav className="hidden md:flex items-center gap-5 tracking-widest text-sm font-semibold" aria-label="Primary">
                            {navItems.map((item) => {
                                const isActive = activeSection === item.id;
                                return (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        onClick={(e) => handleNavClick(e, item.id)}
                                        className="group relative py-1 px-1 transition-all"
                                    >
                                        <p className={`${transition} relative z-10 tracking-widest transition-all duration-300 ${
                                            isActive
                                                ? 'text-amber-600 dark:text-yellow-300 font-black scale-105 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]'
                                                : 'text-zinc-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white'
                                        }`}>
                                            {item.label}
                                        </p>
                                        <span className={`absolute bottom-0 left-0 w-full h-[2.5px] bg-amber-600 dark:bg-yellow-300 rounded-full transition-all duration-300 ${
                                            isActive ? 'opacity-100 scale-x-100 shadow-[0_0_8px_#facc15]' : 'opacity-0 scale-x-0 group-hover:opacity-60 group-hover:scale-x-75'
                                        }`} />
                                    </a>
                                );
                            })}
                        </nav>

                        {/* Premium Theme Toggle Button */}
                        <button
                            onClick={() => setTheme(isDarkTheme ? 'light' : 'dark')}
                            aria-label={hydrated ? (isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode') : 'Switch theme'}
                            className="flex h-9 w-9 shrink-0 items-center justify-center border border-white bg-zinc-100 dark:bg-zinc-900/50 hover:border-yellow-400 dark:hover:border-yellow-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-all cursor-pointer text-zinc-500 dark:text-zinc-400 active:scale-95 shadow-sm"
                            title={hydrated ? (isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode') : 'Switch Theme'}
                        >
                            {!hydrated ? <Moon size={15} /> : isDarkTheme ? <Sun size={15} /> : <Moon size={15} />}
                        </button>

                        {/* Mobile menu button — opens the bottom sheet */}
                        <button
                            onClick={() => {
                                if (!isMenuOpen) {
                                    setDragY(0);
                                    setIsMenuOpen(true);
                                }
                            }}
                            aria-label="Open menu"
                            aria-expanded={isMenuOpen}
                            className="flex h-9 w-9 shrink-0 items-center justify-center border border-yellow-400 dark:border-yellow-300/70 bg-yellow-400 dark:bg-yellow-300 text-black transition-all cursor-pointer active:scale-95 shadow-sm md:hidden"
                        >
                            <Menu size={17} />
                        </button>
                    </div>
                </header>

                {/* Backdrop — intentionally does NOT close on tap (drag-to-close only) */}
                <div
                    aria-hidden="true"
                    className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-300 md:hidden ${
                        isMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                />

                {/* Mobile bottom sheet — dismiss only by dragging down */}
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Site menu"
                    aria-hidden={!isMenuOpen}
                    className={`fixed inset-x-0 bottom-0 z-[61] md:hidden ${
                        !isDragging ? 'transition-transform duration-300 ease-out' : ''
                    } ${!isMenuOpen ? 'pointer-events-none' : ''}`}
                    style={{ transform: isMenuOpen ? `translateY(${dragY}px)` : 'translateY(110%)' }}
                >
                    <div className="overflow-hidden rounded-tl-3xl rounded-tr-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl">
                        {/* Drag handle — the only way to close */}
                        <div
                            onPointerDown={handleDragStart}
                            onPointerMove={handleDragMove}
                            onPointerUp={handleDragEnd}
                            onPointerCancel={handleDragEnd}
                            className="flex touch-none cursor-grab select-none flex-col items-center gap-1.5 px-6 pb-2 pt-3 active:cursor-grabbing"
                        >
                            <span className="h-1.5 w-12 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                            <span className="text-[10px] font-bold tracking-[0.3em] text-zinc-400 dark:text-zinc-500">
                                DRAG DOWN TO CLOSE
                            </span>
                        </div>
                        <nav className="flex flex-col px-3 pb-3" aria-label="Mobile">
                            {navItems.map((item, index) => {
                                const isActive = activeSection === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={(e) => handleSheetNavClick(e, item.id)}
                                        className={`flex cursor-pointer items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-colors active:scale-[0.99] ${
                                            isActive
                                                ? 'bg-yellow-400/15 dark:bg-yellow-300/10 text-amber-600 dark:text-yellow-300'
                                                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                                        }`}
                                    >
                                        <span className={`font-mono text-[11px] font-bold tracking-widest ${
                                            isActive ? 'text-amber-600 dark:text-yellow-300' : 'text-zinc-400 dark:text-zinc-600'
                                        }`}>
                                            {String(index + 1).padStart(2, '0')}
                                        </span>
                                        <span className="flex-1 text-sm font-bold tracking-[0.2em]">
                                            {item.label}
                                        </span>
                                        {isActive && (
                                            <span className="h-2 w-2 rounded-full bg-amber-600 dark:bg-yellow-300 shadow-[0_0_8px_#facc15]" />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                <section
                    ref={sectionRef}
                    onMouseMove={handleHeroMouseMove}
                    onMouseEnter={() => setIsHoveringHero(true)}
                    onMouseLeave={() => setIsHoveringHero(false)}
                    className="relative flex min-h-svh flex-col justify-center items-start px-6 md:px-10 bg-zinc-50 dark:bg-black gap-4 md:gap-5 pt-24 md:pt-20 pb-20 md:pb-16 overflow-hidden"
                >
                    {/* Background decorations — visible on all screens */}
                    <div aria-hidden="true" className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-yellow-400/20 blur-3xl dark:bg-yellow-300/10" />
                    <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl dark:bg-yellow-300/[0.07]" />
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-100 [background-image:linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] [background-size:44px_44px] dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]" />
                    {/* Ambient snakes wandering the grid */}
                    <GridSnake />
                    {/* Hover spotlight — golden glow + lit-up grid that follows the cursor */}
                    <div
                        ref={hoverFxRef}
                        aria-hidden="true"
                        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${isHoveringHero ? 'opacity-100' : 'opacity-0'}`}
                    />
                    <div className="absolute right-[-0%] top-1/3 -translate-y-1/2 text-[20rem] md:text-[20rem] font-mono tracking-widest font-black text-zinc-900/[0.20] dark:text-white/[0.20] select-none pointer-events-none hidden lg:block">
                        &lt;/&gt;
                    </div>

                    {/* Availability badge */}
                    <div className="z-10 inline-flex items-center gap-2.5 rounded-full border border-zinc-300 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur px-4 py-1.5 font-mono text-[11px] md:text-xs font-bold tracking-[0.2em] text-zinc-600 dark:text-zinc-300">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                        </span>
                        OPEN TO WORK · 2026
                    </div>

                    <p className="text-sm md:text-2xl tracking-widest text-amber-600 dark:text-yellow-400 font-mono z-10"><span className="tracking-widest">B.Sc.</span> UNDERGRADUATE · UPSKILLING AT NIAT</p>
                    <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold text-zinc-900 dark:text-white font-mono tracking-tight overflow-hidden z-10">HEMANTH</h1>
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-zinc-400 dark:text-gray-600 leading-tight z-10">SOLVING PROBLEMS.</h1>
                    <p className="text-zinc-500 dark:text-gray-500 w-full md:w-100 font-mono text-sm md:text-base z-10">Turning ideas into working software.</p>

                    {/* Tech chips */}
                    <div className="z-10 flex flex-wrap gap-2 font-mono">
                        {['C++', 'Python', 'React', 'Node.js'].map((tech) => (
                            <span
                                key={tech}
                                className="rounded-full border border-yellow-500/50 dark:border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-[11px] md:text-xs font-bold tracking-widest text-amber-700 dark:text-yellow-300"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 md:gap-10 font-mono w-full sm:w-auto mt-4 z-10">
                        <button 
                            onClick={() => {
                                document.getElementById('section4')?.scrollIntoView({ behavior: 'smooth' });
                            }} 
                            className="p-3 px-6 bg-yellow-400 dark:bg-yellow-300 text-black hover:bg-yellow-500 dark:hover:bg-yellow-400 transition-colors cursor-pointer w-full sm:w-auto font-bold tracking-wider shadow-md"
                        >
                            VIEW WORK
                        </button>
                        <button 
                            onClick={() => {
                                document.getElementById('section8')?.scrollIntoView({ behavior: 'smooth' });
                            }} 
                            className="p-3 px-6 border border-zinc-300 dark:border-zinc-800 text-zinc-500 dark:text-gray-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-500 dark:hover:border-white transition-colors w-full sm:w-auto tracking-wider cursor-pointer font-bold"
                        >
                            CONTACT
                        </button>
                    </div>

                    {/* Scroll cue */}
                    <button
                        onClick={() => {
                            document.getElementById('section2')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        aria-label="Scroll to about section"
                        className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-0.5 text-zinc-400 dark:text-zinc-500 transition-colors hover:text-amber-600 dark:hover:text-yellow-300"
                    >
                        <span className="font-mono text-[10px] font-bold tracking-[0.3em]">SCROLL</span>
                        <ChevronDown size={18} className="animate-bounce" />
                    </button>
                </section>
            </div>
        </>
    )
}
