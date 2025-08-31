import { Video, Transcript } from '../entities/Video';

export interface TokenUsage {
	inputTokens: number;
	outputTokens: number;
}

export interface VideoProcessingService {
	extractVideoInfo(url: string): Promise<{
		title: string;
		duration: number;
		thumbnailUrl?: string;
	}>;
	getVideoTranscript(url: string): Promise<{
		transcript: string;
		tokenUsage: TokenUsage;
	}>;
}
