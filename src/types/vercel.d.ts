declare module '@vercel/speed-insights/react' {
    import type { ComponentType } from 'react';
    const SpeedInsights: ComponentType;
    export { SpeedInsights };
    export default SpeedInsights;
}

declare module '@vercel/analytics/react' {
    import type { ComponentType } from 'react';
    const Analytics: ComponentType;
    export { Analytics };
    export default Analytics;
}
