import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ProgressEntry } from '@/lib/types';

// For development, store entries in a JSON file
// In production, you would use a real database
const DATA_DIR = join(process.cwd(), 'data');
const PROGRESS_FILE = join(DATA_DIR, 'progress-entries.json');

// Ensure the data directory exists
async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  
  // Create the progress file if it doesn't exist
  if (!existsSync(PROGRESS_FILE)) {
    await writeFile(PROGRESS_FILE, JSON.stringify([], null, 2));
  }
}

// Load progress entries from the file
async function loadEntries(): Promise<ProgressEntry[]> {
  try {
    await ensureDataDir();
    const data = await readFile(PROGRESS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading progress entries:', error);
    return [];
  }
}

// Save progress entries to the file
async function saveEntries(entries: ProgressEntry[]): Promise<void> {
  try {
    await ensureDataDir();
    await writeFile(PROGRESS_FILE, JSON.stringify(entries, null, 2));
  } catch (error) {
    console.error('Error saving progress entries:', error);
    throw new Error('Failed to save progress entries');
  }
}

// GET handler to retrieve progress entries for a month
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    
    if (!year || !month) {
      return NextResponse.json(
        { error: 'Year and month are required' },
        { status: 400 }
      );
    }
    
    // Load all entries
    const allEntries = await loadEntries();
    
    // Filter by year and month
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    
    const filteredEntries = allEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === yearNum && entryDate.getMonth() === monthNum - 1;
    });
    
    return NextResponse.json({ entries: filteredEntries });
  } catch (error) {
    console.error('Error retrieving progress entries:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve progress entries' },
      { status: 500 }
    );
  }
}

// POST handler to create a new progress entry
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.date) {
      return NextResponse.json(
        { error: 'Title and date are required' },
        { status: 400 }
      );
    }
    
    // Load existing entries
    const entries = await loadEntries();
    
    // Create new entry with ID and timestamps
    const now = new Date();
    const newEntry: ProgressEntry = {
      id: uuidv4(),
      userId: 'user123', // For development; in production, get from authenticated user
      title: data.title,
      description: data.description || '',
      date: data.date,
      images: data.images || [],
      postedAt: data.postedAt || now.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    
    // Add to entries and save
    entries.push(newEntry);
    await saveEntries(entries);
    
    return NextResponse.json({ entry: newEntry });
  } catch (error) {
    console.error('Error creating progress entry:', error);
    return NextResponse.json(
      { error: 'Failed to create progress entry' },
      { status: 500 }
    );
  }
}

// PUT handler to update an existing progress entry
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }
    
    // Load existing entries
    const entries = await loadEntries();
    
    // Find the entry to update
    const entryIndex = entries.findIndex(entry => entry.id === data.id);
    
    if (entryIndex === -1) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }
    
    // Update the entry
    const now = new Date();
    const updatedEntry = {
      ...entries[entryIndex],
      title: data.title || entries[entryIndex].title,
      description: data.description !== undefined ? data.description : entries[entryIndex].description,
      images: data.images || entries[entryIndex].images,
      updatedAt: now.toISOString(),
    };
    
    // Replace the old entry
    entries[entryIndex] = updatedEntry;
    
    // Save the updated entries
    await saveEntries(entries);
    
    return NextResponse.json({ entry: updatedEntry });
  } catch (error) {
    console.error('Error updating progress entry:', error);
    return NextResponse.json(
      { error: 'Failed to update progress entry' },
      { status: 500 }
    );
  }
} 