import type { FC, ReactNode } from "react";

export interface User {
	email: string;
	password: string;
}

type SearchParams = { [key: string]: string | string[] | undefined };

interface ParamsWithLocale {
	[key: string]: string;
}

export interface PageProps<Params extends ParamsWithLocale = ParamsWithLocale> {
	params: Promise<Params>;
	searchParams: Promise<SearchParams>;
}

export interface LayoutProps<
	Params extends ParamsWithLocale = ParamsWithLocale,
> {
	params: Params;
	children: ReactNode;
}

export type ErrorRouteComponent = FC<{
	error: Error;
	reset: () => void;
}>;

export interface DynamicMetadata<
	Params extends ParamsWithLocale = ParamsWithLocale,
	SearchParams extends object = object,
> {
	params: Promise<Params>;
	searchParams: Promise<SearchParams>;
}