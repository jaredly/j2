import { createTheme, NextUIProvider } from '@nextui-org/react';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Editor } from './Editor';
import './poly';
import { setupRecorder } from './record';
import { newStore } from './store/store';
import { run } from './test';

// testMutationObserver();

const runApp = () => {
    const darkTheme = createTheme({
        type: 'dark',
        theme: { colors: { background: '#0d0e16' } },
    });

    // const { store, root } = newStore('hello(fn(a)=>a)');
    const { store, root } = newStore('hello(one(2)(3), 1, 2u)');

    // @ts-ignore
    const reactRoot = (window.rootRoot =
        // @ts-ignore
        window.rootRoot || createRoot(document.getElementById('root')!));
    reactRoot.render(
        <NextUIProvider theme={darkTheme}>
            <Editor store={store} root={root} />
        </NextUIProvider>,
    );
};

const mode: string = 'app';

if (mode === 'recorder') {
    setupRecorder();
} else if (mode === 'gen') {
} else {
    runApp();
}
