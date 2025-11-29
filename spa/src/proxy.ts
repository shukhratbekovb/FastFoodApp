import { type NextRequest, NextResponse } from "next/server";

export const proxy = async (
	request: NextRequest,
): Promise<NextResponse<unknown>> => {
	const { pathname } = request.nextUrl;

	if (pathname === "/") {
		return NextResponse.redirect(new URL("/login", request.nextUrl));
	}

	return NextResponse.next();
};

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
