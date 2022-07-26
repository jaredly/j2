import generate from '@babel/generator';
import * as fs from 'fs';
import {
    addBuiltin,
    addBuiltinDecorator,
    addBuiltinType,
    FullContext,
    hashTypes,
    noloc,
} from '../../ctx';
import { fileToTast, typeToplevelT } from '../../elements/base';
import { TVar } from '../../elements/type-vbls';
import { parseFile, parseType } from '../../grammar/base.parser';
import { fixComments } from '../../grammar/fixComments';
import { iCtx } from '../../ir/ir';
import { jCtx, Ctx as JCtx } from '../../ir/to-js';
import { printToString } from '../../printer/pp';
import { newPPCtx, pegPrinter } from '../../printer/to-pp';
import {
    transformExpression,
    transformFile,
    transformToplevel,
    transformType,
    Visitor,
} from '../../transform-tast';
import { Expression, File, Loc, Type } from '../../typed-ast';
import {
    errorCount,
    initVerify,
    populateSyms,
    Verify,
    verify,
    verifyVisitor,
} from '../analyze';
import { getType } from '../getType';
import { Ctx, printCtx } from '../to-ast';

export type FixtureFile = {
    builtins: Builtin[];
    fixtures: Array<Fixture>;
};

export type Fixture = {
    title: string;
    input: string;
    builtins: Builtin[];
    output_expected: string;
    output_failed: string;
    shouldFail: boolean;
};

export const locClearVisitor: Visitor<null> = {
    Loc: () => noloc,
    // RefKind(node) {
    //     if (node.type === 'Global') {
    //         return { ...node, id: idToString(node.id) as any } as RefKind;
    //     }
    //     return null;
    // },
};

export const clearLocs = (ast: File) => {
    return transformFile(ast, locClearVisitor, null);
};

export const serializeSections = (
    map: { [key: string]: string },
    char = '=',
) => {
    return Object.keys(map)
        .filter((k) => map[k].trim().length > 0)
        .map(
            (key) => `${char}${char}[${key}]${char}${char}\n${map[key].trim()}`,
        )
        .join('\n\n');
};

export const loadSections = (data: string, char = '=') => {
    const sections: { [key: string]: string } = {};
    if (!data) {
        return sections;
    }
    let section = '';
    let sectionName = '';
    for (const line of data.split('\n')) {
        if (
            line.startsWith(char + char + '[') &&
            line.endsWith(']' + char + char)
        ) {
            if (section) {
                sections[sectionName] = section;
            }
            section = '';
            sectionName = line.slice(3, -3);
        } else {
            section += line + '\n';
        }
    }
    if (section) {
        sections[sectionName] = section;
    }
    return sections;
};

export const aliasesToString = (
    aliases: { [key: string]: string },
    mid = '=',
) =>
    Object.keys(aliases).length
        ? 'alias ' +
          Object.entries(aliases)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([key, value]) => {
                  return `${key}${mid}${value}`;
              })
              .join(' ') +
          '\n'
        : '';

export const aliasesFromString = (raw: string) => {
    return raw
        .slice('alias '.length)
        .split(' ')
        .reduce((acc, cur) => {
            const [key, value] = cur.split('=');
            acc[key] = value;
            return acc;
        }, {} as { [key: string]: string });
};

export const splitAliases = (text: string): [string, string] => {
    if (text.startsWith('alias ')) {
        const idx = text.indexOf('\n');
        return [text.slice(0, idx), text.slice(idx + 1)];
    }
    return ['', text];
};

export const serializeFixtureFile = (file: FixtureFile) => {
    const fixmap: { [key: string]: string } = {};
    file.fixtures.forEach((fixture) => {
        while (fixmap[fixture.title]) {
            fixture.title += '_';
        }
        fixmap[fixture.title] = serializeSections(
            {
                [fixture.shouldFail ? 'input:shouldFail' : 'input']:
                    fixture.input,
                'output:expected': fixture.output_expected,
                'output:failed': fixture.output_failed,
                builtins: fixture.builtins.map(serializeBuiltin).join('\n'),
            },
            '-',
        );
    });
    return serializeSections(
        {
            builtins: file.builtins.map(serializeBuiltin).join('\n'),
            fixtures: serializeSections(fixmap, '='),
        },
        '#',
    );
};

