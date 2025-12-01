import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ProductType } from "@/defaults/products.data";

export const useCartStore = create<CartStoreType>()(
	persist(
		(set, get) => ({
			cart: [],
			orders: [],
			lastOrderId: 0,
			dailyReport: {
				totalOrders: 0,
				totalRevenue: 0,
				startDate: new Date().toISOString().split("T")[0] as string,
				orders: [],
			},

			addItem: (product, selectedTag = null) =>
				set((state) => {
					const cartItemId = selectedTag
						? `${product.id}-${selectedTag.id}`
						: product.id.toString();

					const exists = state.cart.find((i) => i.id === cartItemId);

					if (exists) {
						return {
							cart: state.cart
								.map((i) =>
									i.id === cartItemId ? { ...i, quantity: i.quantity + 1 } : i,
								)
								.sort(
									(a, b) =>
										Number.parseInt(b.id, 10) - Number.parseInt(a.id, 10),
								),
						};
					}

					const newItem: CartItem = {
						id: cartItemId,
						productId: product.id,
						name: selectedTag
							? `${product.name} (${selectedTag.name})`
							: product.name,
						price: selectedTag ? selectedTag.price : product.price,
						category: product.category,
						imageUrl: product.imageUrl,
						quantity: 1,
						originalProduct: product,
						selectedTag: selectedTag || null,
						newPrice: undefined,
					};

					return {
						cart: [...state.cart, newItem],
					};
				}),

			removeItem: (id) =>
				set((state) => ({
					cart: state.cart
						.filter((i) => i.id !== id)
						.sort(
							(a, b) => Number.parseInt(b.id, 10) - Number.parseInt(a.id, 10),
						),
				})),

			setQuantity: (id, quantity) =>
				set((state) => ({
					cart: state.cart
						.map((i) => (i.id === id ? { ...i, quantity } : i))
						.filter((item) => item.quantity > 0)
						.sort(
							(a, b) => Number.parseInt(b.id, 10) - Number.parseInt(a.id, 10),
						),
				})),

			setPrice: (id, newPrice) =>
				set((state) => ({
					cart: state.cart
						.map((i) => (i.id === id ? { ...i, newPrice } : i))
						.sort(
							(a, b) => Number.parseInt(b.id, 10) - Number.parseInt(a.id, 10),
						),
				})),

			clearCart: () => set({ cart: [] }),

			createOrder: (totalPrice?: number): OrderType | null => {
				const state = get();

				if (state.cart.length === 0) return null;

				const nextOrderId =
					state.lastOrderId >= 999 ? 1 : state.lastOrderId + 1;
				const newOrderId = nextOrderId;

				const calculatedTotal = state.cart.reduce((sum, item) => {
					const itemPrice =
						item.newPrice !== undefined ? item.newPrice : item.price;
					return sum + itemPrice * item.quantity;
				}, 0);

				const finalTotal =
					totalPrice !== undefined ? totalPrice : calculatedTotal;

				const newOrder: OrderType = {
					orderId: newOrderId,
					items: state.cart,
					totalPrice: finalTotal,
					originalTotal: calculatedTotal,
					createdAt: new Date().toISOString(),
				};

				const today = new Date().toISOString().split("T")[0] as string;
				const currentReport = state.dailyReport;

				const updatedReport =
					currentReport.startDate === today
						? currentReport
						: {
							totalOrders: 0,
							totalRevenue: 0,
							startDate: today,
							orders: [],
						};

				set({
					orders: [newOrder, ...state.orders].sort(
						(a, b) => b.orderId - a.orderId,
					),
					cart: [],
					lastOrderId: newOrderId,
					dailyReport: {
						...updatedReport,
						totalOrders: updatedReport.totalOrders + 1,
						totalRevenue: updatedReport.totalRevenue + finalTotal,
						orders: [newOrder, ...updatedReport.orders],
					},
				});

				return newOrder;
			},

			completeOrder: (orderId) =>
				set((state) => ({
					orders: state.orders.map((o) =>
						o.orderId === orderId ? { ...o, status: "completed" } : o,
					),
				})),

			cancelOrder(orderId) {
				set((state) => {
					const orderToCancel = state.orders.find((o) => o.orderId === orderId);

					if (!orderToCancel) return state;

					const orderTotal = orderToCancel.totalPrice ||
						orderToCancel.items.reduce((sum, item) => {
							const itemPrice = item.newPrice ?? item.price;
							return sum + itemPrice * item.quantity;
						}, 0);

					const today = new Date().toISOString().split("T")[0] as string;
					const currentReport = state.dailyReport;

					if (currentReport.startDate === today) {
						return {
							orders: state.orders.map((o) =>
								o.orderId === orderId ? { ...o, status: "cancelled" } : o,
							),
							dailyReport: {
								...currentReport,
								totalOrders: Math.max(0, currentReport.totalOrders - 1),
								totalRevenue: Math.max(0, currentReport.totalRevenue - orderTotal),
								orders: currentReport.orders.filter(o => o.orderId !== orderId),
							},
						};
					}

					return {
						orders: state.orders.map((o) =>
							o.orderId === orderId ? { ...o, status: "cancelled" } : o,
						),
					};
				});
			},

			getDailyReport: () => {
				const state = get();
				const productSalesMap = new Map<string, ProductSales>();

				state.dailyReport.orders.forEach((order) => {
					order.items.forEach((item) => {
						const finalPrice =
							item.newPrice !== undefined ? item.newPrice : item.price;
						const revenue = finalPrice * item.quantity;

						const productKey = `${item.productId}-${item.id}`;

						if (!productSalesMap.has(productKey)) {
							productSalesMap.set(productKey, {
								productId: item.productId,
								productName: item.originalProduct?.name || item.name.split(" (")[0] as string,
								totalQuantity: 0,
								totalRevenue: 0,
							});
						}

						const productStats = productSalesMap.get(productKey)!;
						productStats.totalQuantity += item.quantity;
						productStats.totalRevenue += revenue;
					});
				});

				const productSales = Array.from(productSalesMap.values()).sort(
					(a, b) => b.totalRevenue - a.totalRevenue,
				);

				return {
					totalOrders: state.dailyReport.totalOrders,
					totalRevenue: state.dailyReport.totalRevenue,
					startDate: state.dailyReport.startDate,
					productSales,
				};
			},

			clearDailyReport: () => {
				const today = new Date().toISOString().split("T")[0] as string;
				set({
					dailyReport: {
						totalOrders: 0,
						totalRevenue: 0,
						startDate: today,
						orders: [],
					},
				});
			},

			clearAllData: () => {
				const today = new Date().toISOString().split("T")[0] as string;
				set({
					orders: [],
					lastOrderId: 0,
					dailyReport: {
						totalOrders: 0,
						totalRevenue: 0,
						startDate: today,
						orders: [],
					},
				});
			},
		}),
		{
			name: "cart-storage",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				orders: state.orders,
				lastOrderId: state.lastOrderId,
				dailyReport: state.dailyReport,
			}),
		},
	),
);

