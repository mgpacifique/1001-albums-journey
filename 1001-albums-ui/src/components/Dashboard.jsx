import React from 'react';
import AlbumHero from './AlbumHero';
import { Star, Disc, Calendar, Music, Radio } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard({ data, musicPlatform, onTogglePlatform }) {

    if (!data) return null;

    // --- Calcs for Project Overview ---
    const totalAlbums = 1089; // Updated per user request (book editions added up)
    const generatedCount = (data.history?.length || 0) + (data.currentAlbum ? 1 : 0);
    const remainingCount = Math.max(0, totalAlbums - generatedCount);
    const progressPercent = Math.min(100, Math.round((generatedCount / totalAlbums) * 100));

    // Live Global Average (from history)
    const history = data.history || [];
    const avgGlobalRating = history.length > 0
        ? (history.reduce((a, b) => a + (b.globalRating || 0), 0) / history.length).toFixed(2)
        : 'N/A';

    // Start Date (Oldest generatedAt)
    const sortedHistory = [...history].sort((a, b) => new Date(a.generatedAt) - new Date(b.generatedAt));
    const startDate = sortedHistory.length > 0
        ? new Date(sortedHistory[0].generatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Not started';

    // Collage Images (Last 20 or random?) - Let's take valid images from history
    // Collage Images: Combine current + history to ensure "hand in hand" count
    const allAlbums = data.currentAlbum ? [data.currentAlbum, ...history] : history;
    const collageImages = allAlbums
        .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt)) // Newest first
        .filter((h, index, self) =>
            // Filter duplicates (by name) and valid images
            (h.images?.[0]?.url || h.image) &&
            index === self.findIndex(t => t.name === h.name)
        )
        .slice(0, 50); // Increased limit to fill responsive grid

    return (
        <div className="dashboard container">
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>Hello, {data.name}!</h1>
                    <p style={{ color: '#a1a1aa' }}>Here is your album for today.</p>
                </div>
            </header>

            <main>
                {/* 1. HERO ALBUM (Album of the Day) */}
                {data.currentAlbum ? (
                    <AlbumHero album={data.currentAlbum} musicPlatform={musicPlatform} />
                ) : (
                    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                        <h2>No album for today!</h2>
                    </div>
                )}

                {/* 2. PROJECT OVERVIEW SECTION (New) */}
                <div className="project-overview-section animate-fade-in" style={{ animationDelay: '0.1s' }}>

                    {/* Hero Collage */}
                    <div className="dashboard-collage glass-panel">
                        <div className="collage-grid">
                            {collageImages.map((img, i) => (
                                <div key={i} className="collage-item">
                                    <img
                                        src={img.images?.[0]?.url || img.image}
                                        alt="Album Art"
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                            {/* Fillers if empty */}
                            {collageImages.length === 0 && (
                                <div className="collage-placeholder">Start generating albums to see your collage!</div>
                            )}
                        </div>
                        <div className="collage-overlay"></div>
                        <div className="collage-title">
                            <h2>Your Journey</h2>
                            <span>{generatedCount} Albums Discovered</span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="overview-grid">

                        {/* Progress Card */}
                        <div className="overview-card glass-panel progress-card">
                            <div className="card-icon"><Disc size={24} /></div>
                            <h3>Progress</h3>
                            <div className="progress-container">
                                <div className="progress-labels">
                                    <span className="big-stat">{generatedCount} <span className="sub">/ {totalAlbums}</span></span>
                                    <span className="percent">{progressPercent}%</span>
                                </div>
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                                </div>
                                <p className="remaining-text">{remainingCount} albums remaining</p>
                            </div>
                        </div>

                        {/* Global Rating Card */}
                        <div className="overview-card glass-panel rating-card">
                            <div className="card-icon"><Star size={24} /></div>
                            <h3>Global Average</h3>
                            <div className="stat-value">{avgGlobalRating}</div>
                            <p className="stat-sub">Based on {generatedCount} albums</p>
                        </div>

                        {/* Project Details Card */}
                        <div className="overview-card glass-panel details-card">
                            <div className="card-icon"><Calendar size={24} /></div>
                            <h3>Project Details</h3>
                            <div className="detail-row">
                                <span>Started:</span>
                                <strong>{startDate}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Project ID:</span>
                                <strong>{data.slug || data.name}</strong> // Assuming slug/name matches ID
                            </div>
                        </div>

                        {/* Platform Switcher Card */}
                        <div className="overview-card glass-panel platform-card">
                            <div className="card-icon"><Music size={24} /></div>
                            <h3>Music Platform</h3>
                            <div className="platform-toggle">
                                <button
                                    className={`platform-btn ${musicPlatform === 'spotify' ? 'active spotify' : ''}`}
                                    onClick={onTogglePlatform}
                                    disabled={musicPlatform === 'spotify'}
                                >
                                    <Radio size={18} /> Spotify
                                </button>
                                <button
                                    className={`platform-btn ${musicPlatform === 'apple' ? 'active apple' : ''}`}
                                    onClick={onTogglePlatform}
                                    disabled={musicPlatform === 'apple'}
                                >
                                    <Radio size={18} /> Apple
                                </button>
                            </div>
                            <p className="stat-sub">Default for "Listen" buttons</p>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
