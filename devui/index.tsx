import { createTheme, NextUIProvider } from '@nextui-org/react';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

const darkTheme = createTheme({ type: 'dark' });

// @ts-ignore
const root = (window.rootRoot =
    // @ts-ignore
    window.rootRoot || createRoot(document.getElementById('root')!));
root.render(
    <NextUIProvider theme={darkTheme}>
        <App />
    </NextUIProvider>,
);
