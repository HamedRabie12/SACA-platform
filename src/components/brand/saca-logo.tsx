"use client";

type LogoSize = "sm" | "md" | "lg" | "xl";

const sizes: Record<LogoSize, string> = {
  sm: "h-9 w-[180px]",
  md: "h-11 w-[220px]",
  lg: "h-14 w-[280px]",
  xl: "h-20 w-[400px]",
};

export function SACALogo({
  size = "md",
  showText = true,
}: {
  size?: LogoSize;
  showText?: boolean;
}) {
  const className = showText
    ? `${sizes[size]} object-contain`
    : `${size === "xl" ? "h-16 w-16" : size === "lg" ? "h-12 w-12" : size === "md" ? "h-10 w-10" : "h-8 w-8"} object-contain`;

  return (
    <img
      src="/logo.svg"
      alt={showText ? "Sudanese American Community Association — SACA" : "SACA"}
      className={className}
      width={showText ? undefined : 64}
      height={showText ? undefined : 64}
      decoding="async"
    />
  );
}

export function SACAWordmark() {
  return <SACALogo size="md" showText />;
}

export function SACALogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <img
      src="/logo-mark.svg"
      alt="SACA"
      className={className}
      decoding="async"
    />
  );
}
