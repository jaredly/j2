import './poly';
import { createTheme, NextUIProvider } from '@nextui-org/react';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Editor } from './Editor';
import { testMutationObserver } from './testMutationObserver';
import { newStore } from './store/store';

testMutationObserver();

const darkTheme = createTheme({
    type: 'dark',
    theme: { colors: { background: '#0d0e16' } },
});

const { store, root } = newStore('hello(one(2)(3), 1, 2u)')

// @ts-ignore
const reactRoot = (window.rootRoot =
    // @ts-ignore
    window.rootRoot || createRoot(document.getElementById('root')!));
reactRoot.render(
    <NextUIProvider theme={darkTheme}>
        <Editor store={store} root={root} />
    </NextUIProvider>,
);
