'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { ProgressEntry } from '@/lib/types';
import { getProgressEntriesForMonth } from '@/lib/progress-service';

export default function ProgressDashboard() {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1); // 1-12 format

  // Load entries when year/month changes
  useEffect(() => {
    async function loadEntries() {
      setLoading(true);
      try {
        const fetchedEntries = await getProgressEntriesForMonth(year, month);
        setEntries(fetchedEntries);
      } catch (error) {
        console.error('Error loading entries:', error);
      } finally {
        setLoading(false);
      }
    }

    loadEntries();
  }, [year, month]);

  // Helper to group entries by day
  const entriesByDay = entries.reduce<Record<string, ProgressEntry[]>>((acc, entry) => {
    const day = entry.date.split('T')[0];
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(entry);
    return acc;
  }, {});

  // Handle month navigation
  const handlePrevMonth = () => {
    if (month === 1) {
      setYear(prev => prev - 1);
      setMonth(12);
    } else {
      setMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear(prev => prev + 1);
      setMonth(1);
    } else {
      setMonth(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Progress Dashboard</h1>
          <div className="space-x-4">
            <Link 
              href="/progress"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
            >
              Progress Calendar
            </Link>
          </div>
        </div>

        {/* Month selector */}
        <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-lg shadow">
          <button 
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          <h2 className="text-xl font-semibold text-gray-800">
            {new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          
          <button 
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 mb-4">No progress entries for this month.</p>
            <Link 
              href={`/progress/${year}/${month}`}
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Add Progress
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(entriesByDay).sort((a, b) => b[0].localeCompare(a[0])).map(([day, dayEntries]) => (
              <div key={day} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-indigo-50 p-4 border-b">
                  <h3 className="font-medium text-indigo-800">
                    {format(parseISO(day), 'EEEE, MMMM d, yyyy')}
                  </h3>
                </div>
                <div className="divide-y">
                  {dayEntries.map(entry => (
                    <div key={entry.id} className="p-4 hover:bg-gray-50">
                      <div className="flex flex-col sm:flex-row">
                        <div className="flex-grow">
                          <h4 className="font-semibold text-lg mb-2">{entry.title}</h4>
                          <p className="text-gray-600 mb-3 text-sm">
                            {format(parseISO(entry.postedAt), 'h:mm a')}
                          </p>
                          {entry.description && (
                            <p className="text-gray-700 mb-4">{entry.description}</p>
                          )}
                        </div>
                        {entry.images && entry.images.length > 0 && (
                          <div className="flex mt-3 sm:mt-0">
                            {entry.images.slice(0, 3).map((image, index) => (
                              <div key={index} className="w-16 h-16 rounded-md overflow-hidden ml-2 first:ml-0">
                                <Image 
                                  src={image} 
                                  alt={`Image for ${entry.title}`}
                                  width={64}
                                  height={64}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Link 
                          href={`/progress/${year}/${month}?edit=${entry.id}`}
                          className="text-indigo-600 text-sm hover:underline"
                        >
                          Edit Entry
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 