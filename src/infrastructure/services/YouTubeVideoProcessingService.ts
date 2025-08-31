import { google } from 'googleapis';
import { VideoProcessingService } from '../../domain/services/VideoProcessingService';
import { TokenCalculator, TokenUsage } from '../utils/tokenCalculator';

export class YouTubeVideoProcessingService implements VideoProcessingService {
	private extractVideoId(url: string): string | null {
		const regex =
			/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
		const match = url.match(regex);
		return match ? match[1] : null;
	}

	private parseDuration(duration: string): number {
		// Parse ISO 8601 duration (PT4M13S = 4 minutes 13 seconds)
		const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
		if (!match) return 0;

		const hours = parseInt(match[1] || '0');
		const minutes = parseInt(match[2] || '0');
		const seconds = parseInt(match[3] || '0');

		return hours * 3600 + minutes * 60 + seconds;
	}

	async extractVideoInfo(url: string): Promise<{
		title: string;
		duration: number;
		thumbnailUrl?: string;
	}> {
		console.log('Extracting video info using YouTube Data API v3 for:', url);

		const videoId = this.extractVideoId(url);
		if (!videoId) {
			throw new Error('Invalid YouTube URL - could not extract video ID');
		}

		const apiKey = process.env.YOUTUBE_API_KEY;
		if (!apiKey) {
			throw new Error('YOUTUBE_API_KEY environment variable is required');
		}

		try {
			const youtube = google.youtube({
				version: 'v3',
				auth: apiKey,
			});

			const response = await youtube.videos.list({
				part: ['snippet', 'contentDetails'],
				id: [videoId],
			});

			if (!response.data.items || response.data.items.length === 0) {
				throw new Error('Video not found or not accessible');
			}

			const video = response.data.items[0];
			const snippet = video.snippet;
			const contentDetails = video.contentDetails;

			// Parse duration (ISO 8601 format like PT4M13S)
			const duration = this.parseDuration(contentDetails?.duration || '0');

			const result = {
				title: snippet?.title || 'Unknown Title',
				duration: duration,
				thumbnailUrl:
					snippet?.thumbnails?.high?.url ||
					snippet?.thumbnails?.default?.url ||
					undefined,
			};

			console.log('Successfully extracted video info:', {
				title: result.title,
				duration: result.duration,
				hasThumbnail: !!result.thumbnailUrl,
			});

			return result;
		} catch (error) {
			console.error('YouTube Data API error:', error);
			throw new Error(
				`Failed to extract video information: ${
					error instanceof Error ? error.message : 'Unknown error'
				}`
			);
		}
	}

	async getVideoTranscript(url: string): Promise<{
		transcript: string;
		tokenUsage: TokenUsage;
	}> {
		console.log('Getting video transcript for:', url);

		// For now, we'll use a placeholder since YouTube's official API doesn't provide
		// direct access to audio content for transcription. Here are the alternatives:

		// Option 1: Use YouTube's automatic captions (if available)
		// Option 2: Use a third-party transcription service
		// Option 3: Implement audio extraction with proper licensing
		// Option 4: Use YouTube's captions API (requires additional setup)

		const videoId = this.extractVideoId(url);
		if (!videoId) {
			throw new Error('Invalid YouTube URL - could not extract video ID');
		}

		// Try to get captions using YouTube Data API
		try {
			const apiKey = process.env.YOUTUBE_API_KEY;
			if (!apiKey) {
				throw new Error('YOUTUBE_API_KEY environment variable is required');
			}

			const youtube = google.youtube({
				version: 'v3',
				auth: apiKey,
			});

			// Get captions list
			const captionsResponse = await youtube.captions.list({
				part: ['snippet'],
				videoId: videoId,
			});

			if (captionsResponse.data.items && captionsResponse.data.items.length > 0) {
				// Find English captions
				const englishCaptions = captionsResponse.data.items.find(
					(caption) => caption.snippet?.language === 'en'
				);

				if (englishCaptions) {
					console.log('Found English captions, attempting to download...');
					
					// Download captions
					const captionContent = await youtube.captions.download({
						id: englishCaptions.id!,
						tfmt: 'srt', // or 'ttml', 'vtt'
					});

					// Parse SRT format to get just the text
					const transcript = this.parseSRTContent(captionContent.data as string);
					
					return {
						transcript,
						tokenUsage: {
							inputTokens: TokenCalculator.estimateTokens(transcript),
							outputTokens: 0,
						},
					};
				}
			}

			// No captions available, return placeholder
			const placeholderTranscript = `No captions available for this video (${url}). 
			The video may not have automatic captions enabled, or captions may not be available in English.
			
			To get transcripts for this video, you would need to:
			1. Enable captions on the YouTube video
			2. Use a different transcription service
			3. Implement audio extraction with proper licensing`;

			return {
				transcript: placeholderTranscript,
				tokenUsage: {
					inputTokens: TokenCalculator.estimateTokens(placeholderTranscript),
					outputTokens: 0,
				},
			};
		} catch (error) {
			console.error('Error getting captions:', error);
			
			const errorTranscript = `Error retrieving captions for video (${url}): ${
				error instanceof Error ? error.message : 'Unknown error'
			}`;

			return {
				transcript: errorTranscript,
				tokenUsage: {
					inputTokens: TokenCalculator.estimateTokens(errorTranscript),
					outputTokens: 0,
				},
			};
		}
	}

	private parseSRTContent(srtContent: string): string {
		// Parse SRT format and extract just the text
		const lines = srtContent.split('\n');
		const textLines: string[] = [];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			
			// Skip empty lines, sequence numbers, and timestamps
			if (line === '' || /^\d+$/.test(line) || line.includes('-->')) {
				continue;
			}
			
			// This should be a text line
			if (line.length > 0) {
				textLines.push(line);
			}
		}

		return textLines.join(' ');
	}
}