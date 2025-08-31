import { GoogleGenerativeAI } from '@google/generative-ai';
import { LogicalSegment } from '../../domain/entities/Video';
import { TokenCalculator } from '../utils/tokenCalculator';

export class LogicalSegmentService {
	private genAI: GoogleGenerativeAI;

	constructor() {
		const apiKey = process.env.GEMINI_API_KEY;
		if (!apiKey) {
			throw new Error('GEMINI_API_KEY environment variable is required');
		}
		this.genAI = new GoogleGenerativeAI(apiKey);
	}

	async processIntoSegments(transcriptText: string): Promise<{
		segments: LogicalSegment[];
		tokenUsage: { inputTokens: number; outputTokens: number };
	}> {
		const model = this.genAI.getGenerativeModel({
			model: 'gemini-1.5-flash',
		});

		const prompt = `You are a video transcript analyzer. Your task is to create logical segments from a transcript based on content themes and topics.

TRANSCRIPT:
${transcriptText}

REQUIREMENTS:
1. Create 5-10 logical segments that group related content by topic/theme
2. Each segment must have:
   - title: descriptive string summarizing the topic
   - text: relevant portion of the transcript for that topic

GUIDELINES:
- Group content by logical themes or topics
- Each segment should contain complete thoughts or related information
- Provide meaningful titles that summarize the content
- Ensure segments flow logically from one to the next
- Cover the entire transcript content

EXAMPLE OUTPUT FORMAT:
{
  "segments": [
    {
      "title": "Introduction to Real Teeth vs Veneers",
      "text": "Hey tough guy. You know what these are? Huh? Yes, that's right..."
    },
    {
      "title": "Emily Martinez's Crazy Glue Veneer Scam",
      "text": "Emily Martinez is facing some serious years in the slammer..."
    },
    {
      "title": "Conclusion and Final Thoughts",
      "text": "Pretty interesting stuff here. I'm curious what her sentencing will look like..."
    }
  ]
}

RESPOND WITH ONLY THE JSON OBJECT. NO MARKDOWN, NO EXPLANATIONS, NO CODE BLOCKS.`;

		try {
			const inputTokens = TokenCalculator.estimateTokens(
				prompt + transcriptText
			);

			const result = await model.generateContent(prompt);
			const response = await result.response;
			const responseText = response.text();

			console.log('Raw AI response:', responseText);
			console.log('Response length:', responseText.length);

			const outputTokens = TokenCalculator.estimateTokens(responseText);

			const cleanedResponse = this.extractJsonFromResponse(responseText);
			console.log('Cleaned response:', cleanedResponse);

			const parsedResponse = JSON.parse(cleanedResponse);
			const segments: LogicalSegment[] = parsedResponse.segments || [];

			console.log('Parsed segments:', segments.length);
			console.log('First few segments:', segments.slice(0, 3));

			return {
				segments,
				tokenUsage: {
					inputTokens,
					outputTokens,
				},
			};
		} catch (error) {
			console.error('Error processing logical segments:', error);
			throw new Error(
				`Failed to create logical segments: ${
					error instanceof Error ? error.message : 'Unknown error'
				}`
			);
		}
	}

	private extractJsonFromResponse(responseText: string): string {
		// First try to find JSON in code blocks
		const codeBlockMatch = responseText.match(
			/```(?:json)?\s*(\{[\s\S]*?\})\s*```/
		);
		if (codeBlockMatch) {
			return codeBlockMatch[1];
		}

		// Try to find the complete JSON object by counting braces
		const jsonStart = responseText.indexOf('{');
		if (jsonStart === -1) {
			throw new Error('No JSON object found in response');
		}

		let braceCount = 0;
		let jsonEnd = -1;

		for (let i = jsonStart; i < responseText.length; i++) {
			if (responseText[i] === '{') {
				braceCount++;
			} else if (responseText[i] === '}') {
				braceCount--;
				if (braceCount === 0) {
					jsonEnd = i;
					break;
				}
			}
		}

		if (jsonEnd === -1) {
			throw new Error('Incomplete JSON object in response');
		}

		return responseText.substring(jsonStart, jsonEnd + 1);
	}
}
