import type { ReactNode } from 'react';
import { ArrowRight, Loader2, Lock, Mail, Phone, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { brand } from '../../config/brand';

export function Register() {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);

        if (password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres.');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);
        const result = await register(name, email, password, whatsapp);

        if (!result.success) {
            setError(result.error || 'Erro ao criar o acesso');
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(249,161,43,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(36,79,158,0.10),_transparent_34%),linear-gradient(180deg,#ffffff_0%,#f6f8fa_100%)] px-4 py-4 sm:py-6">
            <div className="absolute left-[-4%] top-[-10%] h-[420px] w-[420px] rounded-full bg-brand-orange/20 blur-3xl" />
            <div className="absolute bottom-[-12%] right-[-4%] h-[420px] w-[420px] rounded-full bg-brand-blue/10 blur-3xl" />

            <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center sm:min-h-[calc(100vh-3rem)]">
                <div className="grid w-full gap-6 overflow-hidden rounded-[36px] border border-white/80 bg-white/95 shadow-brand-lg backdrop-blur-xl lg:grid-cols-[1fr_1fr]">
                    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(249,161,43,0.24),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(36,79,158,0.28),_transparent_30%),linear-gradient(135deg,#051C28_0%,#082B3A_58%,#183B7A_100%)] p-6 text-white sm:p-8">
                        <div className="absolute left-10 top-10 h-16 w-16 rounded-full border border-brand-orange/35" />
                        <div className="absolute bottom-14 right-12 h-24 w-24 rounded-full border border-white/10" />
                        <div className="absolute right-0 top-24 h-1 w-28 bg-brand-orange" />
                        <img className="h-auto w-44 object-contain" src={brand.logos.white} alt={brand.name} />

                        <div className="mt-8 max-w-xl">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-brand-orange">
                                ATIVAÇÃO DE ACESSO
                            </p>
                            <h1 className="mt-4 text-4xl font-display leading-tight sm:text-[42px]">
                                Ative seu acesso ao HUB oficial da maior comunidade imobiliária do Brasil.
                            </h1>
                            <p className="mt-4 text-sm leading-7 text-white/[0.78] sm:text-base">
                                Entre para a plataforma que centraliza oportunidades, conexões, parceiros e negócios do
                                Corretores Litoral SC em um ambiente próprio, organizado e profissional.
                            </p>
                        </div>

                        <div className="mt-6 space-y-3">
                            {[
                                'Sua presença profissional em uma base oficial, com mais visibilidade e credibilidade dentro da comunidade.',
                                'Acesso às oportunidades, pedidos, diretórios, mural, segmentos, agenda e benefícios em um único lugar.',
                            ].map((item) => (
                                <div key={item} className="rounded-[20px] border border-white/15 bg-white/10 p-4 text-sm leading-6 text-white/[0.78] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="p-6 sm:p-8">
                        <div className="max-w-md">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-brand-orange-dark">
                                Novo membro
                            </p>
                            <h2 className="mt-3 text-4xl font-display text-brand-text">Ativar meu perfil</h2>
                            <p className="mt-3 text-sm leading-6 text-text-secondary">
                                Preencha seus dados de acesso para entrar na plataforma proprietária da comunidade.
                            </p>

                            <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="rounded-[20px] border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-600">
                                        {error}
                                    </div>
                                )}

                                <Field
                                    label="Nome completo"
                                    icon={<User size={18} />}
                                    value={name}
                                    onChange={setName}
                                    placeholder="Seu nome"
                                />
                                <Field
                                    label="E-mail"
                                    icon={<Mail size={18} />}
                                    value={email}
                                    onChange={setEmail}
                                    placeholder="seu@email.com"
                                    type="email"
                                />

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-text-secondary">WhatsApp de apoio</label>
                                    <div className="group relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition group-focus-within:text-brand-orange" size={18} />
                                        <input
                                            type="text"
                                            value={whatsapp}
                                            onChange={(event) => setWhatsapp(event.target.value.replace(/\D/g, ''))}
                                            required
                                            className="h-12 w-full rounded-[18px] border border-brand-border bg-brand-bg/70 pl-11 pr-4 text-sm text-brand-text outline-none transition focus:border-brand-orange focus:bg-white focus:shadow-[0_0_0_4px_rgba(249,161,43,0.16)]"
                                            placeholder="DDD + número"
                                        />
                                    </div>
                                </div>

                                <Field
                                    label="Senha"
                                    icon={<Lock size={18} />}
                                    value={password}
                                    onChange={setPassword}
                                    placeholder="Mínimo 6 caracteres"
                                    type="password"
                                />
                                <Field
                                    label="Confirmar senha"
                                    icon={<Lock size={18} />}
                                    value={confirmPassword}
                                    onChange={setConfirmPassword}
                                    placeholder="Repita a senha"
                                    type="password"
                                />

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-brand-orange to-brand-orange-dark px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(249,161,43,0.30)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(249,161,43,0.38)] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Criar acesso'}
                                    {!loading && <ArrowRight size={18} />}
                                </button>
                            </form>

                            <div className="mt-5 rounded-[20px] border border-brand-border bg-brand-bg/70 p-4">
                                <p className="text-sm leading-6 text-text-secondary">
                                    Já tem acesso?
                                    <Link to="/login" className="ml-2 font-semibold text-brand-orange-dark transition hover:text-brand-orange">
                                        Entrar agora
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

interface FieldProps {
    label: string;
    icon: ReactNode;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    type?: string;
}

function Field({ label, icon, value, onChange, placeholder, type = 'text' }: FieldProps) {
    return (
        <div>
            <label className="mb-2 block text-sm font-semibold text-text-secondary">{label}</label>
            <div className="group relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition group-focus-within:text-brand-orange">
                    {icon}
                </span>
                <input
                    type={type}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    required
                    minLength={type === 'password' ? 6 : undefined}
                    className="h-12 w-full rounded-[18px] border border-brand-border bg-brand-bg/70 pl-11 pr-4 text-sm text-brand-text outline-none transition focus:border-brand-orange focus:bg-white focus:shadow-[0_0_0_4px_rgba(249,161,43,0.16)]"
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
}
