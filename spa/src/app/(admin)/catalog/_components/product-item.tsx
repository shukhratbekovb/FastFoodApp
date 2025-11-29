"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { ProductType } from "@/defaults/products.data";
import { cn, toMoney } from "@/lib/utils";
import { type ProductTag, useCartStore } from "@/stores/cart.store";

export const ProductItem = ({ product }: Props) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const addItem = useCartStore((state) => state.addItem);
	const setQuantity = useCartStore((state) => state.setQuantity);
	const cart = useCartStore((state) => state.cart);

	// Получаем количество для конкретного варианта
	const getQuantityForItem = (tag: ProductTag | null = null) => {
		const itemId = tag ? `${product.id}-${tag.id}` : product.id.toString();
		const cartItem = cart.find((item) => item.id === itemId);
		return cartItem?.quantity || 0;
	};

	// Получаем общее количество для продукта (все варианты)
	const getTotalQuantity = () => {
		const mainProduct = cart.find((item) => item.id === product.id.toString());
		const tagProducts = cart.filter((item) =>
			item.id.startsWith(`${product.id}-`),
		);

		return (
			(mainProduct?.quantity || 0) +
			tagProducts.reduce((sum, item) => sum + item.quantity, 0)
		);
	};

	const handleAddItem = (tag: ProductTag | null = null) => {
		addItem(product, tag);
	};

	const handleRemoveItem = (tag: ProductTag | null = null) => {
		const itemId = tag ? `${product.id}-${tag.id}` : product.id.toString();
		const currentQuantity = getQuantityForItem(tag);

		if (currentQuantity > 0) {
			setQuantity(itemId, currentQuantity - 1);
		}
	};

	const totalQuantity = getTotalQuantity();

	return (
		<>
			<Card
				className={cn(
					"flex flex-col pt-0 overflow-hidden rounded-xl sm:rounded-2xl shadow-sm sm:shadow-md border-0 bg-white cursor-pointer transition-all duration-300 hover:shadow-lg sm:hover:shadow-xl hover:-translate-y-0.5 sm:hover:-translate-y-1",
				)}
				onClick={() => setIsDialogOpen(true)}
			>
				<CardHeader className="p-0">
					<div className="h-32 xs:h-36 sm:h-48 md:h-52 lg:h-60 overflow-hidden relative">
						{/** biome-ignore lint/performance/noImgElement: <explanation> */}
						<img
							src={product.imageUrl}
							alt={product.name}
							className={cn(
								"w-full h-full object-cover transition-transform duration-500 hover:scale-105",
							)}
						/>
					</div>
				</CardHeader>

				<CardContent className="flex-1 p-2 sm:p-3 md:p-4">
					<h3 className="font-semibold text-gray-900 text-xs xs:text-sm sm:text-base leading-tight mb-1 sm:mb-2 line-clamp-2 min-h-[2.5em]">
						{product.name}
					</h3>

					<div className="flex items-center justify-between gap-1 xs:gap-2">
						<span className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-red-600 whitespace-nowrap">
							{toMoney(product.price)}
						</span>

						<div className="flex gap-1 xs:gap-2 items-center">
							{totalQuantity > 0 && (
								<>
									<Button
										size="default"
										variant="outline"
										className="h-6 w-6 xs:h-7 xs:w-7 sm:h-9 sm:w-9"
										onClick={(e) => {
											e.stopPropagation();
											if (!product.tags?.length) {
												handleRemoveItem();
											} else {
												setIsDialogOpen(true);
											}
										}}
									>
										<Minus size={12} className="xs:size-3 sm:size-4" />
									</Button>

									<span className="min-w-4 xs:min-w-5 sm:min-w-6 text-center font-medium text-xs xs:text-sm sm:text-base">
										{totalQuantity}
									</span>
								</>
							)}

							<Button
								size="default"
								className="h-6 w-6 xs:h-7 xs:w-7 sm:h-9 sm:w-9"
								onClick={(e) => {
									e.stopPropagation();
									if (!product.tags?.length) {
										handleAddItem();
									} else {
										setIsDialogOpen(true);
									}
								}}
							>
								<Plus size={12} className="xs:size-3 sm:size-4" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-[95vw] sm:max-w-md rounded-lg sm:rounded-xl mx-2 sm:mx-0">
					<DialogHeader>
						<DialogTitle className="text-base sm:text-lg text-center">
							{product.name}
						</DialogTitle>
					</DialogHeader>

					<div className="flex flex-col gap-3 sm:gap-4 max-h-[60vh] sm:max-h-none overflow-y-auto">
						{/* Основной продукт */}
						<div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
							<div className="flex-1 min-w-0">
								<div className="font-semibold text-sm sm:text-base">
									Базовая версия
								</div>
								<div className="text-base sm:text-lg font-bold text-red-600">
									{toMoney(product.price)}
								</div>
							</div>
							<div className="flex items-center gap-2 sm:gap-3 ml-2">
								<Button
									size="sm"
									variant="outline"
									className="h-8 w-8 sm:h-9 sm:w-9"
									onClick={() => handleRemoveItem()}
									disabled={getQuantityForItem() === 0}
								>
									<Minus size={14} className="sm:size-4" />
								</Button>
								<span className="min-w-6 sm:min-w-8 text-center font-medium text-sm sm:text-base">
									{getQuantityForItem()}
								</span>
								<Button
									size="sm"
									className="h-8 w-8 sm:h-9 sm:w-9"
									onClick={() => handleAddItem()}
								>
									<Plus size={14} className="sm:size-4" />
								</Button>
							</div>
						</div>

						{/* Варианты из тегов */}
						{product.tags?.map((tag) => {
							const quantity = getQuantityForItem(tag);
							return (
								<div
									key={tag.id}
									className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg"
								>
									<div className="flex-1 min-w-0">
										<div className="font-semibold text-sm sm:text-base">
											{tag.name}
										</div>
										<div className="text-base sm:text-lg font-bold text-red-600">
											{toMoney(tag.price)}
										</div>
									</div>
									<div className="flex items-center gap-2 sm:gap-3 ml-2">
										<Button
											size="sm"
											variant="outline"
											className="h-8 w-8 sm:h-9 sm:w-9"
											onClick={() => handleRemoveItem(tag)}
											disabled={quantity === 0}
										>
											<Minus size={14} className="sm:size-4" />
										</Button>
										<span className="min-w-6 sm:min-w-8 text-center font-medium text-sm sm:text-base">
											{quantity}
										</span>
										<Button
											size="sm"
											className="h-8 w-8 sm:h-9 sm:w-9"
											onClick={() => handleAddItem(tag)}
										>
											<Plus size={14} className="sm:size-4" />
										</Button>
									</div>
								</div>
							);
						})}
					</div>

					<div className="flex gap-2 pt-3 sm:pt-4 border-t">
						<Button
							variant="outline"
							className="flex-1 text-sm sm:text-base py-2 sm:py-2"
							onClick={() => setIsDialogOpen(false)}
						>
							Закрыть
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};

interface Props {
	product: ProductType;
}
