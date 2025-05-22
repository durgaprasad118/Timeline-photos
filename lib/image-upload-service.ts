'use server';

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

/**
 * Uploads a file to the server and returns the URL path
 */
export async function uploadImage(file: File): Promise<string> {
  try {
    // Create the upload directory if it doesn't exist
    await ensureUploadDir();
    
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
    return relativePath;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * For dev/mock environments, we just return a static image URL
 */
export function getMockImageUrl(): string {
  // Return a random Unsplash image for development
  const mockUrls = [
    'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=500&h=500&fit=crop',
  ];
  
  const index = Math.floor(Math.random() * mockUrls.length);
  return mockUrls[index];
} 