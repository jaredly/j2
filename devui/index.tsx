import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { NextUIProvider, createTheme, Link } from '@nextui-org/react';
import { FixtureFile } from './FixtureFile';

const darkTheme = createTheme({ type: 'dark' });

export const usePromise = <T,>(
    fn: () => Promise<T>,
    bust: any[],
): [T | null, (v: T) => void] => {
    const [data, setData] = React.useState<T | null>(null);
    React.useEffect(() => {
        fn().then(setData);
    }, bust);
    return [data, setData];
};

export const useHash = () => {
    const [hash, setHash] = React.useState(location.hash?.slice(1));
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
    return hash;
};

const App = () => {
    const hash = useHash();
    const [listing] = usePromise<string[]>(
        () => fetch('/element/').then((res) => res.json()),
        [],
    );
    if (!listing) {
        return <>Loading...</>;
    }
    return hash ? (
        <FixtureFile listing={listing} name={hash.split('/')[0]} />
    ) : (
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
                ))}
            </div>
            <div>Click a thing</div>
        </div>
    );
};

// @ts-ignore
const root = (window.rootRoot =
    // @ts-ignore
    window.rootRoot || createRoot(document.getElementById('root')!));
root.render(
    <NextUIProvider theme={darkTheme}>
        <App />
    </NextUIProvider>,
);
