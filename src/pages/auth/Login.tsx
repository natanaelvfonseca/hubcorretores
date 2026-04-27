import { ArrowRight, Loader2, Lock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { brand } from '../../config/brand';

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

    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(249,161,43,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(36,79,158,0.10),_transparent_34%),linear-gradient(180deg,#ffffff_0%,#f6f8fa_100%)] px-4 py-6 sm:py-8">
            <div className="absolute left-[-18%] top-[-12%] h-[320px] w-[320px] rounded-full bg-brand-orange/20 blur-3xl sm:left-[-10%] sm:h-[380px] sm:w-[380px]" />
            <div className="hidden sm:absolute sm:bottom-[-14%] sm:right-[-8%] sm:block sm:h-[420px] sm:w-[420px] sm:rounded-full sm:bg-brand-blue/10 sm:blur-3xl" />

            <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center sm:min-h-[calc(100vh-4rem)]">
                <div className="grid w-full gap-0 overflow-hidden rounded-[28px] border border-white/80 bg-white/95 shadow-brand-lg backdrop-blur-xl sm:rounded-[32px] lg:grid-cols-2">
                    <section className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(249,161,43,0.24),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(36,79,158,0.28),_transparent_30%),linear-gradient(135deg,#051C28_0%,#082B3A_58%,#183B7A_100%)] p-8 text-white sm:p-10 lg:block">
                        <div className="absolute inset-y-0 right-0 w-px bg-white/10" />
                        <div className="absolute left-10 top-10 h-16 w-16 rounded-full border border-brand-orange/35" />
                        <div className="absolute bottom-14 right-12 h-24 w-24 rounded-full border border-white/10" />
                        <div className="absolute right-0 top-24 h-1 w-28 bg-brand-orange" />
                        <img className="h-auto w-56 object-contain" src={brand.logos.white} alt={brand.name} />

                        <div className="mt-14 max-w-xl">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-brand-orange">
                                PLATAFORMA OFICIAL
                            </p>
                            <h1 className="mt-5 text-4xl font-display leading-tight sm:text-5xl">
                                O hub oficial de oportunidades do mercado imobiliário no litoral.
                            </h1>
                            <p className="mt-5 text-sm leading-7 text-white/[0.78] sm:text-base">
                                Conecte corretores, parceiros e oportunidades em um só lugar, com mais organização,
                                agilidade e clareza para gerar negócios.
                            </p>
                        </div>

                        <div className="mt-10 grid gap-4 sm:grid-cols-3">
                            {[
                                { value: '12.800+', label: 'Profissionais conectados' },
                                { value: '150+', label: 'Parceiros no ecossistema' },
                                { value: 'HUB', label: 'Base oficial da comunidade' },
                            ].map((item) => (
                                <div key={item.label} className="rounded-brand-lg border border-white/15 bg-white/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur">
                                    <p className="text-2xl font-display text-brand-orange">{item.value}</p>
                                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/[0.65]">{item.label}</p>
                                </div>
                            ))}
                        </div>

                    </section>

                    <section className="p-6 sm:p-10">
                        <div className="mx-auto max-w-md">
                            <div className="mb-7 flex items-center justify-center lg:hidden">
                                <img className="h-auto w-52 object-contain" src={brand.logos.blue} alt={brand.name} />
                            </div>

                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-brand-orange-dark">
                                ACESSO DE MEMBROS
                            </p>
                            <h2 className="mt-3 text-4xl font-display text-brand-text sm:text-4xl">Entrar no HUB</h2>
                            <p className="mt-3 text-sm leading-7 text-text-secondary">
                                Acesse sua conta para acompanhar oportunidades, conexões e novidades da comunidade.
                            </p>

                            <form className="mt-7 space-y-5 sm:mt-8" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="rounded-[20px] border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-600">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-text-secondary">E-mail</label>
                                    <div className="group relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition group-focus-within:text-brand-orange" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(event) => setEmail(event.target.value)}
                                            required
                                            className="h-14 w-full rounded-brand-md border border-brand-border bg-brand-bg/70 pl-11 pr-4 text-sm text-brand-text outline-none transition focus:border-brand-orange focus:bg-white focus:shadow-[0_0_0_4px_rgba(249,161,43,0.16)]"
                                            placeholder="seu@email.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-text-secondary">Senha</label>
                                    <div className="group relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition group-focus-within:text-brand-orange" size={18} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                            required
                                            className="h-14 w-full rounded-brand-md border border-brand-border bg-brand-bg/70 pl-11 pr-4 text-sm text-brand-text outline-none transition focus:border-brand-orange focus:bg-white focus:shadow-[0_0_0_4px_rgba(249,161,43,0.16)]"
                                            placeholder="Digite sua senha"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-brand-md bg-gradient-to-r from-brand-orange to-brand-orange-dark px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(249,161,43,0.30)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(249,161,43,0.38)] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Entrar na plataforma'}
                                    {!loading && <ArrowRight size={18} />}
                                </button>
                            </form>

                            <div className="mt-8 rounded-brand-lg border border-brand-border bg-brand-bg/70 p-5">
                                <p className="text-sm leading-7 text-text-secondary">
                                    Ainda nao tem acesso?
                                    <Link to="/register" className="ml-2 font-semibold text-brand-orange-dark transition hover:text-brand-orange">
                                        Ativar meu perfil
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
