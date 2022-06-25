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
    aliases: { [key: string]: string };
    builtins: Builtin[];
    input: string;
    output: string;
    failing: boolean;
    // i: number;
};

export const locClearVisitor: Visitor<null> = { Loc: () => noloc };

export const clearLocs = (ast: File) => {
    return transformFile(ast, locClearVisitor, null);
};

const takeFirstLine = (text: string): [string, string] => {
    const lines = text.split('\n');
    return [lines[0], lines.slice(1).join('\n')];
};

export const parseFixture = (chunk: string, i: number): Fixture => {
    if (chunk.includes('----')) {
        const [first, input, output] = chunk.split('----');
        const [title, metaRaw] = takeFirstLine(first.trim());
        const meta = JSON.parse(metaRaw);
        return {
            title: title.replace(/^=+\[/, '').replace(/\]=+$/, '').trim(),
            input: input.trim(),
            output: output.trim(),
            ...meta,
        };
    }

    const [input, output] = chunk.trim().split('\n-->\n');
    const [title, ...rest] = input.split('\n');
    const builtins: Builtin[] = [];
    const aliases: { [key: string]: string } = {};
    while (rest[0].startsWith('//:')) {
        if (rest[0].startsWith('//:aliases:')) {
            rest.shift()!
                .slice('//:aliases:'.length)
                .split(',')
                .forEach((line) => {
                    const [key, value] = line.split('=');
                    aliases[value] = key;
                });
        } else {
            builtins.push(parseBuiltin(rest.shift()!));
        }
    }
    return {
        title: title.replace(/^=+\[/, '').replace(/\]=+$/, '').trim(),
        builtins,
        aliases,
        input: rest.join('\n').trim(),
        output,
        failing: false,
        // i,
    };
};

export const serializeFixture = ({
    title,
    input,
    output,
    builtins,
    aliases,
    failing,
}: Fixture) => {
    return `==[${title}]==\n${JSON.stringify({
        builtins,
        aliases,
        failing,
    })}\n----\n${input}\n----\n${output}`;

    // return `==[${title}]==\n${
    //     builtins.length ? builtins.join('\n') + '\n' : ''
    // }${
    //     Object.keys(aliases).length
    //         ? `//:aliases:${Object.keys(aliases)
    //               .map((k) => `${aliases[k]}=${k}`)
    //               .join(',')}\n`
    //         : ''
    // }\n${input}\n-->\n${output}`;
};

export const parseFixtureFile = (inputRaw: string) => {
    return inputRaw
        .split(/(?=\n==[^\n=]*==\n)/)
        .filter((x) => x.trim())
        .map((chunk, i) => parseFixture(chunk, i));
};

export const loadFixtures = (fixtureFile: string) => {
    let fixtures: Fixture[] = parseFixtureFile(
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
    // input: string;
    output: string;
    aliases: Fixture['aliases'];
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
            .map(({ output }, i) =>
                serializeFixture({ ...fixtures[i], output }),
            )
            .join('\n\n'),
    );
};

export function runFixture({ builtins, input, output, aliases }: Fixture) {
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
    let outputTast;

    const ctx2 = fullContext(aliases);
    loadBuiltins(builtins, ctx2);
    outputTast = ctx2.ToTast.File(fixComments(parseFile(output)), ctx2);

    return {
        ctx,
        ctx2,
        checked,
        newOutput,
        outputTast,
        aliases: actx.backAliases,
    };
}

function loadBuiltins(builtins: Builtin[], ctx: FullContext) {
    builtins.forEach((builtin) => {
        switch (builtin.kind) {
            case 'value':
                const ast = parseType(builtin.type);
                const tast = ctx.ToTast[ast.type](ast as any, ctx);
                addBuiltin(ctx, builtin.name, tast);
                break;
            case 'type':
                addBuiltinType(ctx, builtin.name, builtin.args);
                break;
            case 'decorator':
                addBuiltinDecorator(ctx, builtin.name, 0);
                break;
        }
    });
}

export type Builtin =
    | { kind: 'value'; name: string; type: string }
    | { kind: 'type'; name: string; args: number }
    | {
          kind: 'decorator';
          name: string;
      };
function parseBuiltin(line: string): Builtin {
    const [_, kind, name, ...rest] = line.split(':');
    switch (kind) {
        case 'value':
            const typeRaw = rest.join(':').trim();
            return { kind: 'value', name, type: typeRaw };
        case 'type':
            return { kind: 'type', name, args: +rest };
        case 'decorator':
            return { kind: 'decorator', name };
        default:
            throw new Error(`Invalid builtin line`);
    }
}
