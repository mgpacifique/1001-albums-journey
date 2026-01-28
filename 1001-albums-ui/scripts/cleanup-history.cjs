const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/History.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// The garbage block starts with:
//                                 )}
// 
//                                 {/* SIMILAR ALBUMS SECTION */}
//                                 <div className="modal-similar-section">

// And ends with:
//                                 <div className="modal-footer-meta">
//                                     <small>Added to history on {formatDate(selectedAlbum.generatedAt)}</small>
//                                 </div>
//                             </div>

// We can search for the UNIQUE comment that marks the start of the OLD section.
const startMarker = '{/* SIMILAR ALBUMS SECTION */}';

const startIndex = content.indexOf(startMarker);

if (startIndex === -1) {
    console.log("No legacy 'SIMILAR ALBUMS SECTION' found. File might be clean.");
    process.exit(0);
}

// We need to remove the ")}" before it too if it's the stray one.
// Let's look slightly before startIndex.
// The file has:
// 368:                                 )}
// 369: 
// 370:                                 {/* SIMILAR ALBUMS SECTION */}

// We will find the stray `)}` before the marker.
const strayBrace = ')}';
const braceIndex = content.lastIndexOf(strayBrace, startIndex);

let cutStart = startIndex;
if (braceIndex !== -1 && (startIndex - braceIndex) < 200) { // arbitrary close distance
    // Check if it's the one we think it is.
    // Actually, safer to just cut from startMarker, and I will manually check the brace later or just leave it (one extra brace might be a syntax error, so getting rid of the block is priority 1).
    // Let's just cut from startMarker for now.
    cutStart = startIndex;

    // BUT wait, looking at the previous Step 426:
    // 368:                                 )}
    // It seems this brace is closing something invalid or is extra.
    // If I cut from `startMarker`, I leave `)}` behind.
    // If `)}` is extra, the syntax is broken.
}

// Identify the end.
// The garbage block ends with the CLOSING of modal-info-section.
// 423:                             </div>
// followed by closing of modal-body...
// We can find the matching closing div for the deleted block?
// Or we can just find the text of the footer-meta and the div after it.

const footerStr = '<small>Added to history on {formatDate(selectedAlbum.generatedAt)}</small>';
const footerIndex = content.indexOf(footerStr, startIndex); // Find it AFTER the startMarker

if (footerIndex === -1) {
    console.error("Could not find footer in garbage block");
    process.exit(1);
}

// Find the closing </div> for footer, then closing </div> for container
const closingFooter = '</div>';
const closingContainer = '</div>';

// This is approximate logic.
// Let's try to match the exact string block from the view_file if possible.
// Or just regex replace.

// Regex to match:
// \s*\}\)\s*\{\/\* SIMILAR ALBUMS SECTION \*\/\}[\s\S]*?modal-footer-meta[\s\S]*?<\/div>\s*<\/div>

const regex = /\s*\)\}\s*\{\/\* SIMILAR ALBUMS SECTION \*\/\}[\s\S]*?className="modal-footer-meta"[\s\S]*?<\/div>\s*<\/div>/;

if (regex.test(content)) {
    console.log("Found garbage block via regex. Removing...");
    content = content.replace(regex, '');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Cleaned up History.jsx");
} else {
    // Try without the leading brace in case whitespace differs
    const regex2 = /\{\/\* SIMILAR ALBUMS SECTION \*\/\}[\s\S]*?className="modal-footer-meta"[\s\S]*?<\/div>\s*<\/div>/;
    if (regex2.test(content)) {
        console.log("Found garbage block via regex (no leading brace). Removing...");
        content = content.replace(regex2, '');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Cleaned up History.jsx");
    } else {
        console.error("Could not match garbage block with regex.");
    }
}
