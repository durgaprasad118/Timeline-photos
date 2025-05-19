"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function GoogleLoginButton() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="flex items-center justify-center w-full px-4 py-2 mt-4 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <svg
        className="w-5 h-5 mr-2"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M19.6 10.2c0-.7-.1-1.4-.2-2H10v3.8h5.4c-.2 1.2-1 2.3-2.1 3v2.5h3.4c2-1.8 3.1-4.5 3.1-7.3z"
          fill="#4285F4"
        />
        <path
          d="M10 20c2.9 0 5.3-.9 7-2.5l-3.4-2.5c-.9.6-2.1 1-3.6 1-2.8 0-5.1-1.9-6-4.4H.5v2.6C2.2 17.8 5.8 20 10 20z"
          fill="#34A853"
        />
        <path
          d="M4 11.6c-.2-.6-.4-1.3-.4-2s.2-1.4.4-2V5H.5C.2 6.2 0 7.6 0 9c0 1.4.2 2.8.5 4l3.5-1.4z"
          fill="#FBBC05"
        />
        <path
          d="M10 3.6c1.6 0 3 .5 4.1 1.6l3-3C15.3.8 12.9 0 10 0 5.8 0 2.2 2.2.5 5.6L4 7.2c.9-2.5 3.2-4.4 6-4.4z"
          fill="#EA4335"
        />
      </svg>
      Sign in with Google
    </button>
  );
} 