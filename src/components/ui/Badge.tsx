import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/80",
        outline: "text-foreground",
        whatsapp: "border-transparent bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
        web: "border-transparent bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
        voice: "border-transparent bg-amber-500/15 text-amber-400 border-amber-500/20",
        confirmed: "border-transparent bg-emerald-500/15 text-emerald-400",
        pending: "border-transparent bg-amber-500/15 text-amber-400",
        cancelled: "border-transparent bg-red-500/15 text-red-400",
        completed: "border-transparent bg-zinc-500/15 text-zinc-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };