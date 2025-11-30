"use client";

import { Button } from "./ui/button";

export const VirtualKeyboard = ({
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
