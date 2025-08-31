export interface TokenUsage {
	inputTokens: number;
	outputTokens: number;
}

export class TokenCalculator {
	static estimateTokens(text: string): number {
		return Math.ceil(text.length / 4);
	}

	static estimateAudioTokens(audioSizeBytes: number): number {
		return Math.ceil(audioSizeBytes / 1000);
	}

	static calculateCost(
		inputTokens: number,
		outputTokens: number
	): {
		inputCost: number;
		outputCost: number;
		totalCost: number;
	} {
		const inputCostPerMillion = 0.3;
		const outputCostPerMillion = 0.3;

		const inputCost = (inputTokens / 1000000) * inputCostPerMillion;
		const outputCost = (outputTokens / 1000000) * outputCostPerMillion;
		const totalCost = inputCost + outputCost;

		return {
			inputCost: Math.round(inputCost * 10000) / 10000,
			outputCost: Math.round(outputCost * 10000) / 10000,
			totalCost: Math.round(totalCost * 10000) / 10000,
		};
	}
}
