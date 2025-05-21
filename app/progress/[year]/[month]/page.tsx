'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  format, 
  parseISO, 
  startOfMonth, 
  endOfMonth, 
  isToday, 
  isSameMonth,
  getDaysInMonth,
  addDays
} from 'date-fns';
import { mockEntries } from '../../mock-data';
import { ProgressEntry } from '@/lib/types';
import ProgressEntryModal from '../../components/ProgressEntryModal';
import ProgressTimeline from '../../components/ProgressTimeline';
import { syncProgressWithCalendar } from '@/lib/progress-calendar-service';

export default function MonthPage() {
  const router = useRouter();
  const params = useParams();
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEntry, setSelectedEntry] = useState<ProgressEntry | undefined>(undefined);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  // Parse the year and month from the route params
  const year = parseInt(params.year as string, 10);
  const month = parseInt(params.month as string, 10) - 1; // Adjust month to be 0-based
  
  const monthDate = new Date(year, month, 1);
  const totalDays = getDaysInMonth(monthDate);
  const today = new Date();
  
  // Filter entries for the current month
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        // In a production environment, this would call the API
        // const response = await fetch(`/api/progress?year=${year}&month=${month + 1}`);
        // if (!response.ok) throw new Error('Failed to fetch entries');
        // const data = await response.json();
        // setEntries(data.entries);
        
        // For now, use mock data
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        const filteredEntries = mockEntries.filter(entry => {
          const entryDate = parseISO(entry.date);
          return entryDate >= monthStart && entryDate <= monthEnd;
        });
        
        setEntries(filteredEntries);
      } catch (error) {
        console.error('Error fetching entries:', error);
      }
    };
    
    fetchEntries();
  }, [monthDate, year, month]);
  
  // Handle adding a new entry
  const handleAddEntry = async (entryData: Omit<ProgressEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      // In a production environment, this would call the API
      // const response = await fetch('/api/progress', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(entryData),
      // });
      // 
      // if (!response.ok) throw new Error('Failed to create entry');
      // const data = await response.json();
      // const newEntry = data.entry;
      
      // For now, create a mock entry
      const newEntry: ProgressEntry = {
        id: `entry-${Date.now()}`,
        userId: 'user123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...entryData
      };
      
      setEntries(prev => [...prev, newEntry]);
      
      // Log the new entry
      console.log('New entry:', newEntry);
      
      // Sync with calendar if it has images
      if (newEntry.images && newEntry.images.length > 0) {
        await syncProgressWithCalendar(newEntry);
      }
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };
  
  // Handle editing an existing entry
  const handleEditEntry = (entry: ProgressEntry) => {
    setSelectedEntry(entry);
    setSelectedDate(parseISO(entry.date));
    setShowModal(true);
  };
  
  // Handle updating an entry
  const handleUpdateEntry = async (entryData: Omit<ProgressEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedEntry) return;
    
    try {
      // In a production environment, this would call the API
      // const response = await fetch(`/api/progress/${selectedEntry.id}`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(entryData),
      // });
      // 
      // if (!response.ok) throw new Error('Failed to update entry');
      // const data = await response.json();
      // const updatedEntry = data.entry;
      
      // For now, update the entry locally
      const updatedEntry: ProgressEntry = {
        ...selectedEntry,
        ...entryData,
        updatedAt: new Date().toISOString()
      };
      
      setEntries(prev => prev.map(entry => 
        entry.id === selectedEntry.id ? updatedEntry : entry
      ));
      
      setSelectedEntry(undefined);
      
      // Log the updated entry
      console.log('Updated entry:', updatedEntry);
      
      // Sync with calendar if it has images
      if (updatedEntry.images && updatedEntry.images.length > 0) {
        await syncProgressWithCalendar(updatedEntry);
      }
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };
  
  // Can only add or edit entries for the current day
  const canAddEntryToday = isToday(selectedDate) && isSameMonth(selectedDate, monthDate);
  
  // Create daily progress indicators
  const daysWithEntries = entries.reduce<Record<string, boolean>>((acc, entry) => {
    const dayStr = entry.date.split('T')[0];
    acc[dayStr] = true;
    return acc;
  }, {});

  const handleAddTodayClick = () => {
    if (isButtonDisabled) return;
    
    setIsButtonDisabled(true);
    setSelectedDate(new Date());
    setSelectedEntry(undefined);
    setShowModal(true);
    
    // Re-enable the button after a short delay
    setTimeout(() => {
      setIsButtonDisabled(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Link 
              href="/progress"
              className="inline-flex items-center px-2 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </Link>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {format(monthDate, 'MMMM yyyy')}
            </h1>
          </div>
          
          <button
            onClick={handleAddTodayClick}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!isToday(new Date()) || isButtonDisabled}
          >
            Add Today's Progress
          </button>
        </div>
        
        {/* Monthly calendar overview */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-4 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Monthly Overview
          </h2>
          
          <div className="grid grid-cols-7 gap-1">
            {/* Day labels */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-xs text-gray-500 dark:text-gray-400 text-center p-1">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {Array.from({ length: totalDays }).map((_, idx) => {
              const date = new Date(year, month, idx + 1);
              const dateStr = format(date, 'yyyy-MM-dd');
              const hasEntry = daysWithEntries[dateStr];
              const isCurrentDay = isToday(date);
              
              return (
                <div 
                  key={idx}
                  className={`aspect-square p-1 rounded-md flex items-center justify-center text-sm ${
                    isCurrentDay 
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 font-medium' 
                      : hasEntry 
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                        : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="relative">
                    {idx + 1}
                    {hasEntry && (
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-1 h-1 bg-green-500 rounded-full" />
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Entries timeline */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6">
            Progress Timeline
            <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} this month
            </span>
          </h2>
          
          {entries.length > 0 ? (
            <ProgressTimeline entries={entries} onEdit={handleEditEntry} />
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">
                No progress entries for this month yet.
              </p>
              <button
                onClick={handleAddTodayClick}
                className="mt-4 px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!isToday(new Date()) || isButtonDisabled}
              >
                Add your first entry
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Entry modal */}
      <ProgressEntryModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedEntry(undefined);
        }}
        date={selectedDate}
        onSave={selectedEntry ? handleUpdateEntry : handleAddEntry}
        initialData={selectedEntry}
        isEditing={!!selectedEntry}
      />
    </div>
  );
} 