export interface ProductTag {
	id: number;
	name: string;
	price: number;
}

export type CartItem = {
	id: string;
	productId: number;
	name: string;
	price: number;
	category: string;
	imageUrl: string;
	quantity: number;
	originalProduct: ProductType;
	selectedTag: ProductTag | null;
	newPrice?: number;
};

export interface OrderType {
	orderId: number;
	items: CartItem[];
	totalPrice?: number;
	originalTotal?: number;
	status?: "pending" | "completed" | "cancelled";
	createdAt?: string;
}

export interface ProductSales {
	productId: number;
	productName: string;
	totalQuantity: number;
	totalRevenue: number;
}

export interface CartStoreType {
	cart: CartItem[];
	orders: OrderType[];
	lastOrderId: number;
	dailyReport: {
		totalOrders: number;
		totalRevenue: number;
		startDate: string;
		orders: OrderType[];
	};

	addItem: (product: ProductType, selectedTag?: ProductTag | null) => void;
	removeItem: (id: string) => void;
	setQuantity: (id: string, quantity: number) => void;
	setPrice: (id: string, newPrice: number) => void;
	clearCart: () => void;
	createOrder: (totalPrice?: number) => OrderType | null;
	completeOrder: (orderId: number) => void;

	getDailyReport: () => {
		totalOrders: number;
		totalRevenue: number;
		startDate: string;
		productSales: ProductSales[];
	};
	clearDailyReport: () => void;
	clearAllData: () => void;
	cancelOrder: (orderId: number) => void;
}
