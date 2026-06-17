import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
const keys = new Set();
const keyRegex = /\bt\(['"]([^'"]+)['"]\)/g;

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = keyRegex.exec(content)) !== null) {
    keys.add(match[1]);
  }
});

console.log(Array.from(keys).sort().join('\n'));
