'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
} from 'date-fns';
import { ProgressEntry } from '@/lib/types';
import ProgressEntryModal from '../../components/ProgressEntryModal';
import ProgressTimeline from '../../components/ProgressTimeline';
import { getProgressEntriesForMonth, createProgressEntry, updateProgressEntry } from '@/lib/progress-service';

export default function MonthPage() {
  const router = useRouter();
  const params = useParams();
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEntry, setSelectedEntry] = useState<ProgressEntry | undefined>(undefined);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Client-side only effects
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Parse the year and month from the route params
  const year = parseInt(params.year as string, 10);
  const month = parseInt(params.month as string, 10) - 1; // Adjust month to be 0-based
  
  const monthDate = useMemo(() => new Date(year, month, 1), [year, month]);
  const totalDays = useMemo(() => getDaysInMonth(monthDate), [monthDate]);
  
  // Filter entries for the current month - only run when params change
  useEffect(() => {
    if (!isMounted) return;

    // Fetch entries from the API
    const fetchEntries = async () => {
      try {
        console.log(`Fetching progress entries for ${year}/${month + 1}`);
        // Month is 1-indexed in the API
        const fetchedEntries = await getProgressEntriesForMonth(year, month + 1);
        setEntries(fetchedEntries);
      } catch (error) {
        console.error('Error fetching entries:', error);
      }
    };
    
    fetchEntries();
  }, [year, month, isMounted]);
  
  // Handle adding a new entry
  const handleAddEntry = useCallback(async (entryData: Omit<ProgressEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Save to API
      const newEntry = await createProgressEntry(entryData);
      
      if (newEntry) {
        // Add to local state
        setEntries(prev => [...prev, newEntry]);
        console.log('New entry added and saved to backend:', newEntry);
      }
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  }, []);
  
  // Handle editing an existing entry
  const handleEditEntry = useCallback((entry: ProgressEntry) => {
    setSelectedEntry(entry);
    setSelectedDate(parseISO(entry.date));
    setShowModal(true);
  }, []);
  
  // Handle updating an entry
  const handleUpdateEntry = useCallback(async (entryData: Omit<ProgressEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedEntry) return;
    
    try {
      // Prepare update data
      const updateData = {
        id: selectedEntry.id,
        ...entryData
      };
      
      // Save to API
      const updatedEntry = await updateProgressEntry(updateData);
      
      if (updatedEntry) {
        // Update local state
        setEntries(prev => prev.map(entry => 
          entry.id === selectedEntry.id ? updatedEntry : entry
        ));
        
        setSelectedEntry(undefined);
        console.log('Entry updated and saved to backend:', updatedEntry);
      }
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  }, [selectedEntry]);
  
  // Create daily progress indicators - memoized to prevent recalculations
  const daysWithEntries = useMemo(() => {
    return entries.reduce<Record<string, boolean>>((acc, entry) => {
      const dayStr = entry.date.split('T')[0];
      acc[dayStr] = true;
      return acc;
    }, {});
  }, [entries]);

  const handleAddTodayClick = useCallback(() => {
    if (isButtonDisabled) return;
    
    console.log('Add Today button clicked');
    setIsButtonDisabled(true);
    
    // Use requestAnimationFrame to ensure we're in a client-side rendering context
    requestAnimationFrame(() => {
      // Create a stable date object with time set to midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Update state with the stable date
      setSelectedDate(today);
      setSelectedEntry(undefined);
      setShowModal(true);
      
      console.log('Modal state set to:', true, 'with date:', today.toISOString());
      
      // Re-enable the button after opening the modal
      setIsButtonDisabled(false);
    });
  }, [isButtonDisabled]);

  const handleCloseModal = useCallback(() => {
    console.log('Closing modal');
    setShowModal(false);
    setSelectedEntry(undefined);
  }, []);

  // Add debug useEffect
  useEffect(() => {
    if (!isMounted) return;
    
    // Add error event listener to catch any unhandled errors
    const handleError = (event: ErrorEvent) => {
      console.error('Unhandled error caught:', event.error);
    };
    
    window.addEventListener('error', handleError);
    
    console.log('Debug info:', { 
      params,
      year, 
      month, 
      showModal, 
      selectedDate: selectedDate?.toISOString(),
      selectedEntryId: selectedEntry?.id
    });
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, [params, year, month, showModal, selectedDate, selectedEntry, isMounted]);

  // Handle the case where we're editing an entry from a direct link
  useEffect(() => {
    if (!isMounted) return;
    
    // Check if we have an edit parameter in the URL
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');
    
    if (editId) {
      // Find the entry with this ID
      const entryToEdit = entries.find(entry => entry.id === editId);
      if (entryToEdit) {
        // Set it as the selected entry and open the modal
        setSelectedEntry(entryToEdit);
        setSelectedDate(parseISO(entryToEdit.date));
        setShowModal(true);
      }
    }
  }, [entries, isMounted]);

  // Server-side or early client render - show nothing while hydrating
  if (!isMounted) {
    return <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-8 px-4 sm:px-6 lg:px-8"></div>;
  }

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
          
          <div className="flex space-x-3">
            <button
              onClick={handleAddTodayClick}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!isToday(new Date()) || isButtonDisabled}
            >
              Add Today's Progress
            </button>
          </div>
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
      
      {/* Entry modal - only rendered client-side after mounting */}
      {isMounted && (
        <ProgressEntryModal
          isOpen={showModal}
          onClose={handleCloseModal}
          date={selectedDate}
          onSave={selectedEntry ? handleUpdateEntry : handleAddEntry}
          initialData={selectedEntry}
          isEditing={!!selectedEntry}
        />
      )}
    </div>
  );
} 