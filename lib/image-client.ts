'use client';

/**
 * Client-side utility for uploading images
 */
export async function uploadImageToServer(file: File): Promise<string> {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Send the request to our API endpoint
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload image');
    }
    
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
}

/**
 * For development/testing, we can use mock image URLs
 */
export function getMockImageUrl(): string {
  // Provide mock URLs for development
  const mockUrls = [
    'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=500&h=500&fit=crop',
    'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=500&h=500&fit=crop',
  ];
  
  const index = Math.floor(Math.random() * mockUrls.length);
  return mockUrls[index];
} 