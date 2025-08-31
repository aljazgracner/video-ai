export interface LogicalSegment {
	title: string;
	text: string;
}

export interface Transcript {
	id: string;
	videoId: string;
	text: string;
	logicalSegments?: LogicalSegment[];
	inputTokens: number;
	outputTokens: number;
	createdAt: string;
}

export interface Video {
	id: string;
	youtubeUrl: string;
	title: string;
	duration: number;
	thumbnailUrl?: string;
	createdAt: string;
	updatedAt: string;
}

export interface HistoryItem {
	video: Video;
	transcript: Transcript | null;
	tokenUsage: {
		inputTokens: number;
		outputTokens: number;
		totalCost: number;
	};
}

export interface ProcessResult {
	video: Video;
	transcript: Transcript;
}
