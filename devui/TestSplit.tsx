import { Button, Card, css, Input, styled } from '@nextui-org/react';
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
import { verifyHL } from '../core/typing/__test__/verifyHL';
import { getTestResults, TestValues, TestWhat } from './App';
import { Editor } from './Editor';
import { HL } from './HL';
import { refmt } from './refmt';
import * as p from '../core/grammar/base.parser';
import * as t from '../core/typed-ast';
import { noloc } from '../core/consts';
import { newPPCtx } from '../core/printer/to-pp';
import { printToString } from '../core/printer/pp';
import { NameTrack } from '../core/ir/to-js';
import generate from '@babel/generator';
import { Colorable, typeToString } from './Highlight';
import { idToString, toId } from '../core/ids';
import { Loc } from '../core/typed-ast';
import { transformFile, transformToplevel } from '../core/transform-tast';
import { errorCount, VError } from '../core/typing/analyze';
import { printCtx } from '../core/typing/to-ast';
import { injectComments } from '../core/elements/comments';

/*

So what if ... we had a 'splitEditor'

ok so, file.info doesn't have any aliases in it ...

*/

const Hoverr = styled('div', {
    opacity: 0.5,
    transition: 'opacity 0.2s ease-in-out',
});
const Hovery = styled('div', {
    '&:hover .hello': {
        opacity: 1,
    },
});

export const fmtItem = (item: p.Toplevel, comments: [p.Loc, string][]) => {
    const ast: p.File = {
        type: 'File',
        comments: [],
        toplevels: [],
        loc: noloc,
    };

    ast.toplevels.push(item);

    if (ast.toplevels.length > 0) {
        ast.loc = {
            start: { line: 0, column: 0, offset: 0 },
            end: ast.toplevels[ast.toplevels.length - 1].loc.end,
            idx: -1,
        };
    }

    const pctx = newPPCtx();
    const pp = pctx.ToPP.File(ast, pctx);
    return printToString(injectComments(pp, comments), 100).replace(
        /[ \t]+$/gm,
        '',
    );
};

export const testStatuses = (
    file: Result<FileContents>,
    results: TestValues,
): HL[] => {
    if (file.type === 'Error') {
        return [
            {
                loc: file.err,
                type: 'Error',
                prefix: {
                    text: '🚨',
                    message: `Error locations`,
                },
            },
        ];
    }
    const statuses: HL[] = [];
    file.info.forEach((info, i) => {
        statuses.push(...verifyHL(info.verify));
        if (results.info.exprs[i] !== undefined) {
            const v = results.info.exprs[i];
            const { end } = info.contents.top.loc;
            statuses.push({
                loc: {
                    ...info.contents.top.loc,
                    end: { ...end, offset: end.offset + Infinity },
                },
                type: 'Success',
                suffix: {
                    text:
                        ' ' +
                        (typeof v === 'function'
                            ? info.contents.irtops
                                  ?.map((m) => m.tstring)
                                  .join(' : ') ?? 'not evaluated?'
                            : JSON.stringify(v)),
                },
            });
        }
    });

    // Object.keys(results.info.exprs).forEach((expr) => {
    // })
    // results.testResults.forEach((result) => {
    //     statuses.push({
    //         loc: result.loc,
    //         type: result.msg == null ? 'Success' : 'Error',
    //         prefix: {
    //             text: result.msg == null ? '✅' : '🚨',
    //             message: result.msg ?? undefined,
    //         },
    //     });
    // });

    return statuses;
};
type TestItem =
    | ToplevelInfo<FileContents>
    | {
          type: 'Failed';
          text: string;
          err: Loc;
      };

