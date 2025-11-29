import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ProductType } from "@/defaults/products.data";

export const useCartStore = create<CartStoreType>()(
	persist(
		(set, get) => ({
			cart: [],
			orders: [],
			lastOrderId: 0,

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

				// 💡 ЛОГИКА ОБНОВЛЕНИЯ lastOrderId:
				// Если lastOrderId достиг 999, то новый ID будет 1. Иначе — lastOrderId + 1.
				const nextOrderId =
					state.lastOrderId >= 999 ? 1 : state.lastOrderId + 1;
				const newOrderId = nextOrderId;

				const newOrder: OrderType = {
					orderId: newOrderId,
					items: state.cart,
					totalPrice: totalPrice,
					originalTotal: state.cart.reduce((sum, item) => {
						const itemPrice =
							item.newPrice !== undefined ? item.newPrice : item.price;
						return sum + itemPrice * item.quantity;
					}, 0),
					createdAt: new Date().toISOString(),
				};

				set((state) => ({
					orders: [newOrder, ...state.orders].sort(
						(a, b) => b.orderId - a.orderId,
					),
					cart: [],
					lastOrderId: newOrderId, // Сохраняем новый ID
				}));

				return newOrder;
			},

			completeOrder: (orderId) =>
				set((state) => ({
					orders: state.orders.map((o) =>
						o.orderId === orderId ? { ...o, status: "completed" } : o,
					),
				})),
		}),
		{
			name: "cart-storage",
			storage: createJSONStorage(() => sessionStorage),
			partialize: (state) => ({
				orders: state.orders,
				lastOrderId: state.lastOrderId,
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
	status?: "pending" | "completed";
	createdAt?: string;
}

export interface CartStoreType {
	cart: CartItem[];
	orders: OrderType[];
	lastOrderId: number;

	addItem: (product: ProductType, selectedTag?: ProductTag | null) => void;
	removeItem: (id: string) => void;
	setQuantity: (id: string, quantity: number) => void;
	setPrice: (id: string, newPrice: number) => void;
	clearCart: () => void;

	createOrder: (totalPrice?: number) => OrderType | null;
	completeOrder: (orderId: number) => void;
}
