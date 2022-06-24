import * as React from 'react';
import { render } from 'react-dom';
import { NextUIProvider, createTheme } from '@nextui-org/react';

const darkTheme = createTheme({ type: 'dark' });

const App = () => {
    return (
        <NextUIProvider theme={darkTheme}>
            <div>Hello World. </div>
        </NextUIProvider>
    );
};

render(<App />, document.getElementById('root'));
