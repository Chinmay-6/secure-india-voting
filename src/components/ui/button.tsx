import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ring-offset-[var(--np-card)]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--np-saffron)] text-[var(--np-ink)] hover:bg-[#ff880f]",
        outline:
          "border border-[var(--np-border)] bg-white text-[var(--np-ink)] hover:bg-gray-50",
        ghost:
          "bg-transparent text-[var(--np-ink-muted)] hover:bg-black/5 rounded-full",
      },
      size: {
        default: "h-10 px-5",
        lg: "h-11 px-6 text-sm",
        sm: "h-9 px-4 text-xs",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

