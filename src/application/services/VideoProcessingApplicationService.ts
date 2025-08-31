import { Video, Transcript } from '../../domain/entities/Video';
import { VideoRepository } from '../../domain/repositories/VideoRepository';
import { VideoProcessingService } from '../../domain/services/VideoProcessingService';
import { LogicalSegmentService } from '../../infrastructure/services/LogicalSegmentService';

export class VideoProcessingApplicationService {
	private logicalSegmentService: LogicalSegmentService;

	constructor(
		private videoRepository: VideoRepository,
		private videoProcessingService: VideoProcessingService
	) {
		this.logicalSegmentService = new LogicalSegmentService();
	}

	async processVideo(
		youtubeUrl: string
	): Promise<{ video: Video; transcript: Transcript }> {
		console.log('Processing video:', youtubeUrl);

		const existingVideo = await this.videoRepository.findByYoutubeUrl(
			youtubeUrl
		);
		if (existingVideo) {
			console.log('Found existing video:', existingVideo.title);
			const existingTranscript =
				await this.videoRepository.getTranscriptByVideoId(
					existingVideo.id
				);
			if (existingTranscript) {
				console.log('Returning existing transcript');
				return { video: existingVideo, transcript: existingTranscript };
			}
		}

		console.log('Extracting video info...');
		const videoInfo = await this.videoProcessingService.extractVideoInfo(
			youtubeUrl
		);
		console.log(
			'Video info extracted:',
			videoInfo.title,
			'Duration:',
			videoInfo.duration
		);

		console.log('Getting video transcript...');
		const { transcript: rawTranscript, tokenUsage: audioTokenUsage } =
			await this.videoProcessingService.getVideoTranscript(youtubeUrl);
		console.log('Raw transcript length:', rawTranscript.length);

		const video: Video = {
			id: crypto.randomUUID(),
			youtubeUrl,
			title: videoInfo.title,
			duration: videoInfo.duration,
			thumbnailUrl: videoInfo.thumbnailUrl,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		const savedVideo = await this.videoRepository.save(video);

		console.log('Processing transcript into logical segments...');

		const { segments: logicalSegments, tokenUsage: segmentTokenUsage } =
			await this.logicalSegmentService.processIntoSegments(rawTranscript);

		console.log('Created logical segments:', logicalSegments.length);

		const totalInputTokens =
			audioTokenUsage.inputTokens + segmentTokenUsage.inputTokens;
		const totalOutputTokens =
			audioTokenUsage.outputTokens + segmentTokenUsage.outputTokens;

		const transcript: Transcript = {
			id: crypto.randomUUID(),
			videoId: savedVideo.id,
			text: rawTranscript,
			logicalSegments: logicalSegments,
			inputTokens: totalInputTokens,
			outputTokens: totalOutputTokens,
			createdAt: new Date(),
		};

		const savedTranscript = await this.videoRepository.saveTranscript(
			transcript
		);

		return { video: savedVideo, transcript: savedTranscript };
	}
}
