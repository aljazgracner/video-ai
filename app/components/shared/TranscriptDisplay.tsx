import { Transcript } from '../../../src/types';
import { formatTime } from '../../../src/utils';

interface TranscriptDisplayProps {
	transcript: Transcript;
	showLogicalSegments?: boolean;
	showFullTranscript?: boolean;
}

export default function TranscriptDisplay({
	transcript,
	showLogicalSegments = true,
	showFullTranscript = true,
}: TranscriptDisplayProps) {
	return (
		<div className="space-y-6">
			{showLogicalSegments && (
				<div className="bg-white border border-gray-200 rounded-lg p-6">
					<h3 className="text-xl font-semibold mb-4 text-gray-900">
						Transcript with Logical Segments
					</h3>
					<div className="space-y-6">
						{transcript.logicalSegments &&
						transcript.logicalSegments.length > 0 ? (
							transcript.logicalSegments.map((segment, index) => (
								<div
									key={index}
									className="border-l-4 border-blue-500 pl-4 py-3">
									<h4 className="text-lg font-semibold text-gray-900 mb-2">
										{segment.title}
									</h4>
									<p className="text-gray-800">
										{segment.text}
									</p>
								</div>
							))
						) : (
							<div className="text-gray-600 italic">
								Logical segments are being processed...
							</div>
						)}
					</div>
				</div>
			)}

			{showFullTranscript && (
				<div className="bg-white border border-gray-200 rounded-lg p-6">
					<h3 className="text-xl font-semibold mb-4 text-gray-900">
						Full Transcript
					</h3>
					<p className="text-gray-800 whitespace-pre-wrap">
						{transcript.text}
					</p>
				</div>
			)}
		</div>
	);
}
