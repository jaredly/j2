import { Ctx } from '..';
import * as p from '../grammar/base.parser';
import * as t from '../typed-ast';

export const ToTast = {
    File({ toplevels, loc, comments }: p.File, ctx: Ctx): t.File {
        // Do we forbid toplevel expressions from having a value?
        // I don't see why we would.
        // We might forbid them from having outstanding effects though.
        // deal with that when it comes
        return {
            type: 'File',
            toplevels: toplevels.map((top) => ToTast.Toplevel(top, ctx)),
            comments,
            loc,
        };
    },

    TemplateString(ts: p.TemplateString, ctx: Ctx): t.TemplateString {
        return {
            type: 'TemplateString',
            loc: ts.loc,
            first: ts.first,
            rest: ts.rest.map(({ expr, suffix }) => [
                ToTast[expr.type](expr as any, ctx),
                suffix,
            ]),
        };
    },

    Toplevel(top: p.Toplevel, ctx: Ctx): t.Toplevel {
        return {
            type: 'ToplevelExpression',
            expr: ToTast[top.type](top as any, ctx),
            loc: top.loc,
        };
    },
    DecoratedExpression(
        expr: p.DecoratedExpression_inner,
        ctx: Ctx,
    ): t.Expression {
        const decorators = expr.decorators.map((d) => ToTast.Decorator(d, ctx));
        const inner = ToTast[expr.inner.type](expr.inner as any, ctx);
        return {
            type: 'DecoratedExpression',
            decorators,
            expr: inner,
            loc: expr.loc,
        };
    },
    ParenedExpression(expr: p.ParenedExpression, ctx: Ctx): t.Expression {
        return ToTast[expr.expr.type](expr.expr as any, ctx);
    },
    Decorator(decorator: p.Decorator, ctx: Ctx): t.Decorator {
        return {
            type: 'Decorator',
            id: {
                ref: {
                    type: 'Unresolved',
                    text: decorator.id.text,
                    hash: filterUnresolved(decorator.id.hash?.slice(2, -1)),
                },
                loc: decorator.loc,
            },
            args:
                decorator.args?.items.map((arg) =>
                    ToTast.LabeledDecoratorArg(arg, ctx),
                ) ?? [],
            loc: decorator.loc,
        };
    },
    LabeledDecoratorArg(
        { arg, label, loc }: p.LabeledDecoratorArg,
        ctx: Ctx,
    ): { loc: p.Loc; label: string | null; arg: t.DecoratorArg } {
        if (arg.type === 'DecExpr') {
            return {
                label,
                loc,
                arg: {
                    type: 'Expr',
                    expr: ToTast[arg.expr.type](arg.expr as any, ctx),
                    loc: arg.loc,
                },
            };
        } else {
            return {
                label,
                loc,
                arg: {
                    type: 'Type',
                    typ: ToTast.Type(arg.type_, ctx),
                    loc: arg.loc,
                },
            };
        }
    },
    Type(type: p.Type, ctx: Ctx): t.Type {
        const hash = filterUnresolved(type.hash?.slice(2, -1));
        const resolved = ctx.resolveType(type.text, hash);
        return {
            type: 'TRef',
            ref: resolved ?? {
                type: 'Unresolved',
                text: type.text,
                hash,
            },
            loc: type.loc,
        };
    },
    Boolean(boolean: p.Boolean, ctx: Ctx): t.Boolean {
        return {
            type: 'Boolean',
            loc: boolean.loc,
            value: boolean.v === 'true',
        };
    },
    // um ok but does it make sense to have a whole node just for int literals?
    // maybe I could have a 'literalconstant' node that int/float/number ...
    // although strings can be template literals, so maybe that's a separate node
    Number({ loc, contents }: p.Number, ctx: Ctx): t.Number {
        return {
            type: 'Number',
            value: +contents,
            loc,
            kind: contents.includes('.') ? 'Float' : 'Int',
        };
    },
    // Expression(expr: p.Expression, typ: Type | null, ctx: Ctx): Expression {
    //     return ToTast[expr.type](expr as any, typ, ctx);
    // },
    Identifier({ hash, loc, text }: p.Identifier, ctx: Ctx): t.Expression {
        // ok so here's where rubber meets road, right?
        // like I need to know what Ctx is.
        // hmmmm what if we have a mapping of 'id to type'
        // that can be independent of ... whether it came
        // from builtlin or somethign else.
        //
        hash = filterUnresolved(hash?.slice(2, -1));
        const resolved = ctx.resolve(text, hash);
        if (resolved.length === 1) {
            return { type: 'Ref', loc, kind: resolved[0] };
        }
        return {
            type: 'Ref',
            kind: { type: 'Unresolved', text, hash },
            loc,
        };
    },
    Apply(apply: p.Apply_inner, ctx: Ctx): t.Apply {
        let res = ToTast[apply.target.type](apply.target as any, ctx);
        while (apply.suffixes.length) {
            const next = apply.suffixes.shift()!;
            res = {
                type: 'Apply',
                args:
                    next.args?.items.map((arg) =>
                        ToTast[arg.type](arg as any, ctx),
                    ) ?? [],
                target: res,
                loc: {
                    start: apply.loc.start,
                    end: next.loc.end,
                    idx: next.loc.idx,
                },
            };
        }
        return res as t.Apply;
    },
};

