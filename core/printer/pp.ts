// A basic width-aware pretty printer

import { Loc } from '../grammar/base.parser';

export type Extra = { type: 'Error' };
export type ExtraId = { type: 'id'; id: string; isType: boolean };
export type BreakMode = 'never' | 'always' | 'sometimes';

export const items = (
    items: Array<PP | null>,
    breakMode: BreakMode = 'never',
    loc?: Loc,
    attributes?: Array<string | Extra>,
): PP => ({
    type: 'items',
    items: items.filter((x) => x != null) as Array<PP>,
    breakMode,
    loc,
    attributes,
});
export const args = (
    contents: Array<PP | null>,
    left = '(',
    right = ')',
    trailing = true,
    loc?: Loc,
    rest?: PP,
): PP => ({
    type: 'args',
    contents: contents.filter((m) => m != null) as Array<PP>,
    left,
    right,
    trailing,
    loc,
    rest,
});
export const block = (
    contents: Array<PP | null>,
    sep: string = ';',
    loc?: Loc,
): PP => ({
    type: 'block',
    contents: contents.filter((c) => c != null) as Array<PP>,
    sep,
    loc,
});
export const atom = (
    text: string,
    attributes?: Array<string>,
    loc?: Loc,
): PP => {
    if (text == null) {
        throw new Error(`Empty atom!`);
    }
    return {
        type: 'atom',
        text,
        attributes,
        loc,
    };
};
export const id = (text: string, id: string, kind: string, loc?: Loc): PP => {
    if (text == null) {
        throw new Error(`ID with no text`);
    }
    return {
        type: 'id',
        text,
        id,
        kind,
        loc,
    };
};

type Block = {
    type: 'block';
    contents: Array<PP>;
    sep: string;
    loc?: Loc;
}; // surrounded by {}

type Args = {
    type: 'args';
    contents: Array<PP>;
    left: string;
    right: string;
    trailing: boolean;
    loc?: Loc;
    rest?: PP;
}; // surrounded by ()

type Items = {
    type: 'items';
    items: Array<PP>;
    breakMode: 'never' | 'always' | 'sometimes';
    loc?: Loc;
    attributes?: Array<string | Extra>;
};

export type PP =
    | {
          type: 'atom';
          text: string;
          attributes?: Array<string>;
          loc: Loc | undefined;
      }
    | { type: 'id'; text: string; id: string; kind: string; loc?: Loc }
    | Block
    | Args
    | Items;

export const crawl = (x: PP, fn: (p: PP) => PP): PP => {
    switch (x.type) {
        case 'atom':
            return fn(x);
        case 'id':
            return fn(x);
        case 'block':
            x = fn(x) as Block;
            return {
                ...x,
                contents: x.contents.map((c) => crawl(c, fn)),
            };
        case 'args':
            x = fn(x) as Args;
            return {
                ...x,
                contents: x.contents.map((c) => crawl(c, fn)),
                rest: x.rest && crawl(x.rest, fn),
            };
        case 'items':
            x = fn(x) as Items;
            return {
                ...x,
                items: x.items.map((c) => crawl(c, fn)),
            };
    }
};

const white = (x: number) => new Array(x).fill(' ').join('');

const width = (x: PP): number => {
    switch (x.type) {
        case 'atom':
            // TODO: account for newlines?
            return x.text.length;
        case 'id':
            return x.text.length + 1 + x.id.length;
        case 'items':
            return x.items.reduce((w, x) => width(x) + w, 0);
        default:
            if (!x.contents.length) {
                return 2;
            }
            return (
                2 +
                x.contents.reduce((w, x) => width(x) + w, 0) +
                (x.contents.length - 1) * 2
            );
    }
};

export type StringOptions = {
    hideIds?: boolean;
    hideNames?: boolean;
    showErrors?: boolean;
};

