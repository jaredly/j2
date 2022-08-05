import * as React from 'react';
import { Colorable, colors, styles } from './Highlight';
import { HL } from './HL';
import { Leaf, Tree } from './markUpTree';

export const treeToHtmlLines = (tree: Tree, noPrefix = false) => {
    const lines = treeToLines(tree);
    return lines
        .map((line) => `<div>${oneLine(line, noPrefix)}</div>`)
        .join('');

    // return `<div>${treeToHtmlLinesInner(tree, [], noPrefix)}</div>`;
};

const oneLine = (tree: Tree, noPrefix = false): string => {
    return `${openSpan(tree.hl, noPrefix)}${tree.children
        .map((child, i) =>
            child.type === 'leaf'
                ? `<span data-span="${child.span[0]}:${child.span[1]}" style="padding: 2px 0">${child.text}</span>`
                : oneLine(child, noPrefix),
        )
        .join('')}</span>`;
};

const serializeStyles = (styles?: React.CSSProperties) => {
    if (!styles) {
        return '';
    }
    let items: string[] = [];
    Object.keys(styles).forEach((k) => {
        items.push(`${k}:${(styles as any)[k]}`);
    });
    return '; ' + items.join('; ');
};

export const openSpan = (hl: HL, noPrefix = false, noSuffix = false) =>
    `<span class="${hl.type}" style="color: ${colors[hl.type] ?? '#aaa'}${
        hl.underline
            ? '; text-decoration: underline; text-decoration-style: wavy; text-decoration-color: ' +
              hl.underline
            : ''
    }${serializeStyles(styles[hl.type])}"${
        hl.prefix && !noPrefix
            ? ` data-prefix="${escapeAttr(hl.prefix.text)}"`
            : ''
    }${
        !noPrefix && hl.prefix?.message
            ? ` data-message="${escapeAttr(
                  hl.prefix.message,
              )}" title="${escapeAttr(hl.prefix.message)}"`
            : ''
    }${
        !noSuffix && hl.suffix
            ? ` data-suffix="${escapeAttr(hl.suffix.text)}"`
            : ''
    }${
        !noSuffix && hl.suffix?.message
            ? ` data-suffix-message="${escapeAttr(
                  hl.suffix.message,
              )}" title="${escapeAttr(hl.suffix.message)}"`
            : ''
    }${
        styles[hl.type]?.contentEditable == false
            ? ' contentEditable="false"'
            : ''
    }>`;

export const escapeLine = (line: string) => {
    return line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

export const escapeAttr = (attr: string) => {
    return escapeLine(attr).replace(/"/g, '&quot;');
};

export const treeToLines = (tree: Tree) => {
    // debugger;
    const top: HL = { type: 'Top' as Colorable, loc: tree.hl.loc };
    const treeLines: Tree[] = [{ type: 'tree', children: [], hl: top }];
    let path: Tree[] = [treeLines[0]];
    const newLine = () => {
        const nt: Tree = { type: 'tree', children: [], hl: top };
        treeLines.push(nt);
        const np: Tree[] = [nt];
        // console.log('newLine', path.slice());
        path.pop();
        while (path.length) {
            const got = path.pop()!;
            const next: Tree = {
                ...got,
                children: [],
                hl: { ...got.hl, prefix: undefined, suffix: undefined },
            };
            np[0].children.push(next);
            np.unshift(next);
        }
        path = np;
        // console.log('andThen', path.slice());
    };
    const inner = (item: Tree | Leaf) => {
        if (item.type === 'leaf') {
            const lines = item.text.split('\n');
            lines.forEach((line, i) => {
                path[0].children.push({ ...item, text: line });
                if (i < lines.length - 1) {
                    newLine();
                }
            });
        } else {
            const next = {
                ...item,
                children: [],
                hl: { ...item.hl, suffix: undefined },
            };
            path[0].children.push(next);
            path.unshift(next);
            item.children.forEach(inner);
            path.shift()!.hl.suffix = item.hl.suffix;
        }
    };
    inner(tree);
    return treeLines;
};

export const treeToHtmlLinesInner = (
    tree: Tree,
    path: HL[],
    noPrefix = false,
): string => {
    // ohhh how do I deal with opening lines and closing ones
    return `${openSpan(tree.hl, noPrefix)}${tree.children
        .map((child, i) =>
            child.type === 'leaf'
                ? `<span data-span="${child.span[0]}:${
                      child.span[1]
                  }">${child.text
                      .split('\n')
                      .map(escapeLine)
                      .join(
                          path.map(() => '</span>').join('') +
                              '</div><div>' +
                              path.map((h) => openSpan(h, true, true)).join(''),
                      )}</span>`
                : treeToHtmlLinesInner(child, path.concat([tree.hl]), noPrefix),
        )
        .join('')}</span>`;
};
