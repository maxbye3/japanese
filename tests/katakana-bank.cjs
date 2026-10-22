const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Read the actual data declaration without starting the browser application.
const source = fs.readFileSync(path.join(__dirname, '..', 'katakana.js'), 'utf8');
const declaration = source.slice(source.indexOf('  const WORDS ='), source.indexOf('  // Japanese stays'));
module.exports = JSON.parse(JSON.stringify(vm.runInNewContext(declaration + '\nWORDS;')));
