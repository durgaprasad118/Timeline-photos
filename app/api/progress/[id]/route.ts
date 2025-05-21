import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { updateProgressEntry } from '@/lib/db/progress-service';

// GET /api/progress/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;
    
    // Fetch the entry with its images
    const entry = await prisma.progressEntry.findUnique({
      where: {
        id,
      },
      include: {
        images: true,
      },
    });
    
    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    
    // Check if the entry belongs to the authenticated user
    if (entry.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Transform the entry to match our frontend model
    const transformedEntry = {
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
    
    return NextResponse.json({ entry: transformedEntry });
  } catch (error) {
    console.error('Error fetching progress entry:', error);
    return NextResponse.json({ error: 'Failed to fetch progress entry' }, { status: 500 });
  }
}

// PATCH /api/progress/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = params;
    const body = await request.json();
    const { title, description, images } = body;
    
    // Check if the entry exists and belongs to the user
    const existingEntry = await prisma.progressEntry.findUnique({
      where: {
        id,
      },
    });
    
    if (!existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    
    if (existingEntry.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Update the entry
    const updatedEntry = await updateProgressEntry({
      id,
      title,
      description,
      images,
    });
    
    // Transform the updated entry to match our frontend model
    const transformedEntry = {
      id: updatedEntry.id,
      userId: updatedEntry.userId,
      date: format(updatedEntry.date, 'yyyy-MM-dd'),
      title: updatedEntry.title,
      description: updatedEntry.description || '',
      images: updatedEntry.images.map((image) => image.url),
      postedAt: updatedEntry.postedAt.toISOString(),
      createdAt: updatedEntry.createdAt.toISOString(),
      updatedAt: updatedEntry.updatedAt.toISOString(),
    };
    
    return NextResponse.json({ entry: transformedEntry });
  } catch (error) {
    console.error('Error updating progress entry:', error);
    return NextResponse.json({ error: 'Failed to update progress entry' }, { status: 500 });
  }
}

// DELETE /api/progress/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = params;
    
    // Check if the entry exists and belongs to the user
    const existingEntry = await prisma.progressEntry.findUnique({
      where: {
        id,
      },
    });
    
    if (!existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    
    if (existingEntry.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Delete the entry and related records in a transaction
    await prisma.$transaction([
      // Delete related images
      prisma.progressImage.deleteMany({
        where: {
          progressEntryId: id,
        },
      }),
      // Delete related calendar event
      prisma.calendarEvent.deleteMany({
        where: {
          progressEntryId: id,
        },
      }),
      // Delete the entry itself
      prisma.progressEntry.delete({
        where: {
          id,
        },
      }),
    ]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting progress entry:', error);
    return NextResponse.json({ error: 'Failed to delete progress entry' }, { status: 500 });
  }
} 