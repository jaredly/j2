import { Card, Text } from '@nextui-org/react';
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
import { File, Loc, refHash, Type } from '../core/typed-ast';
import { getType } from '../core/typing/getType';
import { printCtx } from '../core/typing/to-ast';
import { markUpTree, Tree as TreeT } from './markUpTree';

export type Colorable = keyof Visitor<null> | 'Error';

export const colors: {
    [key in Colorable]?: string;
} = {
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
    Error: 'red',
};

const n = (n: number): Loc['start'] => ({ ...noloc.start, offset: n });

export const highlightLocations = (
    text: string,
    typeFile = false,
): { loc: Loc; type: Colorable }[] => {
    if (text.length < -1) {
        return [
            { loc: { start: n(0), end: n(text.length), idx: 0 }, type: 'File' },
            // {
            //     loc: { start: n(0), end: n(err.location.start), idx: 0 },
            //     type: 'error',
            // },
            {
                loc: {
                    start: n(5),
                    end: n(text.length),
                    idx: 0,
                },
                type: 'Number',
            },
        ];
    }
    try {
        const locs: Array<{ loc: Loc; type: keyof Visitor<null> }> = [];
        if (typeFile) {
            const ast = parseTypeFile(text);
            ast.comments.forEach(([loc, _]) => {
                locs.push({ loc, type: 'comment' });
            });
            transformTypeFile(ast, visitor, locs);
        } else {
            const ast = parseFile(text);
            ast.comments.forEach(([loc, _]) => {
                locs.push({ loc, type: 'comment' });
            });
            transformFile(ast, visitor, locs);
        }
        return locs;
    } catch (err) {
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

export const Highlight = ({
    text,
    info,
    portal,
    onClick,
    typeFile,
}: {
    text: string;
    info?: { tast: File; ctx: FullContext };
    portal: HTMLDivElement;
    onClick?: () => void;
    typeFile?: boolean;
}) => {
    if (text.startsWith('alias ')) {
        text = text.slice(text.indexOf('\n') + 1);
    }

    const marked = React.useMemo(() => {
        const locs = highlightLocations(text, typeFile);
        return text.trim().length ? markUpTree(text, locs) : null;
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
            <Text
                css={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: '$mono',
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
            </Text>
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

const visitor: Visitor<Array<{ loc: Loc; type: string }>> = {};
AllTaggedTypeNames.forEach((name) => {
    visitor[name] = (node: any, ctx): any => {
        ctx.push({ loc: node.loc, type: name });
        return null;
    };
});

export const Tree = ({
    tree,
    hover,
}: {
    tree: TreeT;
    hover: null | [number, number];
}) => {
    return (
        <span
            className={tree.kind}
            style={{
                color: colors[tree.kind as keyof Visitor<null>] ?? '#aaa',
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
        </span>
    );
};

export const typeToString = (t: Type, ctx: FullContext) => {
    const actx = printCtx(ctx, false);
    const pctx = newPPCtx(false);
    const ast = actx.ToAst[t.type](t as any, actx);
    return printToString(pctx.ToPP[ast.type](ast as any, pctx), 100);
};

const collectAnnotations = (tast: File, ctx: FullContext) => {
    const annotations: { loc: Loc; text: string }[] = [];
    const visitor: tt.Visitor<null> = {
        Expression: (node) => {
            const t = getType(node, ctx);
            if (t) {
                annotations.push({
                    loc: node.loc,
                    text: typeToString(t, ctx),
                });
            }
            return node;
        },
        Ref(node, ctx) {
            annotations.push({
                loc: node.loc,
                text:
                    node.kind.type === 'Unresolved'
                        ? 'unresolved'
                        : refHash(node.kind),
            });
            return null;
        },
    };
    tt.transformFile(tast, visitor, null);
    // console.log(annotations);
    return annotations;
};
