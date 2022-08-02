import { AllTaggedTypeNames } from '../core/grammar/base.parser';
import { Visitor } from '../core/transform-ast';
import { Loc } from '../core/typed-ast';
import * as p from '../core/grammar/base.parser';
import { Colorable } from './Highlight';

export const highlightVisitor: Visitor<Array<{ loc: Loc; type: Colorable }>> =
    {};
AllTaggedTypeNames.forEach((name) => {
    highlightVisitor[name] = (node: { loc: Loc }, ctx): any => {
        ctx.push({ loc: node.loc, type: name });
        return null;
    };
});

const advance = (
    { offset, line, column }: Loc['start'],
    v: number,
): Loc['start'] => {
    return {
        offset: offset + v,
        column: column + v,
        line,
    };
};

highlightVisitor.AwaitSuffix = (node: p.AwaitSuffix, ctx) => {
    ctx.push({ loc: node.loc, type: 'AwaitSuffix' });
    ctx.push({
        loc: { ...node.loc, start: advance(node.loc.end, -1) },
        type: 'AwaitBang',
    });
    return null;
};

highlightVisitor.ToplevelLet = (node: p.ToplevelLet, ctx) => {
    ctx.push({ loc: node.loc, type: 'ToplevelLet' });
    const { start, end } = node.loc;
    node.items.forEach((item) => {
        ctx.push({
            loc: {
                ...node.loc,
                start: advance(start, 4),
                end: advance(start, 4 + item.name.length),
            },
            type: 'LetName',
        });
    });
    return null;
};

highlightVisitor.TypeAlias = (node: p.TypeAlias, ctx) => {
    ctx.push({ loc: node.loc, type: 'TypeAlias' });
    const { start, end } = node.loc;
    node.items.forEach((item, i) => {
        const off = i === 0 ? 5 : 4;
        ctx.push({
            loc: {
                ...node.loc,
                start: advance(start, off),
                end: advance(start, off + item.name.length),
            },
            type: 'LetName',
        });
    });
    return null;
};

highlightVisitor.Identifier = (node: p.Identifier, ctx) => {
    ctx.push({ loc: node.loc, type: 'Identifier' });
    if (node.hash != null) {
        const { start, end } = node.loc;
        ctx.push({
            loc: {
                ...node.loc,
                start: advance(start, node.text.length),
                end,
            },
            type: 'Hash',
        });
        const num = +node.hash.slice(2, -1);
        if (!isNaN(num) && num + '' === node.hash.slice(2, -1)) {
            ctx.push({
                loc: {
                    ...node.loc,
                    start,
                    end: advance(start, node.text.length),
                },
                type: `Color${num % 10}` as Colorable,
            });
        }
    }
    return null;
};

highlightVisitor.TRef = (node: p.TRef, ctx) => {
    ctx.push({ loc: node.loc, type: 'Identifier' });
    if (node.hash != null) {
        const { start, end } = node.loc;
        ctx.push({
            loc: {
                ...node.loc,
                start: advance(start, node.text.length),
                end,
            },
            type: 'Hash',
        });
        const num = +node.hash.slice(2, -1);
        if (!isNaN(num) && num + '' === node.hash.slice(2, -1)) {
            ctx.push({
                loc: {
                    ...node.loc,
                    start,
                    end: advance(start, node.text.length),
                },
                type: `Color${num % 10}` as Colorable,
            });
        }
    }
    return null;
};

highlightVisitor.TBArg = (node: p.TBArg, ctx) => {
    ctx.push({ loc: node.loc, type: 'Identifier' });
    if (node.hash != null) {
        const { start, end } = node.loc;
        ctx.push({
            loc: {
                ...node.loc,
                start: advance(start, node.label.length),
                end: advance(start, node.label.length + node.hash.length),
            },
            type: 'Hash',
        });
        const num = +node.hash.slice(2, -1);
        if (!isNaN(num) && num + '' === node.hash.slice(2, -1)) {
            ctx.push({
                loc: {
                    ...node.loc,
                    start,
                    end: advance(start, node.label.length),
                },
                type: `Color${num % 10}` as Colorable,
            });
        }
    }
    return null;
};

highlightVisitor.PName = (node: p.PName, ctx) => {
    ctx.push({ loc: node.loc, type: 'Identifier' });
    if (node.hash != null) {
        const { start, end } = node.loc;
        ctx.push({
            loc: {
                ...node.loc,
                start: advance(start, node.name.length),
                end,
            },
            type: 'Hash',
        });
        const num = +node.hash.slice(2, -1);
        if (!isNaN(num) && num + '' === node.hash.slice(2, -1)) {
            ctx.push({
                loc: {
                    ...node.loc,
                    start,
                    end: advance(start, node.name.length),
                },
                type: `Color${num % 10}` as Colorable,
            });
        }
    }
    return null;
};
