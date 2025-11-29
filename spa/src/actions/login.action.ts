"use server";

import { cookies } from "next/headers";
import type { User } from "@/types/type";

export const loginAction = async (formData: FormData) => {
	const email = formData.get("email") as string;
	const password = process.env.AUTH_SECRET as string;

	if (!email || email !== process.env.ADMIN_EMAIL || !process.env.AUTH_SECRET) {
		return {
			status: false,
			message: "Неправильный логин или пароль",
		};
	}

	const user: User = { email, password };
	const expires = new Date(Date.now() + 20 * 3600 * 1000);

	(await cookies()).set({
		name: "fast-food-user",
		value: JSON.stringify(user),
		expires,
		path: "/",
		sameSite: "lax",
		httpOnly: true,
	});

	return {
		status: true,
		message: "Успешный вход",
	};
};
