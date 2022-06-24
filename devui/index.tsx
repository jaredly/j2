import * as React from 'react';
import { render } from 'react-dom';
import { NextUIProvider, createTheme, Link } from '@nextui-org/react';

const darkTheme = createTheme({ type: 'dark' });

export const usePromise = <T,>(fn: () => Promise<T>, bust: any[]) => {
    const [data, setData] = React.useState<T | null>(null);
    React.useEffect(() => {
        fn().then(setData);
    }, bust);
    return data;
};

export const useHash = (): [string, (v: string) => void] => {
    const [hash, setHash] = React.useState(location.search?.slice(1));
    React.useEffect(() => {
        if (location.hash !== (hash ? '#' + hash : '')) {
            location.hash = '#' + hash;
        }
        const fn = () => {
            setHash(location.hash.slice(1));
        };
        window.addEventListener('hashchange', fn);
        return () => window.removeEventListener('hashchange', fn);
    }, [hash]);
    return [hash, setHash];
};

const App = () => {
    const [hash, setHash] = useHash();
    const listing = usePromise<string[]>(
        () => fetch('/element/').then((res) => res.json()),
        [],
    );
    if (!listing) {
        return 'Loading...';
    }
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'stretch',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: 200,
                    padding: 16,
                }}
            >
                {listing.map((name) => (
                    <Link
                        key={name}
                        href={`#${name}`}
                        block
                        color={name === hash ? 'primary' : 'secondary'}
                    >
                        {name}
                    </Link>
                    // <div
                    //     key={name}
                    //     onClick={() => setHash(name)}
                    // >
                    //     {name}
                    // </div>
                ))}
            </div>
            <div>{hash ? <Show name={hash} /> : 'Click a thing'}</div>
        </div>
    );
};

const Show = ({ name }: { name: string }) => {
    const data = usePromise(
        () => fetch(`/element/${name}`).then((res) => res.text()),
        [name],
    );
    return (
        <div>
            {name}
            <pre>{data}</pre>
        </div>
    );
};

render(
    <NextUIProvider theme={darkTheme}>
        <App />
    </NextUIProvider>,
    document.getElementById('root'),
);