export const parseFixtureFile = (inputRaw: string): FixtureFile => {
    const toplevel = loadSections(inputRaw, '#');
    const fix = loadSections(toplevel['fixtures'], '=');
    const fixtures = Object.entries(fix).map(([title, data]): Fixture => {
        const items = loadSections(data, '-');
        return {
            title,
            input: (items['input'] ?? items['input:shouldFail'])?.trim() ?? '',
            output_expected: items['output:expected']?.trim() ?? '',
            output_failed: items['output:failed']?.trim() ?? '',
            shouldFail: 'input:shouldFail' in items,
            builtins:
                items['builtins']
                    ?.trim()
                    ?.split('\n')
                    .filter(Boolean)
                    .map(parseBuiltin) ?? [],
        };
    });
    return {
        builtins:
            toplevel['builtins']
                ?.trim()
                .split('\n')
                .filter(Boolean)
                .map(parseBuiltin) ?? [],
        fixtures,
    };
};

export const loadFixtures = (fixtureFile: string) => {
    let file = parseFixtureFile(fs.readFileSync(fixtureFile, 'utf8'));
    let hasOnly = file.fixtures.some((f) => f.title.includes('[only]'));

    if (hasOnly) {
        hasOnly = true;
        file.fixtures = file.fixtures.filter((f) => f.title.includes('[only]'));
    }

    return { file, hasOnly };
};

export const parseRaw = (
    raw: string,
    ctx: FullContext,
): [File, FullContext] => {
    if (raw.startsWith('alias ')) {
        const idx = raw.indexOf('\n');
        ctx = ctx.withAliases(
            aliasesFromString(raw.slice(0, idx)),
        ) as FullContext;
        raw = raw.slice(idx + 1);
    }
    const ast = parseFile(raw);
    const [file, tctx] = fileToTast(fixComments(ast), ctx);
    return [file, tctx as FullContext];
};

export type FixtureResult = {
    ctx: FullContext;
    ctx2: FullContext;
    input: string;
    checked: File;
    verify: Verify;
    newOutput: string;
    outputTast: File;
    outputVerify: Verify;
    aliases: { [key: string]: string };
};

export function runFixture(
    { input, output_expected, output_failed, builtins }: Fixture,
    baseCtx: FullContext,
): FixtureResult {
    let ctx = baseCtx.clone();
    loadBuiltins(builtins, ctx);

    let checked: File;
    try {
        [checked, ctx] = parseRaw(input, ctx);
    } catch (err) {
        console.log('Failed to parse input:', input);
        console.log(err);
        // throw err;
        checked = { type: 'File', toplevels: [], loc: noloc, comments: [] };
    }
    let actx = printCtx(ctx);
    // const backAliases = {};
    let jctx = jCtx(ctx);

    const printed = checked.toplevels.map((top) => {
        ctx.resetSym();
        populateSyms(top, ctx);
        if (top.type === 'TypeAlias' || top.type === 'ToplevelLet') {
            const tt = typeToplevelT(top, ctx);
            jctx.actx = ctx = ctx.toplevelConfig(tt) as FullContext;
            actx = actx.withToplevel(tt);
            // jctx.actx = actx.actx as FullContext;
        }

        if (top.type === 'ToplevelExpression') {
            const { loc, expr } = top;
            const t = getType(expr, ctx);
            if (!t) {
                checked.comments.push([
                    {
                        ...loc,
                        start: loc.end,
                    },
                    '// Error, no type!',
                ]);
                return actx.ToAst.Toplevel(top, actx);
            }
            validateExpression(ctx, jctx, expr, actx, t, checked, loc);
        }
        if (top.type === 'ToplevelLet') {
            top.elements.forEach((el) => {
                const t = getType(el.expr, ctx);
                if (!t) {
                    checked.comments.push([
                        {
                            ...el.loc,
                            start: el.loc.end,
                        },
                        '// Error, no type!',
                    ]);
                    return;
                }
                validateExpression(
                    ctx,
                    jctx,
                    el.expr,
                    actx,
                    t,
                    checked,
                    el.loc,
                );
            });
        }

        return actx.ToAst.Toplevel(top, actx);
    });

    const newOutput = printToString(
        pegPrinter(
            {
                type: 'File',
                toplevels: printed,
                loc: checked.loc,
                comments: checked.comments,
            },
            newPPCtx(false),
        ),
        100,
    );

    let outputTast: File;

    let output = output_expected ? output_expected : output_failed;

    let ctx2 = baseCtx.clone();
    loadBuiltins(builtins, ctx2);
    try {
        // hmmmmm so what about ...
        // removing error decorators, first? seems like I
        // need to do it.
        [outputTast, ctx2] = parseRaw(output, ctx2);
    } catch (err) {
        console.log(output);
        console.log(err);
        // throw err;
        // throw err;
        outputTast = { type: 'File', toplevels: [], loc: noloc, comments: [] };
    }

    return {
        ctx,
        ctx2,
        input,
        checked,
        verify: verify(checked, ctx),
        newOutput: aliasesToString(actx.backAliases) + newOutput,
        outputTast,
        outputVerify: verify(outputTast, ctx2),
        aliases: actx.backAliases,
    };
}

