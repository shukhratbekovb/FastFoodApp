"use client";

import { Search } from "lucide-react";
import { useQueryStates } from "nuqs";
import { Label } from "@/components/ui/label";
import { SidebarInput } from "@/components/ui/sidebar";
import { searchParamsParsers } from "@/lib/search-params";

export function SearchForm({ ...props }: React.ComponentProps<"form">) {
	const [{ query }, setQuery] = useQueryStates(searchParamsParsers);

	return (
		<form {...props}>
			<div className="relative">
				<Label htmlFor="search" className="sr-only">
					Поиск
				</Label>
				<SidebarInput
					id="search"
					placeholder="Поиск"
					className="h-10 pl-7"
					value={query}
					onChange={(e) =>
						setQuery({
							query: e.target.value,
						})
					}
				/>
				<Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
			</div>
		</form>
	);
}