export const TestSplit = ({
    test,
    onChange,
    name,
    changeName,
}: {
    name: string;
    test: TestWhat;
    onChange: (v: TestWhat, text: string) => void;
    changeName?: (v: string) => void;
}) => {
    // can I attribute comments to each of the infos?
    // also, how do I add / remove items?
    const [items, setItems] = React.useState<TestItem[]>(() => {
        if (test.file.type === 'Error') {
            return [
                { type: 'Failed', text: test.file.text, err: test.file.err },
            ];
        }
        return test.file.info;
    });

    const shared = React.useRef({
        track: { names: {}, used: {} },
        terms: {},
    } as { track: NameTrack; terms: { [key: string]: any } });

    React.useEffect(() => {
        const res = processFileR(
            {
                type: 'File',
                comments: [],
                toplevels: items
                    .filter((item) => item.type === 'Info')
                    .map(
                        (item) =>
                            (item as ToplevelInfo<FileContents>).contents.refmt,
                    ),
                loc: noloc,
            },
            undefined,
            shared.current.terms,
            undefined,
            true,
        );
        const texts = items.map((item) =>
            item.type === 'Failed'
                ? item.text
                : fmtItem(item.contents.refmt, item.comments),
        );
        onChange({ file: res, values: getTestResults(res) }, texts.join('\n'));
    }, [items]);

    // OK so ... what needs to share?
    // global ctx
    // also ... ectx?
    // oh and jctx for sure
    // but I can re-run all the ectx & jctx madness on each keystroke, that's probably fine.
    // as long as I'm not re-processing absolutely everything all the time.

    const hover = React.useMemo(() => {
        const div = document.createElement('div');
        document.body.appendChild(div);
        return div;
    }, []);

    React.useEffect(() => {
        return () => hover.remove();
    }, []);

    let ctx = builtinContext;
    const editors = items
        .map((item, i) => {
            const myctx = ctx;
            ctx =
                item.type === 'Info'
                    ? (ctx.withToplevel(item.contents.top) as FullContext)
                    : ctx;
            return (
                <TopEditor
                    key={i}
                    onChange={(info) => {
                        setItems(
                            reconcileChanges(
                                items,
                                i,
                                info,
                                shared.current,
                                myctx,
                            ),
                        );
                    }}
                    shared={shared}
                    ctx={myctx}
                    item={item}
                    hover={hover}
                />
            );
        })
        .concat([
            <Editor
                key={'last' + items.length}
                text={'// add new item'}
                onBlur={(text) => {
                    const file = processFile(
                        text,
                        ctx,
                        undefined,
                        shared.current.track,
                        true,
                    );
                    if (file.type === 'Success') {
                        setTimeout(() => {
                            setItems(items.concat(file.info));
                        }, 10);
                    }
                }}
                onChange={(text) => {}}
                extraLocs={(v) => {
                    if (v.type !== 'File') {
                        return [];
                    }
                    const file = processFileR(
                        v,
                        ctx,
                        undefined,
                        shared.current.track,
                        true,
                    );
                    const results = getTestResults(file, shared.current.terms);
                    // ok, so we have an AST
                    return testStatuses(file, results);
                }}
            />,
        ]);

    return (
        <div
            style={{
                padding: 24,
                display: 'flex',
                alignItems: 'stretch',
                flexDirection: 'column',
                flex: 1,
            }}
        >
            {changeName ? (
                <div>
                    <BlurInput
                        text={name}
                        onChange={(name) => changeName(name)}
                    />
                </div>
            ) : null}
            <Card
                variant={'bordered'}
                css={{
                    position: 'relative',
                    borderRadius: 3,
                }}
            >
                <Card.Body
                    css={{
                        display: 'flex',
                        fontFamily: '$mono',
                        fontWeight: '$light',
                        overflow: 'auto',
                        paddingBottom: 300,
                    }}
                >
                    {editors}
                </Card.Body>
            </Card>
        </div>
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
    const cache = React.useMemo(
        () =>
            ({} as {
                [key: string]: {
                    file: Result<FileContents>;
                    results: TestValues | null;
                };
            }),
        [ctx],
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
        [ctx],
    );
    const tid = React.useRef(null as null | any);
    return (
        <Hovery
            style={{
                position: 'relative',
                // Hmmm
                // outline: changed.current ? '1px dashed magenta' : 'none',
            }}
            onMouseOut={(evt) => {
                clearTimeout(tid.current);
                // if (evt.target === evt.currentTarget) {
                const target = evt.currentTarget;
                tid.current = setTimeout(() => resetHighlights(target), 100);
                // resetHighlights(target)
                // }
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
                        highlightForLoc(evt, loc);
                    }
                } else {
                    hover.style.display = 'none';
                    const target = evt.currentTarget;
                    // resetHighlights(target),
                    tid.current = setTimeout(
                        () => resetHighlights(target),
                        100,
                    );
                }
            }}
        >
            <Editor
                text={text}
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
                onChange={(text) => {
                    changed.current = true;
                    setText(text);
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
                                    <div key={i}>
                                        {info.contents.irtops?.map(
                                            (item, j) => (
                                                <div key={j}>
                                                    <div
                                                        style={{
                                                            fontStyle: 'italic',
                                                            opacity: 0.5,
                                                        }}
                                                    >
                                                        type:{' '}
                                                        {item.type
                                                            ? typeToString(
                                                                  item.type,
                                                                  ctx,
                                                              )
                                                            : 'No type!'}
                                                    </div>
                                                    <pre
                                                        style={{
                                                            whiteSpace:
                                                                'pre-wrap',
                                                            margin: 0,
                                                            padding: 0,
                                                            fontSize: '0.8em',
                                                            color: '#ccc',
                                                        }}
                                                    >
                                                        {pptostring(
                                                            item.simple,
                                                        )}
                                                        {'\n'}
                                                        {
                                                            generate(
                                                                item.js.body
                                                                    .length ===
                                                                    1
                                                                    ? item.js
                                                                          .body[0]
                                                                    : item.js,
                                                            ).code
                                                        }
                                                    </pre>
                                                    <pre
                                                        style={{
                                                            margin: 0,
                                                            padding: 4,
                                                            border: '1px solid #550000',
                                                            whiteSpace:
                                                                'pre-wrap',
                                                        }}
                                                    >
                                                        Evaluation result:{' '}
                                                        {showValue(
                                                            item.id
                                                                ? shared.current
                                                                      .terms[
                                                                      shared
                                                                          .current
                                                                          .track
                                                                          .names[
                                                                          idToString(
                                                                              item.id!,
                                                                          )
                                                                      ]
                                                                  ]
                                                                : cache[text]
                                                                      ?.results
                                                                      ?.info
                                                                      .exprs[i],
                                                        )}
                                                    </pre>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                )}
        </Hovery>
    );
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

const pptostring = (ast: p.Expression) => {
    const ctx = newPPCtx();
    return printToString(ctx.ToPP.Expression(ast, ctx), 100);
};

export const BlurInput = ({
    text,
    onChange,
}: {
    text: string;
    onChange: (v: string) => void;
}) => {
    const [value, setValue] = React.useState(text);
    const lastText = React.useRef(text);
    React.useEffect(() => {
        if (text !== lastText.current) {
            lastText.current = text;
            setValue(text);
        }
    }, [text]);
    return (
        <Input
            aria-label={'text input'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            bordered
            fullWidth
            onKeyDown={(evt) => {
                if (evt.key === 'Enter') {
                    onChange(value);
                    evt.preventDefault();
                }
                if (evt.key === 'Escape') {
                    onChange(value);
                    evt.preventDefault();
                }
            }}
            onBlur={() => {
                onChange(value);
            }}
        />
    );
};

const showValue = (v: any) => {
    if (typeof v === 'function') {
        return `Function ${v.name}: ${v.toString()}`;
    }
    return JSON.stringify(v);
};

function resetHighlights(target: HTMLElement) {
    target.querySelectorAll('[data-span]').forEach((el) => {
        // el.style.textDecoration = 'none';
        (el as HTMLElement).style.backgroundColor = 'transparent';
    });
}

function highlightForLoc(
    evt: React.MouseEvent<HTMLDivElement, MouseEvent>,
    al: Loc,
) {
    evt.currentTarget.querySelectorAll('[data-span]').forEach((ell) => {
        const el = ell as HTMLElement;
        const [s, e] = el.getAttribute('data-span')!.split(':');
        if (+s >= al.start.offset && +e <= al.end.offset) {
            el.style.backgroundColor = 'rgba(100,100,0,0.2)';
        } else {
            el.style.backgroundColor = 'transparent';
        }
    });
}

function sortedAnnotations(
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

function hoverStyle(box: DOMRect): Partial<HTMLElement['style']> {
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
