import youtubedl from 'youtube-dl-exec';
import { VideoProcessingService } from '../../domain/services/VideoProcessingService';
import { TokenCalculator, TokenUsage } from '../utils/tokenCalculator';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';

const ytdl = youtubedl.create(
	path.resolve(process.cwd(), 'node_modules/youtube-dl-exec/bin/yt-dlp')
);

interface YouTubeVideoInfo {
	title: string;
	duration: number;
	thumbnail: string;
	subtitles?: {
		en?: Array<{
			url: string;
			ext: string;
		}>;
	};
}

const execAsync = promisify(exec);

export class YouTubeVideoProcessingService implements VideoProcessingService {
	async extractVideoInfo(url: string): Promise<{
		title: string;
		duration: number;
		thumbnailUrl?: string;
	}> {
		try {
			const videoInfo = (await ytdl(url, {
				dumpSingleJson: true,
				noCheckCertificates: true,
				noWarnings: true,
				preferFreeFormats: true,
				addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
			})) as YouTubeVideoInfo;

			return {
				title: videoInfo.title,
				duration: Math.floor(videoInfo.duration || 0),
				thumbnailUrl: videoInfo.thumbnail,
			};
		} catch (error) {
			console.error('Error extracting video info:', error);
			throw new Error('Failed to extract video information');
		}
	}

	async getVideoTranscript(url: string): Promise<{
		transcript: string;
		tokenUsage: TokenUsage;
	}> {
		const tempDir = path.join(process.cwd(), 'temp');
		const audioFile = path.join(tempDir, `audio_${Date.now()}.wav`);

		try {
			if (!fs.existsSync(tempDir)) {
				fs.mkdirSync(tempDir, { recursive: true });
			}

			const ytdlOptions: any = {
				format: 'bestaudio',
				output: audioFile.replace('.wav', '.%(ext)s'),
				noCheckCertificates: true,
				noWarnings: true,
				preferFreeFormats: true,
				addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
			};

			await ytdl(url, ytdlOptions);

			const actualAudioFile = this.findDownloadedAudioFile(tempDir);
			if (!actualAudioFile) {
				throw new Error('Failed to find downloaded audio file');
			}

			const audioStats = fs.statSync(actualAudioFile);
			const audioSizeBytes = audioStats.size;

			const { transcript, tokenUsage } = await this.transcribeAudio(
				actualAudioFile
			);

			fs.unlinkSync(actualAudioFile);

			return { transcript, tokenUsage };
		} catch (error) {
			console.error('Error getting video transcript:', error);

			const actualAudioFile = this.findDownloadedAudioFile(tempDir);
			if (actualAudioFile && fs.existsSync(actualAudioFile)) {
				fs.unlinkSync(actualAudioFile);
			}

			throw new Error('Failed to get video transcript');
		}
	}

	private findDownloadedAudioFile(tempDir: string): string | null {
		const files = fs.readdirSync(tempDir);
		const audioFile = files.find(
			(file) =>
				file.endsWith('.mp3') ||
				file.endsWith('.webm') ||
				file.endsWith('.m4a') ||
				file.endsWith('.wav')
		);
		return audioFile ? path.join(tempDir, audioFile) : null;
	}

