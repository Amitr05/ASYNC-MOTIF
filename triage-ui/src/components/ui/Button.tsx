import { cn } from "@/utils/cn";

/*
 * Button — every clickable action in Motif comes from here.
 * Rule: exactly ONE variant="primary" per view (Atlassian's reserved-blue rule).
 */
export type ButtonVariant = "primary" | "secondary" | "subtle" | "danger" | "link";
export type ButtonSize = "sm" | "md";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-pressed disabled:bg-brand/40",
  secondary:
    "border border-border bg-surface text-text hover:bg-surface-hover active:bg-surface-hover disabled:text-text-subtlest",
  subtle:
    "bg-surface-hover text-text-subtle hover:bg-border/60 hover:text-text disabled:text-text-subtlest",
  danger:
    "bg-surface text-risk-critical border border-border hover:bg-risk-critical-subtle disabled:text-text-subtlest",
  link: "text-brand underline-offset-2 hover:underline disabled:text-text-subtlest",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-3.5 text-sm gap-2",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-sm font-medium transition-colors duration-150 ease-standard disabled:cursor-not-allowed",
        VARIANTS[variant],
        variant === "link" ? "h-auto p-0 text-sm" : SIZES[size],
        className,
      )}
    >
      {loading && (
        <span
          aria-hidden
          className="mr-1 inline-block size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
