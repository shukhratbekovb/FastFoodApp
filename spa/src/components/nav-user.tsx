"use client";

import { useRouter } from "next/navigation";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { Button } from "./ui/button";

export function NavUser() {
	const router = useRouter();

	const handleLogout = () => {
		router.push("/login");
	};

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<Button size={"lg"} className="w-full" onClick={handleLogout}>
					Выйти
				</Button>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
