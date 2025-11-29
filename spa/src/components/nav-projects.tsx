"use client";

import Link from "next/link";
import { useQueryStates } from "nuqs";
import {
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { searchParamsParsers } from "@/lib/search-params";
import { cn } from "@/lib/utils";
import type { Menu } from "./app-sidebar";

export function NavProjects({ projects }: Props) {
	const [{ catalog }] = useQueryStates(searchParamsParsers);

	return (
		<SidebarGroup className="group-data-[collapsible=icon]:hidden">
			<SidebarMenu>
				{projects.map((item) => (
					<SidebarMenuItem key={item.name}>
						<SidebarMenuButton asChild>
							<Link
								className={cn({
									"text-blue-500": catalog === item.value,
								})}
								href={item.url}
							>
								<item.icon />
								<span>{item.name}</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}

interface Props {
	projects: Menu[];
}
