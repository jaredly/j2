import '../devui/poly';
import { Button, createTheme, NextUIProvider } from '@nextui-org/react';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { TestSplit } from '../devui/TestSplit';
import { processFile } from '../core/full/full';
import { TestWhat } from '../devui/App';
// @ts-ignore
import effPaper from '../core/elements/test/eff-paper.jd?raw';
// @ts-ignore
import records from '../core/elements/test/records.jd?raw';
// @ts-ignore
import effects from '../core/elements/test/effects.jd?raw';
// @ts-ignore
import recursive from '../core/elements/test/recursive.jd?raw';
// @ts-ignore
import syntax from '../core/elements/test/syntax.jd?raw';

const examples = { syntax, effects, records, effPaper, recursive };

const darkTheme = createTheme({ type: 'dark' });

const App = () => {
    const [tick, setTick] = React.useState(0);
    const [data, setData] = React.useState<TestWhat>(() => {
        const saved = localStorage.getItem('j2:text');
        const res = processFile(
            saved ?? syntax,
            undefined,
            undefined,
            undefined,
            true,
        );
        return { file: res, values: null };
    });

    React.useEffect(() => {}, [data]);

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    paddingLeft: 24,
                    paddingTop: 24,
                }}
            >
                {Object.entries(examples).map(([name, text]) => (
                    <Button
                        color="secondary"
                        bordered
                        size="sm"
                        style={{
                            marginRight: 16,
                        }}
                        key={name}
                        onPress={() => {
                            setTick(tick + 1);
                            setData({
                                file: processFile(
                                    text,
                                    undefined,
                                    undefined,
                                    undefined,
                                    true,
                                ),
                                values: null,
                            });
                        }}
                    >
                        {name}
                    </Button>
                ))}
            </div>
            <TestSplit
                key={tick}
                test={data}
                name="Sandbox"
                onChange={(test, txt) => {
                    setData(test);
                    localStorage.setItem('j2:text', txt);
                }}
            />
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
