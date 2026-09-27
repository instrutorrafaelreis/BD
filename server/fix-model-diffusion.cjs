const fs = require('fs');
let c = fs.readFileSync('index.ts', 'utf8');

c = c.replace(/model: ".*?"/, 'model: "google/diffusiongemma-26b-a4b-it"');

fs.writeFileSync('index.ts', c);
console.log('Fixed model ID to diffusiongemma');
