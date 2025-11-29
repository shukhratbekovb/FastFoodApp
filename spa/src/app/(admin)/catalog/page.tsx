import { Suspense } from "react";
import ProductsList from "./_components/products-list";

export const dynamic = "force-dynamic";

const Page = () => {
	return (
		<Suspense fallback={<div>Loading catalog...</div>}>
			<ProductsList />
		</Suspense>
	);
};

export default Page;
