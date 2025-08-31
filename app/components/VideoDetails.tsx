'use client';

import { Video, Transcript } from '../../src/types';
import { calculateCost } from '../../src/utils';
import VideoInfoCard from './shared/VideoInfoCard';
import TokenUsageCard from './shared/TokenUsageCard';
import TranscriptDisplay from './shared/TranscriptDisplay';

interface VideoDetailsProps {
	video: Video;
	transcript: Transcript;
	onBack: () => void;
}

export default function VideoDetails({
	video,
	transcript,
	onBack,
}: VideoDetailsProps) {
	return (
		<div className="max-w-4xl mx-auto">
			<div className="mb-6">
				<button
					onClick={onBack}
					className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md">
					<svg
						className="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 19l-7-7 7-7"
						/>
					</svg>
					Back to History
				</button>
			</div>

			<div className="space-y-6">
				<VideoInfoCard video={video} />

				<TokenUsageCard
					inputTokens={transcript.inputTokens}
					outputTokens={transcript.outputTokens}
					totalCost={calculateCost(
						transcript.inputTokens,
						transcript.outputTokens
					)}
				/>

				<TranscriptDisplay transcript={transcript} />
			</div>
		</div>
	);
}
