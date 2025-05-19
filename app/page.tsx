import Link from 'next/link';
import Navbar from './components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Capture Your Memories
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Store and share your most precious moments in one place.
          </p>
        </div>
      </main>
    </div>
  );
}
