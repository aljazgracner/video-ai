import ytdl from '@distube/ytdl-core';
import { VideoProcessingService } from '../../domain/services/VideoProcessingService';
import { TokenCalculator, TokenUsage } from '../utils/tokenCalculator';
import path from 'path';
import fs from 'fs';

export class YouTubeVideoProcessingService implements VideoProcessingService {
	async extractVideoInfo(url: string): Promise<{
		title: string;
		duration: number;
		thumbnailUrl?: string;
	}> {
		try {
			console.log('Attempting to extract video info for:', url);

			// Validate URL first
			if (!ytdl.validateURL(url)) {
				throw new Error('Invalid YouTube URL');
			}

			const info = await ytdl.getInfo(url);
			console.log('Successfully got video info');

			const videoDetails = info.videoDetails;
			console.log('Video details:', {
				title: videoDetails.title,
				duration: videoDetails.lengthSeconds,
				hasThumbnails: !!videoDetails.thumbnails?.length,
			});

			return {
				title: videoDetails.title,
				duration: parseInt(videoDetails.lengthSeconds) || 0,
				thumbnailUrl: videoDetails.thumbnails?.[0]?.url,
			};
		} catch (error) {
			console.error('Error extracting video info:', error);
			console.error('Error details:', {
				message:
					error instanceof Error ? error.message : 'Unknown error',
				stack: error instanceof Error ? error.stack : undefined,
			});
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
		const tempDir = '/tmp';
		const audioFile = path.join(tempDir, `audio_${Date.now()}.mp3`);

		try {
			if (!fs.existsSync(tempDir)) {
				fs.mkdirSync(tempDir, { recursive: true });
			}

			const videoInfo = await ytdl.getInfo(url);
			const audioFormat = ytdl.chooseFormat(videoInfo.formats, {
				quality: 'highestaudio',
				filter: 'audioonly',
			});

			if (!audioFormat) {
				throw new Error('No audio format available for this video');
			}

			const audioStream = ytdl(url, { format: audioFormat });
			const writeStream = fs.createWriteStream(audioFile);

			await new Promise<void>((resolve, reject) => {
				audioStream.pipe(writeStream);
				audioStream.on('error', reject);
				writeStream.on('error', reject);
				writeStream.on('finish', () => resolve());
			});

			const audioStats = fs.statSync(audioFile);
			const audioSizeBytes = audioStats.size;

			console.log(`Downloaded audio file: ${audioSizeBytes} bytes`);

			const { transcript, tokenUsage } = await this.transcribeAudio(
				audioFile
			);

			fs.unlinkSync(audioFile);

			return { transcript, tokenUsage };
		} catch (error) {
			console.error('Error getting video transcript:', error);

			if (fs.existsSync(audioFile)) {
				fs.unlinkSync(audioFile);
			}

			throw new Error('Failed to get video transcript');
		}
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
		const codeBlockMatch = responseText.match(
			/```(?:json)?\s*(\{[\s\S]*?)\s*```/
		);
		if (codeBlockMatch) {
			const jsonContent = codeBlockMatch[1];
			const completeJson = this.findCompleteJsonObject(jsonContent);
			if (completeJson) {
				return completeJson;
			}
		}

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

		throw new Error('INCOMPLETE_JSON');
	}

	private findCompleteJsonObject(text: string): string | null {
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

		try {
			JSON.parse(jsonCandidate);
			return jsonCandidate;
		} catch {
			return null;
		}
	}

	private extractFallbackTranscript(responseText: string): string {
		const textMatch = responseText.match(
			/"text"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/
		);
		if (textMatch) {
			return textMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
		}

		const partialTextMatch = responseText.match(
			/"text"\s*:\s*"([^"]*(?:\\.[^"]*)*)/
		);
		if (partialTextMatch) {
			return partialTextMatch[1]
				.replace(/\\"/g, '"')
				.replace(/\\n/g, '\n');
		}

		const cleanText = responseText
			.replace(/```json\s*/g, '')
			.replace(/```\s*/g, '')
			.replace(/^\s*\{[\s\S]*?"text"\s*:\s*"/, '')
			.replace(/"[\s\S]*$/, '')
			.trim();

		if (cleanText.includes('{') || cleanText.includes('}')) {
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
