import path from 'path';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { createServer, request } from 'http';
import { createServer as vite } from 'vite';

(async () => {
    const server = await vite({ root: './devui', server: { port: 3001 } });
    await server.listen();

    createServer((req, res) => {
        // OK so now we do the:
        // "read this if you can"
        if (req.url?.startsWith('/elements/')) {
            if (req.url.endsWith('/') && !req.url.includes('..')) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                const at = path.join('./core/', req.url.slice(1, -1));
                console.log(at);
                return res.end(
                    JSON.stringify(
                        readdirSync(at).filter((t) => t.endsWith('.jd')),
                    ),
                );
            }
            const element: string = req.url.slice('/elements/'.length);
            if (!element.endsWith('.jd') || element.includes('..')) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                return res.end('Invalid element name');
            }
            const fname = `./core/elements/${element}`;
            if (!existsSync(fname)) {
                res.writeHead(404);
                return res.end(`Element not found ${fname}`);
            }
            if (req.method === 'GET') {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(readFileSync(fname, 'utf8'));
            } else if (req.method === 'POST') {
                let data = '';
                req.setEncoding('utf8');
                req.on('data', (chunk) => {
                    data += chunk;
                });
                req.on('end', () => {
                    writeFileSync(fname, data);
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end('OK');
                });
            }
            return;
        }

        const options = {
            hostname: 'localhost',
            port: 3001,
            path: req.url,
            method: req.method,
            headers: req.headers,
        };

        const proxy = request(options, function (proxy_res) {
            res.writeHead(proxy_res.statusCode!, proxy_res.headers);
            proxy_res.pipe(res, { end: true });
        });

        req.pipe(proxy, { end: true });
    }).listen(3000);
    console.log(`Get it on http://localhost:3000`);
})();
