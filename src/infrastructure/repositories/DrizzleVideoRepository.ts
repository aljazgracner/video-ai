import { eq, desc } from 'drizzle-orm';
import { db } from '../database/connection';
import { videos, transcripts } from '../database/schema';
import { VideoRepository } from '../../domain/repositories/VideoRepository';
import { Video, Transcript, LogicalSegment } from '../../domain/entities/Video';

export class DrizzleVideoRepository implements VideoRepository {
	async save(video: Video): Promise<Video> {
		const [savedVideo] = await db
			.insert(videos)
			.values({
				id: video.id,
				youtubeUrl: video.youtubeUrl,
				title: video.title,
				duration: video.duration,
				thumbnailUrl: video.thumbnailUrl,
				createdAt: video.createdAt,
				updatedAt: video.updatedAt,
			})
			.returning();

		return {
			id: savedVideo.id,
			youtubeUrl: savedVideo.youtubeUrl,
			title: savedVideo.title,
			duration: savedVideo.duration,
			thumbnailUrl: savedVideo.thumbnailUrl || undefined,
			createdAt: savedVideo.createdAt,
			updatedAt: savedVideo.updatedAt,
		};
	}

	async findById(id: string): Promise<Video | null> {
		const [video] = await db
			.select()
			.from(videos)
			.where(eq(videos.id, id))
			.limit(1);

		if (!video) return null;

		return {
			id: video.id,
			youtubeUrl: video.youtubeUrl,
			title: video.title,
			duration: video.duration,
			thumbnailUrl: video.thumbnailUrl || undefined,
			createdAt: video.createdAt,
			updatedAt: video.updatedAt,
		};
	}

	async findByYoutubeUrl(url: string): Promise<Video | null> {
		const [video] = await db
			.select()
			.from(videos)
			.where(eq(videos.youtubeUrl, url))
			.limit(1);

		if (!video) return null;

		return {
			id: video.id,
			youtubeUrl: video.youtubeUrl,
			title: video.title,
			duration: video.duration,
			thumbnailUrl: video.thumbnailUrl || undefined,
			createdAt: video.createdAt,
			updatedAt: video.updatedAt,
		};
	}

	async deleteById(id: string): Promise<void> {
		await db.delete(videos).where(eq(videos.id, id));
	}

	async saveTranscript(transcript: Transcript): Promise<Transcript> {
		const [savedTranscript] = await db
			.insert(transcripts)
			.values({
				id: transcript.id,
				videoId: transcript.videoId,
				text: transcript.text,
				logicalSegments: transcript.logicalSegments,
				inputTokens: transcript.inputTokens,
				outputTokens: transcript.outputTokens,
				createdAt: transcript.createdAt,
			})
			.returning();

		return {
			id: savedTranscript.id,
			videoId: savedTranscript.videoId,
			text: savedTranscript.text,
			logicalSegments: savedTranscript.logicalSegments as
				| LogicalSegment[]
				| undefined,
			inputTokens: savedTranscript.inputTokens || 0,
			outputTokens: savedTranscript.outputTokens || 0,
			createdAt: savedTranscript.createdAt,
		};
	}

	async getTranscriptByVideoId(videoId: string): Promise<Transcript | null> {
		const [transcript] = await db
			.select()
			.from(transcripts)
			.where(eq(transcripts.videoId, videoId))
			.limit(1);

		if (!transcript) return null;

		return {
			id: transcript.id,
			videoId: transcript.videoId,
			text: transcript.text,
			logicalSegments: transcript.logicalSegments as
				| LogicalSegment[]
				| undefined,
			inputTokens: transcript.inputTokens || 0,
			outputTokens: transcript.outputTokens || 0,
			createdAt: transcript.createdAt,
		};
	}

	async getAllVideosWithTranscripts(): Promise<
		Array<{ video: Video; transcript: Transcript | null }>
	> {
		const allVideos = await db
			.select()
			.from(videos)
			.orderBy(desc(videos.createdAt));

		const result = await Promise.all(
			allVideos.map(async (video) => {
				const transcript = await this.getTranscriptByVideoId(video.id);
				return {
					video: {
						id: video.id,
						youtubeUrl: video.youtubeUrl,
						title: video.title,
						duration: video.duration,
						thumbnailUrl: video.thumbnailUrl || undefined,
						createdAt: video.createdAt,
						updatedAt: video.updatedAt,
					},
					transcript,
				};
			})
		);

		return result;
	}
}
