import { Card, Popover, styled, Text, Tooltip } from '@nextui-org/react';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { parseTypeFile, SyntaxError } from '../core/grammar/base.parser';
import { FullContext, noloc } from '../core/ctx';
import { AllTaggedTypeNames, parseFile } from '../core/grammar/base.parser';
import { printToString } from '../core/printer/pp';
import { newPPCtx } from '../core/printer/to-pp';
import {
    transformFile,
    transformTypeFile,
    Visitor,
} from '../core/transform-ast';
import * as tt from '../core/transform-tast';
import { File, Loc, refHash, ToplevelLet, Type } from '../core/typed-ast';
import { getType } from '../core/typing/getType';
import { printCtx } from '../core/typing/to-ast';
import { markUpTree, Tree as TreeT } from './markUpTree';
import * as p from '../core/grammar/base.parser';
import { getLocals, Locals } from '../core/elements/pattern';
import { splitAliases } from '../core/typing/__test__/fixture-utils';

export type Colorable = keyof Visitor<null> | 'Error' | 'Success' | 'LetName';

export const colors: {
    [key in Colorable]?: string;
} = {
    LetName: '#00f000',
    TagDecl: '#33ff4e',
    TRef: 'green',
    String: '#afa',
    TemplateString: '#afa',
    TemplatePair: '#afa',
    TBArg: 'magenta',
    Number: 'cyan',
    Boolean: 'cyan',
    Identifier: 'teal',
    comment: 'green',
    Decorator: 'orange',
    DecoratorId: '#ffbf88',
    TemplateWrap: 'yellow',
    // Error: 'red',
    // Success: 'green',
};

const n = (n: number): Loc['start'] => ({ ...noloc.start, offset: n });

export type HL = {
    loc: Loc;
    type: Colorable;
    prefix?: { text: string; message?: string };
    suffix?: { text: string; message?: string };
    underline?: string;
};

export const highlightLocations = (
    text: string,
    typeFile = false,
    extraLocs?: (v: p.File | p.TypeFile) => HL[],
): HL[] => {
    try {
        const locs: HL[] = [];
        if (typeFile) {
            const ast = p.parseTypeFile(text);
            ast.comments.forEach(([loc, _]) => {
                locs.push({ loc, type: 'comment' });
            });
            transformTypeFile(ast, visitor, locs);
            if (extraLocs) {
                locs.push(...extraLocs(ast));
            }
        } else {
            const ast = p.parseFile(text);
            ast.comments.forEach(([loc, _]) => {
                locs.push({ loc, type: 'comment' });
            });
            transformFile(ast, visitor, locs);
            if (extraLocs) {
                locs.push(...extraLocs(ast));
            }
        }
        return locs;
    } catch (err) {
        if (!(err as SyntaxError).location) {
            throw err;
        }
        return [
            { loc: { start: n(0), end: n(text.length), idx: 0 }, type: 'File' },
            {
                loc: {
                    start: n((err as SyntaxError).location.start.offset),
                    end: n(text.length),
                    idx: 0,
                },
                type: 'Error',
            },
        ];
        // return null;
    }
};

const Container = styled('div', {
    whiteSpace: 'pre-wrap',
    fontFamily: '$mono',
});

export const Highlight = ({
    text,
    info,
    portal,
    onClick,
    typeFile,
    extraLocs,
}: {
    text: string;
    info?: { tast: File; ctx: FullContext };
    portal: HTMLDivElement;
    onClick?: () => void;
    typeFile?: boolean;
    extraLocs?: (v: p.File | p.TypeFile) => HL[];
}) => {
    if (text.startsWith('alias ')) {
        text = text.slice(text.indexOf('\n') + 1);
    }

    const marked = React.useMemo(() => {
        const [aliasRaw, rest] = splitAliases(text);

        const locs = highlightLocations(rest, typeFile, extraLocs);
        return text.trim().length ? markUpTree(rest, locs) : null;
    }, [text]);

    const annotations = React.useMemo(
        () => (info ? collectAnnotations(info.tast, info.ctx) : []),
        [info],
    );
    // console.log(annotations);

    const [hover, setHover] = React.useState(
        null as null | {
            span: [number, number];
            pos: { x: number; y: number };
        },
    );

    return (
        <div onClick={onClick}>
            <Container
                css={{
                    cursor: onClick ? 'pointer' : 'default',
                }}
                onMouseLeave={(evt) => {
                    setHover(null);
                }}
            >
                <span
                    onMouseLeave={(evt) => {
                        // evt.stopPropagation();
                        // if (evt.target === evt.currentTarget) {
                        //     setHover(null);
                        // }
                    }}
                    onMouseOver={(evt) => {
                        const span = (evt.target as HTMLSpanElement)
                            .getAttribute('data-span')
                            ?.split(':')
                            .map(Number);
                        if (span) {
                            setHover({
                                span: span as [number, number],
                                pos: { x: evt.clientX, y: evt.clientY },
                            });
                        }
                    }}
                    onMouseMove={(evt) => {
                        const span = (evt.target as HTMLSpanElement)
                            .getAttribute('data-span')
                            ?.split(':')
                            .map(Number);
                        if (span) {
                            setHover({
                                span: span as [number, number],
                                pos: { x: evt.clientX, y: evt.clientY },
                            });
                        }
                    }}
                >
                    {marked ? (
                        <Tree tree={marked} hover={hover?.span ?? null} />
                    ) : (
                        'Error parsing: ' + text
                    )}
                </span>
            </Container>
            {hover && annotations.length && portal
                ? createPortal(
                      <Card
                          variant="bordered"
                          css={{
                              position: 'absolute',
                              top: hover.pos.y + 14,
                              left: hover.pos.x,
                              width: 600,
                              zIndex: 1000,
                              padding: '$4',
                              pointerEvents: 'none',
                          }}
                      >
                          {annotations
                              .filter(
                                  (ann) =>
                                      ann.loc.start.offset <= hover.span[0] &&
                                      ann.loc.end.offset >= hover.span[1],
                              )
                              .sort(
                                  (a, b) =>
                                      a.loc.end.offset -
                                      a.loc.start.offset -
                                      (b.loc.end.offset - b.loc.start.offset),
                              )
                              .map((ann, i) => (
                                  <div key={i}>{ann.text}</div>
                              ))}
                      </Card>,
                      portal,
                  )
                : null}
        </div>
    );
};

