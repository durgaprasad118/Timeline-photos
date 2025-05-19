"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CollectionCardProps {
  id: string;
  title: string;
  description?: string | null;
  coverImage?: string | null;
  memoryCount: number;
  isPublic: boolean;
}

export default function CollectionCard({
  id,
  title,
  description,
  coverImage,
  memoryCount,
  isPublic,
}: CollectionCardProps) {
  return (
    <Link href={`/collections/${id}`}>
      <div className="group relative bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-[280px] transform hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
        
        <div className="relative h-full w-full">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 h-full w-full flex items-center justify-center">
              <span className="text-4xl text-white opacity-30">
                {title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
              {description && (
                <p className="text-sm text-gray-200 line-clamp-2">{description}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className={cn(
                "text-xs px-2 py-1 rounded-full",
                isPublic 
                  ? "bg-green-500/70 text-white" 
                  : "bg-gray-600/70 text-white"
              )}>
                {isPublic ? "Public" : "Private"}
              </span>
              <span className="bg-indigo-500/70 text-white text-xs px-2 py-1 rounded-full">
                {memoryCount} {memoryCount === 1 ? "memory" : "memories"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 