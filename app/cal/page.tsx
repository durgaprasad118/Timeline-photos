'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, EventPropGetter } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import marchEventsData from './events-data.json';

// Define event type
interface CalendarEvent {
  id: number;
  title: string;
  imageUrl: string;
  start: Date;
  end: Date;
  category?: string;
}

// Define the type for the JSON data
interface EventData {
  id: number;
  title: string;
  imageUrl: string;
  date: string;
}

// Setup date-fns localizer
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Event categories with their colors
const eventCategories = {
  meeting: { name: 'Meetings & Calls', color: '#9C27B0' },
  leisure: { name: 'Leisure & Trips', color: '#009688' },
  work: { name: 'Work Tasks', color: '#FF9800' },
  medical: { name: 'Medical Appointments', color: '#F44336' },
  other: { name: 'Other Events', color: '#3174ad' },
  progress: { name: 'Code Progress', color: '#4CAF50' }  // Green color for progress entries
};

// Convert JSON data to CalendarEvent format
const convertToCalendarEvents = (data: EventData[]): CalendarEvent[] => {
  return data.map(event => {
    const eventDate = new Date(event.date);
    return {
      id: event.id,
      title: event.title,
      imageUrl: event.imageUrl,
      start: eventDate,
      end: eventDate,
    };
  });
};

