'use client';

import React from 'react';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { ProgressEntry } from '@/lib/types';

interface ProgressTimelineProps {
  entries: ProgressEntry[];
  onEdit: (entry: ProgressEntry) => void;
}

export default function ProgressTimeline({ entries, onEdit }: ProgressTimelineProps) {
  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {sortedEntries.map((entry, entryIdx) => (
          <li key={entry.id}>
            <div className="relative pb-8">
              {entryIdx !== sortedEntries.length - 1 ? (
                <span
                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                  aria-hidden="true"
                />
              ) : null}
              
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center ring-8 ring-white dark:ring-neutral-800">
                    <span className="text-white font-medium text-sm">
                      {format(parseISO(entry.date), 'd')}
                    </span>
                  </div>
                </div>
                
                <div className="min-w-0 flex-1 bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4">
                  <div>
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {entry.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {format(parseISO(entry.date), 'MMMM d, yyyy')}
                        </p>
                        <button
                          type="button"
                          onClick={() => onEdit(entry)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                          aria-label="Edit"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {entry.description && (
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                        {entry.description}
                      </p>
                    )}
                    
                    {entry.images && entry.images.length > 0 && (
                      <div className="mt-3 flex space-x-2 overflow-x-auto pb-2">
                        {entry.images.map((image, idx) => (
                          <div
                            key={idx}
                            className="h-32 w-32 flex-shrink-0 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700"
                          >
                            <Image
                              src={image}
                              alt={`Image for ${entry.title}`}
                              width={128}
                              height={128}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Posted at {format(parseISO(entry.postedAt), 'h:mm a')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 