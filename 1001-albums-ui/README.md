# 1001 Albums Journey UI

A modern, interactive React application to track your progress through the "1001 Albums You Must Hear Before You Die" challenge. This app interfaces with the 1001 Albums Generator API and enhances the experience with rich visuals, stats, and discovery features.

## Key Features

### 🎵 Album of the Day (Hero)
- **Interactive 3D Card**: Flip the album art to read stats, reviews, and summaries.
- **Similar Albums Carousel**: Discover recommendations based on the current artist, fetched via Last.fm.
- **Direct Streaming Integration**: One-click listening on **Spotify** or **Apple Music**.
- **Spoiler Protection**: Smart filtering that prevents recommending albums that are already part of the 1001 list (including Remastered/Deluxe versions) to avoid spoiling future days.

### 📜 History & Discovery
- **Visual History Grid**: Browse your past listening journey in a responsive grid.
- **Tabbed Modal Interface**: Click any album to see details or switch to the **Similar Albums** view.
- **2x3 Grid Layout**: A clean, compact grid layout for recommendations within the history modal.
- **Hover Play Button**: Quick access to streaming links by hovering over similar album cards.

### 📊 Statistics
- **Rating Distribution**: Visualize how you've rated albums over time.
- **Progress Tracking**: See your completion status at a glance.

## Technical Highlights
- **Framework**: React + Vite
- **Styling**: Vanilla CSS with Glassmorphism aesthetics and responsive design.
- **APIs**:
  - **1001 Albums Generator**: Core project data.
  - **Last.fm**: Finding similar artists and albums.
  - **Wikipedia**: Fetching album summaries.
- **Icons**: Lucide React

## Setup
1. Clone the repo.
2. Run `npm install`.
3. Create a `.env.local` with your `VITE_LASTFM_API_KEY`.
4. Run `npm run dev`.