interface ExtendedCalendarEvent extends CalendarEvent {
  isProgress?: boolean;
  description?: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 1)); // March 15, 2023
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: format(new Date(2023, 2, 15), 'yyyy-MM-dd'),
    category: 'other',
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=40&h=40&fit=crop'
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Load events from JSON data and progress entries from API
  useEffect(() => {
    async function loadEvents() {
      try {
        // Load pre-defined events from JSON
        const calendarEvents = convertToCalendarEvents(marchEventsData as EventData[]);
        
        // Load progress entries from API
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // API expects 1-12 format
        
        const progressResponse = await fetch(`/api/calendar/progress?year=${year}&month=${month}`);
        
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          const progressEvents = progressData.events.map((event: any) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end)
          }));
          
          // Combine regular events with progress entries
          setEvents([...calendarEvents, ...progressEvents]);
        } else {
          setEvents(calendarEvents);
        }
      } catch (error) {
        console.error('Error loading events:', error);
        // Load just the JSON events as fallback
        const calendarEvents = convertToCalendarEvents(marchEventsData as EventData[]);
        setEvents(calendarEvents);
      }
    }
    
    loadEvents();
  }, [currentDate]);

  // Handle slot selection (clicking on a day)
  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
    setNewEvent({
      ...newEvent,
      date: format(start, 'yyyy-MM-dd')
    });
    setShowModal(true);
  };

  // Handle adding a new event
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a new event
    const newCalendarEvent: CalendarEvent = {
      id: events.length + 1,
      title: newEvent.title,
      imageUrl: newEvent.imageUrl,
      start: new Date(newEvent.date),
      end: new Date(newEvent.date),
      category: newEvent.category
    };
    
    // Add to events list
    setEvents([...events, newCalendarEvent]);
    
    // Reset form and close modal
    setNewEvent({
      title: '',
      date: format(new Date(2023, 2, 15), 'yyyy-MM-dd'),
      category: 'other',
      imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=40&h=40&fit=crop'
    });
    setShowModal(false);
  };

  // Custom event renderer to show image + title
  const eventPropGetter: EventPropGetter<CalendarEvent> = (event) => {
    // Determine color based on event title or category
    let backgroundColor = eventCategories.other.color;
    
    // Check if it's a progress entry
    if ('isProgress' in event && event.isProgress) {
      backgroundColor = eventCategories.progress.color;
      return {
        style: {
          backgroundColor,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '2px 6px',
          borderRadius: '4px',
          fontWeight: 700,  // Make progress entries bold
          boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.3)',
        },
      };
    }
    
    // For existing events, determine by title
    if (event.title.includes('Meeting') || event.title.includes('Call')) {
      backgroundColor = eventCategories.meeting.color;
    } else if (event.title.includes('Weekend') || event.title.includes('Trip')) {
      backgroundColor = eventCategories.leisure.color;
    } else if (event.title.includes('Review') || event.title.includes('Report')) {
      backgroundColor = eventCategories.work.color;
    } else if (event.title.includes('Doctor') || event.title.includes('Dentist')) {
      backgroundColor = eventCategories.medical.color;
    }
    
    // For new events with category property
    if ('category' in event && typeof event.category === 'string') {
      const category = event.category as keyof typeof eventCategories;
      if (eventCategories[category]) {
        backgroundColor = eventCategories[category].color;
      }
    }
    
    return {
      style: {
        backgroundColor,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '2px 6px',
        borderRadius: '4px',
        fontWeight: 500,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      },
    };
  };

  const Event = ({ event }: { event: ExtendedCalendarEvent }) => {
    // Custom styling for progress entries
    if (event.isProgress) {
      return (
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center',
            position: 'relative'
          }}
          className="progress-event"
          title={event.description ? `${event.title} - ${event.description}` : event.title}
        >
          <img
            src={event.imageUrl}
            alt={event.title}
            style={{ 
              width: 24, 
              height: 24, 
              marginRight: 6, 
              borderRadius: '50%', 
              objectFit: 'cover',
              border: '2px solid rgba(255,255,255,0.7)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }}
          />
          <span style={{ fontWeight: 'bold' }}>
            {event.title.length > 20 ? `${event.title.substring(0, 20)}...` : event.title}
          </span>
        </div>
      );
    }
    
    // Regular events
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src={event.imageUrl}
          alt={event.title}
          style={{ 
            width: 24, 
            height: 24, 
            marginRight: 6, 
            borderRadius: '50%', 
            objectFit: 'cover',
            border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}
        />
        <span>{event.title}</span>
      </div>
    );
  };

  // Image URLs for each category
  const categoryImages = {
    meeting: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=40&h=40&fit=crop',
    leisure: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=40&h=40&fit=crop',
    work: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=40&h=40&fit=crop',
    medical: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=40&h=40&fit=crop',
    other: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=40&h=40&fit=crop'
  };

  // Update image URL when category changes
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value as keyof typeof categoryImages;
    setNewEvent({
      ...newEvent,
      category,
      imageUrl: categoryImages[category]
    });
  };

  // Handle event selection (clicking on an event)
  const handleSelectEvent = (event: ExtendedCalendarEvent) => {
    // If it's a progress entry, navigate to edit page
    if (event.isProgress) {
      // Extract date from the event
      const eventDate = new Date(event.start);
      const year = eventDate.getFullYear();
      const month = eventDate.getMonth() + 1; // 1-12 format
      
      // Navigate to edit page with the event ID
      window.location.href = `/progress/${year}/${month}?edit=${event.id}`;
    } else {
      // Regular event handling could be added here
      alert(`Selected event: ${event.title}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          {format(currentDate, 'MMMM yyyy')} Calendar
        </h1>
        <button 
          onClick={() => {
            setSelectedDate(currentDate);
            setNewEvent({
              ...newEvent,
              date: format(currentDate, 'yyyy-MM-dd')
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Event
        </button>
      </div>
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-4" style={{ height: 600 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="month"
          date={currentDate}
          onNavigate={date => setCurrentDate(date)}
          components={{
            event: Event,
          }}
          eventPropGetter={eventPropGetter}
          views={['month', 'week', 'day']}
          className="calendar-custom"
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
        />
      </div>
      
      <div className="mt-6 bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Event Categories</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-[#9C27B0] mr-2"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Meetings & Calls</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-[#009688] mr-2"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Leisure & Trips</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-[#FF9800] mr-2"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Work Tasks</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-[#F44336] mr-2"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Medical Appointments</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-[#3174ad] mr-2"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Other Events</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-[#4CAF50] mr-2"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Code Progress</span>
          </div>
        </div>
      </div>
      
      {/* Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Add New Event for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}
            </h2>
            
            <form onSubmit={handleAddEvent}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100"
                  value={newEvent.category}
                  onChange={handleCategoryChange}
                >
                  <option value="meeting">Meeting</option>
                  <option value="leisure">Leisure</option>
                  <option value="work">Work</option>
                  <option value="medical">Medical</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  min="2023-03-01"
                  max="2023-03-31"
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .calendar-custom .rbc-event {
          border: none;
        }
        
        .calendar-custom .rbc-today {
          background-color: rgba(66, 133, 244, 0.08);
        }
        
        .calendar-custom .rbc-off-range-bg {
          background-color: #f5f5f5;
        }
        
        .dark .calendar-custom .rbc-off-range-bg {
          background-color: #2a2a2a;
        }
        
        .dark .calendar-custom .rbc-today {
          background-color: rgba(66, 133, 244, 0.15);
        }
        
        .calendar-custom .rbc-header {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
} 