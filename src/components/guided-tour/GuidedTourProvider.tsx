import confetti from "canvas-confetti";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { ArrowLeft, ArrowRight, PartyPopper, Sparkles, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    GUIDED_TOUR_STEPS,
    GUIDED_TOUR_VERSION,
    type GuidedTourPlacement,
    type GuidedTourStep,
} from "./guidedTourSteps";

type TourStatus = "completed" | "skipped";

interface GuidedTourContextValue {
    isActive: boolean;
    isSidebarLocked: boolean;
    startManualTour: () => void;
}

interface GuidedTourStatusResponse {
    shouldStart: boolean;
    currentVersion: string;
    seenVersion: string | null;
    seenStatus: TourStatus | null;
}

interface SpotlightRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

const GuidedTourContext = createContext<GuidedTourContextValue | undefined>(undefined);
const TOUR_SESSION_PREFIX = "kogna_guided_tour_session";
const TARGET_PADDING = 14;
const CARD_WIDTH = 380;
const DEFAULT_CARD_HEIGHT = 360;

function getSessionKey(userId?: string | null) {
    return `${TOUR_SESSION_PREFIX}:${userId || "anonymous"}`;
}

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

function getCurrentRoute(pathname: string, search: string) {
    return `${pathname}${search || ""}`;
}

function getPopoverStyle(
    rect: SpotlightRect | null,
    placement: GuidedTourPlacement,
    cardWidth: number,
    cardHeight: number,
    offsetX = 0,
    offsetY = 0,
) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const safeCardWidth = Math.min(cardWidth, viewportWidth - 40);
    const safeCardHeight = Math.min(cardHeight, viewportHeight - 40);

    if (!rect || placement === "center") {
        return {
            top: clamp(viewportHeight / 2 - safeCardHeight / 2 + offsetY, 20, viewportHeight - safeCardHeight - 20),
            left: clamp(viewportWidth / 2 - safeCardWidth / 2 + offsetX, 20, viewportWidth - safeCardWidth - 20),
        };
    }

    const margin = 24;
    let resolvedPlacement = placement;
    let top = rect.top;
    let left = rect.left;

    if (placement === "bottom" && rect.top + rect.height + margin + safeCardHeight > viewportHeight - 20 && rect.top - safeCardHeight - margin >= 20) {
        resolvedPlacement = "top";
    } else if (placement === "top" && rect.top - safeCardHeight - margin < 20 && rect.top + rect.height + margin + safeCardHeight <= viewportHeight - 20) {
        resolvedPlacement = "bottom";
    } else if (placement === "right" && rect.left + rect.width + margin + safeCardWidth > viewportWidth - 20 && rect.left - safeCardWidth - margin >= 20) {
        resolvedPlacement = "left";
    } else if (placement === "left" && rect.left - safeCardWidth - margin < 20 && rect.left + rect.width + margin + safeCardWidth <= viewportWidth - 20) {
        resolvedPlacement = "right";
    }

    if (resolvedPlacement === "bottom") {
        top = rect.top + rect.height + margin;
        left = rect.left + rect.width / 2 - safeCardWidth / 2;
    } else if (resolvedPlacement === "top") {
        top = rect.top - safeCardHeight - margin;
        left = rect.left + rect.width / 2 - safeCardWidth / 2;
    } else if (resolvedPlacement === "left") {
        top = rect.top + rect.height / 2 - safeCardHeight / 2;
        left = rect.left - safeCardWidth - margin;
    } else if (resolvedPlacement === "right") {
        top = rect.top + rect.height / 2 - safeCardHeight / 2;
        left = rect.left + rect.width + margin;
    }

    return {
        top: clamp(top + offsetY, 20, viewportHeight - safeCardHeight - 20),
        left: clamp(left + offsetX, 20, viewportWidth - safeCardWidth - 20),
    };
}

function buildSpotlightRect(element: HTMLElement): SpotlightRect {
    const rect = element.getBoundingClientRect();
    return {
        top: Math.max(12, rect.top - TARGET_PADDING),
        left: Math.max(12, rect.left - TARGET_PADDING),
        width: Math.min(window.innerWidth - 24, rect.width + TARGET_PADDING * 2),
        height: Math.min(window.innerHeight - 24, rect.height + TARGET_PADDING * 2),
    };
}

function fireCelebration() {
    const colors = ["#FF7A1A", "#FF9A5A", "#FDBA74", "#FACC15"];
    confetti({
        particleCount: 180,
        spread: 90,
        origin: { y: 0.55 },
        colors,
    });
    confetti({
        particleCount: 110,
        spread: 120,
        origin: { x: 0.2, y: 0.55 },
        colors,
    });
    confetti({
        particleCount: 110,
        spread: 120,
        origin: { x: 0.8, y: 0.55 },
        colors,
    });
}

