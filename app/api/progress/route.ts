import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createProgressEntry, getProgressEntriesForMonth, updateProgressEntry } from '@/lib/db/progress-service';

// GET /api/progress?year=2023&month=5
export async function GET(request: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');
    
    if (!yearParam || !monthParam) {
      return NextResponse.json({ error: 'Year and month parameters are required' }, { status: 400 });
    }
    
    // Parse year and month
    const year = parseInt(yearParam, 10);
    const month = parseInt(monthParam, 10) - 1; // Adjust to 0-based month
    
    // Get entries for the month
    const entries = await getProgressEntriesForMonth(session.user.id, year, month);
    
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching progress entries:', error);
    return NextResponse.json({ error: 'Failed to fetch progress entries' }, { status: 500 });
  }
}

// POST /api/progress
export async function POST(request: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { date, title, description, images } = body;
    
    if (!date || !title) {
      return NextResponse.json({ error: 'Date and title are required' }, { status: 400 });
    }
    
    // Create a new progress entry
    const entry = await createProgressEntry({
      userId: session.user.id,
      date,
      title,
      description,
      images: images || [],
    });
    
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('Error creating progress entry:', error);
    return NextResponse.json({ error: 'Failed to create progress entry' }, { status: 500 });
  }
} 