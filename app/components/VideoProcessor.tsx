'use client';

import { useState } from 'react';
import { ProcessResult } from '../../src/types';
import { formatTime, calculateCost } from '../../src/utils';
import VideoInfoCard from './shared/VideoInfoCard';
import TokenUsageCard from './shared/TokenUsageCard';
import TranscriptDisplay from './shared/TranscriptDisplay';

export default function VideoProcessor() {
	const [youtubeUrl, setYoutubeUrl] = useState('');
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<ProcessResult | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		setResult(null);

		try {
			const response = await fetch('/api/videos/process', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ youtubeUrl }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to process video');
			}

			setResult(data.data);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-4xl mx-auto">
			<div className="mb-8">
				<div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-8 shadow-lg">
					<div className="text-center mb-6">
						<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
							<svg
								className="w-8 h-8 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<h2 className="text-xl font-semibold text-gray-800 mb-2">
							Generate Video Transcript
						</h2>
						<p className="text-gray-600">
							Paste a YouTube URL to extract and analyze the video
							transcript
						</p>
					</div>

					<form onSubmit={handleSubmit}>
						<div className="space-y-4">
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
									<svg
										className="w-5 h-5 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
										/>
									</svg>
								</div>
								<input
									type="url"
									value={youtubeUrl}
									onChange={(e) =>
										setYoutubeUrl(e.target.value)
									}
									placeholder="https://www.youtube.com/watch?v=..."
									className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-gray-900 placeholder-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
									required
									disabled={loading}
								/>
							</div>

							<button
								type="submit"
								disabled={loading || !youtubeUrl.trim()}
								className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none">
								{loading ? (
									<div className="flex items-center justify-center space-x-3">
										<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
										<span>Processing Video...</span>
									</div>
								) : (
									<div className="flex items-center justify-center space-x-2">
										<svg
											className="w-5 h-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										<span>Generate Transcript</span>
									</div>
								)}
							</button>
						</div>
					</form>
				</div>
			</div>

			{error && (
				<div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm">
					<div className="flex items-center space-x-3">
						<svg
							className="w-5 h-5 text-red-500 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span className="font-medium">{error}</span>
					</div>
				</div>
			)}

			{result && (
				<div className="space-y-6">
					<VideoInfoCard video={result.video} />

					<TokenUsageCard
						inputTokens={result.transcript.inputTokens}
						outputTokens={result.transcript.outputTokens}
						totalCost={calculateCost(
							result.transcript.inputTokens,
							result.transcript.outputTokens
						)}
					/>

					<TranscriptDisplay transcript={result.transcript} />
				</div>
			)}
		</div>
	);
}
