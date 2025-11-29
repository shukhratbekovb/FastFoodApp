"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createOrderPrint } from "@/api/create-order";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { toMoney } from "@/lib/utils";
import {
	type CartItem,
	type OrderType,
	useCartStore,
} from "@/stores/cart.store";
import { Field, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";

const VirtualKeyboard = ({
	onInput,
	onClose,
	onClear,
	onBackspace,
}: {
	onInput: (value: string) => void;
	onClose: () => void;
	onClear: () => void;
	onBackspace: () => void;
}) => {
	const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

	const handleKeyPress = (key: string) => {
		onInput(key);
	};

	return (
		<div className="fixed bottom-0 left-0 right-3/5 bg-white border-t shadow-lg p-3 sm:p-4 z-50">
			<div className="max-w-md mx-auto">
				<div className="grid grid-cols-3 gap-2 mb-3">
					{numbers.map((num) => (
						<Button
							key={num}
							variant="outline"
							className="h-12 sm:h-14 text-lg sm:text-xl font-medium"
							onClick={() => handleKeyPress(num)}
						>
							{num}
						</Button>
					))}
					<Button
						variant="outline"
						className="h-12 sm:h-14 text-lg sm:text-xl font-medium"
						onClick={onBackspace}
					>
						⌫
					</Button>
					<Button
						variant="outline"
						className="h-12 sm:h-14 text-lg sm:text-xl font-medium"
						onClick={() => handleKeyPress("00")}
					>
						00
					</Button>
				</div>

				<div className="grid grid-cols-2 gap-2">
					<Button
						variant="outline"
						className="h-12 sm:h-14 text-sm sm:text-base"
						onClick={onClear}
					>
						Очистить
					</Button>
					<Button
						className="h-12 sm:h-14 text-sm sm:text-base bg-green-600 hover:bg-green-700"
						onClick={onClose}
					>
						Готово
					</Button>
				</div>
			</div>
		</div>
	);
};

export const OrderSheet = () => {
	const cart = useCartStore((state) => state.cart);
	const orders = useCartStore((state) => state.orders);
	const removeItem = useCartStore((state) => state.removeItem);
	const setQuantity = useCartStore((state) => state.setQuantity);
	const setPrice = useCartStore((state) => state.setPrice);
	const createOrder = useCartStore((state) => state.createOrder);
	const clearCart = useCartStore((state) => state.clearCart);
	const [customTotal, setCustomTotal] = useState(0);
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [tempPrices, setTempPrices] = useState<Record<string, string>>({});
	const [pending, startTransition] = useTransition();
	const [isCreatingAndPrinting, setIsCreatingAndPrinting] = useState(false); // Для кнопки "Создать заказ"

	const [showKeyboard, setShowKeyboard] = useState(false);
	const [activeInput, setActiveInput] = useState<{
		type: "price" | "total";
		itemId?: string;
	} | null>(null);

	const currentPriceRef = useRef<string>("");
	const currentTotalRef = useRef<string>("");

	const getItemPrice = (item: CartItem) => {
		return item.newPrice !== undefined ? item.newPrice : item.price;
	};

	const getItemTotal = (item: CartItem) => {
		return getItemPrice(item) * item.quantity;
	};

	const originalTotal = cart.reduce((sum, item) => sum + getItemTotal(item), 0);

	const displayTotal = customTotal !== 0 ? customTotal : originalTotal;

	useEffect(() => {
		setCustomTotal(0);
	}, [cart]);

	const handleInputFocus = (type: "price" | "total", itemId?: string) => {
		if (window.innerWidth < 1028) {
			setActiveInput({ type, itemId });
			setShowKeyboard(true);

			if (type === "price" && itemId) {
				currentPriceRef.current = tempPrices[itemId] || "";
			} else if (type === "total") {
				currentTotalRef.current =
					customTotal !== 0 ? customTotal.toString() : "";
			}
		}
	};

	const handleKeyboardInput = (key: string) => {
		if (activeInput?.type === "price" && activeInput.itemId) {
			currentPriceRef.current += key;
			handlePriceChange(activeInput.itemId, currentPriceRef.current);
		} else if (activeInput?.type === "total") {
			currentTotalRef.current += key;
			handleTotalChange(currentTotalRef.current);
		}
	};

	const handleKeyboardBackspace = () => {
		if (activeInput?.type === "price" && activeInput.itemId) {
			currentPriceRef.current = currentPriceRef.current.slice(0, -1);
			handlePriceChange(activeInput.itemId, currentPriceRef.current);
		} else if (activeInput?.type === "total") {
			currentTotalRef.current = currentTotalRef.current.slice(0, -1);
			handleTotalChange(currentTotalRef.current);
		}
	};

	const handleKeyboardClear = () => {
		if (activeInput?.type === "price" && activeInput.itemId) {
			currentPriceRef.current = "";
			handlePriceChange(activeInput.itemId, "");
		} else if (activeInput?.type === "total") {
			currentTotalRef.current = "";
			handleTotalChange("");
		}
	};

	const handleKeyboardClose = () => {
		setShowKeyboard(false);
		setActiveInput(null);
		currentPriceRef.current = "";
		currentTotalRef.current = "";
	};

	// 🚀 ОБНОВЛЕННАЯ ФУНКЦИЯ СОЗДАНИЯ И ПЕЧАТИ ЗАКАЗА
	const handleCreateOrder = () => {
		if (cart.length === 0) return;

		const finalTotal = customTotal !== 0 ? customTotal : undefined;
		const newOrder = createOrder(finalTotal); // Создаем заказ и получаем его

		if (!newOrder) return; // На всякий случай, если корзина была пуста

		setCustomTotal(0); // Сбрасываем кастомную сумму

		startTransition(async () => {
			setIsCreatingAndPrinting(true);

			const response = await createOrderPrint({
				body: {
					order_id: newOrder.orderId,
					products: newOrder.items.map((item) => ({
						name: item.name,
						// Используем фактическую цену, сохраненную в заказе
						price: item.newPrice ?? item.price,
						quantity: item.quantity,
					})),
					total: newOrder.totalPrice || newOrder.originalTotal || 0,
				},
			});

			setIsCreatingAndPrinting(false);

			if (!response.status) {
				alert(
					`Заказ #${newOrder.orderId} создан, но печать не удалась: ${response.message}`,
				);
				return;
			}

			// alert(`Заказ #${newOrder.orderId} успешно создан и отправлен на печать.`);
			// setIsSheetOpen(false); // Закрыть, если нужно
		});
	};

	const handlePriceChange = (itemId: string, value: string) => {
		setTempPrices((prev) => ({
			...prev,
			[itemId]: value,
		}));
	};

	const handlePriceSave = (itemId: string) => {
		const tempPrice = tempPrices[itemId];
		if (tempPrice) {
			const newPrice = Number.parseInt(tempPrice.replace(/\s/g, ""), 10);
			if (!Number.isNaN(newPrice) && newPrice > 0) {
				setPrice(itemId, newPrice);
			}
		}

		setTempPrices((prev) => {
			const newTemp = { ...prev };
			delete newTemp[itemId];
			return newTemp;
		});
	};

	const handlePriceKeyPress = (e: React.KeyboardEvent, itemId: string) => {
		if (e.key === "Enter") {
			handlePriceSave(itemId);
		}
	};

	const handleTotalChange = (value: string) => {
		const newTotal = Number.parseInt(value.replace(/\s/g, ""), 10);
		if (!Number.isNaN(newTotal) && newTotal >= 0) {
			setCustomTotal(newTotal);
		} else if (value === "") {
			setCustomTotal(0);
		}
	};

	const handleResetTotal = () => {
		setCustomTotal(0);
	};

	const handlePrintOrder = (order: OrderType) => {
		startTransition(async () => {
			const response = await createOrderPrint({
				body: {
					order_id: order.orderId,
					products: order.items.map((item) => ({
						name: item.name,
						price: item.newPrice ?? item.price, // Используем цену, сохраненную в item
						quantity: item.quantity,
					})),
					total: order.totalPrice || order.originalTotal || 0,
				},
			});

			if (!response.status) {
				alert(response.message);
				return;
			}

			// setIsSheetOpen(false); // Необязательно
		});
	};

	return (
		<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
			<SheetTrigger asChild onClick={() => setIsSheetOpen(true)}>
				<Button className="w-full text-sm sm:text-base py-2 sm:py-2.5">
					Корзина ({cart.length})
				</Button>
			</SheetTrigger>

			<SheetContent className="w-full sm:max-w-3/5 p-3 sm:p-4 md:p-6 flex flex-col gap-3 sm:gap-4 overflow-y-auto">
				<SheetHeader className="px-1 sm:px-0">
					<SheetTitle className="text-xl sm:text-2xl font-bold">
						Корзина
					</SheetTitle>
				</SheetHeader>

				{cart.length > 0 && (
					<>
						<div className="flex flex-col gap-3 sm:gap-4 min-h-96 overflow-y-auto border-b pb-2 sm:pb-3">
							{cart.map((item) => {
								const currentPrice = getItemPrice(item);
								const isCustomPrice = item.newPrice !== undefined;

								return (
									<div
										key={item.id}
										className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg"
									>
										<div className="flex-1 space-y-1 sm:space-y-2 min-w-0">
											<p className="font-semibold text-sm sm:text-base line-clamp-2">
												{item.name}
											</p>

											<div className="flex items-center gap-1 sm:gap-2 flex-wrap">
												{isCustomPrice ? (
													<>
														<span className="text-gray-500 line-through text-xs sm:text-sm">
															{toMoney(item.price)}
														</span>
														<span className="text-green-600 font-semibold text-sm sm:text-base">
															{toMoney(currentPrice)}
														</span>
													</>
												) : (
													<span className="text-gray-600 text-sm sm:text-base">
														{toMoney(currentPrice)}
													</span>
												)}
											</div>

											<div className="flex gap-2 xs:items-center w-full xs:w-auto">
												<Input
													placeholder="Новая цена"
													value={tempPrices[item.id] || ""}
													onChange={(e) =>
														handlePriceChange(item.id, e.target.value)
													}
													onKeyDown={(e) => handlePriceKeyPress(e, item.id)}
													onFocus={() => handleInputFocus("price", item.id)}
													className="h-8 text-xs sm:text-sm flex-1 xs:flex-none xs:w-32 sm:w-40"
												/>
												<div className="flex gap-1 sm:gap-2">
													<Button
														size="sm"
														className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
														onClick={() => handlePriceSave(item.id)}
														disabled={!tempPrices[item.id]}
													>
														OK
													</Button>
													{isCustomPrice && (
														<Button
															size="sm"
															variant="outline"
															className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
															onClick={() => setPrice(item.id, item.price)}
														>
															Сброс
														</Button>
													)}
												</div>
											</div>
										</div>

										<div className="flex items-center justify-between xs:justify-end gap-2 sm:gap-3 w-full xs:w-auto">
											<div className="flex items-center gap-1 sm:gap-2">
												<Button
													size="sm"
													className="h-8 w-8 sm:h-9 sm:w-9"
													onClick={() => {
														if (item.quantity > 1) {
															setQuantity(item.id, item.quantity - 1);
														} else {
															removeItem(item.id);
														}
													}}
												>
													-
												</Button>

												<span className="min-w-6 sm:min-w-8 text-center font-medium text-sm sm:text-base">
													{item.quantity}
												</span>

												<Button
													size="sm"
													className="h-8 w-8 sm:h-9 sm:w-9"
													onClick={() =>
														setQuantity(item.id, item.quantity + 1)
													}
												>
													+
												</Button>
											</div>

											<Button
												variant="destructive"
												size="sm"
												className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
												onClick={() => removeItem(item.id)}
											>
												Удалить
											</Button>
										</div>
									</div>
								);
							})}
						</div>

						<div className="flex flex-col gap-3 sm:gap-4 mt-1 sm:mt-2">
							<Field className="space-y-1.5">
								<FieldLabel className="font-bold text-base sm:text-lg">
									Общая сумма:{" "}
									{customTotal !== 0 ? (
										<span className="text-green-600">
											{toMoney(displayTotal)}
										</span>
									) : (
										toMoney(displayTotal)
									)}
								</FieldLabel>

								<div className="flex flex-col xs:flex-row gap-2 xs:items-center">
									<Input
										disabled={displayTotal === 0}
										type="number"
										className="w-full xs:w-40 sm:w-60 text-sm sm:text-base"
										placeholder="Введите общую сумму"
										value={customTotal !== 0 ? customTotal : ""}
										onChange={(e) => handleTotalChange(e.target.value)}
										onFocus={() => handleInputFocus("total")}
									/>

									<Button
										variant="outline"
										className="text-xs sm:text-sm py-1.5 sm:py-2"
										onClick={handleResetTotal}
										disabled={customTotal === 0}
									>
										Сброс
									</Button>
								</div>
								{customTotal !== 0 && (
									<p className="text-xs sm:text-sm text-gray-500">
										Оригинальная сумма: {toMoney(originalTotal)}
									</p>
								)}
							</Field>

							<div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 sm:gap-3">
								<div className="text-base sm:text-lg font-bold">
									К оплате: {toMoney(displayTotal)}
								</div>
								<Button
									onClick={handleCreateOrder}
									disabled={cart.length === 0 || isCreatingAndPrinting}
									className="w-full xs:w-auto text-sm sm:text-base py-2 sm:py-2"
								>
									{isCreatingAndPrinting
										? "Создание и печать..."
										: "Создать заказ"}
								</Button>
							</div>
						</div>

						<Button
							variant="outline"
							onClick={clearCart}
							disabled={cart.length === 0}
							className="mt-1 sm:mt-2 text-sm sm:text-base py-2 sm:py-2"
						>
							Очистить корзину
						</Button>
					</>
				)}

				{orders.length > 0 && (
					<div className="mt-4 sm:mt-6 flex flex-col gap-2 sm:gap-3 h-96 overflow-y-auto">
						<h3 className="font-bold text-lg sm:text-xl">Все заказы</h3>

						{orders.map((order) => {
							const orderTotal =
								order.totalPrice !== undefined
									? order.totalPrice
									: order.items.reduce((sum, i) => {
											const itemPrice =
												i.newPrice !== undefined ? i.newPrice : i.price;
											return sum + itemPrice * i.quantity;
										}, 0);

							return (
								<div
									key={order.orderId}
									className="p-2 sm:p-3 border rounded-md flex flex-col gap-1 sm:gap-2 bg-gray-50"
								>
									<div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-1 sm:gap-2">
										<p className="font-semibold text-sm sm:text-base">
											Заказ # {order.orderId}
										</p>
										<span className="text-xs sm:text-sm text-gray-500">
											{order.createdAt
												? new Date(order.createdAt).toLocaleTimeString()
												: ""}
										</span>
									</div>

									<div className="flex flex-col gap-1 sm:gap-1">
										{order.items.map((item) => {
											const itemPrice =
												item.newPrice !== undefined
													? item.newPrice
													: item.price;
											return (
												<div
													key={item.id}
													className="flex justify-between text-xs sm:text-sm text-gray-700"
												>
													<span className="flex-1 truncate mr-2">
														{item.name} x{item.quantity}
													</span>
													<span className="whitespace-nowrap">
														{toMoney(itemPrice * item.quantity)}
													</span>
												</div>
											);
										})}
									</div>

									<div className="flex flex-col xs:flex-row xs:justify-between xs:items-center gap-2 sm:gap-3 pt-1 sm:pt-2 border-t">
										<div className="font-semibold text-sm sm:text-base">
											Итого: {toMoney(orderTotal)}
											{order.totalPrice !== undefined && (
												<span className="text-green-600 text-xs sm:text-sm ml-1 sm:ml-2">
													(изменено)
												</span>
											)}
										</div>
										<Button
											size="sm"
											className="text-xs sm:text-sm py-1 sm:py-1.5 h-8 sm:h-9"
											onClick={() => handlePrintOrder(order)}
											variant="outline"
											disabled={pending}
										>
											{pending ? "Загрузка..." : "Печать"}
										</Button>
									</div>
								</div>
							);
						})}
					</div>
				)}

				{showKeyboard && (
					<VirtualKeyboard
						onInput={handleKeyboardInput}
						onClose={handleKeyboardClose}
						onClear={handleKeyboardClear}
						onBackspace={handleKeyboardBackspace}
					/>
				)}
			</SheetContent>
		</Sheet>
	);
};
