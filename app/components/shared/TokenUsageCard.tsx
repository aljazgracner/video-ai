interface TokenUsageCardProps {
	inputTokens: number;
	outputTokens: number;
	totalCost: number;
	showCost?: boolean;
}

export default function TokenUsageCard({
	inputTokens,
	outputTokens,
	totalCost,
	showCost = true,
}: TokenUsageCardProps) {
	return (
		<div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
			<h3 className="text-xl font-semibold mb-6 text-gray-900 flex items-center">
				<svg
					className="w-6 h-6 mr-3 text-blue-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
					/>
				</svg>
				Token Usage & Cost
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
							<svg
								className="w-6 h-6 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
						</div>
						<div>
							<div className="text-sm text-blue-600 font-medium">
								Input Tokens
							</div>
							<div className="text-2xl font-bold text-blue-900">
								{inputTokens.toLocaleString()}
							</div>
						</div>
					</div>
				</div>
				<div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
							<svg
								className="w-6 h-6 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
								/>
							</svg>
						</div>
						<div>
							<div className="text-sm text-green-600 font-medium">
								Output Tokens
							</div>
							<div className="text-2xl font-bold text-green-900">
								{outputTokens.toLocaleString()}
							</div>
						</div>
					</div>
				</div>
				{showCost && (
					<div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
								<svg
									className="w-6 h-6 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
									/>
								</svg>
							</div>
							<div>
								<div className="text-sm text-purple-600 font-medium">
									Estimated Cost
								</div>
								<div className="text-2xl font-bold text-purple-900">
									${totalCost}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
