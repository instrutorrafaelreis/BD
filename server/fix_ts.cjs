const fs = require('fs');
let c = fs.readFileSync('index.ts', 'utf8');

c = c.replace(
  "const userId = req.headers['userid'];",
  "const userId = req.headers['userid'] as string;"
).replace(
  "const userId = req.headers['userid'];",
  "const userId = req.headers['userid'] as string;"
).replace(
  "const userId = req.headers['userid'];",
  "const userId = req.headers['userid'] as string;"
);

c = c.replace(
  "const row = data[i];",
  "const row = data[i] as any;"
);

c = c.replace(
  "let data = [];",
  "let data: any[] = [];"
);

c = c.replace(
  "data = result.data;",
  "data = result.data as any[];"
);

c = c.replace(
  "data = xlsx.utils.sheet_to_json(sheet);",
  "data = xlsx.utils.sheet_to_json(sheet) as any[];"
);

fs.writeFileSync('index.ts', c);
