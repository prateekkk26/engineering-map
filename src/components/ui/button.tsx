import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * The app had no Button. Every button was a hand-written class string, and the
 * same ~90 characters of hover and focus state were repeated across a dozen
 * files — which is why they had already drifted apart.
 *
 * `brand` is the only variant that fills with the accent hue, and PRD §7 gives
 * it exactly one home: the support call to action. Anything else that wants a
 * filled accent button is a request to amend that list.
 */
const buttonVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&>svg]:pointer-events-none [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        brand: "bg-brand text-brand-foreground hover:bg-brand/90",
        outline: "ring-1 ring-border hover:bg-accent/40",
        ghost: "hover:bg-accent/60",
        link: "text-brand underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 [&>svg]:size-4",
        default: "h-9 px-4 [&>svg]:size-4",
        lg: "h-11 px-5 text-base [&>svg]:size-5",
        icon: "size-9 [&>svg]:size-4",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
