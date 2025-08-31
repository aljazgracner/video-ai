export const formatTime = (seconds: number): string => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const calculateCost = (
	inputTokens: number,
	outputTokens: number
): number => {
	const inputCostPerMillion = 0.3;
	const outputCostPerMillion = 0.3;
	const inputCost = (inputTokens / 1000000) * inputCostPerMillion;
	const outputCost = (outputTokens / 1000000) * outputCostPerMillion;
	return Math.round((inputCost + outputCost) * 10000) / 10000;
};

export const formatDate = (dateString: string): string => {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};
