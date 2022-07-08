import * as React from 'react';
import { FullContext } from '../core/ctx';
import { Visitor } from '../core/transform-ast';
import { Colorable, colors, highlightLocations } from './Highlight';
import { markUpTree, Tree } from './markUpTree';

export const isAncestor = (child: Node | null, parent: Node) => {
    while (child) {
        if (child === parent) {
            return true;
        }
        child = child.parentElement;
    }
    return false;
};

export const getText = (node: HTMLDivElement) => {
    let text: string[] = [];
    node.childNodes.forEach((node) => {
        text.push(node.textContent ?? '');
    });
    return text.join('\n');
};

export type HistItem = { text: string; pos: number; prevPos: number };
export type History = { items: HistItem[]; idx: number };
export const undo = ({
    items,
    idx,
}: History): [History, { text: string; pos: number } | null] => {
    if (idx < items.length - 1) {
        // const { text } = items[items.length - 2 - idx];
        // const { prevPos: pos } = items[items.length - 1 - idx];
        return [{ items, idx: idx + 1 }, items[items.length - 2 - idx]];
    }
    return [{ items, idx: idx }, null];
};
export const redo = ({
    items,
    idx,
}: History): [History, { text: string; pos: number } | null] => {
    if (idx > 0) {
        return [{ items, idx: idx - 1 }, items[items.length - idx]];
    }
    return [{ items, idx: idx }, null];
};
export const update = (
    { items, idx }: History,
    text: string,
    pos: number,
    prevPos: number,
): History => {
    return {
        items: [...items.slice(0, items.length - idx), { text, pos, prevPos }],
        idx: 0,
    };
};

const initial = (v: string): History => ({
    items: [{ text: v, pos: 0, prevPos: 0 }],
    idx: 0,
});

export const Editor = ({
    ctx,
    text,
    onBlur,
    onChange,
}: {
    ctx: FullContext;
    text: string;
    onBlur: (text: string) => void;
    onChange: (v: string) => void;
}) => {
    const ref = React.useRef(null as null | HTMLDivElement);
    const [editing, setEditing] = React.useState(false);

    const history = React.useRef(initial(text));

    React.useEffect(() => {
        if (getText(ref.current!) !== text) {
            const locs = highlightLocations(text);
            if (text.length) {
                setHtmlAndClean(
                    ref.current!,
                    treeToHtmlLines(markUpTree(text, locs)),
                );
            } else {
                ref.current!.innerHTML = '';
                text.split('\n').map((line) => {
                    const div = document.createElement('div');
                    div.textContent = line;
                    if (!line.length) {
                        div.innerHTML = '<br/>';
                    }
                    ref.current!.append(div);
                });
            }
        }
    }, [text]);
    const latest = React.useRef(text);
    latest.current = text;

    const prevPos = React.useRef(0);

    React.useEffect(() => {
        if (!editing) {
            return;
        }
        const options = {
            subtree: true,
            childList: true,
            attributes: true,
            characterData: true,
        };
        const obsfn = () => {
            const sel = document.getSelection()!;
            if (!isAncestor(sel?.anchorNode, ref.current!)) {
                setEditing(false);
                onBlur(getText(ref.current!));
                return;
            }
            const text = getText(ref.current!);
            if (text !== latest.current) {
                onChange(text);
                const pos = getPos(ref.current!);
                history.current = update(
                    history.current,
                    text,
                    pos,
                    prevPos.current,
                );
                prevPos.current = pos;
                obs.disconnect();
                const locs = highlightLocations(text);
                const html = treeToHtmlLines(markUpTree(text, locs));
                setHtmlAndClean(ref.current!, html);
                setPos(ref.current!, pos);
                obs.observe(ref.current!, options);
            }
        };
        const obs = new MutationObserver(obsfn);
        obs.observe(ref.current!, options);

        const keyfn = (evt: KeyboardEvent) => {
            if (evt.metaKey && evt.key === 'z') {
                evt.preventDefault();
                let entry = null;
                if (evt.shiftKey) {
                    [history.current, entry] = redo(history.current);
                } else {
                    [history.current, entry] = undo(history.current);
                }

                if (entry == null) {
                    return;
                }
                obs.disconnect();
                const locs = highlightLocations(entry.text);
                const html = treeToHtmlLines(markUpTree(entry.text, locs));
                setHtmlAndClean(ref.current!, html);
                setPos(ref.current!, entry.pos);
                onChange(entry.text);
                obs.observe(ref.current!, options);
            }
        };
        document.addEventListener('keydown', keyfn);

        const selfn = () => {
            prevPos.current = getPos(ref.current!);
        };
        // document.addEventListener('selectionchange', selfn);

        return () => {
            obs.disconnect();
            document.removeEventListener('keydown', keyfn);
            document.removeEventListener('selectionchange', selfn);
        };
    }, [editing]);

    return (
        <div
            contentEditable
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="editor-ce"
            style={{
                outline: editing ? '2px solid #f00' : 'none',
                padding: 4,
                whiteSpace: 'pre-wrap',
                minHeight: '1.5em',
                minWidth: 50,
            }}
            onBlur={() => {
                setEditing(false);
                onBlur(getText(ref.current!));
            }}
            onFocus={() => setEditing(true)}
            onKeyDown={(evt) => {
                if (evt.key === 'Escape') {
                    // setEditing(false);
                    // onBlur(getText(ref.current!));
                    ref.current!.blur();
                    // document.body.focus();
                    document.getSelection()?.removeAllRanges();
                }
            }}
            ref={(node) => (ref.current = node)}
        ></div>
    );
};

