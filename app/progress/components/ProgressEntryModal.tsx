'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import Image from 'next/image';
import { ProgressEntry } from '@/lib/types';
import { uploadImageToServer, getMockImageUrl } from '@/lib/image-client';

interface ProgressEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  onSave: (entry: Omit<ProgressEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Partial<ProgressEntry>;
  isEditing?: boolean;
}

// Define the keyframes style as a string to inject into the document
const spinKeyframes = `
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
`;

export default function ProgressEntryModal({
  isOpen,
  onClose,
  date,
  onSave,
  initialData,
  isEditing = false,
}: ProgressEntryModalProps) {
  console.log('ProgressEntryModal render:', { isOpen, date, isEditing });
  
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.images || []);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  
  // Handle client-side only rendering
  useEffect(() => {
    setIsMounted(true);
    
    // Inject the keyframes animation into the document
    if (!document.getElementById('spin-keyframes')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'spin-keyframes';
      styleElement.textContent = spinKeyframes;
      document.head.appendChild(styleElement);
    }
    
    return () => {
      // Clean up the style element when component unmounts
      const styleElement = document.getElementById('spin-keyframes');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);
  
  useEffect(() => {
    if (isOpen && isMounted) {
      console.log('Modal opened with date:', date);
      // Reset form when initialData changes
      if (initialData) {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setImageUrls(initialData.images || []);
      } else {
        setTitle('');
        setDescription('');
        setImageUrls([]);
      }
      setSelectedFiles([]);
      setErrorMessage('');
    }
  }, [isOpen, initialData, date, isMounted]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Function to upload image or use mock in development
  const uploadImageFile = async (file: File): Promise<string> => {
    try {
      // In a production environment, upload the file to the server
      // In development, we can optionally use mock images
      if (process.env.NODE_ENV === 'development' && process.env.USE_MOCK_IMAGES === 'true') {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return getMockImageUrl();
      } else {
        // Upload the image and get the URL
        return await uploadImageToServer(file);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Check if adding these files would exceed the 3 image limit
      if (imageUrls.length + files.length > 3) {
        setErrorMessage('Maximum 3 images are allowed');
        return;
      }
      
      // Store selected files for later upload
      setSelectedFiles(prev => [...prev, ...files]);
      
      // Generate temporary mock URLs for preview
      // In production, these would be replaced with actual URLs after upload
      const tempUrls = files.map(() => getMockImageUrl());
      setImageUrls(prev => [...prev, ...tempUrls]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setErrorMessage('');
    }
  };
  
  const removeImage = (index: number) => {
    // If it's a newly selected file, remove from selectedFiles
    if (index >= (initialData?.images?.length || 0)) {
      const newSelectedFiles = [...selectedFiles];
      newSelectedFiles.splice(index - (initialData?.images?.length || 0), 1);
      setSelectedFiles(newSelectedFiles);
    }
    
    // Remove from imageUrls
    const newImageUrls = [...imageUrls];
    newImageUrls.splice(index, 1);
    setImageUrls(newImageUrls);
    
    setErrorMessage('');
  };
  
  // Close modal handler with proper cleanup
  const handleModalClose = useCallback(() => {
    // Clean up any URL objects before closing
    imageUrls.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    
    // Clear state
    setSelectedFiles([]);
    setErrorMessage('');
    
    // Invoke the parent's close handler
    onClose();
  }, [imageUrls, onClose]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission initiated');
    
    if (!title.trim()) {
      setErrorMessage('Title is required');
      return;
    }
    
    if (isUploading) {
      console.log('Submission in progress, ignoring duplicate request');
      return; // Prevent multiple submissions
    }
    
    // Set uploading state to disable button and show spinner
    setIsUploading(true);
    
    // Use a small timeout to ensure UI state updates first
    setTimeout(async () => {
      try {
        // Create stable date strings
        const formattedDate = format(date, 'yyyy-MM-dd');
        const now = new Date();
        now.setMilliseconds(0); // Remove milliseconds for stability
        
        // Process any new file uploads
        let finalImageUrls = [...(initialData?.images || [])];
        
        if (selectedFiles.length > 0) {
          // Upload all selected files
          const uploadPromises = selectedFiles.map(file => uploadImageFile(file));
          const uploadedUrls = await Promise.all(uploadPromises);
          
          // Combine existing and new image URLs
          finalImageUrls = [...finalImageUrls, ...uploadedUrls];
        }
        
        // Create the entry data with stable date strings and real uploaded image URLs
        const entryData: Omit<ProgressEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
          date: formattedDate,
          title,
          description,
          images: finalImageUrls,
          postedAt: now.toISOString(),
        };
        
        console.log('Saving entry with uploaded images:', entryData);
        
        // Save and close
        onSave(entryData);
        handleModalClose();
      } catch (error) {
        console.error('Error saving entry:', error);
        setErrorMessage('Failed to save entry. Please try again.');
        setIsUploading(false);
      }
    }, 50);
  };
  
  // Don't render anything on the server or if modal is closed
  if (!isMounted || !isOpen) {
    return null;
  }
  
  console.log('Rendering modal content');
  
  // Using inline styles to ensure the modal is visible
  const modalStyles = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  };
  
  const modalContentStyles = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
  };
  
  const spinnerStyles = {
    marginRight: '8px',
    height: '16px',
    width: '16px',
    animation: 'spin 1s linear infinite',
  };
  
  return (
    <div style={modalStyles} onClick={handleModalClose}>
      <div style={modalContentStyles} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          {isEditing ? 'Edit' : 'Add'} Progress for {format(date, 'MMMM d, yyyy')}
        </h3>
        
        <form onSubmit={handleSubmit}>
          {errorMessage && (
            <div style={{ padding: '8px', backgroundColor: '#fee2e2', color: '#ef4444', marginBottom: '16px', borderRadius: '4px' }}>
              {errorMessage}
            </div>
          )}
          
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="title" style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
              Title *
            </label>
            <input
              type="text"
              id="title"
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                border: '1px solid #d1d5db',
                borderRadius: '4px'
              }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What did you work on today?"
              required
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
              Description
            </label>
            <textarea
              id="description"
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                minHeight: '120px'
              }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share the details of what you learned or built today..."
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
              Images (Max 3)
            </label>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {imageUrls.map((url, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <div style={{ height: '80px', width: '80px', overflow: 'hidden', borderRadius: '4px', border: '1px solid #d1d5db' }}>
                    <Image
                      src={url}
                      alt={`Selected image ${index + 1}`}
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{ 
                      position: 'absolute', 
                      top: '-8px', 
                      right: '-8px', 
                      backgroundColor: '#ef4444',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {imageUrls.length < 3 && (
                <div>
                  <label
                    htmlFor="file-upload"
                    style={{ 
                      height: '80px', 
                      width: '80px', 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed #d1d5db',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ height: '24px', width: '24px', color: '#9ca3af' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    accept="image/*"
                    ref={fileInputRef}
                  />
                </div>
              )}
            </div>
            <p style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
              Upload up to 3 images to showcase your progress
            </p>
          </div>
          
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={handleModalClose}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#4f46e5',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 500,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                opacity: isUploading ? 0.5 : 1,
                cursor: isUploading ? 'not-allowed' : 'pointer'
              }}
            >
              {isUploading ? (
                <>
                  <svg style={spinnerStyles} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 