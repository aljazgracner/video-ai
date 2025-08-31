import { NextResponse } from 'next/server';
import { DrizzleVideoRepository } from '../../../../src/infrastructure/repositories/DrizzleVideoRepository';
import { TokenCalculator } from '../../../../src/infrastructure/utils/tokenCalculator';

const videoRepository = new DrizzleVideoRepository();

export async function GET() {
	try {
		const videosWithTranscripts =
			await videoRepository.getAllVideosWithTranscripts();

		const historyWithCosts = videosWithTranscripts.map(
			({ video, transcript }) => {
				let totalCost = 0;
				let totalInputTokens = 0;
				let totalOutputTokens = 0;

				if (transcript) {
					totalInputTokens = transcript.inputTokens;
					totalOutputTokens = transcript.outputTokens;
					const costInfo = TokenCalculator.calculateCost(
						totalInputTokens,
						totalOutputTokens
					);
					totalCost = costInfo.totalCost;
				}

				return {
					video,
					transcript,
					tokenUsage: {
						inputTokens: totalInputTokens,
						outputTokens: totalOutputTokens,
						totalCost,
					},
				};
			}
		);

		return NextResponse.json({
			success: true,
			data: historyWithCosts,
		});
	} catch (error) {
		console.error('Error fetching video history:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch video history' },
			{ status: 500 }
		);
	}
}
