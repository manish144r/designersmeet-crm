import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-background border border-primary hover:bg-primary-hover",
        secondary:
          "bg-background text-foreground border border-border-strong hover:bg-hover",
        ghost: "text-secondary hover:bg-hover hover:text-foreground",
        outline: "border border-border-strong bg-background hover:bg-hover",
        destructive: "bg-danger text-background hover:opacity-90",
      },
      size: {
        default: "h-9 px-3.5 py-1.5",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-5",
        icon: "h-[30px] w-[30px]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
  },
);
Button.displayName = "Button";
export { buttonVariants };
