'use client';

import { useState, useEffect } from 'react';
import { HistoryItem, Video, Transcript } from '../../src/types';
import { formatTime, formatDate } from '../../src/utils';

interface VideoHistoryProps {
	onVideoClick?: (video: Video, transcript: Transcript) => void;
}

export default function VideoHistory({ onVideoClick }: VideoHistoryProps = {}) {
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchHistory();
	}, []);

	const fetchHistory = async () => {
		try {
			const response = await fetch('/api/videos/history');
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to fetch history');
			}

			setHistory(data.data);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="max-w-6xl mx-auto">
				<div className="flex items-center justify-center h-64">
					<div className="flex items-center space-x-3">
						<div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
						<span className="text-lg text-gray-600">
							Loading history...
						</span>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="max-w-6xl mx-auto">
				<div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm">
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
			</div>
		);
	}

	const totalCost = history.reduce(
		(sum, item) => sum + item.tokenUsage.totalCost,
		0
	);
	const totalInputTokens = history.reduce(
		(sum, item) => sum + item.tokenUsage.inputTokens,
		0
	);
	const totalOutputTokens = history.reduce(
		(sum, item) => sum + item.tokenUsage.outputTokens,
		0
	);

	return (
		<div className="max-w-6xl mx-auto">
			<div className="mb-8">
				<div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-8 shadow-lg mb-6">
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
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<h1 className="text-2xl font-bold text-gray-900 mb-2">
							Processing History
						</h1>
						<p className="text-gray-600">
							View and manage your processed video transcripts
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						<div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
									<svg
										className="w-6 h-6 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 9h6m-6 4h6m-6 4h4"
										/>
									</svg>
								</div>
								<div>
									<div className="text-sm text-blue-600 font-medium">
										Total Videos
									</div>
									<div className="text-2xl font-bold text-blue-900">
										{history.length}
									</div>
								</div>
							</div>
						</div>
						<div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
									<svg
										className="w-6 h-6 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
								</div>
								<div>
									<div className="text-sm text-green-600 font-medium">
										Input Tokens
									</div>
									<div className="text-2xl font-bold text-green-900">
										{totalInputTokens.toLocaleString()}
									</div>
								</div>
							</div>
						</div>
						<div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
									<svg
										className="w-6 h-6 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
										/>
									</svg>
								</div>
								<div>
									<div className="text-sm text-purple-600 font-medium">
										Output Tokens
									</div>
									<div className="text-2xl font-bold text-purple-900">
										{totalOutputTokens.toLocaleString()}
									</div>
								</div>
							</div>
						</div>
						<div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
									<svg
										className="w-6 h-6 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
										/>
									</svg>
								</div>
								<div>
									<div className="text-sm text-orange-600 font-medium">
										Total Cost
									</div>
									<div className="text-2xl font-bold text-orange-900">
										${totalCost.toFixed(4)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{history.length === 0 ? (
				<div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-12 shadow-lg text-center">
					<div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6">
						<svg
							className="w-10 h-10 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 9h6m-6 4h6m-6 4h4"
							/>
						</svg>
					</div>
					<h3 className="text-xl font-semibold text-gray-900 mb-2">
						No videos processed yet
					</h3>
					<p className="text-gray-600 mb-6">
						Start by processing your first YouTube video to see it
						appear here
					</p>
					<button
						onClick={() => window.location.reload()}
						className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
						<svg
							className="w-5 h-5 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 6v6m0 0v6m0-6h6m-6 0H6"
							/>
						</svg>
						Process First Video
					</button>
				</div>
			) : (
				<div className="space-y-6">
					{history.map((item) => (
						<div
							key={item.video.id}
							className={`bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-200 shadow-sm hover:shadow-lg ${
								item.transcript && onVideoClick
									? 'hover:shadow-xl cursor-pointer transform hover:-translate-y-1'
									: 'hover:shadow-md'
							}`}
							onClick={() => {
								if (item.transcript && onVideoClick) {
									onVideoClick(item.video, item.transcript);
								}
							}}>
							<div className="flex flex-col md:flex-row gap-6">
								{item.video.thumbnailUrl && (
									<div className="relative">
										<img
											src={item.video.thumbnailUrl}
											alt={item.video.title}
											className="w-48 h-32 object-cover rounded-xl flex-shrink-0 shadow-md"
										/>
										<div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-lg">
											{formatTime(item.video.duration)}
										</div>
									</div>
								)}

								<div className="flex-1">
									<h3 className="text-xl font-semibold mb-3 text-gray-900">
										{item.video.title}
									</h3>

									<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
										<div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
											<div className="text-xs text-blue-600 font-medium mb-1">
												Processed
											</div>
											<div className="text-sm text-blue-900 font-semibold">
												{formatDate(
													item.video.createdAt
												)}
											</div>
										</div>
										<div className="bg-green-50 p-3 rounded-lg border border-green-200">
											<div className="text-xs text-green-600 font-medium mb-1">
												Input Tokens
											</div>
											<div className="text-sm text-green-900 font-semibold">
												{item.tokenUsage.inputTokens.toLocaleString()}
											</div>
										</div>
										<div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
											<div className="text-xs text-purple-600 font-medium mb-1">
												Output Tokens
											</div>
											<div className="text-sm text-purple-900 font-semibold">
												{item.tokenUsage.outputTokens.toLocaleString()}
											</div>
										</div>
										<div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
											<div className="text-xs text-orange-600 font-medium mb-1">
												Cost
											</div>
											<div className="text-sm text-orange-900 font-semibold">
												$
												{item.tokenUsage.totalCost.toFixed(
													4
												)}
											</div>
										</div>
									</div>

									<div className="flex items-center justify-between">
										{item.transcript && (
											<div className="flex items-center space-x-2 text-sm text-gray-600">
												<svg
													className="w-4 h-4 text-gray-400"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24">
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
													/>
												</svg>
												<span className="font-medium">
													{item.transcript
														.logicalSegments
														?.length || 0}{' '}
													segments
												</span>
											</div>
										)}

										{item.transcript && onVideoClick && (
											<div className="flex items-center space-x-2 text-blue-600 text-sm font-medium">
												<span>View Details</span>
												<svg
													className="w-4 h-4"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24">
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M9 5l7 7-7 7"
													/>
												</svg>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
