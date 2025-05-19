import Link from 'next/link';
import Navbar from './components/Navbar';
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <Navbar />
      <main>
        <div className="relative py-16 md:py-24 bg-gradient-to-b from-indigo-600 to-indigo-800 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white">
                Capture Your Memories
              </h1>
              <p className="mt-5 max-w-xl mx-auto text-xl text-indigo-100">
                Store and share your most precious moments in one place.
              </p>
              
              {session ? (
                <div className="mt-10">
                  <Link
                    href="/collections"
                    className="px-8 py-3 bg-white text-indigo-600 font-medium rounded-md shadow hover:bg-gray-100 transition duration-150"
                  >
                    View My Collections
                  </Link>
                </div>
              ) : (
                <div className="mt-10">
                  <Link
                    href="/login"
                    className="px-8 py-3 bg-white text-indigo-600 font-medium rounded-md shadow hover:bg-gray-100 transition duration-150"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 0 L50 100 L100 0 Z" fill="white" />
            </svg>
          </div>
        </div>
        
        <div className="py-12 md:py-24 bg-white dark:bg-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Organize Your Memories
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
                Create collections for different aspects of your life and view them in a beautiful timeline.
              </p>
            </div>
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 dark:bg-neutral-700 p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">Upload Photos</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Add images to your collections and preserve your special moments.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-neutral-700 p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">Create Collections</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Organize your memories into different collections for easy access.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-neutral-700 p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">Timeline View</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  View your memories in a beautiful chronological timeline.
                </p>
              </div>
            </div>
            
            <div className="mt-16 text-center">
              {session ? (
                <Link
                  href="/collections/create"
                  className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md shadow hover:bg-indigo-700 transition duration-150"
                >
                  Create Your First Collection
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md shadow hover:bg-indigo-700 transition duration-150"
                >
                  Sign In to Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
