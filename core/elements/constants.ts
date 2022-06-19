import { Ctx } from '..';
import { noloc } from '../ctx';
import * as p from '../grammar/base.parser';
import { Ctx as PCtx, ToPP } from '../printer/pegPrinter';
import * as pp from '../printer/pp';
import * as t from '../typed-ast';
import { Expression, Loc } from '../typed-ast';
import { Ctx as ACtx, ToAst } from '../typing/to-ast';
import { ToTast } from '../typing/to-tast';

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

export const ConstantsToTast = {
    TemplateString(ts: p.TemplateString, ctx: Ctx): t.TemplateString {
        return {
            type: 'TemplateString',
            loc: ts.loc,
            first: ts.first,
            rest: ts.rest.map(({ expr, suffix, loc }) => ({
                expr: ToTast[expr.type](expr as any, ctx),
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

export const ConstantsToAst = {
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
                expr: ToAst[expr.type](expr as any, ctx),
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

export const ConstantsToPP = {
    TemplateString(ts: p.TemplateString, ctx: PCtx): pp.PP {
        if (!ts.rest.length) {
            return pp.atom(`"${ts.first}"`, ts.loc);
        }
        let items: pp.PP[] = [pp.atom(`"${ts.first}\${`, noloc)];
        ts.rest.forEach(({ expr, suffix, loc }, i) => {
            items.push(ToPP[expr.type](expr as any, ctx));
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
