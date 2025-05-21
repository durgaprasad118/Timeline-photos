'use client';

import React, { useState, useRef } from 'react';
import { format } from 'date-fns';
import Image from 'next/image';
import { uploadImageAction } from "@/app/actions/cloudinary-actions";
import { ProgressEntry } from '@/lib/types';

interface ProgressEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  onSave: (entry: Omit<ProgressEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Partial<ProgressEntry>;
  isEditing?: boolean;
}

export default function ProgressEntryModal({
  isOpen,
  onClose,
  date,
  onSave,
  initialData,
  isEditing = false,
}: ProgressEntryModalProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(initialData?.images || []);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Check if adding these files would exceed the 3 image limit
      if (imageUrls.length + files.length > 3) {
        setErrorMessage('Maximum 3 images are allowed');
        return;
      }
      
      setSelectedFiles(prev => [...prev, ...files]);
      
      // Create preview URLs for the selected files
      const newImageUrls = files.map(file => URL.createObjectURL(file));
      setImageUrls(prev => [...prev, ...newImageUrls]);
      
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
  
  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setErrorMessage('Title is required');
      return;
    }
    
    if (isUploading) {
      return; // Prevent multiple submissions
    }
    
    try {
      setIsUploading(true);
      
      // Upload new images if any
      let allImageUrls = [...imageUrls];
      
      if (selectedFiles.length > 0) {
        // Remove preview URLs for newly selected files
        allImageUrls = allImageUrls.slice(0, initialData?.images?.length || 0);
        
        // Upload new files to Cloudinary
        const uploadPromises = selectedFiles.map(async (file) => {
          try {
            // Convert file to base64
            const base64Data = await fileToBase64(file);
            
            // Upload to Cloudinary
            return await uploadImageAction(base64Data);
          } catch (error) {
            console.error('Error processing file:', error);
            throw error;
          }
        });
        
        const uploadedUrls = await Promise.all(uploadPromises);
        allImageUrls = [...allImageUrls, ...uploadedUrls];
      }
      
      // Format the current time
      const now = new Date();
      
      // Prepare the entry data
      const entryData: Omit<ProgressEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
        date: format(date, 'yyyy-MM-dd'),
        title,
        description,
        images: allImageUrls,
        postedAt: now.toISOString(),
      };
      
      onSave(entryData);
      onClose();
    } catch (error) {
      console.error('Error saving entry:', error);
      setErrorMessage('Failed to save entry. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-neutral-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-title">
              {isEditing ? 'Edit' : 'Add'} Progress for {format(date, 'MMMM d, yyyy')}
            </h3>
            
            <form onSubmit={handleSubmit} className="mt-4">
              {errorMessage && (
                <div className="mb-4 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-md">
                  {errorMessage}
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What did you work on today?"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 min-h-[120px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share the details of what you learned or built today..."
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Images (Max 3)
                </label>
                
                <div className="flex items-center flex-wrap gap-3 mt-2">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <div className="h-20 w-20 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
                        <Image
                          src={url}
                          alt={`Selected image ${index + 1}`}
                          width={80}
                          height={80}
                          className="object-cover h-full w-full"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center text-xs"
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
                        className="h-20 w-20 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-gray-400 dark:text-gray-500"
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
                        className="sr-only"
                        onChange={handleFileChange}
                        accept="image/*"
                        ref={fileInputRef}
                      />
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Upload up to 3 images to showcase your progress
                </p>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
      </div>
    </div>
  );
} 