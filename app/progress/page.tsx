'use client';

import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, getDaysInMonth, parseISO } from 'date-fns';
import Link from 'next/link';
import { mockEntries, mockUserStats } from './mock-data';
import { MonthCard } from '@/lib/types';

export default function ProgressPage() {
  const [monthCards, setMonthCards] = useState<MonthCard[]>([]);
  
  useEffect(() => {
    // Generate month cards from current month (May 2023) to Dec 2025
    const cards: MonthCard[] = [];
    const startDate = new Date(2023, 4, 1); // May 2023
    const endDate = new Date(2025, 11, 31); // Dec 2025
    
    let currentDate = startOfMonth(startDate);
    
    while (currentDate <= endDate) {
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();
      const daysInMonth = getDaysInMonth(currentDate);
      
      // Count entries for this month from mock data
      const monthStart = startOfMonth(currentDate).toISOString();
      const monthEnd = endOfMonth(currentDate).toISOString();
      
      const entriesInMonth = mockEntries.filter(entry => {
        const entryDate = parseISO(entry.date);
        return entryDate >= parseISO(monthStart) && entryDate <= parseISO(monthEnd);
      });
      
      cards.push({
        month,
        year,
        entriesCount: entriesInMonth.length,
        daysInMonth,
        progressPercentage: (entriesInMonth.length / daysInMonth) * 100
      });
      
      // Move to next month
      currentDate = new Date(year, month + 1, 1);
    }
    
    setMonthCards(cards);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            #100DaysOfCode Progress
          </h1>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {mockUserStats.currentStreak} days
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Days</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {mockUserStats.totalDays} days
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {monthCards.map((card) => (
            <Link 
              href={`/progress/${card.year}/${card.month + 1}`} 
              key={`${card.year}-${card.month}`}
              className="block group"
            >
              <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg transform hover:-translate-y-1">
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {format(new Date(card.year, card.month, 1), 'MMMM yyyy')}
                  </h2>
                  
                  <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${Math.min(card.progressPercentage, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {card.entriesCount} / {card.daysInMonth} days
                    </p>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {Math.round(card.progressPercentage)}%
                    </p>
                  </div>
                </div>
                
                {card.entriesCount > 0 && (
                  <div className="px-5 py-3 bg-gray-50 dark:bg-neutral-700 flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {card.entriesCount} entries
                    </span>
                    <span className="text-sm text-indigo-600 dark:text-indigo-400 group-hover:underline">
                      View details →
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 