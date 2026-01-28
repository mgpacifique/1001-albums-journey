const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/History.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Target the specific placeholder lines
const placeholder1 = "    const scrollLeft = () => { /* ... */ };";
const placeholder2 = "    const scrollRight = () => { /* ... */ };";

// Target the garbage comment block start
const garbageStart = "    // DO NOT include scrollLeft/scrollRight here";
// Target the garbage comment block end (or just a unique string inside it to regex match the whole block)

// Let's replace placeholders first
content = content.replace(placeholder1, '');
content = content.replace(placeholder2, '');

// Now remove the garbage block. 
// It spans multiple lines. "DO NOT ... " down to empty lines before the real function.
// We can just find the start of garbage, and find the start of the REAL function, and remove everything in between.

const realFuncStart = "    const scrollLeft = () => {";
// We need to be careful not to match the placeholder if we hadn't removed it, but we just did.
// But wait, split/replace logic is safer.

const garbageIndex = content.indexOf(garbageStart);
if (garbageIndex !== -1) {
    const realFuncIndex = content.indexOf(realFuncStart, garbageIndex);
    if (realFuncIndex !== -1) {
        // Cut from garbageIndex to realFuncIndex
        const before = content.substring(0, garbageIndex);
        const after = content.substring(realFuncIndex);
        content = before + after;
        console.log("Removed garbage block.");
    } else {
        console.log("Could not find real function start after garbage.");
    }
} else {
    console.log("Garbage block not found (might have been removed or text mismatch).");
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Cleaned up History.jsx placeholders.");
