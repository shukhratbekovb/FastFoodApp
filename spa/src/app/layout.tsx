import type { Metadata } from "next";
import { Geist } from "next/font/google";
import type { FC, ReactNode } from "react";
import "@/css/globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { cn } from "@/lib/utils";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Fast Food",
};

const RootLayout: FC<LayoutProps> = ({ children }) => {
	return (
		<html lang="en" translate="no" className="scroll-smooth">
			<body className={cn(geistSans.className)}>
				<NuqsAdapter>{children}</NuqsAdapter>
			</body>
		</html>
	);
};

export interface LayoutProps {
	children: ReactNode;
}

export default RootLayout;
