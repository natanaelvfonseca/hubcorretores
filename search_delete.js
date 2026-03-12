const fs = require('fs');
try {
  const content = fs.readFileSync('server.js', 'utf8');
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].toLowerCase();
    if (l.includes('app.delete') && l.includes('leads')) {
      console.log((i + 1) + ': ' + lines[i].trim().substring(0, 150));
    }
  }
} catch (e) {
  console.error(e);
}