export const treeToHtml = (
    tree: Tree,
    hover: null | [number, number],
): string => {
    return `<span class="${tree.kind}" style="color: ${
        colors[tree.kind] ?? '#aaa'
    }">${tree.children
        .map((child, i) =>
            child.type === 'leaf'
                ? `<span data-span="${child.span[0]}:${child.span[1]}">${child.text}</span>`
                : treeToHtml(child, hover),
        )
        .join('')}</span>`;
};

export const openSpan = (kind: Colorable) =>
    `<span class="${kind}" style="color: ${colors[kind] ?? '#aaa'}">`;

export const treeToHtmlLines = (tree: Tree) => {
    return `<div>${treeToHtmlLinesInner(tree, [])}</div>`;
};

export const escapeLine = (line: string) => {
    return line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

export const treeToHtmlLinesInner = (tree: Tree, path: Colorable[]): string => {
    // ohhh how do I deal with opening lines and closing ones
    return `${openSpan(tree.kind)}${tree.children
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
                              path.map(openSpan).join(''),
                      )}</span>`
                : treeToHtmlLinesInner(child, path.concat([tree.kind])),
        )
        .join('')}</span>`;
};

const getPos = (target: HTMLElement) => {
    const sel = document.getSelection()!;
    const r = sel.getRangeAt(0).cloneRange();
    sel.extend(target, 0);
    const pos = sel.toString().length;
    sel.removeAllRanges();
    sel.addRange(r);
    return pos;
};

/**
 * set caret position
 * @param {number} position - caret position
 */
const setPos = (target: ChildNode, position: number) => {
    var selection = window.getSelection()!;
    let range = document.createRange();
    range.selectNode(target);
    range.setStart(target, 0);
    createRange(
        target,
        {
            count: position,
        },
        range,
    );
    if (range) {
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }
};

const createRange = (
    node: ChildNode,
    chars: { count: number },
    range: Range,
): boolean => {
    if (chars.count === 0) {
        range.setEnd(node, chars.count);
        return true;
    } else if (node && chars.count > 0) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent!.length < chars.count) {
                chars.count -= node.textContent!.length;
            } else {
                range.setEnd(node, chars.count);
                chars.count = 0;
                return true;
            }
        } else {
            for (var lp = 0; lp < node.childNodes.length; lp++) {
                if (createRange(node.childNodes[lp], chars, range)) {
                    return true;
                }
            }
            if (node.nodeName === 'DIV') {
                chars.count--;
            }
        }
    }
    return false;
};

function setHtmlAndClean(node: HTMLDivElement, html: string) {
    node.innerHTML = html;
    node.childNodes.forEach((child) => {
        if (child.textContent === '') {
            (child as HTMLDivElement).innerHTML = '<br/>';
        } else {
            child.childNodes.forEach((child) => {
                // Clean up empty spans
                if (child.textContent === '') {
                    child.remove();
                }
            });
        }
    });
}
