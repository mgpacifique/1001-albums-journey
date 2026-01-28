const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/History.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// The block to remove/replace
// It starts with {/* SIMILAR ALBUMS SECTION */} and goes down to the end of modal-info-section
// We need to be careful.

const startMarker = '{/* SIMILAR ALBUMS SECTION */}';
const footerMarker = '<div className="modal-footer-meta">';
const endFooterMarker = '</div>'; // closing for footer-meta
const endSectionMarker = '</div>'; // closing for modal-info-section

// We want to replace from startMarker to the end of modal-info-section content
// But regex might be safer if we match specific unique lines.

const targetBlockStart = `<div className="modal-similar-section">`;
const targetBlockEndRegex = /<small>Added to history on \{formatDate\(selectedAlbum\.generatedAt\)\}<\/small>\s*<\/div>\s*<\/div>/;

// Let's try to identify the indexes
const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
    console.error("Could not find start marker");
    process.exit(1);
}

// Find the end of the modal-info-section (which is </div > after the footer)
// The footer is:
// <div className="modal-footer-meta">
//     <small>Added to history on {formatDate(selectedAlbum.generatedAt)}</small>
// </div>
// </div> <-- This is the end of modal-info-section

const footerRegex = /<div className="modal-footer-meta">\s*<small>Added to history on \{formatDate\(selectedAlbum\.generatedAt\)\}<\/small>\s*<\/div>\s*<\/div>/;
const match = content.match(footerRegex);

if (!match) {
    console.error("Could not find footer regex match");
    process.exit(1);
}

// The replacement content
const newContentBlock = `
                                {/* SIMILAR TAB CONTENT */}
                                {activeTab === 'similar' && (
                                    <div className="tab-content animate-fade-in modal-similar-section">
                                        {loadingSimilar && <p className="loading-text">Finding similar albums...</p>}
                                        
                                        {similarAlbums && similarAlbums.length > 0 && (
                                            <div className="carousel-wrapper" style={{ marginTop: '0.5rem' }}>
                                                <button className="carousel-btn left" onClick={scrollLeft} aria-label="Scroll left">
                                                    <ChevronLeft size={24} />
                                                </button>
                                                
                                                <div className="similar-grid" ref={scrollRef}>
                                                    {similarAlbums.map(alb => (
                                                        <a
                                                            key={alb.id}
                                                            href={alb.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="similar-card"
                                                            title={alb.name + ' by ' + alb.artist}
                                                        >
                                                            <img src={alb.image} alt={alb.name} />
                                                            <div className="similar-info">
                                                                <p className="s-title">{alb.name}</p>
                                                                <p className="s-artist">{alb.artist}</p>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>

                                                <button className="carousel-btn right" onClick={scrollRight} aria-label="Scroll right">
                                                    <ChevronRight size={24} />
                                                </button>
                                            </div>
                                        )}
                                        
                                        {similarAlbums && similarAlbums.length === 0 && !loadingSimilar && (
                                            <p className="empty-text">No recommendations found.</p>
                                        )}
                                    </div>
                                )}
                            </div>`;

// Replace from startIndex to (match.index + match[0].length)
const before = content.substring(0, startIndex);
const after = content.substring(match.index + match[0].length);

const newFileContent = before + newContentBlock + after;

fs.writeFileSync(filePath, newFileContent, 'utf8');
console.log("Successfully patched History.jsx");
