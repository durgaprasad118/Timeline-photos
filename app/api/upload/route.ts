import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';

// Define the upload directory - this could be configurable via env variables
const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), 'public', 'uploads');

// Ensure the upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Create the upload directory if it doesn't exist
    await ensureUploadDir();
    
    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }
    
    // Generate a unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = join(UPLOAD_DIR, fileName);
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Write the file to disk
    await writeFile(filePath, buffer);
    
    // Return the URL path (not the absolute path)
    const relativePath = `/uploads/${fileName}`;
    
    console.log(`Image uploaded: ${relativePath}`);
    
    return NextResponse.json({ url: relativePath });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
} 