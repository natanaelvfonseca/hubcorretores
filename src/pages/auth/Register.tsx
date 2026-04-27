import type { ReactNode } from 'react';
import { ArrowRight, Loader2, Lock, Mail, Phone, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/branding/BrandLogo';

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
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.14),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(214,140,69,0.16),_transparent_28%),linear-gradient(180deg,#f5f8fa_0%,#edf4f5_100%)] px-4 py-8">
            <div className="absolute left-[-4%] top-[-10%] h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-[-12%] right-[-4%] h-[420px] w-[420px] rounded-full bg-accent/[0.15] blur-3xl" />

            <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
                <div className="grid w-full gap-6 overflow-hidden rounded-[36px] border border-white/70 bg-white/[0.78] shadow-[0_30px_80px_rgba(8,23,38,0.12)] backdrop-blur-xl lg:grid-cols-[1fr_1fr]">
                    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(94,234,212,0.18),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(248,180,106,0.22),_transparent_26%),linear-gradient(135deg,#062133,#0b3a55)] p-8 text-white sm:p-10">
                        <BrandLogo className="text-white" markWidth={34} markHeight={42} wordSize={30} />

                        <div className="mt-14 max-w-xl">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#9FE7E0]">
                                ATIVAÇÃO DE ACESSO
                            </p>
                            <h1 className="mt-5 text-4xl font-display leading-tight sm:text-5xl">
                                Ative seu acesso ao HUB oficial da maior comunidade imobiliária do Brasil.
                            </h1>
                            <p className="mt-5 text-sm leading-7 text-white/[0.78] sm:text-base">
                                Entre para a plataforma que centraliza oportunidades, conexões, parceiros e negócios do
                                Corretores Litoral SC em um ambiente próprio, organizado e profissional.
                            </p>
                        </div>

                        <div className="mt-10 space-y-4">
                            {[
                                'Sua presença profissional em uma base oficial, com mais visibilidade e credibilidade dentro da comunidade.',
                                'Acesso às oportunidades, pedidos, diretórios, mural, segmentos, agenda e benefícios em um único lugar.',
                                'Menos dependência dos grupos de WhatsApp e mais controle sobre conexões, negócios e relacionamento.',
                            ].map((item) => (
                                <div key={item} className="rounded-[24px] border border-white/12 bg-white/[0.08] p-4 text-sm leading-7 text-white/[0.78] backdrop-blur">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="p-8 sm:p-10">
                        <div className="max-w-md">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-primary/70">
                                Novo membro
                            </p>
                            <h2 className="mt-3 text-4xl font-display text-text-primary">Ativar meu perfil</h2>
                            <p className="mt-3 text-sm leading-7 text-text-secondary">
                                Preencha seus dados de acesso para entrar na plataforma proprietária da comunidade.
                            </p>

                            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition group-focus-within:text-primary" size={18} />
                                        <input
                                            type="text"
                                            value={whatsapp}
                                            onChange={(event) => setWhatsapp(event.target.value.replace(/\D/g, ''))}
                                            required
                                            className="h-14 w-full rounded-[22px] border border-border/80 bg-background/80 pl-11 pr-4 text-sm text-text-primary outline-none transition focus:border-primary/35 focus:bg-white"
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
                                    className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[22px] bg-gradient-to-r from-primary via-[#1697a2] to-[#0a4b66] px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,118,110,0.28)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Criar acesso'}
                                    {!loading && <ArrowRight size={18} />}
                                </button>
                            </form>

                            <div className="mt-8 rounded-[24px] border border-border/70 bg-background/70 p-5">
                                <p className="text-sm leading-7 text-text-secondary">
                                    Já tem acesso?
                                    <Link to="/login" className="ml-2 font-semibold text-primary transition hover:text-primary-light">
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
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition group-focus-within:text-primary">
                    {icon}
                </span>
                <input
                    type={type}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    required
                    minLength={type === 'password' ? 6 : undefined}
                    className="h-14 w-full rounded-[22px] border border-border/80 bg-background/80 pl-11 pr-4 text-sm text-text-primary outline-none transition focus:border-primary/35 focus:bg-white"
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
}
