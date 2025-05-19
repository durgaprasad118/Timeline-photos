import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import CollectionCard from "../components/collection-card";
import { PrismaClient } from "@/app/generated/prisma";

export default async function CollectionsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }
  
  // Use the singleton db instance instead of creating a new one
  const collections = await db.collection.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      _count: {
        select: {
          memories: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <div className="bg-indigo-600 dark:bg-indigo-800 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">My Collections</h1>
              <p className="mt-2 text-indigo-100">
                Organize your memories into collections
              </p>
            </div>
            <Link
              href="/collections/create"
              className="inline-flex items-center bg-white hover:bg-gray-100 text-indigo-600 font-medium py-2 px-4 rounded-md"
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
              New Collection
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {collections.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-xl shadow-sm">
            <h2 className="text-2xl font-medium text-gray-600 dark:text-gray-300 mb-4">
              You don't have any collections yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Create your first collection to start organizing your memories
            </p>
            <Link
              href="/collections/create"
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
              Create Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                id={collection.id}
                title={collection.title}
                description={collection.description}
                coverImage={collection.coverImage}
                memoryCount={collection._count.memories}
                isPublic={collection.isPublic}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 