import { refHash } from '.';
import { FullContext } from './ctx';
import * as p from './grammar/base.parser';
import * as t from './typed-ast';

export type Ctx = {
    printRef: (
        ref: t.RefKind,
        loc: p.Loc,
        kind: 'value' | 'type' | 'decorator',
    ) => p.Identifier;
};

export const printCtx = (ctx: FullContext): Ctx => {
    const reverse: { [key: string]: string } = {};
    Object.keys(ctx.values.names).forEach((name) => {
        ctx.values.names[name].forEach((ref) => {
            reverse[refHash(ref)] = name;
        });
    });
    const reverseType: { [key: string]: string } = {};
    Object.keys(ctx.types.names).forEach((name) => {
        reverseType[refHash(ctx.types.names[name])] = name;
    });
    return {
        printRef(ref, loc, kind) {
            const hash = refHash(ref);
            const name = kind === 'value' ? reverse[hash] : reverseType[hash];
            return {
                type: 'Identifier',
                text: name ?? 'unnamed',
                hash: `#[${hash}]`,
                loc,
            };
        },
    };
};

export const ToAst = {
    File({ type, toplevels, loc, comments }: t.File, ctx: Ctx): p.File {
        // TOOD: Go through and find all hashes, right?
        // maybe when printing unresolved things, put `#[:unresolved:]` or something?
        return {
            type,
            toplevels: toplevels.map((t) => ToAst[t.type](t, ctx)),
            loc,
            comments,
        };
    },
    ToplevelExpression({ type, expr, loc }: t.Toplevel, ctx: Ctx): p.Toplevel {
        return ToAst[expr.type](expr as any, ctx);
    },
    DecoratedExpression(
        { type, decorators, expr, loc }: t.DecoratedExpression,
        ctx: Ctx,
    ): p.DecoratedExpression_inner {
        const inner = ToAst[expr.type](expr as any, ctx);
        if (inner.type === 'DecoratedExpression') {
            return {
                ...inner,
                decorators: decorators
                    .map((d) => ToAst[d.type](d, ctx))
                    .concat(inner.decorators),
            };
        }
        return {
            type: 'DecoratedExpression',
            inner,
            loc,
            decorators: decorators.map((d) => ToAst[d.type](d, ctx)),
        };
    },
    Decorator({ type, id, args, loc }: t.Decorator, ctx: Ctx): p.Decorator {
        return {
            type,
            id:
                id.ref.type === 'Unresolved'
                    ? {
                          type: 'DecoratorId',
                          text: id.ref.text,
                          hash: id.ref.hash ?? '#[:unresolved:]',
                          loc: id.loc,
                      }
                    : {
                          ...ctx.printRef(id.ref, id.loc, 'decorator'),
                          type: 'DecoratorId',
                      },
            args: {
                type: 'DecoratorArgs',
                items: args.map(
                    ({ arg, loc, label }): p.LabeledDecoratorArg => {
                        return {
                            type: 'LabeledDecoratorArg',
                            label,
                            arg:
                                arg.type === 'Expr'
                                    ? {
                                          type: 'DecExpr',
                                          expr: ToAst[arg.expr.type](
                                              arg.expr as any,
                                              ctx,
                                          ),
                                          loc: arg.loc,
                                      }
                                    : {
                                          type: 'DecType',
                                          // @ts-ignore
                                          type_: ToAst[arg.typ.type](
                                              arg.typ as any,
                                              ctx,
                                          ),
                                          loc: arg.loc,
                                      },
                            loc,
                        };
                    },
                ),
                loc,
            },
            loc,
        };
    },
    TRef({ type, ref, loc }: t.TRef, ctx: Ctx): p.Type {
        const { text, hash } =
            ref.type === 'Unresolved' ? ref : ctx.printRef(ref, loc, 'type');
        return { type: 'Type', text, hash, loc };
    },
    Apply({ type, target, args, loc }: t.Apply, ctx: Ctx): p.Apply {
        let inner = ToAst[target.type](target as any, ctx);
        const parens: p.Parens = {
            loc,
            type: 'Parens',
            args: {
                type: 'CommaExpr',
                items: args.map((a) => ToAst[a.type](a as any, ctx)),
                loc,
            },
        };
        if (inner.type === 'Apply') {
            return { ...inner, suffixes: inner.suffixes.concat([parens]) };
        }
        if (inner.type === 'DecoratedExpression') {
            return {
                type,
                target: { type: 'ParenedExpression', expr: inner, loc },
                suffixes: [parens],
                loc,
            };
        }
        return { type, target: inner, suffixes: [parens], loc };
    },
    Boolean({ type, value, loc }: t.Boolean, ctx: Ctx): p.Boolean {
        return { type, v: value ? 'true' : 'false', loc };
    },
    Number({ type, value, loc }: t.Number, ctx: Ctx): p.Number {
        return {
            type,
            contents: '' + value,
            loc,
        };
    },
    Ref({ type, kind, loc }: t.Ref, ctx: Ctx): p.Identifier {
        if (kind.type === 'Unresolved') {
            return {
                type: 'Identifier',
                text: kind.text,
                hash: '#[:unresolved:]',
                loc,
            };
        } else {
            return ctx.printRef(kind, loc, 'value');
        }
    },
};
