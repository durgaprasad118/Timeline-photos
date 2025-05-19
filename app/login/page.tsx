import GoogleLoginButton from "../components/GoogleLoginButton";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Welcome</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your memories
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  );
} 