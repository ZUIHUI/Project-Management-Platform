export const cn = (...values) => values.filter(Boolean).join(" ");

const buttonVariants = {
  primary: "border-transparent bg-brand text-white hover:bg-brand-active active:bg-brand-active disabled:bg-brand-disabled disabled:text-white",
  secondary: "border-transparent bg-surface-strong text-ink hover:bg-line disabled:bg-surface-strong disabled:text-muted",
  outline: "border-line bg-canvas text-ink hover:bg-surface disabled:border-line disabled:bg-canvas disabled:text-muted",
  ghost: "border-transparent bg-transparent text-ink hover:bg-surface-strong disabled:bg-transparent disabled:text-muted",
  danger: "border-line bg-canvas text-danger hover:border-danger hover:bg-danger-soft disabled:border-line disabled:bg-canvas disabled:text-muted",
};

const buttonSizes = {
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-14 px-8 text-base",
};

export const buttonClass = ({ variant = "primary", size = "md", className = "" } = {}) =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-pill border font-semibold leading-none transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-100",
    buttonVariants[variant] ?? buttonVariants.primary,
    buttonSizes[size] ?? buttonSizes.md,
    className,
  );

export const inputClass = cn(
  "min-h-12 w-full rounded-control border border-line bg-canvas px-4 text-base text-ink outline-none transition-colors",
  "placeholder:text-muted-soft focus:border-brand focus:ring-1 focus:ring-brand disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted",
  "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-danger",
);
