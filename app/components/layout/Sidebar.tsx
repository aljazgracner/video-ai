'use client';

import { useState } from 'react';

interface SidebarProps {
	activeItem: string;
	onItemClick: (item: string) => void;
}

const navigationItems = [
	{
		id: 'video-transcript',
		name: 'Video to Text Transcript',
		icon: (
			<svg
				className="w-5 h-5"
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
		),
	},
	{
		id: 'video-history',
		name: 'Video History',
		icon: (
			<svg
				className="w-5 h-5"
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
		),
	},
	{
		id: 'settings',
		name: 'Settings',
		icon: (
			<svg
				className="w-5 h-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24">
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
				/>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
				/>
			</svg>
		),
	},
];

export default function Sidebar({ activeItem, onItemClick }: SidebarProps) {
	return (
		<aside className="w-64 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 min-h-screen shadow-lg">
			<nav className="mt-6">
				<div className="px-6 mb-4">
					<h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
						Navigation
					</h2>
				</div>
				<ul className="space-y-2 px-4">
					{navigationItems.map((item) => (
						<li key={item.id}>
							<button
								onClick={() => onItemClick(item.id)}
								className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer group ${
									activeItem === item.id
										? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
										: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md hover:transform hover:scale-102'
								}`}>
								<span
									className={`mr-3 transition-colors duration-200 ${
										activeItem === item.id
											? 'text-white'
											: 'text-gray-400 group-hover:text-gray-600'
									}`}>
									{item.icon}
								</span>
								<span className="flex-1 text-left">
									{item.name}
								</span>
								{activeItem === item.id && (
									<div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
								)}
							</button>
						</li>
					))}
				</ul>
			</nav>
		</aside>
	);
}
