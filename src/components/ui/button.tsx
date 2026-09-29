import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient" | "comedy";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";
    
    const variants = {
      default: "bg-[#d9072a] text-white shadow-md hover:bg-[#ca0c2a] shadow-[#d9072a]/25",
      comedy: "bg-[#d9072a] hover:bg-[#ca0c2a] text-white shadow-lg shadow-[#d9072a]/30 font-semibold tracking-wide",
      gradient: "bg-gradient-to-r from-[#d9072a] via-[#e5193c] to-[#aa0020] text-white shadow-lg hover:from-[#c20625] hover:to-[#8f001b] shadow-[#d9072a]/30",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
      outline: "border border-border/80 bg-background/50 backdrop-blur-sm hover:bg-[#d9072a]/10 hover:text-white text-slate-300 hover:border-[#d9072a]/50",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-[#d9072a]/15 hover:text-[#ff4d6d] text-muted-foreground",
      link: "text-[#d9072a] underline-offset-4 hover:underline",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-12 rounded-xl px-8 text-base",
      icon: "h-10 w-10",
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
