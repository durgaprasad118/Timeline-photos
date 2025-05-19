# Memories App

A Next.js application for storing and sharing memories with Google Authentication.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables by creating a `.env.local` file:
   ```
   # Database
   DATABASE_URL="your_database_url_here"

   # Next Auth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your_nextauth_secret" # Generate with `openssl rand -base64 32`

   # Google Provider
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   ```

4. Set up Google OAuth credentials:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application" as the application type
   - Add "http://localhost:3000" to Authorized JavaScript origins
   - Add "http://localhost:3000/api/auth/callback/google" to Authorized redirect URIs
   - Copy the Client ID and Client Secret to your `.env.local` file

5. Generate Prisma client:
   ```
   npx prisma generate
   ```

6. Run the database migrations:
   ```
   npx prisma migrate dev
   ```

7. Start the development server:
   ```
   npm run dev
   ```

## Features

- Google OAuth authentication
- User profiles
- Responsive design
