import { Inbox, LoaderCircle } from "lucide-react";
import { buttonClass, cn } from "./styles";

export function Button({ as: Component = "button", type = "button", variant, size, className, ...props }) {
  return (
    <Component
      type={Component === "button" ? type : undefined}
      className={buttonClass({ variant, size, className })}
      {...props}
    />
  );
}

export function IconButton({ label, children, className, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-body transition-colors",
        "hover:bg-surface-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:text-muted disabled:hover:bg-transparent",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function PageHeader({ eyebrow, title, description, actions, children, className }) {
  return (
    <header className={cn("flex flex-col gap-5 border-b border-line-soft pb-6 xl:flex-row xl:items-end xl:justify-between", className)}>
      <div className="min-w-0 max-w-3xl">
        {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">{eyebrow}</p> : null}
        <h1 className="font-display text-3xl font-normal tracking-tight text-ink sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-body sm:text-base">{description}</p> : null}
        {children}
      </div>
      {actions ? <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto">{actions}</div> : null}
    </header>
  );
}

export function Card({ as: Component = "section", className, children, ...props }) {
  const CardElement = Component;
  return (
    <CardElement className={cn("rounded-card border border-line bg-canvas", className)} {...props}>
      {children}
    </CardElement>
  );
}

export function CardHeader({ title, description, action, className }) {
  return (
    <div className={cn("flex flex-col gap-3 border-b border-line-soft px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6", className)}>
      <div>
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-1 text-sm text-body">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

const badgeTones = {
  neutral: "bg-surface-strong text-body",
  brand: "bg-brand-soft text-brand-active",
  success: "bg-success-soft text-success-strong",
  warning: "bg-warning-soft text-warning-strong",
  danger: "bg-danger-soft text-danger",
};

export function Badge({ tone = "neutral", children, className }) {
  return (
    <span className={cn("inline-flex min-h-7 items-center rounded-pill px-3 text-xs font-semibold", badgeTones[tone], className)}>
      {children}
    </span>
  );
}

const alertTones = {
  info: "border-line bg-brand-soft text-brand-active",
  success: "border-line bg-success-soft text-success-strong",
  error: "border-line bg-danger-soft text-danger",
};

export function Alert({ tone = "info", title, children, className }) {
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("rounded-control border px-4 py-3 text-sm", alertTones[tone], className)}>
      {title ? <p className="font-semibold">{title}</p> : null}
      {children ? <div className={title ? "mt-1" : ""}>{children}</div> : null}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, action, compact = false, className }) {
  const EmptyIcon = Icon;
  return (
    <div className={cn("flex flex-col items-center justify-center text-center", compact ? "px-4 py-8" : "px-6 py-14", className)}>
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-surface-strong text-body">
        <EmptyIcon aria-hidden="true" size={22} />
      </span>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-1 max-w-md text-sm leading-6 text-body">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function LoadingState({ label = "載入中…", compact = false }) {
  return (
    <div role="status" aria-live="polite" className={cn("flex items-center justify-center gap-3 text-sm text-body", compact ? "py-5" : "py-14")}>
      <LoaderCircle className="animate-spin motion-reduce:animate-none" size={18} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function FormField({ label, htmlFor, hint, error, required, children, className }) {
  const describedBy = error ? `${htmlFor}-error` : hint ? `${htmlFor}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-ink">
        {label}
        {required ? <span className="ml-1 text-danger" aria-hidden="true">*</span> : null}
        {required ? <span className="sr-only">（必填）</span> : null}
      </label>
      {typeof children === "function" ? children({ describedBy, invalid: Boolean(error) }) : children}
      {hint && !error ? <p id={`${htmlFor}-hint`} className="mt-2 text-xs leading-5 text-muted">{hint}</p> : null}
      {error ? <p id={`${htmlFor}-error`} role="alert" className="mt-2 text-xs text-danger">{error}</p> : null}
    </div>
  );
}

export function StatCard({ label, value, helper, icon: Icon, tone = "default" }) {
  const valueTone = tone === "danger" ? "text-danger" : tone === "success" ? "text-success-strong" : "text-ink";
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-body">{label}</p>
          <p className={cn("mt-3 font-mono text-3xl font-medium tracking-tight", valueTone)}>{value}</p>
          {helper ? <p className="mt-2 text-xs text-muted">{helper}</p> : null}
        </div>
        {Icon ? (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-strong text-ink">
            <Icon size={19} aria-hidden="true" />
          </span>
        ) : null}
      </div>
    </Card>
  );
}
