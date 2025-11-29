const API = "http://192.168.0.200:8000";

export const createOrderPrint = async ({ body }: Params) => {
	try {
		const response = await fetch(`${API}/print/`, {
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
	products: Product[];
	total: number;
	order_id: number;
}

export interface Product {
	name: string;
	price: number;
	quantity: number;
}
