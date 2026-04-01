import { useMemo, useState, useRef } from 'react';

interface Stage {
    title: string;
    count: number;
    color: string;
}

interface PipelineFlowProps {
    stages: Stage[];
}

const STAGE_COLORS = [
    '#062133', // marine deep
    '#0A4B66', // marine
    '#0F7B8C', // primary
    '#1AA0A4', // primary light
    '#43C6D1', // coastal cyan
    '#D8893C', // accent
    '#7CB7A3', // sea mist
    '#22c55e', // green
];

const HEIGHT = 80;
const PADDING_Y = 8;

// Smooth bezier path between two rectangles (left center → right center)
function buildStreamPath(
    x1: number, y1top: number, y1bot: number,
    x2: number, y2top: number, y2bot: number
): string {
    const cx = (x1 + x2) / 2;
    // top curve
    const top = `M${x1},${y1top} C${cx},${y1top} ${cx},${y2top} ${x2},${y2top}`;
    // bottom curve (reverse)
    const bot = `L${x2},${y2bot} C${cx},${y2bot} ${cx},${y1bot} ${x1},${y1bot} Z`;
    return top + ' ' + bot;
}

export function PipelineFlow({ stages }: PipelineFlowProps) {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; stage: Stage; idx: number } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const total = useMemo(() => stages.reduce((s, c) => s + c.count, 0), [stages]);
    const maxCount = useMemo(() => Math.max(...stages.map(s => s.count), 1), [stages]);

    // Removed bottleneck logic - now handled in dashboard recommendations

    // Normalize heights for each stage band
    const normalize = (count: number) => {
        const minH = 20; // minimum band height in px
        const maxH = HEIGHT - PADDING_Y * 2;
        if (maxCount === 0) return minH;
        return minH + (count / maxCount) * (maxH - minH);
    };

    const n = stages.length;

    // We'll render the SVG in a viewBox="0 0 1000 HEIGHT"
    const VW = 1000;
    const segW = VW / n;

    // Vertical center of canvas
    const mid = HEIGHT / 2;

    // Compute band top/bottom for each segment
    const bands = stages.map((s) => {
        const h = normalize(s.count);
        return { top: mid - h / 2, bot: mid + h / 2 };
    });

    // Removed conversion rates as per user request

    return (
        <div className="w-full flex flex-col select-none">
            {/* Labels above */}
            <div className="flex" style={{ minHeight: 28 }}>
                {stages.map((s, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end pb-1" style={{ minWidth: 0 }}>
                        <span
                            className="text-[11px] font-semibold text-text-secondary px-1 text-center leading-tight"
                            style={{ wordBreak: 'break-word', maxWidth: '100%' }}
                        >
                            {s.title}
                        </span>
                    </div>
                ))}
            </div>

            {/* SVG stream */}
            <svg
                ref={svgRef}
                viewBox={`0 0 ${VW} ${HEIGHT}`}
                preserveAspectRatio="none"
                className="w-full"
                style={{ height: HEIGHT, marginTop: 4 }}
            >
                <defs>
                    {stages.map((_s, i) => (
                        <linearGradient key={i} id={`grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={STAGE_COLORS[i % STAGE_COLORS.length]} stopOpacity="0.85" />
                            <stop offset="100%" stopColor={STAGE_COLORS[(i + 1) % STAGE_COLORS.length]} stopOpacity="0.75" />
                        </linearGradient>
                    ))}
                </defs>

                {/* Connection paths between stages */}
                {stages.map((_, i) => {
                    if (i >= n - 1) return null;
                    const x1 = (i + 0.75) * segW;
                    const x2 = (i + 1.25) * segW;
                    const b1 = bands[i];
                    const b2 = bands[i + 1];
                    const d = buildStreamPath(x1, b1.top, b1.bot, x2, b2.top, b2.bot);
                    return (
                        <path
                            key={`conn-${i}`}
                            d={d}
                            fill={`url(#grad-${i})`}
                            opacity={0.6}
                            className="transition-all duration-500"
                        />
                    );
                })}

                {/* Stage bands */}
                {stages.map((s, i) => {
                    const x = i * segW + segW * 0.25;
                    const w = segW * 0.5;
                    const b = bands[i];
                    const h = b.bot - b.top;
                    const color = STAGE_COLORS[i % STAGE_COLORS.length];
                    return (
                        <g key={i}>
                            <rect
                                x={x}
                                y={b.top}
                                width={w}
                                height={h}
                                rx={8}
                                fill={color}
                                opacity={0.82}
                                className="cursor-pointer transition-all duration-500"
                                onMouseEnter={() => {
                                    const svgEl = svgRef.current;
                                    if (!svgEl) return;
                                    const rect = svgEl.getBoundingClientRect();
                                    const svgX = (i + 0.5) * segW;
                                    const pct = (svgX / VW) * rect.width + rect.left;
                                    setTooltip({ x: pct, y: rect.top, stage: s, idx: i });
                                }}
                                onMouseLeave={() => setTooltip(null)}
                            />
                            {/* Count label inside band if tall enough */}
                            {h > 14 && (
                                <text
                                    x={x + w / 2}
                                    y={b.top + h / 2 + 1}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize={h > 50 ? 16 : h > 30 ? 13 : 10}
                                    fontWeight="bold"
                                    fill="white"
                                    opacity={0.9}
                                    className="pointer-events-none"
                                >
                                    {s.count}
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* Removed conversion rate labels */}
            </svg>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="fixed z-50 pointer-events-none"
                    style={{
                        left: Math.min(tooltip.x, window.innerWidth - 180),
                        top: tooltip.y - 90,
                        transform: 'translateX(-50%)',
                    }}
                >
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl px-4 py-3 min-w-[160px]">
                        <div className="flex items-center gap-2 mb-1">
                            <span
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ background: STAGE_COLORS[tooltip.idx % STAGE_COLORS.length] }}
                            />
                            <span className="text-sm font-semibold text-white">{tooltip.stage.title}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                            <div className="flex justify-between gap-4">
                                <span>Leads</span>
                                <span className="text-white font-bold">{tooltip.stage.count}</span>
                            </div>
                            <div className="flex justify-between gap-4 mt-0.5">
                                <span>Do total</span>
                                <span className="text-white font-bold">
                                    {total > 0 ? Math.round((tooltip.stage.count / total) * 100) : 0}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom legend: total */}
            <div className="flex items-center justify-center gap-2 pt-1 pb-0.5">
                <span className="text-[10px] text-text-muted">
                    {total} leads no pipeline
                </span>
            </div>
        </div>
    );
}
