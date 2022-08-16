import * as t from '../../typed-ast';
import * as p from '../../grammar/base.parser';
import { isOpText } from './apply';
import { makeBinop } from './makeBinop';

export const makeApply = (
    inner: p.Expression,
    suffix: p.Suffix,
    loc: t.Loc,
    showIds: boolean,
    arrow = false,
): p.Expression => {
    if (
        arrow &&
        suffix.type === 'CallSuffix' &&
        suffix.args?.items.length &&
        (inner.type === 'Identifier' ||
            (inner.type === 'Apply' &&
                inner.suffixes.length === 1 &&
                inner.suffixes[0].type === 'TypeApplicationSuffix' &&
                inner.target.type === 'Identifier'))
    ) {
        const ninner = suffix.args.items[0];
        suffix = {
            type: 'ArrowSuffix',
            types:
                inner.type === 'Apply'
                    ? (inner.suffixes[0] as p.TypeApplicationSuffix)
                    : null,
            args:
                suffix.args.items.length > 1
                    ? {
                          type: 'CallSuffix',
                          args: {
                              type: 'CommaExpr',
                              items: suffix.args.items.slice(1),
                              loc: suffix.args.loc,
                          },
                          loc: suffix.args.loc,
                      }
                    : null,
            loc: suffix.loc,
            name:
                inner.type === 'Identifier'
                    ? inner
                    : (inner.target as p.Identifier),
        };
        inner = ninner;
    }
    if (
        inner.type === 'Identifier' &&
        isOpText(inner.text) &&
        suffix.type === 'CallSuffix' &&
        suffix.args &&
        suffix.args.items.length === 2
    ) {
        return makeBinop(
            inner,
            suffix.args.items[0],
            suffix.args.items[1],
            loc,
            showIds,
        );
    }
    if (inner.type === 'Apply') {
        return { ...inner, suffixes: inner.suffixes.concat([suffix]), loc };
    }
    if (inner.type === 'DecoratedExpression') {
        return {
            type: 'Apply',
            target: {
                type: 'ParenedExpression',
                items: {
                    type: 'CommaExpr',
                    items: [inner],
                    loc,
                },
                loc,
            },
            suffixes: [suffix],
            loc,
        };
    }
    if (
        inner.type === 'BinOp' ||
        inner.type === 'WithUnary' ||
        inner.type === 'Lambda' ||
        inner.type === 'TypeAbstraction'
    ) {
        inner = {
            type: 'ParenedExpression',
            items: {
                type: 'CommaExpr',
                items: [inner],
                loc,
            },
            loc,
        };
    }
    return { type: 'Apply', target: inner, suffixes: [suffix], loc };
};
