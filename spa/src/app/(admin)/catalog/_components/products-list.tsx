"use client";

import { Suspense } from "react";
import { productsData } from "@/defaults/products.data";
import { useSearchParams } from "@/lib/search-params";
import { ProductItem } from "./product-item";

const ProductsContent = () => {
	const [params] = useSearchParams();

	const catalog = params.catalog || "";
	const query = params.query || "";

	const productsByCategory = productsData.filter((product) => {
		const catalogMatch = catalog
			? product.category.toLowerCase().includes(catalog.toLowerCase())
			: true;

		const queryMatch = query
			? product.name.toLowerCase().includes(query.toLowerCase())
			: true;

		return catalogMatch && queryMatch;
	});

	return (
		<section
			data-slot="products-list"
			className="px-3 sm:px-4 lg:px-10 py-4 sm:py-6 lg:py-10"
		>
			{productsByCategory.length === 0 && (
				<div className="text-center py-8 sm:py-10">
					<p className="text-gray-500 text-base sm:text-lg">
						Ничего не найдено
					</p>
					<p className="text-sm text-gray-400 mt-1 sm:mt-2">
						Попробуйте изменить параметры поиска
					</p>
				</div>
			)}

			{productsByCategory.length > 0 && (
				<div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
					{productsByCategory.map((product) => (
						<ProductItem key={product.id} product={product} />
					))}
				</div>
			)}
		</section>
	);
};

const ProductsList = () => {
	return (
		<Suspense
			fallback={
				<div className="px-3 sm:px-4 lg:px-10 py-4 sm:py-6 lg:py-10">
					<div className="text-center py-8 sm:py-10">
						<p className="text-gray-500 text-sm sm:text-base">
							Загрузка товаров...
						</p>
					</div>
				</div>
			}
		>
			<ProductsContent />
		</Suspense>
	);
};

export default ProductsList;
