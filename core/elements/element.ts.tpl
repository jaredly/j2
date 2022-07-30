import { Visitor } from '../transform-tast';
import { decorate } from '../typing/analyze';
import { Ctx as ACtx } from '../typing/analyze';
import { typeMatches } from '../typing/typeMatches';
import * as t from '../typed-ast';
import * as p from '../grammar/base.parser';
import * as pp from '../printer/pp';
import { Ctx as PCtx } from '../printer/to-pp';
import { Ctx as TCtx } from '../typing/to-tast';
import { Ctx as TACtx } from '../typing/to-ast';
import { Ctx as TMCtx } from '../typing/typeMatches';
import { Ctx as ICtx } from '../ir/ir';
import * as b from '@babel/types';
import { Ctx as JCtx } from '../ir/to-js';

export const grammar = `
`;

export const ToTast = {
    // Apply(apply: p.Apply_inner, ctx: TCtx): t.Apply {
    // },
};

export const ToAst = {
    // Apply({ type, target, args, loc }: t.Apply, ctx: TACtx): p.Apply {
    // },
};

export const ToPP = {
    // Apply(apply: p.Apply_inner, ctx: PCtx): pp.PP {
    // },
};

export const ToIR = {};

export const ToJS = {};

export const Analyze: Visitor<{ ctx: ACtx; hit: {} }> = {
    // Expression_Apply(node, { ctx, hit }) {
    // },
};
