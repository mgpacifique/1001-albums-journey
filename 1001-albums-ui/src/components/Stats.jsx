import React, { useRef, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid
} from 'recharts';
import { Download, Camera, Star } from 'lucide-react';
import html2canvas from 'html2canvas';
import './Stats.css';

const DEFAULT_COLORS = ['#db2777', '#7c3aed', '#2563eb', '#0891b2', '#059669'];

export default function Stats({ history }) {
    const wallRef = useRef(null);
    const fiveStarRef = useRef(null);
    const oneStarRef = useRef(null);
    const [exporting, setExporting] = useState(false);

    if (!history || history.length === 0) {
        return (
            <div className="stats-empty">
                <h2>No stats available yet!</h2>
                <p>Wait for more albums to generate.</p>
            </div>
        );
    }

    // ------- STATS CALCULATIONS -------

    // 1. Total Albums
    const totalAlbums = history.length;

    // 2. Avg Ratings
    const hasProjectRatings = history.some(h => h.rating !== undefined && h.rating !== null && !isNaN(h.rating));
    const avgGlobalRating = (history.reduce((a, b) => a + (b.globalRating || 0), 0) / (totalAlbums || 1)).toFixed(2);
    const projectRatings = history.filter(h => h.rating && !isNaN(h.rating)).map(h => Number(h.rating));
    const avgProjectRating = projectRatings.length > 0
        ? Math.round(projectRatings.reduce((a, b) => a + b, 0) / projectRatings.length)
        : 'N/A';

    // 3. Rating Distribution
    const distributionSource = hasProjectRatings ? projectRatings : history.map(h => Math.round(h.globalRating || 0)).filter(r => r > 0);
    const ratingDist = [1, 2, 3, 4, 5].map(star => ({
        name: `${star}★`,
        count: distributionSource.filter(r => Math.round(r) === star).length,
        fill: DEFAULT_COLORS[star - 1] || '#8884d8'
    }));

    // 4. Timeline Data (Monthly Averages)
    const sortedHistory = [...history].sort((a, b) => new Date(a.generatedAt) - new Date(b.generatedAt));

    // Group by Month-Year keys (e.g., "2025-10")
    const groupedByMonth = sortedHistory.reduce((acc, curr) => {
        const date = new Date(curr.generatedAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM

        if (!acc[key]) {
            acc[key] = {
                key, // for sorting
                label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), // "Oct 25"
                fullDate: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), // "October 2025"
                sumRating: 0,
                countRating: 0,
                sumGlobal: 0,
                countGlobal: 0,
                albums: []
            };
        }

        // Add User Rating
        if (curr.rating && !isNaN(curr.rating)) {
            acc[key].sumRating += Number(curr.rating);
            acc[key].countRating += 1;
        }

        // Add Global Rating
        if (curr.globalRating) {
            acc[key].sumGlobal += Number(curr.globalRating);
            acc[key].countGlobal += 1;
        }

        acc[key].albums.push(curr.name);
        return acc;

    }, {});

    const timelineData = Object.values(groupedByMonth)
        .sort((a, b) => a.key.localeCompare(b.key))
        .map(group => ({
            label: group.label,
            fullDate: group.fullDate,
            rating: group.countRating > 0 ? Number((group.sumRating / group.countRating).toFixed(2)) : null,
            globalRating: group.countGlobal > 0 ? Number((group.sumGlobal / group.countGlobal).toFixed(2)) : null,
            count: group.albums.length,
            sampleAlbum: group.albums[0] // just for context if needed
        }));

    // 5. Genre Data
    const genreCounts = history.reduce((acc, curr) => {
        const genres = curr.album?.genres || curr.genres || [];
        genres.forEach(g => {
            acc[g] = (acc[g] || 0) + 1;
        });
        return acc;
    }, {});
    const genreData = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1]).slice(0, 10)
        .map(([name, value]) => ({ name, value }));

    // 6. Rated Lists
    const fiveStarAlbums = history.filter(h => h.rating == 5);
    const oneStarAlbums = history.filter(h => h.rating == 1);


    // Generic Export Function
    const handleExport = async (ref, filename, titleText) => {
        if (!ref.current) return;
        setExporting(true);
        try {
            const canvas = await html2canvas(ref.current, {
                useCORS: true,
                backgroundColor: '#0f0f11',
                scale: 2,
                onclone: (clonedDoc) => {
                    const clonedNode = clonedDoc.body.querySelector(`[class*="${ref.current.className.split(' ')[0]}"]`);
                    // Or better, find the node by checking content, but simpler works if ref works.
                    // Actually, onclone gives the WHOLE doc. We need to manipulate the TARGET node inside it.
                    // Since we pass the ref which is a node, html2canvas renders THAT node.
                    // BUT, onclone allows modifying the cloned document BEFORE render. 
                    // So we can find the element equivalent to ref.current and prepend a title.
                    // However, finding the exact element in cloned doc can be tricky if id is missing.
                    // Let's assume we wrappted the content.

                    // Simpler Strategy:
                    // Create a style block to hide specific elements if needed
                    const style = clonedDoc.createElement('style');
                    style.innerHTML = `.export-title { display: block !important; margin-bottom: 1rem; color: #fff; text-align: center; }`;
                    clonedDoc.body.appendChild(style);
                }
            });

            // Wait, the above onclone strategy with CSS requires the element to already exist but be hidden.
            // Let's try inserting the title into the DOM (hidden), and then unhiding it in capture.

            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL();
            link.click();
        } catch (err) {
            console.error("Export failed", err);
        } finally {
            setExporting(false);
        }
    };

    // REVISED STRATEGY:
    // Instead of complex onclone, let's just render the title inside the ref container but hide it with CSS normally.
    // When exporting, we can either force it visible via onclone or just rely on a special export class.
    // Let's add the titles to the JSX directly with a 'hidden' class.


    return (
        <div className="stats-container animate-fade-in">
            <header className="stats-header">
                <h1>Project Statistics</h1>
                <div className="main-stats">
                    <div className="stat-card glass-panel">
                        <h3>Total Albums</h3>
                        <p>{totalAlbums}</p>
                    </div>
                    {hasProjectRatings && (
                        <div className="stat-card glass-panel">
                            <h3>Group Rating</h3>
                            <p>{avgProjectRating}</p>
                        </div>
                    )}
                    <div className="stat-card glass-panel">
                        <h3>Avg Global Rating</h3>
                        <p>{avgGlobalRating}</p>
                    </div>
                </div>
            </header>

            {/* Row 1: Distribution & Timeline */}
            <div className="charts-row">
                <div className="chart-card glass-panel half-width">
                    <h3>Rating Distribution {hasProjectRatings ? '(Group)' : '(Global)'}</h3>
                    <div className="chart-wrapper">
                        <div className="chart-scroll-container">
                            <div className="chart-inner-wrapper">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={ratingDist}>
                                        <XAxis dataKey="name" tick={{ fill: '#aaa' }} stroke="#444" />
                                        <YAxis tick={{ fill: '#aaa' }} allowDecimals={false} stroke="#444" />
                                        <Tooltip
                                            contentStyle={{ background: '#18181b', border: '1px solid #333', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                            {ratingDist.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="chart-card glass-panel half-width">
                    <h3>Rating Timeline</h3>
                    <div className="chart-wrapper">
                        <div className="chart-scroll-container">
                            <div className="chart-inner-wrapper">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={timelineData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fill: '#aaa' }} stroke="#444" minTickGap={30} />
                                        <YAxis domain={[0, 5]} tick={{ fill: '#aaa' }} stroke="#444" ticks={[1, 2, 3, 4, 5]} />
                                        <Tooltip
                                            contentStyle={{ background: '#18181b', border: '1px solid #333', borderRadius: '8px' }}
                                            labelFormatter={(label, item) => {
                                                const point = item[0]?.payload;
                                                return point ? `${point.fullDate} (${point.count} albums)` : label;
                                            }}
                                            formatter={(value, name) => [value, name]}
                                        />
                                        {hasProjectRatings && (
                                            <Line type="monotone" dataKey="rating" stroke="#fbbf24" strokeWidth={3} dot={{ r: 4, fill: '#fbbf24' }} name="Group Rating" />
                                        )}
                                        <Line type="monotone" dataKey="globalRating" stroke={hasProjectRatings ? "#2563eb" : "#fbbf24"} strokeWidth={hasProjectRatings ? 2 : 3} dot={false} strokeOpacity={hasProjectRatings ? 0.5 : 1} name="Global Rating" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Genres Chart (Moved Here) */}
                <div className="chart-card glass-panel half-width">
                    <h3>Top Genres</h3>
                    <div className="chart-wrapper">
                        <div className="chart-scroll-container">
                            <div className="chart-inner-wrapper">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={genreData} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            width={90}
                                            tick={{ fill: '#aaa', fontSize: 11 }}
                                            stroke="#444"
                                            interval={0}
                                        />
                                        <Tooltip
                                            contentStyle={{ background: '#18181b', border: '1px solid #333', fontSize: '12px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#0891b2" barSize={16} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lists Table Grid */}
            {hasProjectRatings && (
                <div className="lists-grid">

                    {/* 5-STAR LIST */}
                    <div className="list-card glass-panel">
                        <div className="list-header">
                            <h3>Loved (5 <Star size={16} fill="#fbbf24" stroke="none" style={{ display: 'inline', verticalAlign: 'text-bottom' }} />)</h3>
                            <button className="icon-btn-small" onClick={() => handleExport(fiveStarRef, '5-star-albums.png')} title="Export List">
                                <Camera size={16} />
                            </button>
                        </div>

                        <div className="stats-collage-grid" ref={fiveStarRef}>
                            <h2 className="export-title">Loved (5 Stars)</h2>
                            {fiveStarAlbums.length === 0 && <p className="empty-text">No 5-star albums yet.</p>}
                            {fiveStarAlbums.map((a, i) => (
                                <div key={i} className="stats-collage-item">
                                    <img
                                        src={a.album?.images?.[0]?.url || a.images?.[0]?.url || a.image}
                                        alt={a.album?.name || a.name}
                                        title={`${a.album?.name || a.name} - ${a.album?.artist || a.artist}`}
                                        crossOrigin="anonymous"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 1-STAR LIST */}
                    <div className="list-card glass-panel">
                        <div className="list-header">
                            <h3>Disliked (1 <Star size={16} fill="#ef4444" stroke="none" style={{ display: 'inline', verticalAlign: 'text-bottom' }} />)</h3>
                            <button className="icon-btn-small" onClick={() => handleExport(oneStarRef, '1-star-albums.png')} title="Export List">
                                <Camera size={16} />
                            </button>
                        </div>

                        <div className="stats-collage-grid" ref={oneStarRef}>
                            <h2 className="export-title">Disliked (1 Star)</h2>
                            {oneStarAlbums.length === 0 && <p className="empty-text">No 1-star albums yet.</p>}
                            {oneStarAlbums.map((a, i) => (
                                <div key={i} className="stats-collage-item">
                                    <img
                                        src={a.album?.images?.[0]?.url || a.images?.[0]?.url || a.image}
                                        alt={a.album?.name || a.name}
                                        title={`${a.album?.name || a.name} - ${a.album?.artist || a.artist}`}
                                        crossOrigin="anonymous"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}



            <div className="album-wall-section">
                <div className="wall-header">
                    <h3>Album Wall</h3>
                    <button className="export-btn" onClick={() => handleExport(wallRef, '1001-album-wall.png')} disabled={exporting}>
                        {exporting ? 'Saving...' : <><Camera size={18} /> Export Wall</>}
                    </button>
                </div>

                <div className="album-wall" ref={wallRef}>
                    <h2 className="export-title">My Album Journey</h2>
                    {history.map((item, i) => (
                        <div key={i} className="wall-item">
                            <img
                                src={item.album?.images?.[0]?.url || item.images?.[0]?.url || item.image}
                                alt={item.album?.name || item.name}
                                crossOrigin="anonymous"
                                onError={(e) => e.target.style.display = 'none'}
                                title={`${item.album?.name || item.name} (${item.globalRating?.toFixed(1) || 'N/A'})`}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
