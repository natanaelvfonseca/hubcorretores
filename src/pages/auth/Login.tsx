import { ArrowRight, Building2, Loader2, Lock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/branding/BrandLogo';
import { CONSTRUTORA_DEMO_EMAIL } from '../../data/construtoraMockData';

export function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const result = await login(email, password);

        if (!result.success) {
            setError(result.error || 'Erro ao acessar a plataforma');
            setLoading(false);
        }
    };

    const handleDemoAccess = async () => {
        setLoading(true);
        setError(null);

        const result = await login(CONSTRUTORA_DEMO_EMAIL, 'demo');

        if (!result.success) {
            setError(result.error || 'Erro ao acessar o ambiente demo');
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.14),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(214,140,69,0.16),_transparent_28%),linear-gradient(180deg,#f5f8fa_0%,#edf4f5_100%)] px-4 py-8">
            <div className="absolute left-[-6%] top-[-8%] h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-[-12%] right-[-2%] h-[420px] w-[420px] rounded-full bg-accent/[0.15] blur-3xl" />

            <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
                <div className="grid w-full gap-6 overflow-hidden rounded-[36px] border border-white/70 bg-white/[0.78] shadow-[0_30px_80px_rgba(8,23,38,0.12)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
                    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(94,234,212,0.18),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(248,180,106,0.22),_transparent_26%),linear-gradient(135deg,#062133,#0b3a55)] p-8 text-white sm:p-10">
                        <div className="absolute inset-y-0 right-0 w-px bg-white/10" />
                        <BrandLogo className="text-white" markWidth={34} markHeight={42} wordSize={30} />

                        <div className="mt-14 max-w-xl">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#9FE7E0]">
                                Plataforma proprietaria
                            </p>
                            <h1 className="mt-5 text-4xl font-display leading-tight sm:text-5xl">
                                O novo centro oficial da comunidade imobiliaria do litoral catarinense.
                            </h1>
                            <p className="mt-5 text-sm leading-7 text-white/[0.78] sm:text-base">
                                Networking, oportunidades, diretorios, beneficios e agenda regional em uma experiencia
                                premium, profissional e feita para gerar conexoes reais de negocio.
                            </p>
                        </div>

                        <div className="mt-10 grid gap-4 sm:grid-cols-3">
                            {[
                                { value: '12.800+', label: 'profissionais conectados' },
                                { value: '150+', label: 'parceiros no clube' },
                                { value: 'HUB', label: 'como base oficial' },
                            ].map((item) => (
                                <div key={item.label} className="rounded-[24px] border border-white/12 bg-white/[0.08] p-4 backdrop-blur">
                                    <p className="text-2xl font-display text-white">{item.value}</p>
                                    <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/[0.62]">{item.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 rounded-[28px] border border-white/12 bg-black/[0.12] p-5">
                            <p className="text-sm leading-7 text-white/[0.78]">
                                O WhatsApp continua importante para follow-up e agilidade, mas a inteligencia da
                                comunidade passa a morar dentro da plataforma.
                            </p>
                        </div>
                    </section>

                    <section className="p-8 sm:p-10">
                        <div className="max-w-md">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-primary/70">
                                Acesso de membros
                            </p>
                            <h2 className="mt-3 text-4xl font-display text-text-primary">Entrar no HUB</h2>
                            <p className="mt-3 text-sm leading-7 text-text-secondary">
                                Use seu acesso para entrar no ecossistema oficial de corretores, imobiliarias,
                                construtoras e parceiros do Litoral SC.
                            </p>

                            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="rounded-[20px] border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-600">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-text-secondary">E-mail</label>
                                    <div className="group relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition group-focus-within:text-primary" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(event) => setEmail(event.target.value)}
                                            required
                                            className="h-14 w-full rounded-[22px] border border-border/80 bg-background/80 pl-11 pr-4 text-sm text-text-primary outline-none transition focus:border-primary/35 focus:bg-white"
                                            placeholder="seu@email.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-text-secondary">Senha</label>
                                    <div className="group relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition group-focus-within:text-primary" size={18} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                            required
                                            className="h-14 w-full rounded-[22px] border border-border/80 bg-background/80 pl-11 pr-4 text-sm text-text-primary outline-none transition focus:border-primary/35 focus:bg-white"
                                            placeholder="Digite sua senha"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[22px] bg-gradient-to-r from-primary via-[#1697a2] to-[#0a4b66] px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,118,110,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Entrar na plataforma'}
                                    {!loading && <ArrowRight size={18} />}
                                </button>
                            </form>

                            <div className="mt-8 rounded-[24px] border border-border/70 bg-background/70 p-5">
                                <p className="text-sm leading-7 text-text-secondary">
                                    Ainda nao tem acesso?
                                    <Link to="/register" className="ml-2 font-semibold text-primary transition hover:text-primary-light">
                                        Ativar meu perfil
                                    </Link>
                                </p>
                            </div>

                            <div className="mt-4 rounded-[26px] border border-primary/15 bg-[linear-gradient(135deg,rgba(15,123,140,0.08),rgba(216,137,60,0.08))] p-5">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-2xl bg-primary/12 p-3 text-primary">
                                        <Building2 size={18} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/70">
                                            Demo construtora
                                        </p>
                                        <h3 className="mt-2 text-xl font-display text-text-primary">Construtora Alpha</h3>
                                        <p className="mt-2 text-sm leading-6 text-text-secondary">
                                            Ambiente executivo com geracao de demanda, qualificacao por IA, performance
                                            dos corretores e visao filtrada por empreendimento.
                                        </p>
                                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">
                                            {CONSTRUTORA_DEMO_EMAIL}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleDemoAccess}
                                    disabled={loading}
                                    className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[20px] border border-primary/15 bg-white/80 px-4 text-sm font-semibold text-primary transition hover:border-primary/30 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Entrar como Construtora Alpha
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
