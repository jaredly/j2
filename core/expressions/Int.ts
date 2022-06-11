// An AST node

import { Location } from '../';

export const grammar = `
Int "int" = _ contents:$("-"? [0-9]+) 
`;

export type Int = { type: 'Int'; contents: string; location: Location };
export type T_Int = { type: 'Int'; value: number };
export const typeOfInt = (node: T_Int) => ({ type: 'builtin', name: 'int' });

// So we run a script, and all of the sudden
// after `grammar` we have the type, right?
// that's how I want to do it?
// And we make `index.js` such that I can be importing
// all the things I need.
