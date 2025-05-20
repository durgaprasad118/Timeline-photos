import Navbar from '../components/Navbar';
import ShikiPlayground from '../components/ShikiPlayground';
import './playground.css';

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <Navbar />
      
      <div className="relative py-12 bg-gradient-to-b from-indigo-600 to-indigo-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Code Playground
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-indigo-100">
              Try out Shiki syntax highlighting with different languages and themes.
            </p>
          </div>
        </div>
        
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 0 L50 100 L100 0 Z" fill="white" />
          </svg>
        </div>
      </div>
      
      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ShikiPlayground />
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                About Shiki
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Shiki (式) is a beautiful syntax highlighter based on TextMate grammar and themes, 
                the same engine as VS Code's syntax highlighting. It provides accurate and fast 
                syntax highlighting for almost any mainstream programming language.
              </p>
              <div className="mt-4">
                <a 
                  href="https://shiki.style" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                >
                  Learn more about Shiki →
                </a>
              </div>
            </div>
            
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                How to Use
              </h2>
              <ul className="text-gray-600 dark:text-gray-300 space-y-2 list-disc pl-5">
                <li>Select a language from the dropdown menu</li>
                <li>Choose a theme to see different syntax highlighting styles</li>
                <li>Edit the code directly in the editor</li>
                <li>Changes are highlighted in real-time</li>
                <li>Try Markdown for rich text formatting</li>
              </ul>
              <p className="mt-4 text-gray-600 dark:text-gray-300">
                The editor uses a single-column layout where you can type directly over the highlighted code.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 