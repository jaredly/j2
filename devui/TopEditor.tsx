import generate from '@babel/generator';
import * as React from 'react';
import { builtinContext, FullContext } from '../core/ctx';
import {
    FileContents,
    processFile,
    processFileR,
    Result,
    Success,
    ToplevelInfo,
} from '../core/full/full';
import * as p from '../core/grammar/base.parser';
import { idToString } from '../core/ids';
import { NameTrack } from '../core/ir/to-js';
import { printToString } from '../core/printer/pp';
import { newPPCtx } from '../core/printer/to-pp';
import * as t from '../core/typed-ast';
import { Loc } from '../core/typed-ast';
import { errorCount, VError } from '../core/typing/analyze';
import { printCtx } from '../core/typing/to-ast';
import { getTestResults, TestValues } from './App';
import { Editor } from './Editor';
import { HL } from './HL';
import { fmtItem, Hoverr, Hovery, testStatuses } from './TestSplit';
import { transformToplevel } from '../core/transform-tast';
import { Colorable } from './Highlight';
import { vdomWidget } from './widgets/vdom';

export const ctxCacheKey = (ctx: FullContext) => {
    const inner = ctx.extract();
    return (
        Object.keys(inner.types.hashed).sort().join(' ') +
        ' /// ' +
        Object.keys(inner.values.hashed).sort().join(' ')
    );
};

