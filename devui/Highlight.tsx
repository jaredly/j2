import { Text } from '@nextui-org/react';
import * as React from 'react';
import { AllTaggedTypeNames, parseFile } from '../core/grammar/base.parser';
import { transformFile, Visitor } from '../core/transform-ast';
import { Loc } from '../core/typed-ast';

export const Highlight = ({ text }: { text: string }) => {
    const parsed = React.useMemo(() => {
        try {
            const ast = parseFile(text);
            const locs: Array<{ loc: Loc; type: string }> = [];
            ast.comments.forEach(([loc, _]) => {
                locs.push({ loc, type: 'comment' });
            });
            transformFile(ast, visitor, locs);
            return locs;
        } catch (err) {
            console.error(err);
            return [];
        }
    }, [text]);
    const marked = React.useMemo(() => {
        return markUpTree(text, parsed);
    }, [parsed]);
    const [hover, setHover] = React.useState(null as null | [number, number]);
    return (
        <Text
            css={{
                whiteSpace: 'pre-wrap',
                fontFamily: '$mono',
                cursor: 'default',
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
                        setHover(span as [number, number]);
                    }
                }}
            >
                <Tree tree={marked} hover={hover} />
            </span>
            {hover ? JSON.stringify(hover) : null}
        </Text>
    );
};
const colors: {
    [key in keyof Visitor<null>]: string;
} = {
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
};
const visitor: Visitor<Array<{ loc: Loc; type: string }>> = {};
AllTaggedTypeNames.forEach((name) => {
    visitor[name] = (node: any, ctx): any => {
        ctx.push({ loc: node.loc, type: name });
        return null;
    };
});
type Tree = { type: 'tree'; kind: string; children: (Tree | Leaf)[] };
type Leaf = { type: 'leaf'; span: [number, number]; text: string };
const markUpTree = (text: string, locs: Array<{ loc: Loc; type: string }>) => {
    const points = sortLocs(locs);
    let pos = 0;
    let top: Tree = { type: 'tree', children: [], kind: '' };
    let stack: Tree[] = [top];
    points.forEach(({ at, starts, ends }) => {
        if (at > pos) {
            stack[0].children.push({
                type: 'leaf',
                text: text.slice(pos, at),
                span: [pos, at],
            });
        }
        ends.forEach(() => {
            stack.shift();
        });
        starts.forEach(({ type }) => {
            const next: Tree = { type: 'tree', children: [], kind: type };
            stack[0].children.push(next);
            stack.unshift(next);
            // const color = colors[type as keyof Visitor<null>];
            // res += `<span class="${type}" style="color: ${color ?? '#aaa'}">`;
        });

        pos = at;
    });
    return top;
};
// const markUp = (text: string, locs: Array<{ loc: Loc; type: string }>) => {
//     const points = sortLocs(locs);
//     let pos = 0;
//     let res = '';
//     points.forEach(({ at, starts, ends }) => {
//         if (at > pos) {
//             res += `<span data-span="${pos}:${at}">${text.slice(
//                 pos,
//                 at,
//             )}</span>`;
//         }
//         ends.forEach(({ type }) => {
//             res += `</span>`;
//         });
//         starts.forEach(({ type }) => {
//             const color = colors[type as keyof Visitor<null>];
//             res += `<span class="${type}" style="color: ${color ?? '#aaa'}">`;
//         });
//         pos = at;
//     });
//     return res;
// };

export const Tree = ({
    tree,
    hover,
}: {
    tree: Tree;
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

export function sortLocs(locs: { loc: Loc; type: string }[]) {
    let points: {
        at: number;
        starts: { type: string; size: number }[];
        ends: { type: string; size: number }[];
    }[] = [];
    locs.forEach(({ loc, type }) => {
        const size = loc.end.offset - loc.start.offset;
        let sp =
            points[loc.start.offset] ??
            (points[loc.start.offset] = {
                starts: [],
                ends: [],
                at: loc.start.offset,
            });
        sp.starts.push({ type, size });
        let ep =
            points[loc.end.offset] ??
            (points[loc.end.offset] = {
                starts: [],
                ends: [],
                at: loc.end.offset,
            });
        ep.ends.push({ type, size });
    });
    points.forEach(({ starts, ends }) => {
        starts.sort((a, b) => b.size - a.size); // starts bigggest first
        ends.sort((a, b) => a.size - b.size);
    });
    return points;
}
