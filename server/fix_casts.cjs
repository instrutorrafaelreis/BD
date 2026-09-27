const fs = require('fs');
let c = fs.readFileSync('index.ts', 'utf8');

c = c.replace(/const userId = req\.query\.userId;/g, "const userId = String(req.query.userId);");
c = c.replace(/where: { id: userId }/g, "where: { id: String(userId) }");
c = c.replace(/where: { id: String\(userId\) }/g, "where: { id: String(userId) }"); // ensure no double String(String(userId))

// Fix any req.headers
c = c.replace(/const userId = \(req\.headers\['userid'\] as string\);/g, "const userId = String(req.headers['userid']);");
c = c.replace(/req\.headers\['userid'\]/g, "String(req.headers['userid'])");

fs.writeFileSync('index.ts', c);