function validateExpression(
    ctx: FullContext,
    jctx: JCtx,
    expr: Expression,
    actx: Ctx,
    t: Type,
    checked: File,
    loc: Loc,
) {
    const ictx = iCtx(ctx);
    const ir = ictx.ToIR.Expression(expr, ictx);
    const js = jctx.ToJS.IExpression(ir, jctx);
    const jsraw = generate(js).code;
    const pp = newPPCtx(false);
    const ast = actx.ToAst.Type(t, actx);
    const cm = printToString(pp.ToPP.Type(ast, pp), 200);
    checked.comments.push([
        { ...loc, start: loc.end },
        '// ' + cm, // + ' ' + jsraw + ' */',
    ]);
    const results: Verify = initVerify();
    transformExpression(expr, verifyVisitor(results, ctx), ctx);
    if (!errorCount(results)) {
        checked.comments.push([
            { ...loc, start: loc.end },
            '/* ' + jsraw + ' */',
        ]);
    }
}

export function loadBuiltins(builtins: Builtin[], ctx: FullContext) {
    builtins.forEach((builtin) => {
        switch (builtin.kind) {
            case 'value':
                try {
                    const ast = parseType(builtin.type);
                    const tast = ctx.ToTast.Type(ast, ctx);
                    addBuiltin(ctx, builtin.name, tast);
                } catch (err) {
                    console.error(err);
                }
                break;
            case 'type': {
                let args: TVar[] = [];
                if (builtin.args) {
                    const ast = parseType(builtin.args + 'ok');
                    const tast = ctx.ToTast.Type(ast, ctx);
                    if (tast.type === 'TVars') {
                        args = tast.args.map((arg) => ({ ...arg, loc: noloc }));
                    }
                }
                addBuiltinType(ctx, builtin.name, args);
                break;
            }
            case 'decorator':
                addBuiltinDecorator(ctx, builtin.name, 0);
                break;
        }
    });
}

export type Builtin =
    | { kind: 'value'; name: string; type: string }
    | { kind: 'type'; name: string; args: string }
    | {
          kind: 'decorator';
          name: string;
      };
export function parseBuiltin(line: string): Builtin {
    const [_, kind, name, ...rest] = line.split(':');
    switch (kind) {
        case 'value':
            const typeRaw = rest.join(':').trim();
            return { kind: 'value', name, type: typeRaw };
        case 'type':
            return { kind: 'type', name, args: rest.join(':') };
        case 'decorator':
            return { kind: 'decorator', name };
        default:
            throw new Error(`Invalid builtin line: ${line}`);
    }
}

export const serializeBuiltin = (builtin: Builtin): string => {
    switch (builtin.kind) {
        case 'value':
            return `//:value:${builtin.name}:${builtin.type}`;
        case 'decorator':
            return `//:decorator:${builtin.name}`;
        case 'type':
            return `//:type:${builtin.name}:${builtin.args}`;
    }
};
