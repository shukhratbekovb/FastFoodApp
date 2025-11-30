import { ENV } from "@/configs/env.config";

export const createReport = async ({ body }: Params) => {
	try {
		const response = await fetch(`${ENV.API}/print/report/`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			throw new Error("Network response was not ok");
		}

		return {
			status: true,
			message: "Order created successfully",
		};
	} catch (error) {
		console.error("Error creating order:", error);
		return {
			status: false,
			message: "Failed to create order",
		};
	}
};

interface Params {
	body: Request;
}

interface Request {
	total_orders: number;
	total_price: number;
	items: {
		name: string;
		quantity: number;
		price: number;
	}[];
}
