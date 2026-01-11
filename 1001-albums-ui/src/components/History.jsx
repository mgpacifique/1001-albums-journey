import React, { useState } from 'react';
import { LayoutGrid, List as ListIcon, Play, ArrowDownUp } from 'lucide-react';
import './History.css';

export default function History({ history }) {
    const [viewMode, setViewMode] = useState('grid');
    const [sortOrder, setSortOrder] = useState('recent'); // 'recent' or 'oldest'

    if (!history || history.length === 0) return null;

    // Derived sorted state
    const sortedHistory = [...history].sort((a, b) => {
        const dateA = new Date(a.generatedAt);
        const dateB = new Date(b.generatedAt);
        return sortOrder === 'recent' ? dateB - dateA : dateA - dateB;
    });

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    // Helper to open native app
    const handlePlay = (album) => {
        // Try Spotify native URI first
        if (album.spotifyId) {
            window.location.href = `spotify:album:${album.spotifyId}`;
            // Fallback to web link if needed (often handled by browser asking to open app)
            // setTimeout(() => window.open(`https://open.spotify.com/album/${album.spotifyId}`, '_blank'), 500);
        } else if (album.appleMusicId) {
            // Apple Music deeplink scheme usually starts with music://
            window.location.href = `music://music.apple.com/album/${album.appleMusicId}`;
        } else {
            console.warn("No supported music ID found for native play.");
        }
    };

    return (
        <div className="history-section animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="history-header-row">
                <div className="header-info">
                    <h3>History</h3>
                    <span className="count-badge">{history.length} albums</span>
                </div>

                <div className="view-toggle">
                    <button
                        className="toggle-btn"
                        onClick={() => setSortOrder(prev => prev === 'recent' ? 'oldest' : 'recent')}
                        title={`Sort by: ${sortOrder === 'recent' ? 'Recent' : 'Oldest'} First`}
                    >
                        <ArrowDownUp size={20} />
                        <span style={{ marginLeft: '6px', fontSize: '0.9rem' }}>{sortOrder === 'recent' ? 'Recent' : 'Oldest'}</span>
                    </button>
                    <div className="divider" style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }}></div>
                    <button
                        className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                        title="Grid View"
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                        title="List View"
                    >
                        <ListIcon size={20} />
                    </button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                /* GRID VIEW */
                <div className="history-grid">
                    {sortedHistory.map((item, index) => (
                        <div key={index} className="history-card glass-panel">
                            <div className="history-cover-wrapper">
                                <img
                                    src={item.images?.[0]?.url || item.image || 'https://via.placeholder.com/150'}
                                    alt={item.name}
                                    className="history-cover"
                                    loading="lazy"
                                />
                            </div>
                            <div className="history-info">
                                <h4 className="history-title" title={item.name}>{item.name}</h4>
                                <p className="history-artist">{item.artist}</p>
                                <div className="grid-meta">
                                    <span>{item.releaseDate}</span>
                                    {/* Show User Rating if exists (Integer), else Global (Decimal) */}
                                    {(item.rating && !isNaN(item.rating)) ? (
                                        <span className="history-rating user-rating">★ {item.rating}</span>
                                    ) : (item.globalRating && (
                                        <span className="history-rating global-rating">★ {item.globalRating}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* LIST VIEW */
                <div className="history-list">
                    {sortedHistory.map((item, index) => (
                        <div key={index} className="list-item glass-panel">
                            {/* Left: Cover */}
                            <div className="list-cover-container">
                                <img
                                    src={item.images?.[0]?.url || item.image}
                                    alt={item.name}
                                    className="list-cover"
                                />
                            </div>

                            {/* Right: Details */}
                            <div className="list-details">
                                <div className="list-top-row">
                                    <h4 className="list-title">{item.name}</h4>
                                    <div className="list-badges">
                                        <span className="rank-badge">#{history.length - index}</span>
                                        {item.genres?.slice(0, 2).map(g => <span key={g} className="genre-tag">{g}</span>)}
                                    </div>
                                </div>

                                <div className="list-sub-row">
                                    <button className="play-btn-small" onClick={() => handlePlay(item)} title="Play in App">
                                        <Play size={14} fill="currentColor" />
                                    </button>
                                    <span className="list-artist">{item.artist}</span>
                                    <span className="separator">•</span>
                                    <span className="list-year">{item.releaseDate}</span>
                                </div>

                                <div className="list-meta-row">
                                    <div className="list-ratings">
                                        {/* Global */}
                                        <span className="global-pill" title="Global Rating">
                                            Glo: <strong>{item.globalRating || '-'}</strong>
                                        </span>
                                        {/* User Rating - checking normalized 'rating' */}
                                        {item.rating && !isNaN(item.rating) && (
                                            <span className="user-pill" title="My Rating">
                                                My: <strong>{item.rating}</strong> ★
                                            </span>
                                        )}
                                    </div>
                                    <span className="list-date">Added {formatDate(item.generatedAt)}</span>
                                </div>

                                {/* Review Text if it exists */}
                                {item.review && (
                                    <div className="list-review">
                                        "{item.review}"
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
