import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Style relief partagé pour les CTA (navbar-like) */
const ctaRelief =
	"rounded-full backdrop-blur-xl backdrop-saturate-150 shadow-[0_6px_20px_-4px_rgba(0,0,0,0.12),0_4px_8px_-2px_rgba(0,0,0,0.08),inset_0_2px_0_0_rgba(255,255,255,0.6)] dark:shadow-[0_6px_20px_-4px_rgba(0,0,0,0.35),0_4px_8px_-2px_rgba(0,0,0,0.2),inset_0_2px_0_0_rgba(255,255,255,0.15)] transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
	{
		variants: {
			variant: {
				default:
					"bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
				destructive:
					"bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
				outline:
					"border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
				secondary:
					"bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
				ghost:
					"hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
				link: "text-primary underline-offset-4 hover:underline",
				/** CTA principal (brand) – style navbar avec relief */
				cta: `${ctaRelief} bg-brand/90 dark:bg-brand/75 border border-white/55 dark:border-white/40 text-black font-semibold hover:bg-brand-hover hover:border-white/70 hover:shadow-[0_10px_30px_-8px_rgba(255,140,66,0.4),0_6px_12px_-4px_rgba(0,0,0,0.12),inset_0_2px_0_0_rgba(255,255,255,0.6)] dark:hover:bg-brand-hover dark:hover:border-white/55 dark:hover:shadow-[0_10px_30px_-8px_rgba(255,140,66,0.5),inset_0_2px_0_0_rgba(255,255,255,0.25)]`,
				/** CTA secondaire (outline) – style navbar avec relief */
				ctaOutline: `${ctaRelief} border border-white/50 dark:border-white/30 bg-white/35 dark:bg-white/15 text-ls-heading dark:text-[#e0e0e0] hover:bg-[#26547c] hover:border-[#26547c] hover:text-white hover:shadow-[0_10px_30px_-8px_rgba(0,0,0,0.2),0_6px_12px_-4px_rgba(0,0,0,0.12),inset_0_2px_0_0_rgba(255,255,255,0.25)] dark:hover:bg-[#4a90e2] dark:hover:border-[#4a90e2] dark:hover:shadow-[0_10px_30px_-8px_rgba(0,0,0,0.4),inset_0_2px_0_0_rgba(255,255,255,0.15)]`,
			},
			size: {
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
				lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
				icon: "size-9",
				cta: "h-9 sm:h-10 px-4 sm:px-6 rounded-full",
				ctaSm: "h-8 px-3 sm:px-4 rounded-full text-xs",
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
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
