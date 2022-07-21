import { Ctx } from '..';
import { noloc } from '../ctx';
import * as p from '../grammar/base.parser';
import { Ctx as PCtx } from '../printer/to-pp';
import { Ctx as ICtx } from '../ir/ir';
import * as pp from '../printer/pp';
import * as t from '../typed-ast';
import { Expression, Loc } from '../typed-ast';
import { Ctx as ACtx } from '../typing/to-ast';
import { Visitor } from '../transform-tast';
import { decorate, VisitorCtx } from '../typing/analyze';
import { typeMatches } from '../typing/typeMatches';

export const grammar = `
Boolean "boolean" = v:("true" / "false") ![0-9a-zA-Z_]
Number "number" = _ contents:$("-"? [0-9]+ ("." [0-9]+)? "u"?)

String = "\"" text:$(stringChar*) "\""
TemplateString = "\"" first:$tplStringChars rest:TemplatePair* "\""
TemplatePair = wrap:TemplateWrap suffix:$tplStringChars
TemplateWrap = "\${" _ expr:Expression _ "}"
tplStringChars = $(!"\${" stringChar)*
stringChar = $( escapedChar / [^"\\])
escapedChar = "\\" .
`;

export type Boolean = { type: 'Boolean'; loc: Loc; value: boolean };
// export type String = { type: 'String'; loc: Loc; value: boolean };

export type Number = {
    type: 'Number';
    loc: Loc;
    value: number;
    kind: 'Int' | 'Float' | 'UInt';
};

export type TemplateString = {
    type: 'TemplateString';
    first: string;
    rest: Array<{ expr: Expression; suffix: string; loc: Loc }>;
    loc: Loc;
};

export type ITemplateString = {
    type: 'TemplateString';
    first: string;
    rest: Array<{ expr: t.IExpression; suffix: string; loc: Loc }>;
    loc: Loc;
};

export type String = { type: 'String'; text: string; loc: Loc };

export const Analyze: Visitor<VisitorCtx> = {
    Expression_TemplateString(node, { ctx, hit }) {
        let changed = false;
        const rest: TemplateString['rest'] = node.rest.map(
            ({ expr, suffix, loc }) => {
                let expt = ctx.getType(expr);
                if (expt?.type === 'TVbl') {
                    expt = ctx.addTypeConstraint(
                        expt,
                        ctx.typeByName('string')!,
                    );
                }
                // HMMMM This might ... end up wrapping multiple times?
                // like ... and the idxs we're doing to be having with noloc
                // are not going to disambiguate. I think I need to think
                // about this more.
                if (
                    expt &&
                    !typeMatches(expt, ctx.typeByName('string')!, ctx)
                ) {
                    changed = true;
                    return {
                        suffix,
                        loc,
                        expr: decorate(expr, 'notAString', hit, ctx),
                    };
                }
                return { suffix, loc, expr };
            },
        );
        return changed ? { ...node, rest } : null;
    },
};

export const ToTast = {
    TemplateString(ts: p.TemplateString, ctx: Ctx): t.TemplateString {
        return {
            type: 'TemplateString',
            loc: ts.loc,
            first: ts.first,
            rest: ts.rest.map(({ wrap: { expr }, suffix, loc }) => ({
                expr: ctx.ToTast.Expression(expr, ctx),
                suffix,
                loc,
            })),
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
            value: +(contents.endsWith('u') ? contents.slice(0, -1) : contents),
            loc,
            kind: contents.includes('.')
                ? 'Float'
                : contents.endsWith('u')
                ? 'UInt'
                : 'Int',
        };
    },
};

export const ToAst = {
    TemplateString(
        { type, first, rest, loc }: t.TemplateString,
        ctx: ACtx,
    ): p.TemplateString {
        return {
            type: 'TemplateString',
            loc,
            first,
            rest: rest.map(({ expr, suffix, loc }) => ({
                type: 'TemplatePair',
                wrap: {
                    expr: ctx.ToAst.Expression(expr, ctx),
                    loc,
                    type: 'TemplateWrap',
                },
                suffix,
                loc,
            })),
        };
    },
    Boolean({ type, value, loc }: t.Boolean, ctx: ACtx): p.Boolean {
        return { type, v: value ? 'true' : 'false', loc };
    },
    Number({ type, value, loc, kind }: t.Number, ctx: ACtx): p.Number {
        let contents = value.toString();
        if (kind === 'Float' && !contents.includes('.')) {
            contents += '.0';
        }
        if (kind === 'UInt') {
            contents += 'u';
        }
        return {
            type,
            contents,
            loc,
        };
    },
};

export const ToPP = {
    TemplateString(ts: p.TemplateString, ctx: PCtx): pp.PP {
        if (!ts.rest.length) {
            return pp.atom(`"${ts.first}"`, ts.loc);
        }
        let items: pp.PP[] = [pp.atom(`"${ts.first}\${`, noloc)];
        ts.rest.forEach(({ wrap: { expr }, suffix, loc }, i) => {
            items.push(ctx.ToPP.Expression(expr, ctx));
            items.push(
                pp.atom(
                    '}' + suffix + (i === ts.rest.length - 1 ? '"' : '${'),
                    loc,
                ),
            );
        });
        return pp.items(items, ts.loc);
    },
    Boolean(bool: p.Boolean, ctx: PCtx): pp.PP {
        return pp.atom(bool.v, bool.loc);
    },
    Number(int: p.Number, ctx: PCtx): pp.PP {
        return pp.atom(int.contents, int.loc);
    },
};

export const ToIR = {
    Number: (x: t.Number, ctx: ICtx) => x,
    Boolean: (x: t.Boolean, ctx: ICtx) => x,
    Ref: (x: t.Ref, ctx: ICtx) => x,
    TemplateString(x: t.TemplateString, ctx: ICtx): t.ITemplateString {
        return {
            ...x,
            rest: x.rest.map((part) => ({
                ...part,
                expr: ctx.ToIR[part.expr.type](part.expr as any, ctx),
            })),
        };
    },
};

import * as b from '@babel/types';
import { Ctx as JCtx } from '../ir/to-js';
import { findBuiltinName } from './base';
export const ToJS = {
    Number(x: t.Number, ctx: JCtx): b.NumericLiteral {
        return b.numericLiteral(x.value);
    },
    Boolean(x: t.Boolean, ctx: JCtx): b.BooleanLiteral {
        return b.booleanLiteral(x.value);
    },
    Ref(x: t.Ref, ctx: JCtx): b.Identifier {
        if (x.kind.type === 'Global') {
            const name = findBuiltinName(x.kind.id, ctx.actx);
            if (name) {
                return b.identifier(name);
            }
        }
        if (x.kind.type === 'Local') {
        }
        return b.identifier(t.refHash(x.kind));
    },
    TemplateString(x: t.ITemplateString, ctx: JCtx): b.TemplateLiteral {
        return b.templateLiteral(
            [x.first]
                .concat(x.rest.map((r) => r.suffix))
                .map((t) => b.templateElement({ raw: t })),
            x.rest.map((r) => ctx.ToJS.IExpression(r.expr, ctx)),
        );
    },
};
