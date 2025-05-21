import { prisma } from '@/lib/prisma';
import { format, parseISO, startOfDay, endOfDay, subDays } from 'date-fns';
import { ProgressEntry } from '@/lib/types';

// Types for database operations
type CreateProgressEntryInput = {
  userId: string;
  date: string;
  title: string;
  description?: string;
  images: string[];
};

type UpdateProgressEntryInput = {
  id: string;
  title?: string;
  description?: string;
  images?: string[];
};

export async function createProgressEntry(input: CreateProgressEntryInput) {
  const { userId, date, title, description, images } = input;
  
  // Parse the date string to a Date object
  const entryDate = parseISO(date);
  
  // Start a transaction to ensure data consistency
  const result = await prisma.$transaction(async (tx) => {
    // Create the progress entry
    const entry = await tx.progressEntry.create({
      data: {
        date: entryDate,
        title,
        description,
        postedAt: new Date(),
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    
    // Create the progress images
    if (images && images.length > 0) {
      await Promise.all(
        images.map((url) =>
          tx.progressImage.create({
            data: {
              url,
              progressEntry: {
                connect: {
                  id: entry.id,
                },
              },
            },
          })
        )
      );
    }
    
    // Create or update the calendar event
    if (images && images.length > 0) {
      await tx.calendarEvent.create({
        data: {
          title,
          date: entryDate,
          imageUrl: images[0],
          category: 'work',
          progressEntry: {
            connect: {
              id: entry.id,
            },
          },
        },
      });
    }
    
    // Update user stats
    await updateUserStats(tx, userId);
    
    // Return the created entry with its images
    return tx.progressEntry.findUnique({
      where: { id: entry.id },
      include: {
        images: true,
      },
    });
  });
  
  return result;
}

export async function updateProgressEntry(input: UpdateProgressEntryInput) {
  const { id, title, description, images } = input;
  
  // Start a transaction to ensure data consistency
  const result = await prisma.$transaction(async (tx) => {
    // Update the progress entry
    const entry = await tx.progressEntry.update({
      where: { id },
      data: {
        title,
        description,
        updatedAt: new Date(),
      },
      include: {
        images: true,
      },
    });
    
    // If new images are provided, delete existing ones and create new ones
    if (images) {
      // Delete existing images
      await tx.progressImage.deleteMany({
        where: {
          progressEntryId: id,
        },
      });
      
      // Create new images
      await Promise.all(
        images.map((url) =>
          tx.progressImage.create({
            data: {
              url,
              progressEntry: {
                connect: {
                  id,
                },
              },
            },
          })
        )
      );
      
      // Update the calendar event
      if (images.length > 0) {
        await tx.calendarEvent.upsert({
          where: {
            progressEntryId: id,
          },
          update: {
            title: title || entry.title,
            imageUrl: images[0],
            updatedAt: new Date(),
          },
          create: {
            title: title || entry.title,
            date: entry.date,
            imageUrl: images[0],
            category: 'work',
            progressEntry: {
              connect: {
                id,
              },
            },
          },
        });
      }
    }
    
    // Return the updated entry with its new images
    return tx.progressEntry.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });
  });
  
  return result;
}

export async function getProgressEntriesForMonth(userId: string, year: number, month: number) {
  // Create start and end dates for the month
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // Last day of the month
  
  // Query entries for the month
  const entries = await prisma.progressEntry.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      images: true,
    },
    orderBy: {
      date: 'desc',
    },
  });
  
  // Convert to the ProgressEntry type from our types.ts file
  return entries.map((entry) => ({
    id: entry.id,
    userId: entry.userId,
    date: format(entry.date, 'yyyy-MM-dd'),
    title: entry.title,
    description: entry.description || '',
    images: entry.images.map((image) => image.url),
    postedAt: entry.postedAt.toISOString(),
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }));
}

export async function getProgressEntryForDay(userId: string, date: string) {
  const parsedDate = parseISO(date);
  const dayStart = startOfDay(parsedDate);
  const dayEnd = endOfDay(parsedDate);
  
  const entry = await prisma.progressEntry.findFirst({
    where: {
      userId,
      date: {
        gte: dayStart,
        lte: dayEnd,
      },
    },
    include: {
      images: true,
    },
  });
  
  if (!entry) return null;
  
  return {
    id: entry.id,
    userId: entry.userId,
    date: format(entry.date, 'yyyy-MM-dd'),
    title: entry.title,
    description: entry.description || '',
    images: entry.images.map((image) => image.url),
    postedAt: entry.postedAt.toISOString(),
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

export async function getUserStats(userId: string) {
  let stats = await prisma.userStats.findUnique({
    where: {
      userId,
    },
  });
  
  if (!stats) {
    // Create stats if they don't exist
    stats = await prisma.userStats.create({
      data: {
        userId,
        totalDays: 0,
        currentStreak: 0,
        longestStreak: 0,
      },
    });
  }
  
  return stats;
}

// Helper function to update user stats
async function updateUserStats(tx: any, userId: string) {
  // Get all user entries ordered by date
  const entries = await tx.progressEntry.findMany({
    where: {
      userId,
    },
    orderBy: {
      date: 'asc',
    },
  });
  
  const totalDays = entries.length;
  let currentStreak = 0;
  let longestStreak = 0;
  let lastPostedDate = null;
  
  if (entries.length > 0) {
    lastPostedDate = entries[entries.length - 1].date;
    
    // Calculate streaks
    let currentStreakCount = 1;
    let maxStreakCount = 1;
    
    for (let i = 1; i < entries.length; i++) {
      const prevDate = new Date(entries[i - 1].date);
      const currDate = new Date(entries[i].date);
      
      // Check if the current date is the day after the previous date
      prevDate.setDate(prevDate.getDate() + 1);
      
      if (
        prevDate.getFullYear() === currDate.getFullYear() &&
        prevDate.getMonth() === currDate.getMonth() &&
        prevDate.getDate() === currDate.getDate()
      ) {
        // Consecutive day, increment current streak
        currentStreakCount++;
        maxStreakCount = Math.max(maxStreakCount, currentStreakCount);
      } else {
        // Streak broken
        currentStreakCount = 1;
      }
    }
    
    // Check if the current streak is still active (last entry is today or yesterday)
    const lastEntryDate = new Date(entries[entries.length - 1].date);
    const today = new Date();
    const yesterday = subDays(today, 1);
    
    if (
      format(lastEntryDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') ||
      format(lastEntryDate, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')
    ) {
      currentStreak = currentStreakCount;
    } else {
      currentStreak = 0;
    }
    
    longestStreak = maxStreakCount;
  }
  
  // Update the user stats
  await tx.userStats.upsert({
    where: {
      userId,
    },
    update: {
      totalDays,
      currentStreak,
      longestStreak,
      lastPostedDate,
      updatedAt: new Date(),
    },
    create: {
      userId,
      totalDays,
      currentStreak,
      longestStreak,
      lastPostedDate,
      updatedAt: new Date(),
    },
  });
} 