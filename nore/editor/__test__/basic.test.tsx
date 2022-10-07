import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Editor, emptyStore } from '../Editor';
import * as React from 'react';
import { parseExpression } from '../../generated/parser';
import * as to from '../../generated/to-map';
import { newStore, setSelection } from '../store/store';
import * as t from '../../generated/type-map';

describe('Editor', () => {
    it('thing', async () => {
        const { store, root } = newStore('hello(one, 2, 3)');

        render(<Editor store={store} root={root} />);

        const node = store.map[root].value as t.Apply;
        setSelection(store, {
            type: 'edit',
            idx: node.target,
            at: 'end',
            cid: 0,
        });
        const id = await screen.findByText('hello');
        userEvent.click(id);
        expect(document.activeElement).toEqual(id);
        userEvent.keyboard('awesome[Escape]');
        // await new Promise(res => setTimeout(res, 50))
        expect((store.map[node.target].value as t.Identifier).text).toEqual(
            'helloawesome',
        );
    });
});