function GuidedTourOverlay({
    step,
    stepIndex,
    totalSteps,
    spotlightRect,
    onNext,
    onPrevious,
    onSkip,
}: {
    step: GuidedTourStep;
    stepIndex: number;
    totalSteps: number;
    spotlightRect: SpotlightRect | null;
    onNext: () => void;
    onPrevious: () => void;
    onSkip: () => void;
}) {
    const isIntroStep = stepIndex === 0;
    const cardRef = useRef<HTMLDivElement | null>(null);
    const [cardSize, setCardSize] = useState({ width: CARD_WIDTH, height: DEFAULT_CARD_HEIGHT });
    const popoverStyle = getPopoverStyle(
        spotlightRect,
        spotlightRect ? step.placement : "center",
        cardSize.width,
        cardSize.height,
        step.popoverOffsetX ?? 0,
        step.popoverOffsetY ?? 0,
    );

    useEffect(() => {
        if (!cardRef.current) return;

        const updateSize = () => {
            if (!cardRef.current) return;
            const rect = cardRef.current.getBoundingClientRect();
            setCardSize({
                width: rect.width || CARD_WIDTH,
                height: rect.height || DEFAULT_CARD_HEIGHT,
            });
        };

        updateSize();

        const observer = new ResizeObserver(() => updateSize());
        observer.observe(cardRef.current);
        window.addEventListener("resize", updateSize);

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", updateSize);
        };
    }, [step.id]);

    return (
        <div className="pointer-events-none fixed inset-0 z-[1200]">
            {!spotlightRect && <div className="absolute inset-0 bg-slate-950/44" />}

            {spotlightRect && (
                <div
                    className="absolute rounded-[32px] border border-primary/35 shadow-[0_0_0_9999px_rgba(2,6,23,0.44),0_0_0_1px_rgba(255,255,255,0.12),0_25px_60px_rgba(15,23,42,0.18)] transition-all duration-300"
                    style={{
                        top: spotlightRect.top,
                        left: spotlightRect.left,
                        width: spotlightRect.width,
                        height: spotlightRect.height,
                    }}
                />
            )}

            <div
                ref={cardRef}
                className="pointer-events-auto absolute w-[min(92vw,380px)] overflow-hidden rounded-[30px] border border-white/12 bg-white/[0.96] shadow-[0_30px_90px_rgba(15,23,42,0.36)] transition-all duration-300 dark:border-white/[0.10] dark:bg-[#111214]/96"
                style={popoverStyle}
            >
                <div className="flex max-h-[calc(100vh-40px)] flex-col bg-[radial-gradient(circle_at_top_right,rgba(255,122,26,0.16),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(255,122,26,0.10),transparent_30%)]">
                    <div className="overflow-y-auto p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="inline-flex rounded-full border border-primary/15 bg-primary/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                                    TOUR GUIADO
                                </div>
                                <h3 className="mt-4 text-2xl font-display font-bold tracking-tight text-foreground">
                                    {step.title}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={onSkip}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/[0.06] bg-white/80 text-muted-foreground transition-colors hover:text-foreground dark:border-white/[0.08] dark:bg-white/[0.04]"
                                aria-label="Pular tour"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <p className="mt-5 text-sm leading-7 text-muted-foreground">{step.description}</p>
                    </div>
                    <div className="border-t border-black/[0.06] px-5 py-4 dark:border-white/[0.08]">
                        <div className="flex items-center justify-between gap-4">
                            <div className="text-xs font-medium text-muted-foreground">
                                Passo {stepIndex + 1} de {totalSteps}
                            </div>
                            <div className="flex items-center gap-2">
                                {!isIntroStep && (
                                    <button
                                        type="button"
                                        onClick={onPrevious}
                                        className="inline-flex h-11 items-center gap-2 rounded-2xl border border-black/[0.08] bg-white px-4 text-sm font-semibold text-foreground transition-colors hover:border-primary/20 dark:border-white/[0.08] dark:bg-white/[0.04]"
                                    >
                                        <ArrowLeft size={14} />
                                        Anterior
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={onNext}
                                    className="inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7A1A] via-[#FF6B2D] to-[#FF9A5A] px-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(245,121,59,0.28)]"
                                >
                                    {isIntroStep ? "Começar" : "Próximo"}
                                    {!isIntroStep && <ArrowRight size={14} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GuidedTourCompletionModal({
    onFinish,
}: {
    onFinish: () => void;
}) {
    return (
        <div className="pointer-events-none fixed inset-0 z-[1200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/72 backdrop-blur-[5px]" />
            <div className="pointer-events-auto relative w-full max-w-xl overflow-hidden rounded-[34px] border border-white/12 bg-white/[0.97] shadow-[0_35px_120px_rgba(15,23,42,0.42)] dark:border-white/[0.10] dark:bg-[#111214]/96">
                <div className="bg-[radial-gradient(circle_at_top_right,rgba(255,122,26,0.18),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(255,122,26,0.10),transparent_30%)] p-8 text-center sm:p-10">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-[#FF7A1A] via-[#FF6B2D] to-[#FF9A5A] text-white shadow-[0_24px_60px_rgba(245,121,59,0.32)]">
                        <PartyPopper size={34} />
                    </div>
                    <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.08] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                        <Sparkles size={12} />
                        Plataforma pronta
                    </div>
                    <h2 className="mt-5 text-3xl font-display font-bold tracking-tight text-foreground sm:text-4xl">
                        Agora esta tudo pronto para transformar o WhatsApp em um canal potente de vendas
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
                        Sua plataforma ja esta organizada para acompanhar receita, operar conversas, recuperar leads e acelerar fechamento com mais previsibilidade.
                    </p>

                    <button
                        type="button"
                        onClick={onFinish}
                        className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF7A1A] via-[#FF6B2D] to-[#FF9A5A] px-6 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(245,121,59,0.32)]"
                    >
                        Finalizar e abrir metricas
                        <ArrowRight size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export function GuidedTourProvider({ children }: { children: ReactNode }) {
    const { token, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);
    const [showCompletion, setShowCompletion] = useState(false);
    const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
    const [statusLoaded, setStatusLoaded] = useState(false);
    const [tourStatus, setTourStatus] = useState<GuidedTourStatusResponse | null>(null);
    const [isManualReplay, setIsManualReplay] = useState(false);
    const completionFiredRef = useRef(false);
    const resolveTimerRef = useRef<number | null>(null);

    const currentStep = isActive ? GUIDED_TOUR_STEPS[stepIndex] : null;
    const currentRoute = getCurrentRoute(location.pathname, location.search);
    const sessionKey = getSessionKey(user?.id);

    const clearResolveTimer = useCallback(() => {
        if (resolveTimerRef.current) {
            window.clearTimeout(resolveTimerRef.current);
            resolveTimerRef.current = null;
        }
    }, []);

    const persistSession = useCallback((active: boolean, index: number, completionOpen: boolean) => {
        if (!user?.id) return;

        if (!active && !completionOpen) {
            sessionStorage.removeItem(sessionKey);
            return;
        }

        sessionStorage.setItem(
            sessionKey,
            JSON.stringify({
                active,
                index,
                completionOpen,
            }),
        );
    }, [sessionKey, user?.id]);

    const saveTourState = useCallback(async (status: TourStatus) => {
        if (!token) return;
        if (isManualReplay && tourStatus?.seenVersion === GUIDED_TOUR_VERSION) return;

        try {
            await fetch("/api/guided-tour/state", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            });
        } catch (error) {
            console.error("Failed to persist guided tour state", error);
        }
    }, [isManualReplay, token, tourStatus?.seenVersion]);

    const closeTourSession = useCallback(() => {
        clearResolveTimer();
        setIsActive(false);
        setShowCompletion(false);
        setSpotlightRect(null);
        setStepIndex(0);
        setIsManualReplay(false);
        completionFiredRef.current = false;
        persistSession(false, 0, false);
    }, [clearResolveTimer, persistSession]);

    const startTour = useCallback((manual = false, initialIndex = 0) => {
        clearResolveTimer();
        completionFiredRef.current = false;
        setIsManualReplay(manual);
        setShowCompletion(false);
        setStepIndex(initialIndex);
        setIsActive(true);
        persistSession(true, initialIndex, false);
    }, [clearResolveTimer, persistSession]);

    const startManualTour = useCallback(() => {
        startTour(true, 0);
    }, [startTour]);

    const skipTour = useCallback(async () => {
        await saveTourState("skipped");
        closeTourSession();
    }, [closeTourSession, saveTourState]);

    const finishTour = useCallback(async () => {
        await saveTourState("completed");
        closeTourSession();
        navigate("/dashboard/revenue-metrics", { replace: true });
    }, [closeTourSession, navigate, saveTourState]);

    const openCompletion = useCallback(() => {
        clearResolveTimer();
        setIsActive(false);
        setShowCompletion(true);
        setSpotlightRect(null);
        persistSession(false, stepIndex, true);
        navigate("/dashboard/revenue-metrics", { replace: true });
    }, [clearResolveTimer, navigate, persistSession, stepIndex]);

    const goToStep = useCallback((nextIndex: number) => {
        const safeIndex = clamp(nextIndex, 0, GUIDED_TOUR_STEPS.length - 1);
        setStepIndex(safeIndex);
        persistSession(true, safeIndex, false);
    }, [persistSession]);

    const goNext = useCallback(() => {
        if (stepIndex >= GUIDED_TOUR_STEPS.length - 1) {
            openCompletion();
            return;
        }

        goToStep(stepIndex + 1);
    }, [goToStep, openCompletion, stepIndex]);

    const goPrevious = useCallback(() => {
        if (stepIndex === 0) return;
        goToStep(stepIndex - 1);
    }, [goToStep, stepIndex]);

    useEffect(() => {
        if (!token || !user?.id) {
            setStatusLoaded(true);
            return;
        }

        let cancelled = false;

        const fetchStatus = async () => {
            try {
                const response = await fetch("/api/guided-tour/status", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Guided tour status failed (${response.status})`);
                }

                const data = await response.json() as GuidedTourStatusResponse;
                if (cancelled) return;

                setTourStatus(data);
                const persisted = sessionStorage.getItem(sessionKey);
                if (persisted) {
                    try {
                        const parsed = JSON.parse(persisted) as { active?: boolean; index?: number; completionOpen?: boolean };
                        if (parsed.completionOpen) {
                            setShowCompletion(true);
                            return;
                        }
                        if (parsed.active) {
                            startTour(false, clamp(parsed.index || 0, 0, GUIDED_TOUR_STEPS.length - 1));
                            return;
                        }
                    } catch {
                        sessionStorage.removeItem(sessionKey);
                    }
                }

                if (data.shouldStart) {
                    startTour(false, 0);
                }
            } catch (error) {
                console.error("Failed to load guided tour status", error);
            } finally {
                if (!cancelled) setStatusLoaded(true);
            }
        };

        fetchStatus();

        return () => {
            cancelled = true;
        };
    }, [sessionKey, startTour, token, user?.id]);

    useEffect(() => {
        if (!showCompletion || completionFiredRef.current) return;
        completionFiredRef.current = true;
        fireCelebration();
    }, [showCompletion]);

    useEffect(() => {
        if (!statusLoaded || !isActive || !currentStep) return;

        if (currentStep.route !== currentRoute) {
            clearResolveTimer();
            setSpotlightRect(null);
            navigate(currentStep.route, { replace: true });
            return;
        }

        let attempts = 0;

        const resolveTarget = () => {
            const element = document.querySelector<HTMLElement>(`[data-tour-id="${currentStep.targetId}"]`);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                setSpotlightRect(buildSpotlightRect(element));
                return;
            }

            attempts += 1;
            if (attempts >= 18) {
                setSpotlightRect(null);
                return;
            }

            resolveTimerRef.current = window.setTimeout(resolveTarget, 120);
        };

        clearResolveTimer();
        resolveTarget();

        return () => {
            clearResolveTimer();
        };
    }, [clearResolveTimer, currentRoute, currentStep, isActive, navigate, statusLoaded]);

    useEffect(() => {
        if (!isActive || !currentStep || currentRoute !== currentStep.route) return;

        const updateSpotlight = () => {
            const element = document.querySelector<HTMLElement>(`[data-tour-id="${currentStep.targetId}"]`);
            if (element) {
                setSpotlightRect(buildSpotlightRect(element));
            }
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                skipTour().catch(() => {});
            }
            if (event.key === "ArrowRight") {
                goNext();
            }
            if (event.key === "ArrowLeft") {
                goPrevious();
            }
        };

        window.addEventListener("resize", updateSpotlight);
        window.addEventListener("scroll", updateSpotlight, true);
        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("resize", updateSpotlight);
            window.removeEventListener("scroll", updateSpotlight, true);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [currentRoute, currentStep, goNext, goPrevious, isActive, skipTour]);

    const value = useMemo<GuidedTourContextValue>(() => ({
        isActive: isActive || showCompletion,
        isSidebarLocked: isActive || showCompletion,
        startManualTour,
    }), [isActive, showCompletion, startManualTour]);

    return (
        <GuidedTourContext.Provider value={value}>
            {children}

            {isActive && currentStep && (
                <GuidedTourOverlay
                    step={currentStep}
                    stepIndex={stepIndex}
                    totalSteps={GUIDED_TOUR_STEPS.length}
                    spotlightRect={spotlightRect}
                    onNext={goNext}
                    onPrevious={goPrevious}
                    onSkip={() => {
                        skipTour().catch(() => {});
                    }}
                />
            )}

            {showCompletion && <GuidedTourCompletionModal onFinish={() => {
                finishTour().catch(() => {});
            }} />}
        </GuidedTourContext.Provider>
    );
}

export function useGuidedTour() {
    const context = useContext(GuidedTourContext);

    if (!context) {
        throw new Error("useGuidedTour must be used within GuidedTourProvider");
    }

    return context;
}
