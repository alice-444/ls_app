"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import type { ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			toastOptions={{
				classNames: {
					toast:
						"group toast group-[.toaster]:bg-white/40 dark:group-[.toaster]:bg-black/40 group-[.toaster]:backdrop-blur-xl group-[.toaster]:backdrop-saturate-150 group-[.toaster]:text-foreground group-[.toaster]:border-white/50 dark:group-[.toaster]:border-white/20 group-[.toaster]:shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] group-[.toaster]:rounded-full group-[.toaster]:px-6 group-[.toaster]:py-3",
					description: "group-[.toast]:text-muted-foreground",
					actionButton:
						"group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
					cancelButton:
						"group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
				},
			}}
			style={
				{
					"--normal-bg": "var(--popover)",
					"--normal-text": "var(--popover-foreground)",
					"--normal-border": "var(--border)",
				} as React.CSSProperties
			}
			{...props}
		/>
	);
};

export { Toaster };