export const TopEditor = ({
    item,
    ctx,
    shared,
    onChange,
    hover,
}: {
    item:
        | ToplevelInfo<FileContents>
        | { type: 'Failed'; text: string; err: Loc };
    ctx: FullContext;
    shared: { current: { track: NameTrack; terms: { [key: string]: string } } };
    onChange: (info: ToplevelInfo<FileContents>[]) => void;
    hover: HTMLDivElement;
}) => {
    console.log(`top Editor render`);
    const changed = React.useRef(false);
    const [text, setText] = React.useState(() =>
        item.type === 'Failed'
            ? item.text
            : fmtItem(item.contents.refmt, item.comments),
    );
    React.useEffect(() => {
        setText(
            item.type === 'Failed'
                ? item.text
                : fmtItem(item.contents.refmt, item.comments),
        );
    }, [item]);
    const cacheKey = ctxCacheKey(ctx);
    const cache = React.useMemo(
        () =>
            ({} as {
                [key: string]: {
                    file: Result<FileContents>;
                    results: TestValues | null;
                };
            }),
        [cacheKey],
    );
    if (!cache[text]) {
        const file = processFile(
            text,
            ctx,
            undefined,
            shared.current.track,
            true,
        );
        const results =
            file.type === 'Success'
                ? getTestResults(file, shared.current.terms)
                : null;
        cache[text] = { file, results };
    }
    let { file, results } = cache[text];
    const [open, setOpen] = React.useState(false);

    const extraLocs = React.useCallback(
        (v: p.File | p.TypeFile, text: string) => {
            if (v.type !== 'File') {
                return [];
            }
            if (cache[text]?.file.type === 'Success') {
                const { file, results } = cache[text];
                return testStatuses(file, results!).concat(
                    file.type === 'Success' ? extraHighlights(file) : [],
                );
            }
            const file = processFileR(
                v,
                ctx,
                undefined,
                shared.current.track,
                true,
            );
            const results = getTestResults(file, shared.current.terms);
            cache[text] = { file, results };
            // ok, so we have an AST
            return testStatuses(file, results).concat(extraHighlights(file));
        },
        [cacheKey],
    );
    const tid = React.useRef(null as null | any);
    const obsref = React.useRef(null as null | (() => () => void));
    return (
        <Hovery
            style={{ position: 'relative' }}
            onMouseOut={(evt) => {
                clearTimeout(tid.current);
                const target = evt.currentTarget;
                tid.current = setTimeout(
                    () => resetHighlights(target, obsref),
                    100,
                );
            }}
            onMouseOver={(evt) => {
                clearTimeout(tid.current);
                const loc = (evt.target as HTMLSpanElement).getAttribute(
                    'data-span',
                );
                if (loc && file.type === 'Success') {
                    const [startr, endr] = loc.split(':');
                    const start = +startr;
                    const end = +endr;
                    const { anns, errors } = sortedAnnotations(
                        file,
                        start,
                        end,
                    );
                    if (anns.length || errors.length) {
                        Object.assign(
                            hover.style,
                            hoverStyle(
                                (
                                    evt.target as HTMLSpanElement
                                ).getBoundingClientRect(),
                            ),
                        );
                        hover.innerHTML = '';
                        if (anns.length) {
                            const texts: { [key: string]: true } = {};
                            for (let ann of anns) {
                                if (
                                    ann.loc.start.offset ===
                                        anns[0].loc.start.offset &&
                                    ann.loc.end.offset ===
                                        anns[0].loc.end.offset
                                ) {
                                    if (texts[ann.text]) {
                                        continue;
                                    }
                                    texts[ann.text] = true;
                                    const node = document.createElement('div');
                                    node.textContent = ann.text;
                                    hover.append(node);
                                }
                            }
                        }
                        errors.forEach((error) => {
                            const node = document.createElement('div');
                            if (error.type === 'Dec') {
                                const actx = printCtx(ctx);
                                const p = newPPCtx(true);
                                node.textContent = printToString(
                                    p.ToPP.Decorator(
                                        actx.ToAst.Decorator(error.dec, actx),
                                        p,
                                    ),
                                    100,
                                );
                                hover.append(node);
                            }
                        });
                        const bb = hover.getBoundingClientRect();
                        if (bb.right > window.innerWidth - 8) {
                            hover.style.left = 'unset';
                            hover.style.right = '8px';
                        }
                        if (bb.bottom > window.innerHeight - 8) {
                            hover.style.top = 'unset';
                            hover.style.bottom = '8px';
                        }
                        const loc = anns.length ? anns[0].loc : errors[0].loc;
                        highlightForLoc(evt, loc, obsref);
                    }
                } else {
                    hover.style.display = 'none';
                    const target = evt.currentTarget;
                    // resetHighlights(target),
                    tid.current = setTimeout(
                        () => resetHighlights(target, obsref),
                        100,
                    );
                }
            }}
        >
            <Editor
                text={text}
                obsref={obsref}
                onBlur={(text) => {
                    const file =
                        cache[text]?.file ??
                        processFile(
                            text,
                            ctx,
                            undefined,
                            shared.current.track,
                            true,
                        );
                    if (!cache[text]) {
                        const results =
                            file.type === 'Success'
                                ? getTestResults(file, shared.current.terms)
                                : null;
                        cache[text] = { file, results };
                    }
                    changed.current = false;
                    if (file.type === 'Success') {
                        setTimeout(() => {
                            onChange(file.info);
                        }, 10);
                    }
                }}
                onChange={(ntext) => {
                    changed.current = true;
                    console.log('chagnedddd', text !== ntext);
                    setText(ntext);
                }}
                extraLocs={extraLocs}
            />
            {file.type === 'Success' &&
                file.info.some((m) => m.contents.irtops?.length) && (
                    <div>
                        <Hoverr
                            className="hello"
                            style={{
                                position: 'absolute',
                                top: -7,
                                left: -12,
                                cursor: 'pointer',
                                fontSize: 30,
                                opacity: results?.testResults.length
                                    ? 1
                                    : undefined,
                                color: results?.testResults.some(
                                    (m) => m.msg != null,
                                )
                                    ? 'red'
                                    : results?.testResults.length
                                    ? '#47ff47'
                                    : 'white',
                            }}
                            onClick={() => setOpen(!open)}
                        >
                            ·
                        </Hoverr>
                        {open ? (
                            <div>
                                {file.info.map((info, i) => (
                                    <ShowInfo
                                        i={i}
                                        key={i}
                                        ctx={(file as Success<any>).ctx}
                                        info={info}
                                        shared={shared}
                                        cache={cache}
                                        text={text}
                                    />
                                ))}
                            </div>
                        ) : null}
                    </div>
                )}
        </Hovery>
    );
};

