"use client";

import React from "react";
import Image from "next/image";
import { formatDate } from "@/lib/utils";

interface MemoryCardProps {
  imageUrl: string;
  date: Date | string;
  description: string;
}

export default function MemoryCard({
  imageUrl,
  date,
  description,
}: MemoryCardProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 mb-6">
      <div className="relative h-64 w-full">
        <Image
          src={imageUrl}
          alt={description.substring(0, 30)}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-5">
        <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-2">
          {formatDate(date)}
        </p>
        <div className="text-gray-700 dark:text-gray-300 text-base mb-4">
          {description}
        </div>
      </div>
    </div>
  );
} 