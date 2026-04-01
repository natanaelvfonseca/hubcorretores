import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const MOBILE_MEDIA_QUERY = '(max-width: 1023px)';

export function AppShell() {
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
    });
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
    });
    const location = useLocation();
    const isFullScreenPage = location.pathname.includes('/live-chat') || location.pathname.includes('/kanban'); // Future proofing

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
        const syncLayoutMode = (matches: boolean) => {
            setIsMobile(matches);
            if (!matches) {
                setSidebarCollapsed(false);
            }
        };

        syncLayoutMode(mediaQuery.matches);
        const handleChange = (event: MediaQueryListEvent) => syncLayoutMode(event.matches);
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const effectiveCollapsed = isMobile ? sidebarCollapsed : false;
    const contentMarginClass = isMobile
        ? (effectiveCollapsed ? 'ml-20' : 'ml-72')
        : 'ml-72';

    return (
        <div className="flex h-screen bg-background overflow-hidden relative" data-tour-id="tour-app-shell">
            <Sidebar collapsed={effectiveCollapsed} setCollapsed={setSidebarCollapsed} isMobile={isMobile} />
            <div
                className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${contentMarginClass}`}
            >
                <Topbar />
                {/* 
                  If it's a full screen page (like Chat), use overflow-hidden and no padding.
                  Otherwise use standard dashboard layout (scrollable, padded).
                */}
                <main className={`flex-1 ${isFullScreenPage ? 'overflow-hidden p-0' : 'overflow-y-auto p-6 scrollbar-hide'}`}>
                    <div className={`w-full h-full ${isFullScreenPage ? '' : 'max-w-7xl mx-auto'}`}>
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Background Glow Effect */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl opacity-60"></div>
                <div className="absolute bottom-[-10%] left-[-5%] h-[480px] w-[480px] rounded-full bg-accent/10 blur-3xl opacity-50"></div>
            </div>
        </div>
    );
}
