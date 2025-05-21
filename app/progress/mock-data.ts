import { ProgressEntry, UserStats } from '@/lib/types';

// Sample user ID
const USER_ID = 'user123';

// Function to create a mock progress entry
const createMockEntry = (date: Date, index: number): ProgressEntry => {
  const titles = [
    'Learned React Hooks',
    'Built a responsive navbar',
    'Implemented authentication',
    'Created a REST API',
    'Worked on CSS animations',
    'Built a form validation',
    'Learned TypeScript generics',
    'Created custom hooks',
  ];

  const descriptions = [
    'Today I focused on understanding how React hooks work, particularly useState and useEffect. I built a simple counter application to practice these concepts.',
    'Built a responsive navigation bar that collapses on mobile devices. Used CSS flexbox and media queries to achieve the desired effect.',
    'Implemented user authentication using NextAuth.js. Added Google Sign-In functionality and protected routes.',
    'Created a RESTful API using Express.js. Implemented CRUD operations for a resource and added error handling.',
    'Explored CSS animations and transitions. Created a loading spinner and some hover effects for buttons.',
    'Built a form with validation using React Hook Form. Added error messages and custom validation rules.',
    'Delved deeper into TypeScript by learning about generics. Rewrote some utility functions to be more type-safe.',
    'Created several custom hooks to reuse logic across components, including useLocalStorage, useMediaQuery, and useFetch.',
  ];

  const randomImages = [
    'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=500&h=500&fit=crop',
  ];

  // Get 1-3 random images
  const imageCount = Math.floor(Math.random() * 3) + 1;
  const images = randomImages.slice(0, imageCount);

  const formattedDate = date.toISOString();
  const titleIndex = index % titles.length;
  
  return {
    id: `entry-${date.getTime()}`,
    userId: USER_ID,
    date: formattedDate.split('T')[0],
    title: titles[titleIndex],
    description: descriptions[titleIndex],
    images,
    postedAt: formattedDate,
    createdAt: formattedDate,
    updatedAt: formattedDate,
  };
};

// Generate entries for the last 60 days (with some gaps to simulate missed days)
export const generateMockEntries = (): ProgressEntry[] => {
  const entries: ProgressEntry[] = [];
  const today = new Date();
  
  // Start 60 days ago
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 60);
  
  for (let i = 0; i < 60; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    // Skip some days randomly to simulate missed days (roughly 20% chance)
    if (Math.random() > 0.2) {
      entries.push(createMockEntry(currentDate, i));
    }
  }
  
  return entries;
};

// Mock user stats
export const mockUserStats: UserStats = {
  userId: USER_ID,
  totalDays: 45, // out of 60 possible days
  currentStreak: 7,
  longestStreak: 14,
  lastPostedDate: new Date().toISOString(),
};

// Mock data for all entries
export const mockEntries = generateMockEntries(); 