	private async transcribeAudio(audioFilePath: string): Promise<{
		transcript: string;
		tokenUsage: TokenUsage;
	}> {
		try {
			const { GoogleGenerativeAI } = await import(
				'@google/generative-ai'
			);

			const apiKey = process.env.GEMINI_API_KEY;
			if (!apiKey) {
				throw new Error(
					'GEMINI_API_KEY environment variable is required'
				);
			}

			const genAI = new GoogleGenerativeAI(apiKey);
			const model = genAI.getGenerativeModel({
				model: 'gemini-1.5-flash',
			});

			const audioData = fs.readFileSync(audioFilePath);
			const audioBase64 = audioData.toString('base64');

			const fileExtension = path.extname(audioFilePath).toLowerCase();
			let mimeType = 'audio/mp3';
			if (fileExtension === '.wav') mimeType = 'audio/wav';
			else if (fileExtension === '.webm') mimeType = 'audio/webm';
			else if (fileExtension === '.m4a') mimeType = 'audio/mp4';

			const prompt = `
			Please transcribe the following audio file.
			
			CRITICAL: You must return ONLY a valid JSON object. Do not include any markdown formatting, code blocks, explanations, or additional text.
			
			Return exactly this JSON structure:
			{
			  "text": "Full transcript text here"
			}
			
			Guidelines:
			- Provide accurate transcription of all spoken content
			- Include all spoken words and sentences
			- Return ONLY the JSON object - no code blocks, no explanations, no additional text
			`;

			const inputTokens =
				TokenCalculator.estimateAudioTokens(audioData.length) +
				TokenCalculator.estimateTokens(prompt);

			const result = await model.generateContent([
				prompt,
				{
					inlineData: {
						data: audioBase64,
						mimeType: mimeType,
					},
				},
			]);

			const response = await result.response;
			const responseText = response.text();

			console.log('Raw Gemini response length:', responseText.length);
			console.log(
				'Raw Gemini response preview:',
				responseText.substring(0, 500)
			);

			let cleanedResponse;
			try {
				cleanedResponse = this.extractJsonFromResponse(responseText);
				console.log('Cleaned response length:', cleanedResponse.length);
				console.log(
					'Cleaned response preview:',
					cleanedResponse.substring(0, 500)
				);
			} catch (extractError) {
				if (
					extractError instanceof Error &&
					extractError.message === 'INCOMPLETE_JSON'
				) {
					console.log(
						'Incomplete JSON detected, using fallback extraction'
					);
					const fallbackTranscript =
						this.extractFallbackTranscript(responseText);
					return {
						transcript: fallbackTranscript,
						tokenUsage: {
							inputTokens,
							outputTokens:
								TokenCalculator.estimateTokens(
									fallbackTranscript
								),
						},
					};
				}
				throw extractError;
			}

			let parsedResponse;
			try {
				parsedResponse = JSON.parse(cleanedResponse);
			} catch (parseError) {
				console.error('JSON parse error:', parseError);
				console.error('Failed to parse response:', cleanedResponse);

				// Fallback: try to extract just the transcript text if JSON parsing fails
				console.log(
					'Attempting fallback: extracting transcript text only'
				);
				const fallbackTranscript =
					this.extractFallbackTranscript(responseText);
				return {
					transcript: fallbackTranscript,
					tokenUsage: {
						inputTokens,
						outputTokens:
							TokenCalculator.estimateTokens(fallbackTranscript),
					},
				};
			}

			const transcript = parsedResponse.text || '';
			const outputTokens = TokenCalculator.estimateTokens(transcript);

			return {
				transcript,
				tokenUsage: {
					inputTokens,
					outputTokens,
				},
			};
		} catch (error) {
			console.error('Error transcribing audio with Gemini:', error);
			throw new Error('Failed to transcribe audio');
		}
	}

	private extractJsonFromResponse(responseText: string): string {
		// First try to find JSON in code blocks
		const codeBlockMatch = responseText.match(
			/```(?:json)?\s*(\{[\s\S]*?)\s*```/
		);
		if (codeBlockMatch) {
			const jsonContent = codeBlockMatch[1];
			// Try to find the complete JSON object within the code block
			const completeJson = this.findCompleteJsonObject(jsonContent);
			if (completeJson) {
				return completeJson;
			}
		}

		// Try to find JSON object boundaries more carefully
		const jsonStart = responseText.indexOf('{');
		if (jsonStart === -1) {
			throw new Error('No JSON object found in response');
		}

		const completeJson = this.findCompleteJsonObject(
			responseText.substring(jsonStart)
		);
		if (completeJson) {
			return completeJson;
		}

		// If no complete JSON found, throw a special error that will trigger fallback
		throw new Error('INCOMPLETE_JSON');
	}

	private findCompleteJsonObject(text: string): string | null {
		// Find the matching closing brace by counting braces
		let braceCount = 0;
		let jsonEnd = -1;

		for (let i = 0; i < text.length; i++) {
			if (text[i] === '{') {
				braceCount++;
			} else if (text[i] === '}') {
				braceCount--;
				if (braceCount === 0) {
					jsonEnd = i;
					break;
				}
			}
		}

		if (jsonEnd === -1) {
			return null;
		}

		const jsonCandidate = text.substring(0, jsonEnd + 1);

		// Try to parse it to make sure it's valid JSON
		try {
			JSON.parse(jsonCandidate);
			return jsonCandidate;
		} catch {
			return null;
		}
	}

	private extractFallbackTranscript(responseText: string): string {
		// Try to find the "text" field value in the response (even if JSON is incomplete)
		const textMatch = responseText.match(
			/"text"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/
		);
		if (textMatch) {
			return textMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
		}

		// Try to find text after "text": " even if the JSON is incomplete
		const partialTextMatch = responseText.match(
			/"text"\s*:\s*"([^"]*(?:\\.[^"]*)*)/
		);
		if (partialTextMatch) {
			return partialTextMatch[1]
				.replace(/\\"/g, '"')
				.replace(/\\n/g, '\n');
		}

		// If no JSON structure found, try to extract plain text
		// Remove common markdown formatting
		let cleanText = responseText
			.replace(/```json\s*/g, '')
			.replace(/```\s*/g, '')
			.replace(/^\s*\{[\s\S]*?"text"\s*:\s*"/, '')
			.replace(/"[\s\S]*$/, '')
			.trim();

		// If we still have a lot of JSON structure, try a different approach
		if (cleanText.includes('{') || cleanText.includes('}')) {
			// Look for text between quotes that might be the transcript
			const quotedTextMatch = responseText.match(/"([^"]{100,})"/);
			if (quotedTextMatch) {
				return quotedTextMatch[1]
					.replace(/\\"/g, '"')
					.replace(/\\n/g, '\n');
			}
		}

		return cleanText || responseText;
	}
}
