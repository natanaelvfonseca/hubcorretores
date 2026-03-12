const fs = require('fs');
const lines = fs.readFileSync('server.js', 'utf8').split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('processAIResponse')) {
    console.log((i + 1) + ': ' + lines[i].trim().substring(0, 150));
  }
}
// Also look for ensureLead just in case
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('ensureLead')) {
    console.log((i + 1) + ': ' + lines[i].trim().substring(0, 150));
  }
}
