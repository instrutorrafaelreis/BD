const fs = require('fs');
let c = fs.readFileSync('index.ts', 'utf8');

c = c.replace(/model: ".*?"/, 'model: "google/gemma-2b"');

fs.writeFileSync('index.ts', c);
console.log('Fixed model ID to gemma 2b');
