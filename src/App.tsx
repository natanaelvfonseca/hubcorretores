import { useEffect, useRef } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { AppShell } from './components/layout/AppShell';
import { ThemeProvider } from './components/theme/ThemeProvider';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';
import { HubDashboard } from './pages/hub/HubDashboard';
import { HubModulePage } from './pages/hub/HubModulePage';
import { HubAdminPanel } from './pages/hub/HubAdminPanel';
import { MyAIs } from './pages/brain/MyAIs';
import { CRM } from './pages/crm/CRM';
import { WhatsAppConnection } from './pages/settings/WhatsAppConnection';

declare global {
    interface Window {
        fbq?: (...args: unknown[]) => void;
    }
}

function MetaPixelTracker() {
    const location = useLocation();
    const hasTrackedInitialPageView = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
            return;
        }

        if (!hasTrackedInitialPageView.current) {
            hasTrackedInitialPageView.current = true;
            return;
        }

        window.fbq('track', 'PageView');
    }, [location.pathname, location.search, location.hash]);

    return null;
}

function App() {
    return (
        <ThemeProvider defaultTheme="light" storageKey="hub-corretores-theme">
            <BrowserRouter>
                <MetaPixelTracker />
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/onboarding" element={<Navigate to="/register" replace />} />
                        <Route path="/start" element={<Navigate to="/register" replace />} />

                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <NotificationProvider>
                                        <AppShell />
                                    </NotificationProvider>
                                </ProtectedRoute>
                            }
                        >
                            <Route index element={<Navigate to="/dashboard" replace />} />
                            <Route path="dashboard" element={<HubDashboard />} />
                            <Route path="networking" element={<HubModulePage sectionId="networking" />} />
                            <Route path="oportunidades" element={<HubModulePage sectionId="oportunidades" />} />
                            <Route path="imoveis" element={<HubModulePage sectionId="imoveis" />} />
                            <Route path="diretorio" element={<HubModulePage sectionId="diretorio" />} />
                            <Route path="clube" element={<HubModulePage sectionId="clube" />} />
                            <Route path="agenda" element={<HubModulePage sectionId="agenda" />} />
                            <Route path="canais" element={<HubModulePage sectionId="canais" />} />
                            <Route path="mural" element={<HubModulePage sectionId="mural" />} />
                            <Route path="parceiros" element={<HubModulePage sectionId="parceiros" />} />
                            <Route path="segmentos" element={<HubModulePage sectionId="segmentos" />} />
                            <Route path="brain" element={<MyAIs />} />
                            <Route path="crm" element={<CRM />} />
                            <Route path="whatsapp" element={<WhatsAppConnection />} />
                            <Route path="notificacoes" element={<HubModulePage sectionId="notificacoes" />} />
                            <Route path="perfil" element={<HubModulePage sectionId="perfil" />} />
                            <Route path="configuracoes" element={<HubModulePage sectionId="configuracoes" />} />
                            <Route
                                path="admin/dashboard"
                                element={
                                    <AdminRoute>
                                        <HubAdminPanel />
                                    </AdminRoute>
                                }
                            />
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Route>
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
