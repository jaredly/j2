import { createTheme, NextUIProvider } from '@nextui-org/react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import equal from 'fast-deep-equal';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import * as t from '../generated/type-map';
import { Editor } from './Editor';
import './poly';
import { newStore, Selection, setSelection } from './store/store';

const darkTheme = createTheme({
    type: 'dark',
    theme: { colors: { background: '#0d0e16' } },
});

const Wrapper = () => {
    const [text, setText] = React.useState('hello(2)');
    const [start, setStart] = React.useState(false);
    return (
        <div style={{ padding: 24 }}>
            <div style={{ color: 'black' }}>
                <input value={text} onChange={(e) => setText(e.target.value)} />
                <button onClick={() => setStart(!start)}>Start</button>
            </div>
            {start ? <Recorder text={text} /> : null}
        </div>
    );
};

const Recorder = ({ text }: { text: string }) => {
    const { store, root } = React.useMemo(() => newStore(text), []);
    const items = React.useState([]);
    return (
        <NextUIProvider theme={darkTheme}>
            <Editor store={store} root={root} />
            <div
                style={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                }}
            >
                Root: {root}
                <div
                    style={{
                        display: 'grid',
                        alignItems: 'center',
                        gridTemplateColumns: 'max-content max-content 1fr',
                    }}
                    onMouseLeave={() => {
                        setSelection(store, null);
                    }}
                >
                    {Object.keys(store.map).map((id) => (
                        <div key={id} style={{ display: 'contents' }}>
                            <span
                                style={{
                                    margin: 8,
                                    padding: '4px 8px',
                                    display: 'flex',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    borderRadius: 3,
                                }}
                                onMouseOver={() => {
                                    setSelection(store, {
                                        type: 'select',
                                        idx: +id,
                                        children: null,
                                    });
                                }}
                            >
                                {id}
                            </span>
                            <span style={{ marginRight: 8 }}>
                                {store.map[+id].type}
                            </span>
                            <span>{serial(store.map[+id].value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </NextUIProvider>
    );
};

const serial = (v: any): string => {
    if (!v) {
        return JSON.stringify(v);
    }
    if (Array.isArray(v)) {
        return `[${v.map(serial).join(',')}]`;
    }
    if (typeof v === 'object') {
        return `{${Object.keys(v)
            .filter((k) => v[k] !== undefined)
            .map((k) => `${k}: ${serial(v[k])}`)
            .join(', ')}}`;
    }
    return JSON.stringify(v);
};

export const setupRecorder = () => {
    const node = document.createElement('div');
    document.body.append(node);
    const rr = createRoot(node);
    rr.render(<Wrapper />);
};
