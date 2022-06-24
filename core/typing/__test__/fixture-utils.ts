import * as fs from 'fs';
import {
    addBuiltin,
    addBuiltinDecorator,
    addBuiltinType,
    FullContext,
    fullContext,
    noloc,
} from '../../ctx';
import { parseFile, parseType } from '../../grammar/base.parser';
import { fixComments } from '../../grammar/fixComments';
import { newPPCtx, pegPrinter } from '../../printer/to-pp';
import { printToString } from '../../printer/pp';
import { transformFile, Visitor } from '../../transform-tast';
import { File, refHash } from '../../typed-ast';
import { analyze, analyzeContext, verify } from '../analyze';
import { printCtx, ToAst } from '../to-ast';
import { makeToTast, ToTast } from '../to-tast';
import { getType } from '../getType';
import { idToString } from '../../ids';

export type Fixture = {
    title: string;
    builtins: string[];
    input: string;
    output: string;
    errors: string | undefined;
    i: number;
};

export const locClearVisitor: Visitor<null> = { Loc: () => noloc };

export const clearLocs = (ast: File) => {
    return transformFile(ast, locClearVisitor, null);
};

export const parseFixture = (inputRaw: string) => {
    return inputRaw
        .split(/(?=\n==[^\n=]*==\n)/)
        .filter((x) => x.trim())
        .map((chunk, i) => {
            const [input, output, errors] = chunk.trim().split('\n-->\n');
            const [title, ...rest] = input.split('\n');
            const builtins: string[] = [];
            while (rest[0].startsWith('//:')) {
                builtins.push(rest.shift()!);
            }
            return {
                title,
                builtins,
                input: rest.join('\n').trim(),
                output,
                errors,
                i,
            };
        });
};

export const loadFixtures = (fixtureFile: string) => {
    let fixtures: Fixture[] = parseFixture(
        fs.readFileSync(fixtureFile, 'utf8'),
    );
    let hasOnly = fixtures.some((f) => f.title.includes('[only]'));

    if (hasOnly) {
        hasOnly = true;
        fixtures = fixtures.filter((f) => f.title.includes('[only]'));
    }

    return { fixtures, hasOnly };
};

export type Fixed = {
    input: string;
    output: string;
    errors: string | undefined;
};

/* istanbul ignore next */
export const saveFixed = (
    fixtureFile: string,
    fixtures: Fixture[],
    fixed: Fixed[],
) => {
    let missing = false;
    for (let i = 0; i < fixtures.length; i++) {
        if (!fixed[i]) {
            missing = true;
            break;
        }
    }
    if (missing) {
        console.warn(`Not writing fixtures, looks like something failed`);
        return;
    }
    fs.writeFileSync(
        fixtureFile,
        fixed
            .map(
                ({ input, output, errors }) =>
                    `${input}\n-->\n${output}` +
                    (errors ? '\n-->\n' + errors : ''),
            )
            .join('\n\n'),
    );
};

export function runFixture(builtins: string[], input: string, output: string) {
    const ctx = fullContext();

    loadBuiltins(builtins, ctx);

    let tast;
    try {
        tast = ctx.ToTast.File(fixComments(parseFile(input)), ctx);
    } catch (err) {
        console.log('Failed to parse input:', input);
        throw err;
    }

    const actx = printCtx(ctx);

    const checked = analyze(tast, analyzeContext(ctx));
    checked.toplevels.forEach((top) => {
        const t = getType(top.expr, ctx);
        if (!t) {
            return;
        }
        const pp = newPPCtx(false);
        const ast = actx.ToAst[t.type](t as any, actx);
        const cm = printToString(pp.ToPP[ast.type](ast as any, pp), 200);
        checked.comments.push([
            {
                ...top.loc,
                start: top.loc.end,
            },
            '// ' + cm,
        ]);
    });

    const newOutput = printToString(
        pegPrinter(actx.ToAst.File(checked, actx), newPPCtx(false)),
        100,
    );

    const { errorDecorators, missingTypes } = verify(
        checked,
        analyzeContext(ctx),
    );
    let errorText: string[] = [];
    if (errorDecorators.length) {
        errorText.push(`🚨 ${errorDecorators.length} error decorators`);
    }
    if (missingTypes.length) {
        errorText.push(`🚨 ${missingTypes.length} missing types`);
    }
    let outputTast;
    try {
        const ctx = fullContext();

        loadBuiltins(builtins, ctx);
        outputTast = ctx.ToTast.File(fixComments(parseFile(output)), ctx);
    } catch (err) {}
    return {
        errorText: errorText.length ? errorText.join('\n') : null,
        checked,
        newOutput,
        outputTast,
        aliases: actx.aliases,
    };
}

function loadBuiltins(builtins: string[], ctx: FullContext) {
    builtins.forEach((line) => {
        const [_, kind, name, ...rest] = line.split(':');
        switch (kind) {
            case 'value':
                const typeRaw = rest.join(':').trim();
                const ast = parseType(typeRaw);
                const tast = ctx.ToTast[ast.type](ast as any, ctx);
                addBuiltin(ctx, name, tast);
                break;
            case 'type':
                addBuiltinType(ctx, name, +rest);
                break;
            case 'decorator':
                addBuiltinDecorator(ctx, name, 0);
                break;
        }
    });
}
