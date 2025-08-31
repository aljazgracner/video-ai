'use client';

import { useState, useRef, useEffect } from 'react';

interface User {
	id: string;
	name: string;
	email: string;
	avatar?: string;
}

const mockUser: User = {
	id: '1',
	name: 'To do: login',
	email: 'random@example.com',
	avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
};

export default function Header() {
	const [showUserMenu, setShowUserMenu] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node)
			) {
				setShowUserMenu(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleLogout = () => {
		console.log('Logout clicked');
		setShowUserMenu(false);
	};

	return (
		<header className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 px-6 py-4 shadow-sm">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<div className="flex items-center space-x-3">
						<div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
							<svg
								className="w-5 h-5 text-white"
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
							<h1 className="text-lg font-bold text-gray-900">
								Video AI
							</h1>
							<p className="text-xs text-gray-500">
								Transcript Generator
							</p>
						</div>
					</div>
				</div>

				<div className="flex items-center space-x-4">
					<div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
						<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
						<span className="text-xs font-medium text-blue-700">
							Gemini API available
						</span>
					</div>

					<div className="relative" ref={menuRef}>
						<button
							onClick={() => setShowUserMenu(!showUserMenu)}
							className="flex items-center space-x-3 text-sm rounded-xl px-4 py-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer transition-all duration-200 hover:shadow-md">
							<div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
								<span className="text-sm font-semibold text-white">
									{mockUser.name.charAt(0)}
								</span>
							</div>
							<div className="hidden md:block text-left">
								<p className="text-sm font-medium text-gray-900">
									{mockUser.name}
								</p>
								<p className="text-xs text-gray-500">
									{mockUser.email}
								</p>
							</div>
							<svg
								className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
									showUserMenu ? 'rotate-180' : ''
								}`}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</button>

						{showUserMenu && (
							<div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-200 animate-in slide-in-from-top-2 duration-200">
								<div className="px-4 py-3 border-b border-gray-100">
									<div className="flex items-center space-x-3">
										<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
											<span className="text-sm font-semibold text-white">
												{mockUser.name.charAt(0)}
											</span>
										</div>
										<div>
											<p className="text-sm font-medium text-gray-900">
												{mockUser.name}
											</p>
											<p className="text-xs text-gray-500">
												{mockUser.email}
											</p>
										</div>
									</div>
								</div>
								<div className="py-1">
									<button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-150">
										<svg
											className="w-4 h-4 mr-3 text-gray-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
											/>
										</svg>
										Profile Settings
									</button>
									<button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-150">
										<svg
											className="w-4 h-4 mr-3 text-gray-400"
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
										Preferences
									</button>
									<div className="border-t border-gray-100 my-1"></div>
									<button
										onClick={handleLogout}
										className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors duration-150">
										<svg
											className="w-4 h-4 mr-3 text-red-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24">
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
											/>
										</svg>
										Sign out
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