export const printToStringInner = (
    pp: PP,
    maxWidth: number,
    options: StringOptions,
    sourceMap: SourceMap,
    current: { indent: number; pos: number; line: number } = {
        indent: 0,
        pos: 0,
        line: 0,
    },
): string => {
    const start = { line: current.line, column: current.pos };
    if (pp.type === 'atom') {
        let white: string = '';
        for (let i = 0; i < current.pos; i++) {
            white += ' ';
        }
        const lines = pp.text.split(/\n/g);
        current.pos += lines[lines.length - 1].length;
        current.line += lines.length - 1;
        if (pp.loc && pp.loc.idx) {
            sourceMap[pp.loc.idx] = {
                start,
                end: {
                    line: current.line,
                    column: current.pos,
                },
                idx: pp.loc.idx,
            };
        }
        return lines.join('\n' + white);
    }
    if (pp.type === 'id') {
        if (options.hideNames && pp.kind === 'type') {
            return `anon#${pp.id}`;
        }

        if (options.hideIds || !pp.id) {
            current.pos += pp.text.length;
        } else {
            current.pos += pp.text.length + 1 + pp.id.length;
        }
        current.line += pp.text.split(/\n/g).length - 1;

        if (pp.loc && pp.loc.idx) {
            sourceMap[pp.loc.idx] = {
                start,
                end: {
                    line: current.line,
                    column: current.pos,
                },
                idx: pp.loc.idx,
            };
        }

        if (options.hideIds || !pp.id) {
            return pp.text;
        }
        return pp.text + '#' + pp.id;
    }
    // Always breaks
    if (pp.type === 'block') {
        let res = '{';
        current.indent += 4;
        pp.contents.forEach((item) => {
            current.pos = current.indent;
            current.line += 1;
            res +=
                '\n' +
                white(current.indent) +
                printToStringInner(
                    item,
                    maxWidth,
                    options,
                    sourceMap,
                    current,
                ) +
                pp.sep;
        });
        current.indent -= 4;
        if (res.length > 1) {
            res += '\n' + white(current.indent);
            current.pos = current.indent;
        }
        current.pos += 1;
        res += '}';

        if (pp.loc && pp.loc.idx) {
            sourceMap[pp.loc.idx] = {
                start,
                end: {
                    line: current.line,
                    column: current.pos,
                },
                idx: pp.loc.idx,
            };
        }

        return res;
    }
    // Sometimes breaks
    if (pp.type === 'args') {
        const full = width(pp);
        // const full = pp.contents.reduce((w, x) => w + width(x), 0)
        if (current.pos + full <= maxWidth) {
            let res = pp.left;
            current.pos += 1;
            pp.contents.forEach((child, i) => {
                if (i !== 0) {
                    res += ', ';
                    current.pos += 2;
                }
                const ctext = printToStringInner(
                    child,
                    maxWidth,
                    options,
                    sourceMap,
                    current,
                );
                // current.pos += ctext.length;
                res += ctext;
            });
            current.pos += 1;

            if (pp.loc && pp.loc.idx) {
                sourceMap[pp.loc.idx] = {
                    start,
                    end: {
                        line: current.line,
                        column: current.pos,
                    },
                    idx: pp.loc.idx,
                };
            }

            return res + pp.right;
        }

        let res = pp.left;
        current.pos += 1;
        current.indent += 4;
        pp.contents.forEach((item, i) => {
            current.pos = current.indent;
            current.line += 1;
            res +=
                '\n' +
                white(current.indent) +
                printToStringInner(item, maxWidth, options, sourceMap, current);
            if (pp.trailing || i < pp.contents.length - 1) {
                res += ',';
            }
        });
        current.indent -= 4;
        if (res.length > 1) {
            current.line += 1;
            res += '\n' + white(current.indent);
            current.pos = current.indent;
        }
        current.pos += 1;
        res += pp.right;

        if (pp.loc && pp.loc.idx) {
            sourceMap[pp.loc.idx] = {
                start,
                end: {
                    line: current.line,
                    column: current.pos,
                },
                idx: pp.loc.idx,
            };
        }

        return res;
    }
    if (pp.type === 'items') {
        let prefix = '';
        if (
            options.showErrors &&
            pp.attributes?.find(
                (f) => typeof f === 'object' && f.type === 'Error',
            )
        ) {
            prefix = 'ERROR';
        }
        let shouldBreak =
            pp.breakMode === 'always' ||
            (pp.breakMode === 'sometimes' &&
                current.pos + width(pp) > maxWidth);
        if (shouldBreak) {
            let res = prefix;
            const extra = pp.breakMode === 'sometimes' ? 4 : 0;
            current.indent += extra;
            pp.items.forEach((item, i) => {
                if (i > 0) {
                    current.pos = current.indent;
                    current.line += 1;
                    res += '\n' + white(current.indent);
                }
                res += printToStringInner(
                    item,
                    maxWidth,
                    options,
                    sourceMap,
                    current,
                );
            });
            current.indent -= extra;
            // if (res.length > 1) {
            //     res += '\n' + white(current.indent);
            //     current.pos = current.indent;
            // }

            if (pp.loc && pp.loc.idx) {
                sourceMap[pp.loc.idx] = {
                    start,
                    end: {
                        line: current.line,
                        column: current.pos,
                    },
                    idx: pp.loc.idx,
                };
            }
            return res;
        }
        let res = prefix;
        pp.items.forEach((item) => {
            res += printToStringInner(
                item,
                maxWidth,
                options,
                sourceMap,
                current,
            );
        });

        if (pp.loc && pp.loc.idx) {
            sourceMap[pp.loc.idx] = {
                start,
                end: {
                    line: current.line,
                    column: current.pos,
                },
                idx: pp.loc.idx,
            };
        }
        return res;
    }
    throw new Error(`unexpected pp type ${JSON.stringify(pp)}`);
};

export const printToString = (
    pp: PP,
    maxWidth: number,
    options: StringOptions = { hideIds: false, hideNames: false },
    sourceMap: SourceMap = {},
): string => {
    return printToStringInner(pp, maxWidth, options, sourceMap, {
        indent: 0,
        pos: 0,
        line: 0,
    });
};

export type SourceItem = {
    start: { line: number; column: number };
    end: { line: number; column: number };
    idx: number;
};
/** So technically this is more of a RenderMap, it tracks
 * where the nodes ended up getting printed to.
 */
export type SourceMap = {
    [idx: number]: SourceItem;
};
