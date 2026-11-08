'use client'

import { useEffect, useRef, useState } from 'react'

export const PortfolioHoverGrid = () => {
    const overlayRef = useRef<HTMLDivElement | null>(null)
    const [isActive, setIsActive] = useState(false)
    const [showGrid, setShowGrid] = useState(true)

    useEffect(() => {
        const overlay = overlayRef.current
        if (!overlay) return

        const sections = Array.from(document.querySelectorAll<HTMLElement>('[id^="section"]'))
        const visibility = new Map<string, number>()
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => visibility.set(entry.target.id, entry.intersectionRatio))
            const visibleSection = sections.reduce<HTMLElement | null>((current, section) => {
                if (!current || (visibility.get(section.id) ?? 0) > (visibility.get(current.id) ?? 0)) {
                    return section
                }
                return current
            }, null)
            const sectionNumber = Number(visibleSection?.id.replace('section', ''))
            setShowGrid(Number.isFinite(sectionNumber) && sectionNumber > 1 && sectionNumber % 2 === 1)
        }, { threshold: [0, 0.5, 1] })

        sections.forEach((section) => sectionObserver.observe(section))

        const handlePointerMove = (event: PointerEvent) => {
            overlay.style.backgroundImage = `radial-gradient(220px circle at ${event.clientX}px ${event.clientY}px, rgba(250, 204, 21, 0.22), transparent 70%), linear-gradient(to right, rgba(234, 179, 8, 0.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(234, 179, 8, 0.45) 1px, transparent 1px)`
            overlay.style.backgroundSize = 'auto, 44px 44px, 44px 44px'
            const mask = `radial-gradient(280px circle at ${event.clientX}px ${event.clientY}px, black, transparent 75%)`
            overlay.style.maskImage = mask
            overlay.style.webkitMaskImage = mask
        }

        const handlePointerEnter = () => setIsActive(true)
        const handlePointerLeave = () => setIsActive(false)

        document.addEventListener('pointermove', handlePointerMove)
        document.addEventListener('pointerenter', handlePointerEnter)
        document.addEventListener('pointerleave', handlePointerLeave)

        return () => {
            sectionObserver.disconnect()
            document.removeEventListener('pointermove', handlePointerMove)
            document.removeEventListener('pointerenter', handlePointerEnter)
            document.removeEventListener('pointerleave', handlePointerLeave)
        }
    }, [])

    const gridVisibility = showGrid ? 'opacity-40 dark:opacity-100' : 'opacity-0'

    return (
        <>
            <div
                aria-hidden="true"
                className={`pointer-events-none fixed inset-0 z-40 transition-opacity duration-500 [background-image:linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] [background-size:44px_44px] dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] ${gridVisibility}`}
            />
            <div
                ref={overlayRef}
                aria-hidden="true"
                className={`pointer-events-none fixed inset-0 z-40 transition-opacity duration-500 ${isActive && showGrid ? 'opacity-100' : 'opacity-0'}`}
            />
        </>
    )
}
