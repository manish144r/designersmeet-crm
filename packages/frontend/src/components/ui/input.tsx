import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-[34px] w-full rounded-md border border-border-strong bg-background px-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary focus:ring-[3px] focus:ring-primary-tint",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