const visitor: Visitor<Array<{ loc: Loc; type: Colorable }>> = {};
AllTaggedTypeNames.forEach((name) => {
    visitor[name] = (node: any, ctx): any => {
        ctx.push({ loc: node.loc, type: name });
        return null;
    };
});
const advance = (
    { offset, line, column }: Loc['start'],
    v: number,
): Loc['start'] => {
    return {
        offset: offset + v,
        column: column + v,
        line,
    };
};
visitor.ToplevelLet = (node: p.ToplevelLet, ctx) => {
    ctx.push({ loc: node.loc, type: 'ToplevelLet' });
    const { start, end } = node.loc;
    node.items.forEach((item) => {
        ctx.push({
            loc: {
                ...node.loc,
                start: advance(start, 4),
                end: advance(start, 4 + item.name.length),
            },
            type: 'LetName',
        });
    });
    return null;
};

export const Tree = ({
    tree,
    hover,
}: {
    tree: TreeT;
    hover: null | [number, number];
}) => {
    return (
        <span
            className={tree.hl.type}
            // data-prefix={tree.hl.prefix ? tree.hl.prefix.text : undefined}
            // data-suffix={tree.hl.suffix ? tree.hl.suffix.text : undefined}
            style={{
                color: colors[tree.hl.type] ?? '#aaa',
            }}
        >
            {tree.children.map((child, i) =>
                child.type === 'leaf' ? (
                    <span
                        data-span={`${child.span[0]}:${child.span[1]}`}
                        style={
                            hover &&
                            hover[0] === child.span[0] &&
                            hover[1] === child.span[1]
                                ? {
                                      // outline: '3px dotted rgba(255,255,0,0.1)'
                                      textDecoration: 'underline',
                                  }
                                : {}
                        }
                        key={i}
                    >
                        {child.text}
                    </span>
                ) : (
                    <Tree tree={child} key={i} hover={hover} />
                ),
            )}
            {tree.hl.suffix && tree.hl.suffix.message ? (
                <Tooltip content={tree.hl.suffix.message}>
                    <span style={{ whiteSpace: 'pre-wrap' }}>
                        {tree.hl.suffix.text}
                    </span>
                </Tooltip>
            ) : null}
        </span>
    );
};

export const typeToString = (t: Type, ctx: FullContext) => {
    const actx = printCtx(ctx, false);
    const pctx = newPPCtx(false);
    const ast = actx.ToAst.Type(t, actx);
    return printToString(pctx.ToPP.Type(ast, pctx), 100);
};

const collectAnnotations = (tast: File, ctx: FullContext) => {
    const annotations: { loc: Loc; text: string }[] = [];
    const visitor: tt.Visitor<FullContext> = {
        Lambda(node, ctx) {
            const locals: Locals = [];
            node.args.map((arg) => {
                getLocals(arg.pat, arg.typ, locals, ctx);
            });
            return [null, ctx.withLocals(locals) as FullContext];
        },
        Expression: (node, ctx) => {
            const t = getType(node, ctx);
            if (t) {
                annotations.push({
                    loc: node.loc,
                    text: typeToString(t, ctx),
                });
            } else {
                annotations.push({
                    loc: node.loc,
                    text: `[no type]`,
                });
            }
            return node;
        },
        Ref(node, ctx) {
            let text =
                node.kind.type === 'Unresolved'
                    ? 'Unresolved'
                    : node.kind.type === 'Global'
                    ? refHash(node.kind)
                    : node.kind.type === 'Local'
                    ? `sym=${node.kind.sym}`
                    : `recur(${node.kind.idx})`;
            annotations.push({
                loc: node.loc,
                text,
            });
            return null;
        },
    };
    tt.transformFile(tast, visitor, ctx);
    // console.log(annotations);
    return annotations;
};
