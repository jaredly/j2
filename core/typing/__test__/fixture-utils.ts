import generate from '@babel/generator';
import * as b from '@babel/types';
import * as fs from 'fs';
import { refmt } from '../../../devui/refmt';
import {
    addBuiltin,
    addBuiltinDecorator,
    addBuiltinType,
    builtinContext,
    FullContext,
    locClearVisitor,
    noloc,
} from '../../ctx';
import { fileToTast } from '../../elements/base';
import { TVar } from '../../elements/type-vbls';
import { processFile } from '../../full/full';
import { parseFile, parseType } from '../../grammar/base.parser';
import { fixComments } from '../../grammar/fixComments';
import { printToString } from '../../printer/pp';
import { newPPCtx } from '../../printer/to-pp';
import { transformFile } from '../../transform-tast';
import { File } from '../../typed-ast';
import { errorCount } from '../analyze';

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

export const aliasesToString = (aliases: { [key: string]: string }) =>
    Object.keys(aliases).length
        ? 'alias ' +
          Object.entries(aliases)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([key, value]) => {
                  return `${key}#[${value}]`;
              })
              .join(' ') +
          '\n'
        : '';

export const aliasesFromString = (raw: string) => {
    return raw
        .slice('alias '.length)
        .split(' ')
        .filter((s) => s.trim())
        .reduce((acc, cur) => {
            const [key, value] = cur.split('#');
            acc[key] = value.slice(1, -1);
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

export const fmtify = (text: string, builtins: Builtin[]) => {
    if (!text.trim()) {
        return text.trim();
    }
    const [aliasesRaw, rest] = splitAliases(text);
    const aliases = aliasesFromString(aliasesRaw);

    if (1 == 1) {
        return aliasesToString(aliases) + rest;
    }

    let ctx = builtinContext.clone();
    ctx = ctx.withAliases(aliases) as FullContext;
    loadBuiltins(builtins, ctx);
    const result = processFile(rest, ctx);

    if (result.type === 'Success') {
        const pctx = result.pctx;
        const pp = newPPCtx(false);
        result.info.forEach((info) => {
            const errors = errorCount(info.verify);
            if (!errors) {
                info.contents.irtops?.forEach((ir) => {
                    if (ir.type) {
                        const ast = pctx.ToAst.Type(ir.type, pctx);
                        const cm = printToString(pp.ToPP.Type(ast, pp), 200);
                        result.comments.push([
                            {
                                ...info.contents.top.loc,
                                start: info.contents.top.loc.end,
                            },
                            '// ' + cm,
                        ]);
                    }

                    let js: b.Node = ir.js;
                    if (
                        ir.js.body.length === 1 &&
                        ir.js.body[0].type === 'ReturnStatement'
                    ) {
                        js = ir.js.body[0].argument!;
                    }
                    const jsraw = generate(js).code;
                    result.comments.push([
                        {
                            ...info.contents.top.loc,
                            start: info.contents.top.loc.end,
                        },
                        '/* ' + jsraw + ' */',
                    ]);
                });
            }
        });
    }

    const res = refmt(result);
    // console.log(res);
    return res;
};

export const serializeFixtureFile = (file: FixtureFile) => {
    const fixmap: { [key: string]: string } = {};
    file.fixtures.forEach((fixture) => {
        // console.log('um', fixture.title, fixture.builtins);
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
