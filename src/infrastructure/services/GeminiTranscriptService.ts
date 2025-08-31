import { GoogleGenerativeAI } from '@google/generative-ai';
import { TranscriptService } from '../../domain/services/TranscriptService';
import { Transcript } from '../../domain/entities/Video';
import { TokenUsage } from '../../domain/services/VideoProcessingService';
import { TokenCalculator } from '../utils/tokenCalculator';

export class GeminiTranscriptService implements TranscriptService {
	private genAI: GoogleGenerativeAI;

	constructor() {
		const apiKey = process.env.GEMINI_API_KEY;
		if (!apiKey) {
			throw new Error('GEMINI_API_KEY environment variable is required');
		}
		this.genAI = new GoogleGenerativeAI(apiKey);
	}

	async processTranscript(
		text: string,
		videoDuration?: number
	): Promise<{ transcript: Transcript; tokenUsage: TokenUsage }> {
		console.log(
			'GeminiTranscriptService: Processing transcript, text length:',
			text.length
		);
		const model = this.genAI.getGenerativeModel({
			model: 'gemini-1.5-flash',
		});

		const prompt = `
    Analyze the following video transcript and extract meaningful logical segments.
    Return the result as a JSON object with the following structure:
    {
      "logicalSegments": [
        {
          "title": "Introduction",
          "text": "First segment of text"
        },
        {
          "title": "Main Topic",
          "text": "Second segment of text"
        }
      ]
    }
    
    Guidelines:
    - Break the transcript into logical segments based on topics or themes
    - Each segment should contain complete thoughts or topics
    - Provide meaningful titles for each segment
    - Keep text segments concise but meaningful
    - Return ONLY the JSON object, no markdown formatting, no code blocks, no additional text
    
    Transcript to analyze:
    ${text}
    `;

		try {
			const inputTokens = TokenCalculator.estimateTokens(prompt + text);

			const result = await model.generateContent(prompt);
			const response = await result.response;
			const responseText = response.text();

			const outputTokens = TokenCalculator.estimateTokens(responseText);

			const cleanedResponse = this.extractJsonFromResponse(responseText);
			const parsedResponse = JSON.parse(cleanedResponse);
			const logicalSegments = parsedResponse.logicalSegments || [];
			console.log(
				'GeminiTranscriptService: Generated logical segments count:',
				logicalSegments.length
			);

			const transcript: Transcript = {
				id: crypto.randomUUID(),
				videoId: '',
				text: text,
				logicalSegments: logicalSegments,
				inputTokens: 0,
				outputTokens: 0,
				createdAt: new Date(),
			};

			return {
				transcript,
				tokenUsage: {
					inputTokens,
					outputTokens,
				},
			};
		} catch (error) {
			console.error('Error processing transcript with Gemini:', error);
			throw new Error('Failed to process transcript with Gemini API');
		}
	}

	private extractJsonFromResponse(responseText: string): string {
		const jsonMatch = responseText.match(
			/```(?:json)?\s*(\{[\s\S]*?\})\s*```/
		);
		if (jsonMatch) {
			return jsonMatch[1];
		}

		const jsonStart = responseText.indexOf('{');
		const jsonEnd = responseText.lastIndexOf('}');
		if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
			return responseText.substring(jsonStart, jsonEnd + 1);
		}

		return responseText.trim();
	}
}
