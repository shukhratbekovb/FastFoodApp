"use client";

import * as Icons from "lucide-react";
import type * as React from "react";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { RoutersConfig } from "@/configs/routers.config";
import { categoriesData } from "@/defaults/categories.data";
import { DailyReportSheet } from "./daily-report-sheet.tsx";
import { OrderSheet } from "./order-sheet";

const data = {
	projects: [
		...categoriesData.map((item) => {
			return {
				icon: Icons[item.icon],
				url: `${RoutersConfig.catalog}/?catalog=${item.name}`,
				name: item.title_ru,
				value: item.name,
			};
		}),
	],
} as const;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar
			className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
			{...props}
		>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem className="pt-7">
						<OrderSheet />
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavProjects projects={[...data.projects]} />
			</SidebarContent>
			<SidebarFooter>
				<DailyReportSheet />
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}

export type Menu = (typeof data.projects)[number];
