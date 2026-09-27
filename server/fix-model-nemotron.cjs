const fs = require('fs');
let c = fs.readFileSync('index.ts', 'utf8');

c = c.replace(/model: ".*?"/, 'model: "nvidia/llama-3.1-nemotron-70b-instruct"');

fs.writeFileSync('index.ts', c);
console.log('Fixed model ID to nemotron');