const filterUnresolved = (v: string | null | undefined) =>
    v == null || v === ':unresolved:' ? null : v;

// let inner: p.Expression | Single = apply.target;
// const parens = apply.suffixes.slice();
// while (parens.length) {
//     const next = parens.shift()!;
//     inner = {
//         type: 'Single',
//         target: inner,
//         parens: next,
//         loc: { ...apply.loc, end: next.loc.end },
//     };
// }
// if (inner.type !== 'Single') {
//     return ToTast[inner.type](inner as any, ctx);
// }

// type Single = {
//     target: p.Expression | Single;
//     parens: p.Parens;
//     type: 'Single';
//     loc: p.Location;
// };

// type ExpectedApplyType =
//     | null
//     | { type: 'Exact'; typ: Type }
//     | { type: 'Returns'; typ: Type };

// export const typeApply = (
//     { target, parens: { args }, loc }: Single,
//     ctx: Ctx,
// ): Expression => {
//     return {
//         type: 'Apply',
//         target:
//             target.type === 'Single'
//                 ? typeApply(target, ctx)
//                 : ToTast[target.type](target as any, ctx),
//         loc,
//         args: args?.items.map((arg) => ToTast[arg.type](arg as any, ctx)) ?? [],
//     };
//     /*
//     So the way this goes
//     - iff we have an external constraint, resolve target first
//     - otherwise, try to resolve the args I guess? idk. like maybe check to see
//       yeah I mean I can tune this a bunch once I write some tests.

//     ok wait when would I have a `Returns` constraint?
//     oh that's when the `target` is a `Single`.

//     anyway calling functions on functions might seem extreme, but when
//     we're representing .attribute access as a function call, it'll definitely
//     be used.
//     Of course, .attribute access is .. less well hmm ... yeah I guess if the
//     thing we're acccessing the attribute on is ambiguous, then we might have
//     multiple collisions for the .attribute. depending on the target type.

//     ok, but before I get too far along the type algorithm road,
//     I definitely need to figure out if I can correctly handle the
//     "this empty array gets passed somewhere and then appended to".
//     Although, because I don't have mutation, then the empty array
//     might want to be represented as an anything-array, right?
//     So maybe that just doesn't come up.
//     Only the first use can constrain it?

//     ok the more realistic thing is:
//     this function argument doesn't have a specified type,
//     and we go a little ways in until we use it, and then
//     it needs to have a type.

//     BUT I think it's reasonable to say that if the first
//     usage is ambiguous, you're out to lunch.
//     Right?
//     Except with floats & ints we'll have ambiguity a lot.

//     but I don't want things to get too out of hand, you know.

//     ugh yeah I'm not sure how to represent that, I mean it's a
//     constrain solver thing anyway.
//     Maybe I'll look into hindley milner to see if I can
//     bend it to my will.
//     Or at least use it as a halfway measure, for the easy cases.

//     */
//     // ok so the thing is, we might want to type the target with info from the args
//     // Here's some magic??
// };

// // export const nodeToTast = (node: p.AllTaggedTypes, ctx: Ctx) => {
// //     return ToTast[node.type](node as any, ctx);
// // };

// do I even do builtins?
// or do I just assign them a hash based on something else?
// Library
//
//

/*

Ok, so what's the complex "args back and forth" inference case?

1.0 + 2

2 + 3

5.0 * (2 + 3)

OR EVEN

let fs = (a: float, b: float) => a + b;
let is = (a: int, b: int) => a + b;
let fi = (a: float, b: int) => a + b as float;

let xs = fs
let xs = is
let xs = fi

let f: float = 1.0
let i: int = 1

let x = f
let x = i

xs(x, x) // ambiguous!
xs(f, f) // resolvable

fs(x, x) // resolvable

fi(x, x) // resolvable

is(xs(x, x), i) // resolvable

-> so because we go outward-in,
 -> in this case xs will be restricted to is already
 -> and the x choices are easy.


*/

// export type ExpectedType = null | Type; // {type: 'Exactly', typ: Type} | {type: 'Returns', typ: Type}
