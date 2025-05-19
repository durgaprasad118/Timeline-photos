import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Timeline } from "@/app/components/ui/timeline";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import Image from "next/image";
import MemoryCard from "@/app/components/ui/memory-card";
import Link from "next/link";

interface CollectionPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const collection = await db.collection.findUnique({
    where: { id: params.id },
  });

  return {
    title: collection ? `${collection.title} | Memories` : "Collection",
    description: collection?.description || "View your memories",
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const collection = await db.collection.findUnique({
    where: { id: params.id },
    include: {
      memories: {
        orderBy: {
          date: "desc",
        },
      },
    },
  });

  if (!collection) {
    redirect("/collections");
  }

  // Verify the user has access to this collection
  if (collection.userId !== session.user?.id && !collection.isPublic) {
    redirect("/collections");
  }

  const timelineData = collection.memories.map((memory) => ({
    title: formatDate(memory.date),
    content: (
      <MemoryCard
        imageUrl={memory.image}
        date={memory.date}
        description={memory.description || ""}
      />
    ),
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <div className="relative h-64 md:h-80 w-full bg-indigo-600 dark:bg-indigo-800 overflow-hidden">
        {collection.coverImage && (
          <Image
            src={collection.coverImage}
            alt={collection.title}
            fill
            className="object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-indigo-900/40 flex items-center justify-center">
          <div className="text-center p-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {collection.title}
            </h1>
            {collection.description && (
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                {collection.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/collections"
            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Collections
          </Link>
          <Link
            href={`/collections/${collection.id}/add-memory`}
            className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
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
            Add Memory
          </Link>
        </div>

        {collection.memories.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-medium text-gray-600 dark:text-gray-400 mb-4">
              No memories in this collection yet
            </h2>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              Start adding memories to create your timeline
            </p>
            <Link
              href={`/collections/${collection.id}/add-memory`}
              className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
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
              Add Your First Memory
            </Link>
          </div>
        ) : (
          <Timeline data={timelineData} />
        )}
      </div>
    </div>
  );
} 