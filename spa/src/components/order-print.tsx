"use client";

import { useTransition } from "react";
import { createOrderPrint } from "@/api/create-order";
import type { OrderType } from "@/stores/cart.store";
import { Button } from "./ui/button";

interface Props {
	order: OrderType;
}

export const OrderPrint = ({ order }: Props) => {
	const [pending, startTransition] = useTransition();

	const handlePrintOrder = (order: OrderType) => {
		startTransition(async () => {
			const response = await createOrderPrint({
				body: {
					order_id: order.orderId,
					products: order.items.map((item) => ({
						name: item.name,
						price: item.newPrice ?? item.price,
						quantity: item.quantity,
					})),
					total: order.totalPrice || order.originalTotal || 0,
				},
			});

			if (!response.status) {
				alert(response.message);
				return;
			}
		});
	};

	return (
		<Button
			size="sm"
			className="text-xs sm:text-sm py-1 sm:py-1.5 h-8 sm:h-9"
			onClick={() => handlePrintOrder(order)}
			variant="outline"
			disabled={pending}
		>
			{pending ? "Загрузка..." : "Печать"}
		</Button>
	);
};
