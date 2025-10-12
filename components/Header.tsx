import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { MicrophoneIcon } from './icons/Icons';

interface HeaderProps {
  onToggleLiveChat: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleLiveChat }) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="bg-white shadow-md z-10 dark:bg-gray-800 dark:border-b dark:border-gray-700">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="relative w-full max-w-xl">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 text-gray-700 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
            type="text"
            placeholder="AI Smart Search (e.g., 'moves to London this month')"
          />
        </div>

        <div className="flex items-center">
          <button onClick={onToggleLiveChat} className="flex items-center mx-4 text-gray-600 hover:text-brand-primary focus:outline-none dark:text-gray-300 dark:hover:text-white" aria-label="Toggle live chat">
            <MicrophoneIcon />
          </button>
          <button onClick={toggleTheme} className="flex items-center mx-4 text-gray-600 hover:text-brand-primary focus:outline-none dark:text-gray-300 dark:hover:text-white" aria-label="Toggle theme">
            {theme === 'light' ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )}
          </button>
          <button className="flex items-center mx-4 text-gray-600 hover:text-brand-primary focus:outline-none dark:text-gray-300 dark:hover:text-white">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 17H20L18.5951 15.5951C18.2141 15.2141 18 14.6973 18 14.1585V11C18 8.38757 16.3304 6.16509 14 5.34142V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V5.34142C7.66962 6.16509 6 8.38757 6 11V14.1585C6 14.6973 5.78595 15.2141 5.40493 15.5951L4 17H9M12 21C12.8284 21 13.5 20.3284 13.5 19.5H10.5C10.5 20.3284 11.1716 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </button>

          <div className="relative">
            <button className="flex items-center focus:outline-none">
              <img className="h-10 w-10 rounded-full object-cover" src="https://picsum.photos/100" alt="User" />
              <div className="ml-3 text-left">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">John Doe</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;