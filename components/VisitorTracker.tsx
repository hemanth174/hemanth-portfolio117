'use client'
import { useEffect } from 'react'

export const VisitorTracker = () => {
    useEffect(() => {
        // Only track once per session
        const tracked = sessionStorage.getItem('portfolio_visited');
        if (tracked) return;

        const trackVisit = async () => {
            try {
                await fetch('/api/visitors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        page: window.location.pathname,
                        referrer: document.referrer || '',
                    }),
                });
                sessionStorage.setItem('portfolio_visited', 'true');
            } catch {
                // Silently fail - visitor tracking should not affect user experience
            }
        };

        trackVisit();
    }, []);

    return null; // This component renders nothing
};
