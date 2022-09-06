import { viteFsProxy } from './vite-fs-proxy';

viteFsProxy({
    root: './devui',
    port: 3001,
    dirmap: {
        '/elements/': './core/elements/',
    },
});
