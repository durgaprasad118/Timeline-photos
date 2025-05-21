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
  other: { name: 'Other Events', color: '#3174ad' }
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

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date(2023, 2, 15)); // March 15, 2023
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: format(new Date(2023, 2, 15), 'yyyy-MM-dd'),
    category: 'other',
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=40&h=40&fit=crop'
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Load events from JSON data
  useEffect(() => {
    const calendarEvents = convertToCalendarEvents(marchEventsData as EventData[]);
    setEvents(calendarEvents);
  }, []);

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

  const Event = ({ event }: { event: CalendarEvent }) => (
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">March 2023 Events Calendar</h1>
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