import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
    id: string;
    email: string;
    name: string;
    organization?: {
        id: string;
        name: string;
        planType: 'basic' | 'pro' | 'enterprise';
        whatsapp_connections_limit?: number;
    };
    koins_balance?: number;
    role: 'user' | 'admin';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
    register: (name: string, email: string, pass: string, whatsapp?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readJwtExpiration(token: string): number | null {
    try {
        const [, payload] = token.split('.');
        if (!payload) return null;

        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
        const parsed = JSON.parse(decoded);

        return typeof parsed.exp === 'number' ? parsed.exp * 1000 : null;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const tokenExpiration = useMemo(() => token ? readJwtExpiration(token) : null, [token]);

    // Note: Hydration is now handled by refreshUser on mount

    const login = async (email: string, pass: string) => {
        try {
            const apiBase = ''; // Hardcoded for local dev for now
            const res = await fetch(`${apiBase}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass }),
            });

            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error || 'Falha no login' };
            }

            // Success
            localStorage.setItem('kogna_token', data.token);
            localStorage.setItem('kogna_user', JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);


            // Check Onboarding Status
            try {
                const onboardingRes = await fetch(`${apiBase}/api/onboarding/status`, {
                    headers: { 'Authorization': `Bearer ${data.token}` }
                });
                if (onboardingRes.ok) {
                    const status = await onboardingRes.json();
                    if (!status.completed) {
                        navigate('/register');
                        return { success: true };
                    }
                }
            } catch (e) {
                console.error('Failed to check onboarding status', e);
            }

            navigate('/dashboard');
            return { success: true };

        } catch (err) {
            console.error(err);
            return { success: false, error: 'Erro de conexão com o servidor' };
        }
    };

    const register = async (name: string, email: string, pass: string, whatsapp?: string) => {
        try {
            // Check for affiliate code
            let affiliateCode = undefined;
            try {
                const storedAffiliate = localStorage.getItem('kogna_affiliate_data');
                if (storedAffiliate) {
                    const data = JSON.parse(storedAffiliate);
                    // Optional: check expiration (e.g. 30 days) if needed
                    affiliateCode = data.code;
                }
            } catch (e) {
                console.error('Error parsing affiliate data:', e);
            }

            const apiBase = '';
            const res = await fetch(`${apiBase}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password: pass, whatsapp, affiliateCode }),
            });

            const data = await res.json();

            if (!res.ok) {
                return { success: false, error: data.error || 'Falha no cadastro' };
            }

            // Registration successful! Clear affiliate data
            localStorage.removeItem('kogna_affiliate_data');

            localStorage.setItem('kogna_token', data.token);
            localStorage.setItem('kogna_user', JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);

            navigate('/onboarding');
            return { success: true };

        } catch (err) {
            console.error(err);
            return { success: false, error: 'Erro de conexão com o servidor' };
        }
    };

    const logout = () => {
        localStorage.removeItem('kogna_token');
        localStorage.removeItem('kogna_user');
        setToken(null);
        setUser(null);
        navigate('/login');
    };

    const refreshUser = async () => {
        const storedToken = localStorage.getItem('kogna_token');
        if (!storedToken) {
            setLoading(false);
            return;
        }

        const tokenExpiry = readJwtExpiration(storedToken);
        if (tokenExpiry && tokenExpiry <= Date.now()) {
            console.warn('Session expired locally. Logging out before calling the API...');
            localStorage.removeItem('kogna_token');
            localStorage.removeItem('kogna_user');
            setToken(null);
            setUser(null);
            setLoading(false);
            navigate('/login');
            return;
        }

        try {
            const apiBase = '';
            const res = await fetch(`${apiBase}/api/me`, {
                headers: { 'Authorization': `Bearer ${storedToken}` }
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                setToken(storedToken);
                localStorage.setItem('kogna_user', JSON.stringify(data.user));
            } else if (res.status === 401) {
                // Token invalid or expired, clear session
                console.warn('Session expired or invalid token. Logging out...');
                logout();
            }
        } catch (e) {
            console.error('Failed to refresh user', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    useEffect(() => {
        if (!tokenExpiration) return;

        const remainingMs = tokenExpiration - Date.now();
        if (remainingMs <= 0) {
            logout();
            return;
        }

        const timeoutId = window.setTimeout(() => {
            console.warn('Session expired. Logging out to avoid invalid requests.');
            logout();
        }, remainingMs);

        return () => window.clearTimeout(timeoutId);
    }, [logout, tokenExpiration]);

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, refreshUser, isAuthenticated: !!token }}>
            {loading ? (
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-primary text-xl">Carregando...</div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
