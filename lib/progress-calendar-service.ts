import { ProgressEntry } from './types';

interface CalendarEvent {
  id: number | string;
  title: string;
  imageUrl: string;
  date: string;
  category?: string;
}

// Convert a progress entry to a calendar event
export function convertToCalendarEvent(entry: ProgressEntry): CalendarEvent {
  return {
    id: entry.id,
    title: entry.title,
    imageUrl: entry.images && entry.images.length > 0 
      ? entry.images[0] 
      : 'https://images.unsplash.com/photo-1542626991-cbc4e32524cc?w=40&h=40&fit=crop',
    date: entry.date,
    category: 'work', // Default category for progress entries
  };
}

// Function to add/update events in the calendar
export async function syncProgressWithCalendar(entry: ProgressEntry): Promise<void> {
  try {
    // In a real application, this would be handled automatically by the backend
    // when creating/updating progress entries through the API
    console.log('Syncing progress entry to calendar:', entry.id);
    return Promise.resolve();
  } catch (error) {
    console.error('Error syncing with calendar:', error);
    throw error;
  }
}

// Function to get all calendar events for a specific month
export async function getCalendarEventsForMonth(year: number, month: number): Promise<CalendarEvent[]> {
  try {
    // Make API call to get calendar events
    const response = await fetch(`/api/calendar/events?year=${year}&month=${month + 1}`);
    
    if (!response.ok) {
      throw new Error('Failed to get calendar events');
    }
    
    const data = await response.json();
    return data.events;
  } catch (error) {
    console.error('Error getting calendar events:', error);
    return [];
  }
} 