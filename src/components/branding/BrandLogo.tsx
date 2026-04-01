import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface BrandLogoProps {
  className?: string;
  markClassName?: string;
  wordClassName?: string;
  showWord?: boolean;
  trailing?: ReactNode;
  markWidth?: number;
  markHeight?: number;
  wordSize?: number;
}

export function BrandLogo({
  className,
  markClassName,
  wordClassName,
  showWord = true,
  trailing,
  markWidth = 31,
  markHeight = 42,
  wordSize = 34,
}: BrandLogoProps) {
  const style = {
    '--brand-mark-width': `${markWidth}px`,
    '--brand-mark-height': `${markHeight}px`,
    '--brand-word-size': `${wordSize}px`,
  } as CSSProperties;

  return (
    <span className={cn('brand-logo text-text-primary', className)} style={style}>
      <span className={cn('brand-mark-shell', markClassName)} aria-hidden="true">
        <svg viewBox="0 0 72 72" className="brand-mark-svg" role="presentation">
          <defs>
            <linearGradient id="hub-pin-gradient" x1="10" y1="8" x2="58" y2="62" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#27B7BA" />
              <stop offset="0.58" stopColor="#127B8B" />
              <stop offset="1" stopColor="#0A4B66" />
            </linearGradient>
            <linearGradient id="hub-wave-gradient" x1="16" y1="40" x2="57" y2="54" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#F2B56E" />
              <stop offset="1" stopColor="#D8893C" />
            </linearGradient>
          </defs>
          <path
            d="M36 6c-12.702 0-23 9.932-23 22.186C13 45.02 36 66 36 66s23-20.98 23-37.814C59 15.932 48.702 6 36 6Z"
            fill="url(#hub-pin-gradient)"
          />
          <path
            d="M24 32.5 36 22l12 10.5V45H24V32.5Z"
            fill="rgba(255,255,255,0.96)"
          />
          <path d="M32 45V35h8v10" fill="#C8EEF0" />
          <path
            d="M20 47.5c4.7-3 9.4-3 14.1 0 4.8 3 9.5 3 14.3 0 3.1-2 6.1-2.7 9-2.2"
            fill="none"
            stroke="url(#hub-wave-gradient)"
            strokeLinecap="round"
            strokeWidth="3.4"
          />
          <circle cx="36" cy="28" r="3.2" fill="#0A4B66" />
        </svg>
      </span>
      {showWord && (
        <span className={cn('brand-wording', wordClassName)}>
          <span className="brand-word">HUB Corretores</span>
          <span className="brand-subword">Litoral SC</span>
        </span>
      )}
      {trailing}
    </span>
  );
}
