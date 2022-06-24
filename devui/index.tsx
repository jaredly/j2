import * as React from 'react';
import { render } from 'react-dom';
import { NextUIProvider, createTheme } from '@nextui-org/react';

const darkTheme = createTheme({
    type: 'dark',
    //   theme: {
    //     // colors: {...}, // override dark theme colors
    //   }
});

const App = () => {
    return (
        <NextUIProvider theme={darkTheme}>
            <div>Hello World. Huh</div>
        </NextUIProvider>
    );
};

render(<App />, document.getElementById('root'));
