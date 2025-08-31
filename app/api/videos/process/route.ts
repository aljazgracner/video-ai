import { NextRequest, NextResponse } from 'next/server';
import { VideoProcessingApplicationService } from '../../../../src/application/services/VideoProcessingApplicationService';
import { DrizzleVideoRepository } from '../../../../src/infrastructure/repositories/DrizzleVideoRepository';
import { YouTubeVideoProcessingService } from '../../../../src/infrastructure/services/YouTubeVideoProcessingService';

const videoRepository = new DrizzleVideoRepository();
const videoProcessingService = new YouTubeVideoProcessingService();
const applicationService = new VideoProcessingApplicationService(
	videoRepository,
	videoProcessingService
);

export async function POST(request: NextRequest) {
	try {
		const { youtubeUrl } = await request.json();

		if (!youtubeUrl) {
			return NextResponse.json(
				{ error: 'YouTube URL is required' },
				{ status: 400 }
			);
		}

		const result = await applicationService.processVideo(youtubeUrl);

		return NextResponse.json({
			success: true,
			data: result,
		});
	} catch (error) {
		console.error('Error processing video:', error);
		return NextResponse.json(
			{ error: 'Failed to process video' },
			{ status: 500 }
		);
	}
}
