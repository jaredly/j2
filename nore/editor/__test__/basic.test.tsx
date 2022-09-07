import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Editor, emptyStore } from '../Editor'
import * as React from 'react'
import { parseExpression } from '../../generated/parser'
import * as to from '../../generated/to-map';
import { newStore } from '../store/store'

describe('Editor', () => {
    it('thing', () => {
        const { store, root } = newStore('hello(one, 2, 3)')

        render(<Editor store={store} root={root} />)
    })
})
