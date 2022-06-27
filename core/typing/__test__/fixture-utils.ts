import * as fs from 'fs';
import {
    addBuiltin,
    addBuiltinDecorator,
    addBuiltinType,
    BuiltinTarg,
    FullContext,
    fullContext,
    noloc,
} from '../../ctx';
import { parseFile, parseType } from '../../grammar/base.parser';
import { fixComments } from '../../grammar/fixComments';
import { printToString } from '../../printer/pp';
import { newPPCtx, pegPrinter } from '../../printer/to-pp';
import { transformFile, Visitor } from '../../transform-tast';
import { File } from '../../typed-ast';
import { analyze, analyzeContext, Verify, verify } from '../analyze';
import { getType } from '../getType';
import { printCtx } from '../to-ast';

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

const takeFirstLine = (text: string): [string, string] => {
    const lines = text.split('\n');
    return [lines[0], lines.slice(1).join('\n')];
};

export const parseFixtureOld = (chunk: string, i: number): Fixture => {
    if (chunk.includes('----')) {
        const [first, input, output] = chunk.split('----');
        const [title, metaRaw] = takeFirstLine(first.trim());
        const meta = JSON.parse(metaRaw);
        return {
            title: title.replace(/^=+\[/, '').replace(/\]=+$/, '').trim(),
            input: input.trim(),
            output_expected: output.trim(),
            ...meta,
        };
    }

    const [input, output] = chunk.trim().split('\n-->\n');
    const [title, ...rest] = input.split('\n');
    const builtins: Builtin[] = [];
    const aliases: { [key: string]: string } = {};
    while (rest[0].startsWith('//:')) {
        console.log(rest[0]);
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
        builtins_deprecated: builtins,
        aliases_deprecated: aliases,
        input: rest.join('\n').trim(),
        failing_deprecated: false,
        output_expected: output,
        output_failed: '',
        shouldFail: false,
        // i,
    };
};

export const serializeFixtureOld = ({
    title,
    input,
    output_expected,
    builtins_deprecated: builtins,
    aliases_deprecated: aliases,
    failing_deprecated: failing,
}: Fixture) => {
    return `==[${title}]==\n${JSON.stringify({
        builtins,
        aliases,
        failing,
    })}\n----\n${input}\n----\n${output_expected}`;

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
    if (toplevel['fixtures']) {
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
    }

    const seen: { [key: string]: true } = {};
    let builtins: Builtin[] = [];
    return {
        fixtures: inputRaw
            .split(/(?=\n==[^\n=]*==\n)/)
            .filter((x) => x.trim())
            .map((chunk, i) => {
                const parsed = parseFixtureOld(chunk, i);
                parsed.builtins_deprecated.forEach((builtin) => {
                    const k = `${builtin.name}:${builtin.kind}`;
                    if (!seen[k]) {
                        seen[k] = true;
                        builtins.push(builtin);
                    }
                });
                return { ...parsed, builtins: [] };
            }),
        builtins,
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

// export type Fixed = {
//     // input: string;
//     output: string;
//     aliases: Fixture['aliases'];
// };

// export const saveFixed = (
//     fixtureFile: string,
//     fixtures: Fixture[],
//     fixed: Fixed[],
// ) => {
//     let missing = false;
//     for (let i = 0; i < fixtures.length; i++) {
//         if (!fixed[i]) {
//             missing = true;
//             break;
//         }
//     }
//     if (missing) {
//         console.warn(`Not writing fixtures, looks like something failed`);
//         return;
//     }
//     fs.writeFileSync(
//         fixtureFile,
//         fixed
//             .map(({ output }, i) =>
//                 serializeFixtureOld({
//                     ...fixtures[i],
//                     output_expected: output,
//                 }),
//             )
//             .join('\n\n'),
//     );
// };

export const parseRaw = (raw: string, ctx: FullContext): File => {
    if (raw.startsWith('alias ')) {
        const idx = raw.indexOf('\n');
        ctx.aliases = aliasesFromString(raw.slice(0, idx));
        raw = raw.slice(idx + 1);
    }
    return ctx.ToTast.File(fixComments(parseFile(raw)), ctx);
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
    const ctx = fullContext();

    loadBuiltins(builtins, ctx);

    let tast;
    try {
        tast = parseRaw(input, ctx);
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

    let outputTast;

    const ctx2 = fullContext();
    loadBuiltins(builtins, ctx2);
    try {
        outputTast = parseRaw(output_expected, ctx2);
    } catch (err) {
        console.log(output_expected);
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
                let args: BuiltinTarg[] = [];
                if (builtin.args) {
                    const ast = parseType(builtin.args + 'ok');
                    const tast = ctx.ToTast[ast.type](ast as any, ctx);
                    if (tast.type === 'TVars') {
                        args = tast.args.map(({ bound, default_ }) => ({
                            bound,
                            default_,
                        }));
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
