import React, { useState, useEffect } from 'react';
import { ExternalLink, Music, RotateCcw, Info, Star } from 'lucide-react';
import { getWikiSummary, getAlbumStats } from '../api';
import './AlbumHero.css';

export default function AlbumHero({ album, musicPlatform }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [summary, setSummary] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [backView, setBackView] = useState('summary'); // 'summary' or 'reviews'

    // Real Stats State
    const [realStats, setRealStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);

    useEffect(() => {
        // Reset state on new album (Partial reset, don't clear summary if it's stored?)
        // Actually best to reset all
        setIsFlipped(false);
        setBackView('summary');
        setSummary(null);
        setRealStats(null);

        if (album?.wikipediaUrl) {
            setLoadingSummary(true);
            getWikiSummary(album.wikipediaUrl)
                .then(text => setSummary(text))
                .catch(() => setSummary(null))
                .finally(() => setLoadingSummary(false));
        }

        // Fetch Real Stats immediately or lazy load? 
        // Let's fetch immediately so it's ready, or lazy load on 'reviews' click.
        // Lazy is better for bandwidth since file is large.
    }, [album]);

    // Fetch stats when view changes to 'reviews'
    useEffect(() => {
        if (backView === 'reviews' && !realStats && !loadingStats && album?.name) {
            setLoadingStats(true);
            getAlbumStats(album.name)
                .then(stats => setRealStats(stats))
                .catch(err => console.error(err))
                .finally(() => setLoadingStats(false));
        }
    }, [backView, album, realStats, loadingStats]);

    if (!album) return null;

    const imageUrl = album.images?.[0]?.url || album.image;

    return (
        <div className="album-scene animate-fade-in">
            <div className={`album-card ${isFlipped ? 'is-flipped' : ''}`}>

                {/* FRONT FACE */}
                <div className="album-face album-front glass-panel">
                    <div className="hero-content">
                        <div className="cover-container">
                            <img
                                src={imageUrl}
                                alt={album.name}
                                className="album-cover"
                                onError={(e) => { e.target.style.display = 'none' }}
                            />
                            {!imageUrl && <div className="placeholder-cover">?</div>}

                            <button
                                className="flip-btn"
                                onClick={() => setIsFlipped(true)}
                                title="Read Summary"
                            >
                                <Info size={20} />
                            </button>
                        </div>

                        <div className="album-info">
                            <span className="label">Album of the Day</span>
                            <h1 className="album-title">{album.name}</h1>
                            <h2 className="album-artist">{album.artist}</h2>

                            <div className="meta-tags">
                                {album.releaseDate && <span className="tag">{album.releaseDate}</span>}
                                {album.genres && album.genres.map(g => <span className="tag" key={g}>{g}</span>)}
                            </div>

                            <div className="actions">
                                {/* Global Rating Badge - Moved here */}
                                {album.globalRating && (
                                    <div className="user-rating-badge inline" title="Global Average Rating">
                                        <Star size={18} fill="#fbbf24" stroke="#fbbf24" />
                                        <span>{album.globalRating.toFixed(2)}</span>
                                    </div>
                                )}

                                {/* DYNAMIC LISTEN BUTTON */}
                                {musicPlatform === 'apple' && album.appleMusicId ? (
                                    <button
                                        onClick={() => {
                                            window.location.href = `music://music.apple.com/album/${album.appleMusicId}`;
                                        }}
                                        className="action-btn apple"
                                        style={{ background: '#fa243c', color: 'white' }}
                                    >
                                        <Music size={20} /> Listen on Apple
                                    </button>
                                ) : (album.spotifyId && (
                                    <button
                                        onClick={() => {
                                            window.location.href = `spotify:album:${album.spotifyId}`;
                                        }}
                                        className="action-btn spotify"
                                    >
                                        <Music size={20} /> Listen on Spotify
                                    </button>
                                ))}
                                <button
                                    className="action-btn secondary"
                                    onClick={() => setIsFlipped(true)}
                                >
                                    <Info size={20} /> About Album
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Background Blur */}
                    {imageUrl && (
                        <div
                            className="hero-bg"
                            style={{ backgroundImage: `url(${imageUrl})` }}
                        />
                    )}
                </div>

                {/* BACK FACE */}
                <div className="album-face album-back glass-panel">
                    <button
                        className="flip-back-btn"
                        onClick={() => setIsFlipped(false)}
                    >
                        <RotateCcw size={20} /> Back to Cover
                    </button>

                    <div className="back-content">
                        {backView === 'summary' ? (
                            <div className="fade-enter">
                                <h2>About {album.name}</h2>
                                <div className="summary-scroll">
                                    {loadingSummary ? (
                                        <p className="loading-text">Fetching summary from Wikipedia...</p>
                                    ) : summary ? (
                                        <p className="summary-text">{summary}</p>
                                    ) : (
                                        <p className="empty-text">No summary available.</p>
                                    )}
                                </div>

                                <div className="back-actions">
                                    {album.wikipediaUrl && (
                                        <a
                                            href={album.wikipediaUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="action-btn wiki"
                                        >
                                            <ExternalLink size={20} /> Read Full Wiki
                                        </a>
                                    )}
                                    <button
                                        className="action-btn secondary"
                                        onClick={() => setBackView('reviews')}
                                    >
                                        <Star size={20} /> Reviews
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* REVIEWS VIEW */
                            <div className="fade-enter">
                                <h2>Reviews & Ratings</h2>
                                <div className="reviews-content-scroll">

                                    {/* Global Rating Header */}
                                    <div className="reviews-header-stats">
                                        <div className="big-rating-box">
                                            {/* Use real rating if available, else currentAlbum rating */}
                                            <span className="big-rating-val">
                                                {realStats ? (realStats.averageRating || 0).toFixed(2) : (album.globalRating ? album.globalRating.toFixed(2) : '-')}
                                            </span>
                                            <div className="big-rating-stars">
                                                {[1, 2, 3, 4, 5].map(star => {
                                                    const ratingVal = realStats ? realStats.averageRating : album.globalRating;
                                                    return (
                                                        <Star
                                                            key={star}
                                                            size={16}
                                                            fill={ratingVal >= star ? "#fbbf24" : "none"}
                                                            stroke="#fbbf24"
                                                            className="star-icon"
                                                        />
                                                    );
                                                })}
                                            </div>
                                            <span className="rating-count-label">
                                                {realStats ? `${realStats.votes} Votes` : 'Global Average'}
                                            </span>
                                        </div>

                                        {/* Distribution Chart */}
                                        <div className="distribution-chart">
                                            {loadingStats ? (
                                                <p style={{ color: '#888', fontSize: '0.9rem' }}>Loading distribution...</p>
                                            ) : (
                                                [5, 4, 3, 2, 1].map(stars => {
                                                    // Calculate percentage from real stats
                                                    let percentage = 0;
                                                    let count = 0;

                                                    if (realStats && realStats.votesByGrade) {
                                                        count = realStats.votesByGrade[String(stars)] || 0;
                                                        percentage = realStats.votes > 0 ? (count / realStats.votes) * 100 : 0;
                                                    }
                                                    // No mock fallback to ensure accuracy as requested

                                                    return (
                                                        <div key={stars} className="dist-row">
                                                            <span className="star-label">{stars} ★</span>
                                                            <div className="dist-bar-bg">
                                                                <div className="dist-bar-fill" style={{ width: `${percentage}%` }}></div>
                                                            </div>
                                                            {realStats && <span style={{ fontSize: '0.7rem', color: '#666', minWidth: '30px' }}>{count}</span>}
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>

                                    <div className="review-text-section">
                                        <h3>My Review</h3>
                                        {album.review ? (
                                            <p className="user-review-text">"{album.review}"</p>
                                        ) : (
                                            <p className="no-review-text">No review added yet.</p>
                                        )}
                                    </div>

                                </div>

                                <div className="back-actions">
                                    <button
                                        className="action-btn secondary"
                                        onClick={() => setBackView('summary')}
                                    >
                                        Back to Summary
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
