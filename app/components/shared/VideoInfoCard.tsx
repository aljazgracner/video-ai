import { Video } from '../../../src/types';
import { formatTime, formatDate } from '../../../src/utils';

interface VideoInfoCardProps {
	video: Video;
	showThumbnail?: boolean;
	showDate?: boolean;
	compact?: boolean;
}

export default function VideoInfoCard({
	video,
	showThumbnail = true,
	showDate = true,
	compact = false,
}: VideoInfoCardProps) {
	return (
		<div
			className={`bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl ${
				compact ? 'p-6' : 'p-8'
			} shadow-lg`}>
			<div className="flex flex-col md:flex-row gap-6">
				{showThumbnail && video.thumbnailUrl && (
					<div className="relative">
						<img
							src={video.thumbnailUrl}
							alt={video.title}
							className={`${
								compact ? 'w-48 h-32' : 'w-64 h-36'
							} object-cover rounded-xl shadow-md`}
						/>
						<div className="absolute top-3 right-3 bg-black bg-opacity-75 text-white text-sm px-3 py-1 rounded-lg">
							{formatTime(video.duration)}
						</div>
					</div>
				)}
				<div className="flex-1">
					<h2
						className={`${
							compact ? 'text-xl' : 'text-2xl'
						} font-bold mb-4 text-gray-900`}>
						{video.title}
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
							<div className="text-sm text-blue-600 font-medium mb-1">
								Duration
							</div>
							<div className="text-lg font-semibold text-blue-900">
								{formatTime(video.duration)}
							</div>
						</div>
						{showDate && (
							<div className="bg-green-50 p-4 rounded-xl border border-green-200">
								<div className="text-sm text-green-600 font-medium mb-1">
									Processed
								</div>
								<div className="text-lg font-semibold text-green-900">
									{formatDate(video.createdAt)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
