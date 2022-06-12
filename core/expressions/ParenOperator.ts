// ok

import { Context } from '..';

/*:peg:

ParenOperator = "(" op:(binopWithHash / unaryOpWithHash) ")"
*/

export const fromAst = ({ op, location }: P_ParenOperator, ctx: Context) => {
    // so I'm trying to resolve, right?
    // without a combinatorial explosion.
    // can I get away with only two levels of ambiguity?
    // Like, if I have an "apply" the
};
