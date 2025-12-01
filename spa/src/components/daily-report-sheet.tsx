// components/daily-report-sheet.tsx
"use client";

import { FileText, Printer, X } from "lucide-react";
import { useState, useTransition } from "react";
import { createReport } from "@/api/create-report";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { toMoney } from "@/lib/utils";
import { useCartStore } from "@/stores/cart.store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

export const DailyReportSheet = () => {
	const [open, setOpen] = useState(false);
	const { getDailyReport, clearAllData } = useCartStore();
	const [pending, startTransition] = useTransition();
	const report = getDailyReport();

	const handlePrint = () => {
		startTransition(async () => {
			const response = await createReport({
				body: {
					total_orders: report.totalOrders,
					total_price: report.totalRevenue,
					products: report.productSales.map((item) => ({
						name: item.productName,
						quantity: item.totalQuantity,
						price: item.totalRevenue,
					})),
				},
			});

			if (!response.status) {
				console.error(response.message);
			}
			setOpen(false);
		});
	};

	const handleCloseReport = () => {
		handlePrint();

		setTimeout(() => {
			clearAllData();
			setOpen(false);
		}, 1000);
	};

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button variant="outline" className="w-full gap-2">
					<FileText className="w-4 h-4" />
					Отчет дня
				</Button>
			</SheetTrigger>

			<SheetContent className="sm:max-w-md">
				<SheetHeader>
					<SheetTitle className="flex items-center gap-2">
						<FileText className="w-5 h-5" />
						Отчет за день
					</SheetTitle>
				</SheetHeader>

				<div className="mt-6 space-y-4 px-4">
					<div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
						<div className="text-center">
							<div className="text-2xl font-bold text-blue-600">
								{report.totalOrders}
							</div>
							<div className="text-sm text-gray-600">Заказов</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-green-600">
								{toMoney(report.totalRevenue)}
							</div>
							<div className="text-sm text-gray-600">Выручка</div>
						</div>
					</div>

					{/* Таблица продуктов */}
					{report.productSales.length > 0 ? (
						<div className="border rounded-lg">
							<div className="p-3 bg-gray-50 border-b">
								<h3 className="font-semibold">Проданные продукты</h3>
							</div>
							<div className="max-h-64 overflow-y-auto">
								<Table className="w-full text-sm">
									<TableHeader className="bg-gray-50">
										<TableRow>
											<TableHead className="text-left font-medium">Продукт</TableHead>
											<TableHead className="text-center font-medium">Кол-во</TableHead>
											<TableHead className="text-right font-medium">Сумма</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{report.productSales.map((product) => (
											<TableRow key={product.productId} className="border-b">
												<TableCell>{product.productName}</TableCell>
												<TableCell className="text-center">
													{product.totalQuantity}
												</TableCell>
												<TableCell className="text-right">
													{toMoney(product.totalRevenue)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</div>
					) : (
						<div className="text-center py-8 text-gray-500">
							<FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
							<p>Нет данных о продажах за сегодня</p>
						</div>
					)}

					<div className="flex gap-2 pt-4">
						<Button
							onClick={handlePrint}
							disabled={report.productSales.length === 0}
							className="flex-1 gap-2"
						>
							<Printer className="w-4 h-4" />

							{pending ? "Печать..." : "Печать отчета"}
						</Button>
						<Button
							onClick={handleCloseReport}
							variant="destructive"
							className="gap-2"
							disabled={report.productSales.length === 0}
						>
							<X className="w-4 h-4" />
							Закрыть отчет
						</Button>
					</div>

					{/* Подсказка */}
					{report.productSales.length === 0 && (
						<div className="text-center text-sm text-gray-500 p-2">
							Нет данных для печати отчета
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
};
