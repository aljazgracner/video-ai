import { Video, Transcript } from '../entities/Video';

export interface VideoRepository {
	save(video: Video): Promise<Video>;
	findById(id: string): Promise<Video | null>;
	findByYoutubeUrl(url: string): Promise<Video | null>;
	deleteById(id: string): Promise<void>;
	saveTranscript(transcript: Transcript): Promise<Transcript>;
	getTranscriptByVideoId(videoId: string): Promise<Transcript | null>;
	getAllVideosWithTranscripts(): Promise<
		Array<{ video: Video; transcript: Transcript | null }>
	>;
}
