const fs = require('fs');
const path = require('path');

// 1. Revert schema.prisma to SQLite
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

schema = schema.replace(
  /datasource db \{\s*provider = "postgresql"\s*url\s*= env\("DATABASE_URL"\)\s*\}/,
  `datasource db {\n  provider = "sqlite"\n  url      = "file:./dev.db"\n}`
);

fs.writeFileSync(schemaPath, schema);

// 2. Create .env
const envContent = `DATABASE_URL="file:./dev.db"\n`;
fs.writeFileSync(path.join(__dirname, '.env'), envContent);

console.log('Revertido para SQLite.');
