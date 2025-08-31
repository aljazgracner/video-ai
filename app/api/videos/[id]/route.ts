import { NextRequest, NextResponse } from 'next/server';
import { DrizzleVideoRepository } from '../../../../src/infrastructure/repositories/DrizzleVideoRepository';

const videoRepository = new DrizzleVideoRepository();

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const videoId = params.id;

		if (!videoId) {
			return NextResponse.json(
				{ error: 'Video ID is required' },
				{ status: 400 }
			);
		}

		await videoRepository.deleteById(videoId);

		return NextResponse.json({
			success: true,
			message: 'Video deleted successfully',
		});
	} catch (error) {
		console.error('Error deleting video:', error);
		return NextResponse.json(
			{ error: 'Failed to delete video' },
			{ status: 500 }
		);
	}
}
