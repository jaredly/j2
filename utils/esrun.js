#!/usr/bin/env node
// Ok
const { execSync } = require('child_process');
const { unlinkSync } = require('fs');
const { tmpdir } = require('os');

const [_, __, fname, ...args] = process.argv;

console.log('$ running', fname);

execSync(`esbuild --bundle ${fname} --platform=node --sourcemap > tmprun.js`);

try {
    execSync(`node --enable-source-maps tmprun.js ${args.join(' ')}`, {
        stdio: 'inherit',
    });
} catch (err) {
    // nope
}

unlinkSync('tmprun.js');
