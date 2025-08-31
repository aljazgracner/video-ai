# YouTube Video Transcript Generator

A Next.js application that processes YouTube videos to extract transcripts and generate logical segments using Google's Gemini AI.

## Features

-   Extract video information from YouTube URLs
-   Download and process video transcripts
-   Use Gemini AI to create meaningful logical segments
-   Store video data and transcripts in PostgreSQL database
-   Clean, responsive UI for video processing

## Architecture

This project follows Domain-Driven Design (DDD) principles:

-   **Domain Layer**: Entities, repositories, and domain services
-   **Application Layer**: Application services that orchestrate domain operations
-   **Infrastructure Layer**: Database implementations, external API services
-   **Presentation Layer**: Next.js API routes and React components

## Tech Stack

-   **Frontend**: Next.js 15, React 19, Tailwind CSS
-   **Backend**: Next.js API routes
-   **Database**: PostgreSQL with Drizzle ORM
-   **AI**: Google Gemini API
-   **Video Processing**: youtube-dl-exec for YouTube video extraction

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy the example environment file and update it with your actual values:

```bash
cp env.example .env
```

Then edit the `.env` file with your actual API keys and database connection:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://username:password@localhost:5432/youtube_generator
```

### 3. Database Setup

Generate and run database migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 4. Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

1. Enter a YouTube video URL in the input field
2. Click "Process Video" to extract the transcript
3. The application will:
    - Extract video metadata (title, duration, thumbnail)
    - Download the video transcript
    - Use Gemini AI to create logical segments
    - Store everything in the database
    - Display the results in the UI

## API Endpoints

-   `POST /api/videos/process` - Process a YouTube video and generate transcript

## Database Schema

-   **videos**: Stores video metadata
-   **transcripts**: Stores processed transcripts with logical segments

## Project Structure

```
src/
├── domain/                 # Domain layer
│   ├── entities/          # Domain entities
│   ├── repositories/      # Repository interfaces
│   └── services/          # Domain service interfaces
├── application/           # Application layer
│   └── services/          # Application services
└── infrastructure/        # Infrastructure layer
    ├── database/          # Database schema and connection
    ├── repositories/      # Repository implementations
    └── services/          # External service implementations
```

## Contributing

1. Follow DDD principles
2. Keep domain logic separate from infrastructure concerns
3. Use TypeScript for type safety
4. Write clean, maintainable code
