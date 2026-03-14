"use client";

import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient, trpc, trpcClient } from "@/utils/trpc";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Toaster } from "@/components/ui/Sonner";
import { SidebarProvider } from "@/hooks/use-sidebar";

interface ProvidersProps {
	readonly children: ReactNode;
}

export default function Providers({ children }: Readonly<ProvidersProps>) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<trpc.Provider client={trpcClient} queryClient={queryClient}>
				<QueryClientProvider client={queryClient}>
					<SidebarProvider>
						{children}
					</SidebarProvider>
					<ReactQueryDevtools />
				</QueryClientProvider>
			</trpc.Provider>
			<Toaster richColors />
		</ThemeProvider>
	);
}
