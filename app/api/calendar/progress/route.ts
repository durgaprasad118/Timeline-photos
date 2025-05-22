import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { ProgressEntry } from '@/lib/types';

// Path to the progress entries data file
const PROGRESS_FILE = join(process.cwd(), 'data', 'progress-entries.json');

// Function to load progress entries from file
async function loadProgressEntries(): Promise<ProgressEntry[]> {
  try {
    // Check if file exists
    if (!existsSync(PROGRESS_FILE)) {
      return [];
    }
    
    const data = await readFile(PROGRESS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading progress entries:', error);
    return [];
  }
}

// GET handler to retrieve progress entries for the calendar
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    
    // Load all entries
    const allEntries = await loadProgressEntries();
    
    // Filter by year and month if provided
    let filteredEntries = allEntries;
    
    if (year && month) {
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);
      
      filteredEntries = allEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === yearNum && entryDate.getMonth() === monthNum - 1;
      });
    }
    
    // Format entries for the calendar
    const calendarEvents = filteredEntries.map(entry => ({
      id: entry.id,
      title: entry.title,
      imageUrl: entry.images && entry.images.length > 0 
        ? entry.images[0] 
        : 'https://images.unsplash.com/photo-1542626991-cbc4e32524cc?w=40&h=40&fit=crop',
      start: new Date(entry.date).toISOString(),
      end: new Date(entry.date).toISOString(),
      category: 'work', // Default category for progress entries
      isProgress: true, // Mark as progress entry
      description: entry.description
    }));
    
    return NextResponse.json({ events: calendarEvents });
  } catch (error) {
    console.error('Error retrieving progress entries for calendar:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve progress entries' },
      { status: 500 }
    );
  }
} 