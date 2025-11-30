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

export const DailyReportSheet = () => {
	const [open, setOpen] = useState(false);
	const { getDailyReport, clearAllData } = useCartStore(); // Используем clearAllData вместо clearDailyReport
	const [pending, startTransition] = useTransition();
	const report = getDailyReport();

	const handlePrint = () => {
		startTransition(async () => {
			const response = await createReport({
				body: {
					total_orders: report.totalOrders,
					total_price: report.totalRevenue,
					items: report.productSales.map((item) => ({
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
		// Сначала печатаем отчет
		handlePrint();

		// Затем очищаем ВСЕ данные и закрываем sheet
		setTimeout(() => {
			clearAllData(); // Используем clearAllData вместо clearDailyReport
			setOpen(false);
		}, 1000); // Увеличиваем время для гарантии завершения печати
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
					{/* Статистика */}
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
								<table className="w-full text-sm">
									<thead className="bg-gray-50">
										<tr>
											<th className="text-left p-2 font-medium">Продукт</th>
											<th className="text-center p-2 font-medium">Кол-во</th>
											<th className="text-right p-2 font-medium">Сумма</th>
										</tr>
									</thead>
									<tbody>
										{report.productSales.map((product) => (
											<tr key={product.productId} className="border-b">
												<td className="p-2">{product.productName}</td>
												<td className="p-2 text-center">
													{product.totalQuantity}
												</td>
												<td className="p-2 text-right">
													{toMoney(product.totalRevenue)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					) : (
						<div className="text-center py-8 text-gray-500">
							<FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
							<p>Нет данных о продажах за сегодня</p>
						</div>
					)}

					{/* Кнопки действий */}
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
