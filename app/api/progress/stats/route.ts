import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserStats } from '@/lib/db/progress-service';

// GET /api/progress/stats
export async function GET(request: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Get user stats
    const stats = await getUserStats(session.user.id);
    
    return NextResponse.json({
      stats: {
        totalDays: stats.totalDays,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        lastPostedDate: stats.lastPostedDate ? stats.lastPostedDate.toISOString() : null,
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 });
  }
} 