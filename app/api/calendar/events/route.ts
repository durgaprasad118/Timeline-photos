import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

// GET /api/calendar/events?year=2023&month=5
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
    const month = parseInt(monthParam, 10);
    
    // Get start and end dates for the month
    const startDate = new Date(year, month - 1, 1); // Month is 1-based in the API
    const endDate = new Date(year, month, 0); // Last day of the month
    
    // Find progress entries for the user in the specified month
    const progressEntries = await prisma.progressEntry.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        calendarEvent: true,
        images: {
          take: 1, // Just get the first image
        },
      },
    });
    
    // Transform to calendar events format
    const events = progressEntries
      .filter(entry => entry.calendarEvent || entry.images.length > 0) // Only entries with calendar events or images
      .map(entry => {
        // Use existing calendar event if available
        if (entry.calendarEvent) {
          return {
            id: entry.calendarEvent.id,
            title: entry.calendarEvent.title,
            date: format(entry.date, 'yyyy-MM-dd'),
            imageUrl: entry.calendarEvent.imageUrl,
            category: entry.calendarEvent.category || 'work',
          };
        }
        
        // Otherwise create a calendar event format from the entry
        return {
          id: entry.id,
          title: entry.title,
          date: format(entry.date, 'yyyy-MM-dd'),
          imageUrl: entry.images.length > 0 ? entry.images[0].url : null,
          category: 'work',
        };
      });
    
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
  }
} 