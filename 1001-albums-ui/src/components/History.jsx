import React, { useState, useRef, useEffect } from 'react';
import { LayoutGrid, List as ListIcon, Play, ArrowDownUp, Music, ChevronLeft, ChevronRight } from 'lucide-react';
import { getSimilarAlbums } from '../api';
import { getStreamingLink, getPlatformConfig } from '../utils/streaming';
import './History.css';

export default function History({ history, musicPlatform, streamingMode }) {
    const [viewMode, setViewMode] = useState('grid');
    const [sortOrder, setSortOrder] = useState('recent'); // 'recent' or 'oldest'

    // ... (keep existing state) ...
    // Removed local getPlatformLink helper in favor of utility

    // ... (rest of component) ...

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAlbum, setSelectedAlbum] = useState(null);

    // Similar Albums State for Modal
    const [similarAlbums, setSimilarAlbums] = useState(null);
    const [loadingSimilar, setLoadingSimilar] = useState(false);
    const [activeTab, setActiveTab] = useState('details'); // 'details' | 'similar'
    const scrollRef = useRef(null);

    // Reset similar albums when modal is closed or album changes
    useEffect(() => {
        setSimilarAlbums(null);
        setLoadingSimilar(false);
        setActiveTab('details'); // Reset tab
    }, [selectedAlbum]);

    const handleFetchSimilar = () => {
        if (!selectedAlbum) return;
        setLoadingSimilar(true);
        getSimilarAlbums(selectedAlbum.name, selectedAlbum.artist)
            .then(data => setSimilarAlbums(data || []))
            .catch(err => console.error(err))
            .finally(() => setLoadingSimilar(false));
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'similar' && !similarAlbums && !loadingSimilar) {
            handleFetchSimilar();
        }
    };






    if (!history || history.length === 0) return null;

    // Filter based on search term
    const filteredHistory = history.filter(item => {
        if (!searchTerm) return true;
        const lowerSearch = searchTerm.toLowerCase();
        return (
            item.name.toLowerCase().includes(lowerSearch) ||
            item.artist.toLowerCase().includes(lowerSearch)
        );
    });

    // derived sorted state
    const sortedHistory = [...filteredHistory].sort((a, b) => {
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
                    <span className="count-badge">{filteredHistory.length} albums</span>
                </div>

                <div className="search-container">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search albums or artists..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                        <div
                            key={index}
                            className="history-card glass-panel"
                            onClick={() => setSelectedAlbum(item)}
                        >
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

            {/* ALBUM DETAILS MODAL */}
            {selectedAlbum && (
                <div className="modal-overlay" onClick={() => setSelectedAlbum(null)}>
                    <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={() => setSelectedAlbum(null)}>×</button>

                        <div className="modal-body">
                            <div className="modal-cover-section">
                                <img
                                    src={selectedAlbum.images?.[0]?.url || selectedAlbum.image}
                                    alt={selectedAlbum.name}
                                    className="modal-cover"
                                />
                                <div className="modal-actions">
                                    <button className="play-btn-large" onClick={() => handlePlay(selectedAlbum)}>
                                        <Play fill="currentColor" size={24} /> Play Album
                                    </button>
                                </div>
                            </div>

                            <div className="modal-info-section">
                                <h2 className="modal-title">{selectedAlbum.name}</h2>
                                <h3 className="modal-artist">{selectedAlbum.artist}</h3>

                                <div className="modal-meta-badges">
                                    <span className="modal-badge">{selectedAlbum.releaseDate}</span>
                                    {selectedAlbum.genres?.map(g => (
                                        <span key={g} className="modal-badge genre">{g}</span>
                                    ))}
                                </div>

                                {/* TABS */}
                                <div className="modal-tabs">
                                    <button
                                        className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                                        onClick={() => handleTabChange('details')}
                                    >
                                        <ListIcon size={16} /> Details
                                    </button>
                                    <button
                                        className={`tab-btn ${activeTab === 'similar' ? 'active' : ''}`}
                                        onClick={() => handleTabChange('similar')}
                                    >
                                        <Music size={16} /> Similar Albums
                                    </button>
                                </div>
                                <div className="modal-section-divider"></div>

                                {activeTab === 'details' && (
                                    <div className="tab-content animate-fade-in">
                                        <div className="modal-ratings-row">
                                            <div className="rating-box global">
                                                <span className="rating-label">Global Rating</span>
                                                <span className="rating-value">{selectedAlbum.globalRating || '-'}</span>
                                            </div>
                                            <div className="rating-box user">
                                                <span className="rating-label">My Rating</span>
                                                <span className="rating-value">
                                                    {selectedAlbum.rating && !isNaN(selectedAlbum.rating) ? selectedAlbum.rating : '-'}
                                                    <span className="star">★</span>
                                                </span>
                                            </div>
                                        </div>

                                        {selectedAlbum.review ? (
                                            <div className="modal-review">
                                                <h4>My Review</h4>
                                                <p>"{selectedAlbum.review}"</p>
                                            </div>
                                        ) : (
                                            <div className="modal-review empty">
                                                <p>No review added for this album.</p>
                                            </div>
                                        )}

                                        <div className="modal-footer-meta">
                                            <small>Added to history on {formatDate(selectedAlbum.generatedAt)}</small>
                                        </div>
                                    </div>
                                )}


                                {/* SIMILAR TAB CONTENT */}
                                {activeTab === 'similar' && (
                                    <div className="tab-content animate-fade-in modal-similar-section">
                                        {loadingSimilar && <p className="loading-text">Finding similar albums...</p>}

                                        {similarAlbums && similarAlbums.length > 0 && (
                                            <div className="similar-grid-container">
                                                <div className="similar-grid">
                                                    {similarAlbums.map(alb => {
                                                        const link = getStreamingLink(alb, musicPlatform, streamingMode);
                                                        const isWeb = link.startsWith('http');
                                                        return (
                                                            <a
                                                                key={alb.id}
                                                                href={link}
                                                                target={isWeb ? "_blank" : "_self"}
                                                                rel="noopener noreferrer"
                                                                className="similar-card"
                                                                title={`Listen to ${alb.name} on ${getPlatformConfig(musicPlatform).label}`}
                                                            >
                                                                <div className="card-image-wrapper">
                                                                    <img src={alb.image} alt={alb.name} />
                                                                    <div className="play-overlay">
                                                                        <Play size={32} fill="white" stroke="white" />
                                                                    </div>
                                                                </div>
                                                                <div className="similar-info">
                                                                    <p className="s-title">{alb.name}</p>
                                                                    <p className="s-artist">{alb.artist}</p>
                                                                </div>
                                                            </a>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {similarAlbums && similarAlbums.length === 0 && !loadingSimilar && (
                                            <p className="empty-text">No recommendations found.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
