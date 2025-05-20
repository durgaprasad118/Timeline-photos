"use client";

import Link from "next/link";
import UserMenu from "./UserMenu";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm dark:bg-neutral-800 dark:border-b dark:border-neutral-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-800 dark:text-white">
              Memories
            </Link>
            
            <div className="hidden md:flex space-x-4">
              <Link 
                href="/collections" 
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Collections
              </Link>
              <Link 
                href="/playground" 
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Playground
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  );
} 