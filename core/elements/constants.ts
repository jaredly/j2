import { Ctx } from '..';
import { noloc } from '../ctx';
import * as p from '../grammar/base.parser';
import { Ctx as PCtx } from '../printer/to-pp';
import * as pp from '../printer/pp';
import * as t from '../typed-ast';
import { Expression, Loc } from '../typed-ast';
import { Ctx as ACtx } from '../typing/to-ast';
import { Visitor } from '../transform-tast';
import { decorate, VisitorCtx } from '../typing/analyze';
import { typeMatches } from '../typing/typesEqual';

export const grammar = `
Boolean "boolean" = v:("true" / "false") ![0-9a-zA-Z_]
Number "number" = _ contents:$("-"? [0-9]+ ("." [0-9]+)?)

String = "\"" text:$(stringChar*) "\""
TemplateString = "\"" first:$tplStringChars rest:TemplatePair* "\""
TemplatePair = "\${" _ expr:Expression _ "}" suffix:$tplStringChars
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

export type String = { type: 'String'; text: string; loc: Loc };

export const analyze: Visitor<VisitorCtx> = {
    Expression_TemplateString(node, { ctx, hit }) {
        let changed = false;
        const rest: TemplateString['rest'] = node.rest.map(
            ({ expr, suffix, loc }) => {
                const expt = ctx.getType(expr);
                // HMMMM This might ... end up wrapping multiple times?
                // like ... and the idxs we're doing to be having with noloc
                // are not going to disambiguate. I think I need to think
                // about this more.
                if (
                    expt &&
                    !typeMatches(expt, ctx.typeByName('string')!, ctx._full)
                ) {
                    changed = true;
                    return {
                        suffix,
                        loc,
                        expr: decorate(expr, `Expected string`, hit),
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
            rest: ts.rest.map(({ expr, suffix, loc }) => ({
                expr: ctx.ToTast[expr.type](expr as any, ctx),
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
            value: +contents,
            loc,
            kind: contents.includes('.') ? 'Float' : 'Int',
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
                expr: ctx.ToAst[expr.type](expr as any, ctx),
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
        ts.rest.forEach(({ expr, suffix, loc }, i) => {
            items.push(ctx.ToPP[expr.type](expr as any, ctx));
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
