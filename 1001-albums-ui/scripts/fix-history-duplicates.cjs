const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/History.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const uniqueGarbage = "DO NOT include scrollLeft/scrollRight here";

if (content.indexOf(uniqueGarbage) === -1) {
    console.log("Garbage not found.");
    process.exit(0);
}

// Find start of the garbage block
const startMarker = "    // ... scroll handlers ...";
const startIndex = content.indexOf(startMarker);

// Find end. The block ends before the REAL scrollLeft definition.
const realCode = "    const scrollLeft = () => {";
const realIndex = content.indexOf(realCode, startIndex + 10);

if (startIndex !== -1 && realIndex !== -1) {
    // Cut everything between startIndex and realIndex
    const before = content.substring(0, startIndex);
    const after = content.substring(realIndex);
    fs.writeFileSync(filePath, before + after, 'utf8');
    console.log("Removed duplicate definitions.");
} else {
    console.error("Could not find start/end markers correctly.");
    console.log("Start:", startIndex, "Real:", realIndex);
}
