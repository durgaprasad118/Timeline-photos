'use client';

import { ProgressEntry } from './types';

/**
 * Fetch progress entries for a specific month
 */
export async function getProgressEntriesForMonth(year: number, month: number): Promise<ProgressEntry[]> {
  try {
    const response = await fetch(`/api/progress?year=${year}&month=${month}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch progress entries');
    }

    const data = await response.json();
    return data.entries;
  } catch (error) {
    console.error('Error fetching progress entries:', error);
    return [];
  }
}

/**
 * Create a new progress entry
 */
export async function createProgressEntry(entry: Omit<ProgressEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ProgressEntry | null> {
  try {
    const response = await fetch('/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create progress entry');
    }

    const data = await response.json();
    return data.entry;
  } catch (error) {
    console.error('Error creating progress entry:', error);
    return null;
  }
}

/**
 * Update an existing progress entry
 */
export async function updateProgressEntry(entry: Partial<ProgressEntry> & { id: string }): Promise<ProgressEntry | null> {
  try {
    const response = await fetch('/api/progress', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update progress entry');
    }

    const data = await response.json();
    return data.entry;
  } catch (error) {
    console.error('Error updating progress entry:', error);
    return null;
  }
} 