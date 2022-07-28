import { Card, Popover, styled, Text } from '@nextui-org/react';
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
import { File, Loc, ToplevelLet, Type } from '../core/typed-ast';
import { printCtx } from '../core/typing/to-ast';
import { markUpTree } from './markUpTree';
import * as p from '../core/grammar/base.parser';
import {
    aliasesFromString,
    splitAliases,
} from '../core/typing/__test__/fixture-utils';
import { HL } from './HL';
import { Tree } from './Tree';
import { collectAnnotations } from './collectAnnotations';

export type Colorable = keyof Visitor<null> | 'Error' | 'Success' | 'LetName';

export const styles: {
    [key in Colorable]?: any; // React.CSSProperties;
} = {
    AliasItem: {
        // 'font-size': '50%',
        color: '#555',
        'max-width': '200px',
        display: 'inline-block',
        contentEditable: false,
        // 'user-select': 'none',
        overflow: 'hidden',
        'white-space': 'nowrap',
        'text-overflow': 'ellipsis',
        'margin-bottom': '-7px',
    },
    Error: {
        textDecoration: 'underline',
        textDecorationColor: '#f00',
    },
};

export const colors: {
    [key in Colorable]?: string;
} = {
    LetName: '#00f000',
    TagDecl: '#33ff4e',
    TRef: 'green',
    PName: 'green',
    String: '#afa',
    Enum: '#ff5c5c',
    PEnum: '#ff5c5c',
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
    Aliases: '#777',
    AliasItem: '#555',
    // Error: 'red',
    // Success: 'green',
};

const n = (n: number): Loc['start'] => ({ ...noloc.start, offset: n });

export const highlightLocations = (
    text: string,
    aliases: { [key: string]: string },
    typeFile = false,
    extraLocs?: (
        v: p.File | p.TypeFile,
        aliases: { [key: string]: string },
    ) => HL[],
): HL[] => {
    try {
        const locs: HL[] = [];
        if (typeFile) {
            const ast = p.parseTypeFile(text);
            ast.comments.forEach(([loc, _]) => {
                locs.push({ loc, type: 'comment' });
            });
            transformTypeFile(ast, highlightVisitor, locs);
            if (extraLocs) {
                locs.push(...extraLocs(ast, aliases));
            }
        } else {
            const ast = p.parseFile(text);
            ast.comments.forEach(([loc, _]) => {
                locs.push({ loc, type: 'comment' });
            });
            transformFile(ast, highlightVisitor, locs);
            if (extraLocs) {
                locs.push(...extraLocs(ast, aliases));
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
    extraLocs?: (
        v: p.File | p.TypeFile,
        aliases: { [key: string]: string },
    ) => HL[];
}) => {
    // console.log('wahttt', text);
    const [aliases, rest] = React.useMemo(() => splitAliases(text), [text]);
    text = rest;
    // if (text.startsWith('alias ')) {
    //     text = text.slice(text.indexOf('\n') + 1);
    // }

    const marked = React.useMemo(() => {
        // const [aliasRaw, rest] = splitAliases(text);

        const locs = highlightLocations(
            text,
            aliasesFromString(aliases),
            typeFile,
            extraLocs,
        );
        console.log(
            'locsss',
            locs.filter((t) => t.type === 'Error'),
        );
        return text.trim().length ? markUpTree(text, locs) : null;
    }, [text, aliases]);

    // console.log('tree', marked)
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

const highlightVisitor: Visitor<Array<{ loc: Loc; type: Colorable }>> = {};
AllTaggedTypeNames.forEach((name) => {
    highlightVisitor[name] = (node: any, ctx): any => {
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
highlightVisitor.ToplevelLet = (node: p.ToplevelLet, ctx) => {
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

export const typeToString = (t: Type, ctx: FullContext) => {
    const actx = printCtx(ctx, false);
    const pctx = newPPCtx(false);
    const ast = actx.ToAst.Type(t, actx);
    return printToString(pctx.ToPP.Type(ast, pctx), 100);
};