export function ShowInfo({
    i,
    info,
    shared,
    cache,
    text,
    ctx,
}: {
    i: number;
    info: ToplevelInfo<FileContents>;
    shared: { current: { track: NameTrack; terms: { [key: string]: string } } };
    cache: {
        [key: string]: {
            file: Result<FileContents>;
            results: TestValues | null;
        };
    };
    text: string;
    ctx: FullContext;
}): JSX.Element {
    return (
        <div>
            {info.contents.irtops?.map((item, j) => {
                const value = cache[text]?.results?.info.exprs[i];
                return (
                    <div key={j}>
                        <pre
                            style={{
                                fontStyle: 'italic',
                                opacity: 0.5,
                                whiteSpace: 'pre-wrap',
                                margin: 0,
                                padding: 0,
                                fontSize: '0.8em',
                                color: '#ccc',
                            }}
                        >
                            type: {item.tstring}
                        </pre>
                        <pre
                            style={{
                                whiteSpace: 'pre-wrap',
                                margin: 0,
                                padding: 0,
                                fontSize: '0.8em',
                                color: '#ccc',
                            }}
                        >
                            {pptostring(item.simple)}
                            {'\n'}
                            {
                                generate(
                                    item.js.body.length === 1
                                        ? item.js.body[0]
                                        : item.js,
                                ).code
                            }
                        </pre>
                        <pre
                            style={{
                                margin: 0,
                                padding: 4,
                                border: '1px solid #550000',
                                whiteSpace: 'pre-wrap',
                            }}
                        >
                            Evaluation result:{' '}
                            {showValue(
                                item.id
                                    ? shared.current.terms[
                                          shared.current.track.names[
                                              idToString(item.id!)
                                          ]
                                      ]
                                    : cache[text]?.results?.info.exprs[i],
                            )}
                        </pre>
                        {item.type ? vdomWidget(item.type, value, ctx) : null}
                    </div>
                );
            })}
        </div>
    );
}

export function resetHighlights(
    target: HTMLElement,
    obsref: React.RefObject<null | (() => () => void)>,
) {
    let out = obsref.current ? obsref.current() : null;
    target.querySelectorAll('[data-span]').forEach((el) => {
        // el.style.textDecoration = 'none';
        (el as HTMLElement).style.backgroundColor = 'transparent';
    });
    out ? out() : null;
}

export function highlightForLoc(
    evt: React.MouseEvent<HTMLDivElement, MouseEvent>,
    al: Loc,
    obsref: React.RefObject<null | (() => () => void)>,
) {
    let out = obsref.current ? obsref.current() : null;
    evt.currentTarget.querySelectorAll('[data-span]').forEach((ell) => {
        const el = ell as HTMLElement;
        const [s, e] = el.getAttribute('data-span')!.split(':');
        if (+s >= al.start.offset && +e <= al.end.offset) {
            el.style.backgroundColor = 'rgba(100,100,0,0.2)';
        } else {
            el.style.backgroundColor = 'transparent';
        }
    });
    out ? out() : null;
}

export function sortedAnnotations(
    file: Success<FileContents>,
    start: number,
    end: number,
) {
    const errors: VError[] = [];
    const anns: ToplevelInfo<FileContents>['annotations'] = [];
    file.info.forEach((info) => {
        info.annotations.forEach((ann) => {
            if (ann.loc.start.offset <= start && ann.loc.end.offset >= end) {
                anns.push(ann);
            }
        });
        info.verify.errors.forEach((err) => {
            if (err.loc.start.offset <= start && err.loc.end.offset >= end) {
                errors.push(err);
            } else if (
                err.loc.start.offset >= start &&
                err.loc.end.offset <= end
            ) {
                errors.push(err);
            }
        });
    });
    anns.sort(
        (a, b) =>
            a.loc.end.offset -
            a.loc.start.offset -
            (b.loc.end.offset - b.loc.start.offset),
    );
    return { anns, errors };
}

