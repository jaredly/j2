import { createTheme, NextUIProvider } from '@nextui-org/react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import equal from 'fast-deep-equal';
import * as React from 'react';
import * as t from '../generated/type-map';
import { Editor } from './Editor';
import './poly';
import { newStore, setSelection } from './store/store';

// testMutationObserver();

const darkTheme = createTheme({
    type: 'dark',
    theme: { colors: { background: '#0d0e16' } },
});

const { store, root } = newStore('hello(one(2)(3), 1, 2u)')

class ExpectError extends Error {
    found: any
    expected: any
    constructor(found: any, expected: any) {
        super(`Expect error`)
        this.found = found
        this.expected = expected
    }
}

const expect = (found: any, expected: any) => {
    if (!equal(found, expected)) {
        throw new ExpectError(found, expected)
    }
}

type TestResult = void | ExpectError

const tests: { name: string, fn: () => Promise<TestResult> }[] = []

const test = (name: string, fn: () => Promise<TestResult>) => {
    tests.push({ name, fn })
}

test('type some text', async () => {
    render(
        <NextUIProvider theme={darkTheme}>
            <Editor store={store} root={root} />
        </NextUIProvider>,
    )
    const node = store.map[root].value as t.Apply
    setSelection(store, { type: 'edit', idx: node.target, at: 'end' })
    await new Promise(res => setTimeout(res, 50))
    console.log(document.activeElement)
    const id = await screen.findByText('hello')
    // userEvent.click(id)
    expect(document.activeElement, id)
    await userEvent.keyboard('awesome[Escape]')
    expect((store.map[node.target].value as t.Identifier).text, 'helloawesome')
})

export const run = async () => {
    const results: { name: string, res: TestResult }[] = [];
    for (let test of tests) {
        try {
            await test.fn()
            results.push({ name: test.name, res: undefined })
        } catch (err) {
            results.push({ name: test.name, res: err as ExpectError })
        }
        cleanup()
    }

    return results
}
