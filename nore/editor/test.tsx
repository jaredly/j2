import { createTheme, NextUIProvider } from '@nextui-org/react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import equal from 'fast-deep-equal';
import * as React from 'react';
import * as t from '../generated/type-map';
import { Editor } from './Editor';
import './poly';
import { newStore, Selection, setSelection } from './store/store';

// testMutationObserver();
    const darkTheme = createTheme({
        type: 'dark',
        theme: { colors: { background: '#0d0e16' } },
    });

const init = (text = 'hello(one(2)(3), 1, 2u)') => {

    const { store, root } = newStore(text);
    render(
        <NextUIProvider theme={darkTheme}>
            <Editor store={store} root={root} />
        </NextUIProvider>,
    );
    return { store, root };
};

class ExpectError extends Error {
    found: any;
    expected: any;
    constructor(found: any, expected: any) {
        super(`Expect error`);
        this.found = found;
        this.expected = expected;
    }
}

const expect = (found: any, expected: any) => {
    if (!equal(found, expected)) {
        throw new ExpectError(found, expected);
    }
};

export const run = async () => {
    const results: { name: string; res: TestResult }[] = [];
    for (let test of tests) {
        try {
            await test.fn();
            results.push({ name: test.name, res: undefined });
        } catch (err) {
            results.push({ name: test.name, res: err as ExpectError });
        }
        cleanup();
    }

    return reportResults(results);
};

const reportResults = (results: { name: string; res: TestResult }[]) => {
    const failed = results.filter((x) => x.res);
    const total = results.length;
    Object.assign(document.body.style, {
        padding: '48px',
        fontSize: '48px',
        textAlign: 'center',
    });
    if (failed.length != 0) {
        document.body.innerHTML =
            failed
                .map(
                    (r) =>
                        `X ${r.name}: expected ${JSON.stringify(
                            r.res!.expected,
                        )}, found ${JSON.stringify(r.res!.found)}`,
                )
                .join('<br/>') + `<br/>Failure ${failed.length}/${total}<br/>`;
        const button = document.createElement('button');
        button.onclick = () => run();
        document.body.append(button);
        button.textContent = `Re-Run`;
        button.style.color = 'black';
    } else {
        document.body.innerText = `Success!`;
    }
    return failed.length > 0;
};

type TestResult = void | ExpectError;

const tests: { name: string; fn: () => Promise<TestResult> }[] = [];

const test = (name: string, fn: () => Promise<TestResult>) => {
    tests.push({ name, fn });
};

export const end = (idx: number): Selection => ({ type: 'edit', idx, at: 'end' });
export const start = (idx: number): Selection => ({ type: 'edit', idx, at: 'start' });

test('type some text into an ID', async () => {
    const { store, root } = init('hello()');
    const { target } = store.map[root].value as t.Apply;
    setSelection(store, end(target));
    await userEvent.keyboard('awesome[Escape]');
    const id = store.map[target].value as t.Identifier;
    expect(id.text, 'helloawesome');
});

test('type text into number', async () => {
    const { store, root } = init('42');
    setSelection(store, end(root));
    await userEvent.keyboard('056[Escape]');
    const id = store.map[root].value as t.Number;
    expect(id.num.raw, '42056');
});

test('arrow nav around', async () => {
    const { store, root } = init('hello(42, 12)');
    const {
        target,
        suffixes: [suffix],
    } = store.map[root].value as t.Apply;
    const { args } = store.map[suffix].value as t.CallSuffix;
    setSelection(store, end(target));
    await userEvent.keyboard('[ArrowRight]');
    expect(store.selection, start(args[0]));
    await userEvent.keyboard('[ArrowRight][ArrowRight][ArrowRight]');
    expect(store.selection, start(args[1]));
    await userEvent.keyboard('[ArrowLeft]');
    expect(store.selection, end(args[0]));
});

// hmmmmmmmm I think I want ...
// maybe a way to record things?
// yeah, tbh.
// So, we'll be recording the changes in selection,
// and all the history changes.
// And then I can go through and say "this is a thing to assert"
