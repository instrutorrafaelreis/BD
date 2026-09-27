const fs = require('fs');
let c = fs.readFileSync('index.ts', 'utf8');

c = c.replace(/model: ".*?"/, 'model: "google/gemma-3-12b-it"');

fs.writeFileSync('index.ts', c);
console.log('Fixed model ID to gemma 3');
