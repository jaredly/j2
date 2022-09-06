import { viteFsProxy } from './vite-fs-proxy';

viteFsProxy({
    root: './devui',
    port: 3002,
    innerPort: 3005,
    dirmap: {
        '/elements/': './core/elements/',
    },
});
