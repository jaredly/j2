import * as fs from 'fs';
import objectHash from 'object-hash';
import {
    addBuiltin,
    addBuiltinDecorator,
    addBuiltinType,
    FullContext,
    fullContext,
    noloc,
} from '../../ctx';
import { TVar } from '../../elements/type';
import { parseFile, parseType } from '../../grammar/base.parser';
import { fixComments } from '../../grammar/fixComments';
import { printToString } from '../../printer/pp';
import { newPPCtx, pegPrinter } from '../../printer/to-pp';
import { transformFile, transformType, Visitor } from '../../transform-tast';
import { File } from '../../typed-ast';
import { analyze, analyzeContext, Verify, verify } from '../analyze';
import { getType } from '../getType';
import { printCtx } from '../to-ast';
import { Ctx } from '../to-tast';

export type FixtureFile = {
    builtins: Builtin[];
    fixtures: Array<Fixture>;
};

export type Fixture = {
    title: string;
    input: string;
    output_expected: string;
    output_failed: string;
    shouldFail: boolean;

    failing_deprecated: boolean;
    aliases_deprecated: { [key: string]: string };
    builtins_deprecated: Builtin[];
    // i: number;
};

export const locClearVisitor: Visitor<null> = { Loc: () => noloc };

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

export const aliasesToString = (aliases: { [key: string]: string }) =>
    Object.keys(aliases).length
        ? 'alias ' +
          Object.entries(aliases)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([key, value]) => {
                  return `${key}=${value}`;
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
                'output:expected':
                    (fixture.output_expected?.startsWith('alias ')
                        ? ''
                        : aliasesToString(fixture.aliases_deprecated)) +
                    fixture.output_expected,
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
            input: (items['input'] ?? items['input:shouldFail']).trim(),
            output_expected: items['output:expected']?.trim(),
            output_failed: items['output:failed']?.trim(),
            shouldFail: 'input:shouldFail' in items,

            // No longer needed
            aliases_deprecated: {}, // this will come from the output
            builtins_deprecated: [], // nope as well
            failing_deprecated: false, // comes from output_failed
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
        ctx.aliases = aliasesFromString(raw.slice(0, idx));
        raw = raw.slice(idx + 1);
    }
    const [file, tctx] = ctx.ToTast.File(fixComments(parseFile(raw)), ctx);
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
    { input, output_expected }: Fixture,
    builtins: Builtin[],
): FixtureResult {
    let ctx = fullContext();

    loadBuiltins(builtins, ctx);

    let tast;
    try {
        [tast, ctx] = parseRaw(input, ctx);
    } catch (err) {
        console.log('Failed to parse input:', input);
        console.log(err);
        throw err;
    }

    const actx = printCtx(ctx);

    const checked = analyze(tast, analyzeContext(ctx));
    checked.toplevels.forEach((top) => {
        if (top.type === 'ToplevelExpression') {
            const t = getType(top.expr, ctx);
            if (!t) {
                checked.comments.push([
                    {
                        ...top.loc,
                        start: top.loc.end,
                    },
                    '// Error, no type!',
                ]);
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
        } else if (top.type === 'TypeAlias') {
            const hash = objectHash(
                top.elements.map((t) =>
                    transformType(t.type, locClearVisitor, null),
                ),
            );
            checked.comments.push([
                {
                    ...top.loc,
                    start: top.loc.end,
                },
                '// h' + hash,
            ]);
        }
    });

    const newOutput = printToString(
        pegPrinter(actx.ToAst.File(checked, actx), newPPCtx(false)),
        100,
    );

    let outputTast;

    let ctx2 = fullContext();
    loadBuiltins(builtins, ctx2);
    try {
        [outputTast, ctx2] = parseRaw(output_expected, ctx2);
    } catch (err) {
        console.log(output_expected);
        console.log(err);
        throw err;
    }

    return {
        ctx,
        ctx2,
        input,
        checked,
        verify: verify(checked, analyzeContext(ctx)),
        newOutput: aliasesToString(actx.backAliases) + newOutput,
        outputTast,
        outputVerify: verify(outputTast, analyzeContext(ctx2)),
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
            case 'type': {
                let args: TVar[] = [];
                if (builtin.args) {
                    const ast = parseType(builtin.args + 'ok');
                    const tast = ctx.ToTast[ast.type](ast as any, ctx);
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
