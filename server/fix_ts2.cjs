const fs = require('fs');
let c = fs.readFileSync('index.ts', 'utf8');

c = c.replace(/const userId = req\.headers\['userid'\] as string;/g, "const userId = req.headers['userid'] as string;");
c = c.replace(/const userId = req\.headers\['userid'\];/g, "const userId = req.headers['userid'] as string;");
c = c.replace(/req\.headers\['userid'\]/g, "(req.headers['userid'] as string)");

fs.writeFileSync('index.ts', c);