export function hoverStyle(box: DOMRect): Partial<HTMLElement['style']> {
    return {
        right: 'unset',
        bottom: 'unset',
        top: box.bottom + 8 + 'px',
        left: box.left + 8 + 'px',
        position: 'fixed',
        background: '#222',
        border: '1px solid #333',
        fontFamily:
            'Menlo, Monaco, "Lucida Console", "Liberation Mono", "DejaVu Sans Mono", "Bitstream Vera Sans Mono","Courier New", monospace',
        fontSize: '80%',
        padding: '4px 8px',
        whiteSpace: 'pre',
        pointerEvents: 'none',
        display: 'block',
        color: '#888',
    };
}

export const topHash = (t: t.Toplevel) => {
    if (t.type === 'ToplevelLet') {
        return t.hash;
    }
    if (t.type === 'TypeAlias') {
        return t.hash;
    }
};

export const reconcileChanges = (
    items: TestItem[],
    i: number,
    changed: ToplevelInfo<FileContents>[],
    shared: { track: NameTrack; terms: { [key: string]: any } },
    ctx: FullContext,
) => {
    // Soooo I could just cheat? and eval everything after this one
    const old = items[i];
    if (old.type === 'Failed') {
        return items
            .slice(0, i)
            .concat(changed)
            .concat(items.slice(i + 1));
    }
    const hash = topHash(old.contents.top);
    if (!hash) {
        return items
            .slice(0, i)
            .concat(changed)
            .concat(items.slice(i + 1));
    }
    const hashes = [hash];
    const res = items.slice(0, i).concat(changed);
    changed.forEach((info) => {
        ctx = ctx.withToplevel(info.contents.top) as FullContext;
    });
    for (let j = i + 1; j < items.length; j++) {
        const at = items[j];
        if (
            at.type === 'Failed' ||
            (!hashes.some((h) => at.uses[h]) && errorCount(at.verify) == 0)
        ) {
            res.push(at);
            if (at.type === 'Info') {
                ctx = ctx.withToplevel(at.contents.top) as FullContext;
            }
            continue;
        }
        const hash = topHash(at.contents.top);
        if (hash) {
            hashes.push(hash);
        }
        const text = fmtItem(at.contents.refmt, at.comments);
        const file = processFile(text, ctx, undefined, shared.track, true);
        if (file.type === 'Success') {
            getTestResults(file, shared.terms);
            res.push(...file.info);
            file.info.forEach((info) => {
                ctx = ctx.withToplevel(info.contents.top) as FullContext;
            });
        } else {
            ctx = ctx.withToplevel(at.contents.top) as FullContext;
            res.push(at); // weird!
        }
    }
    return res;
};

const pptostring = (ast: p.Expression) => {
    const ctx = newPPCtx();
    return printToString(ctx.ToPP.Expression(ast, ctx), 100);
};

export type TestItem =
    | ToplevelInfo<FileContents>
    | {
          type: 'Failed';
          text: string;
          err: Loc;
      };

const showValue = (v: any) => {
    if (typeof v === 'function') {
        return `Function ${v.name}: ${v.toString()}`;
    }
    return JSON.stringify(v);
};

export const extraHighlights = (file: Success<FileContents>) => {
    const hls: HL[] = [];
    file.info.forEach((info) => {
        transformToplevel(
            info.contents.top,
            {
                Ref(node, ctx) {
                    if (node.kind.type === 'Local') {
                        hls.push({
                            loc: node.loc,
                            type: `Color${node.kind.sym % 10}` as Colorable,
                        });
                    }
                    return null;
                },
                PName(node, ctx) {
                    hls.push({
                        loc: node.loc,
                        type: `Color${node.sym.id % 10}` as Colorable,
                    });
                    return null;
                },
            },
            null,
        );
    });
    return hls;
};
