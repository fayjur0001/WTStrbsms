import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  cn(
    "inline-flex",
    "items-center",
    "justify-center",
    "gap-2",
    "whitespace-nowrap",
    "rounded-md",
    "text-sm",
    "font-medium",
    "transition-all",
    "disabled:pointer-events-none",
    "disabled:opacity-50",
    "[&_svg]:pointer-events-none",
    "[&_svg:not([class*='size-'])]:size-4",
    "shrink-0",
    "[&_svg]:shrink-0",
    "outline-none",
    "focus-visible:border-ring",
    "focus-visible:ring-ring/50",
    "focus-visible:ring-[3px]",
    "aria-invalid:ring-destructive/20",
    "aria-invalid:border-destructive",
    "cursor-pointer",
  ),
  {
    variants: {
      variant: {
        default: cn(
          "bg-primary",
          "text-primary-foreground",
          "shadow-xs",
          "hover:bg-primary-dark",
        ),
        destructive: cn(
          "bg-destructive",
          "text-white",
          "shadow-xs",
          "hover:bg-destructive/90",
          "focus-visible:ring-destructive/20",
        ),
        outline: cn(
          "border",
          "border",
          "border-primary",
          "text-primary",
          "bg-transparent",
          "shadow-xs",
          "hover:bg-primary",
          "hover:text-foreground",
        ),
        secondary: cn(
          "bg-secondary",
          "text-secondary-foreground",
          "shadow-xs",
          "hover:bg-secondary/80",
          "text-foreground",
        ),
        ghost: cn("hover:bg-accent", "hover:text-accent-foreground"),
        link: cn("text-primary", "underline-offset-4", "hover:underline"),
      },
      size: {
        default: cn("h-9", "px-4", "py-2", "has-[>svg]:px-3"),
        sm: cn("h-8", "rounded-md", "gap-1.5", "px-3", "has-[>svg]:px-2.5"),
        lg: cn("h-10", "rounded-md", "px-6", "has-[>svg]:px-4"),
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  glow = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    glow?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  const glowClasses =
    variant === "default" || variant === undefined
      ? "drop-shadow-[0_0_5px_var(--color-primary)]"
      : variant === "destructive"
        ? "drop-shadow-[0_0_5px_var(--color-destructive)]"
        : variant === "secondary"
          ? "drop-shadow-[0_0_5px_var(--color-secondary)]"
          : undefined;

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }), {
        [`${glowClasses}`]: glow,
      })}
      {...props}
    />
  );
}

export { Button, buttonVariants };
