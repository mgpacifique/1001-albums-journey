import React, { useState, useEffect } from 'react';
import { ExternalLink, Music, RotateCcw, Info, Star } from 'lucide-react';
import { getWikiSummary } from '../api';
import './AlbumHero.css';

export default function AlbumHero({ album, musicPlatform }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [summary, setSummary] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);

    useEffect(() => {
        // Reset state on new album
        setIsFlipped(false);
        setSummary(null);

        if (album?.wikipediaUrl) {
            setLoadingSummary(true);
            getWikiSummary(album.wikipediaUrl)
                .then(text => setSummary(text))
                .catch(() => setSummary(null))
                .finally(() => setLoadingSummary(false));
        }
    }, [album]);

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

                            {/* Global Rating Badge */}
                            {album.globalRating && (
                                <div className="user-rating-badge" title="Global Average Rating">
                                    <Star size={16} fill="#fbbf24" stroke="#fbbf24" />
                                    <span>Global Rating: {album.globalRating.toFixed(2)}</span>
                                </div>
                            )}

                            <div className="actions">
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
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
