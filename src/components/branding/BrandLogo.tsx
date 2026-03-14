import type { CSSProperties, ReactNode } from "react";
import { cn } from "../../utils/cn";

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
    "--brand-mark-width": `${markWidth}px`,
    "--brand-mark-height": `${markHeight}px`,
    "--brand-word-size": `${wordSize}px`,
  } as CSSProperties;

  return (
    <span className={cn("brand-logo text-text-primary", className)} style={style}>
      <span className={cn("brand-mark", markClassName)} aria-hidden="true"></span>
      {showWord && <span className={cn("brand-word", wordClassName)}>Kogna</span>}
      {trailing}
    </span>
  );
}
