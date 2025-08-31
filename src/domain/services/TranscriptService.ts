import { Transcript } from '../entities/Video';
import { TokenUsage } from './VideoProcessingService';

export interface TranscriptService {
	processTranscript(
		text: string,
		videoDuration?: number
	): Promise<{ transcript: Transcript; tokenUsage: TokenUsage }>;
}
