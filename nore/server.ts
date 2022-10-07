import { viteFsProxy } from '../devui/vite-fs-proxy';

viteFsProxy({
    root: './nore/editor/',
    port: 3001,
    innerPort: 3004,
    dirmap: {
        '/fixtures/': './nore/fixtures/',
    },
});
