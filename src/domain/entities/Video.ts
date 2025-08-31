export interface Video {
	id: string;
	youtubeUrl: string;
	title: string;
	duration: number;
	thumbnailUrl?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Transcript {
	id: string;
	videoId: string;
	text: string;
	logicalSegments?: LogicalSegment[];
	inputTokens: number;
	outputTokens: number;
	createdAt: Date;
}

export interface LogicalSegment {
	title: string;
	text: string;
}
