import { Card, Popover, styled, Text } from '@nextui-org/react';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { parseTypeFile, SyntaxError } from '../core/grammar/base.parser';
import { FullContext } from '../core/ctx';
import { noloc } from '../core/consts';
import { parseFile } from '../core/grammar/base.parser';
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
import { highlightVisitor } from './highlightVisitor';

export type Colorable =
    | keyof Visitor<null>
    | 'Error'
    | 'Success'
    | 'LetName'
    | 'AwaitBang'
    | 'Hash'
    | 'Color0'
    | 'Color1'
    | 'Color2'
    | 'Color3'
    | 'Color4'
    | 'Color5'
    | 'Color6'
    | 'Color7'
    | 'Color8'
    | 'Color9';

export const styles: {
    [key in Colorable]?: any; // React.CSSProperties;
} = {
    // Top: {
    //     padding: '3px',
    // },
    AliasItem: {
        color: '#555',
        // 'max-width': '200px',
        // display: 'inline-block',
        // contentEditable: false,
        // overflow: 'hidden',
        // 'white-space': 'nowrap',
        // 'text-overflow': 'ellipsis',
        // 'margin-bottom': '-7px',
    },
    AwaitBang: {
        fontWeight: 'bold',
    },
    Error: {
        'text-decoration': 'underline',
        'text-decoration-color': '#f00',
        'text-decoration-style': 'wavy',
    },
};

export const colors: {
    [key in Colorable]?: string;
} = {
    Hash: 'rgba(200,200,200, 0.3)',
    LetName: 'teal', // '#00c000',
    TRef: 'teal', // '#00c000',
    PName: 'teal', // '#00c000',
    AwaitBang: 'magenta',
    String: '#afa',
    ArrowSuffix: '#bf8529',
    Enum: '#ff5c5c',
    TagDecl: '#ff5c5c',
    // '#33ff4e',
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
};

// https://github.com/d3/d3-scale-chromatic/blob/main/src/categorical/Dark2.js
const src = '1b9e77d95f027570b3e7298a66a61ee6ab02a6761d773366443388';
for (let i = 0; i < src.length; i += 6) {
    colors[`Color${(i / 6) | 0}` as Colorable] = `#${src.slice(i, i + 6)}`;
}

const n = (n: number): Loc['start'] => ({ ...noloc.start, offset: n });

export const highlightLocations = (
    text: string,
    typeFile = false,
    extraLocs?: (
        v: p.File | p.TypeFile,
        // aliases: { [key: string]: string },
        text: string,
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
                locs.push(...extraLocs(ast, text));
            }
        } else {
            const ast = p.parseFile(text);
            ast.comments.forEach(([loc, _]) => {
                locs.push({ loc, type: 'comment' });
            });
            transformFile(ast, highlightVisitor, locs);
            if (extraLocs) {
                locs.push(...extraLocs(ast, text));
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
    extraLocs?: (v: p.File | p.TypeFile, text: string) => HL[];
}) => {
    // const [aliases, rest] = React.useMemo(() => splitAliases(text), [text]);
    // text = rest;

    const marked = React.useMemo(() => {
        const locs = highlightLocations(text, typeFile, extraLocs);
        return text.trim().length ? markUpTree(text, locs) : null;
    }, [text]);

    const annotations = React.useMemo(
        () => (info ? collectAnnotations(info.tast, info.ctx) : []),
        [info],
    );

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

export const typeToString = (t: Type, ctx: FullContext) => {
    const actx = printCtx(ctx, false);
    const pctx = newPPCtx(false);
    const ast = actx.ToAst.Type(t, actx);
    return printToString(pctx.ToPP.Type(ast, pctx), 100);
};
