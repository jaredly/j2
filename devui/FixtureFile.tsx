import { Button, Card, Container, Spacer, Text } from '@nextui-org/react';
import equal from 'fast-deep-equal';
import * as React from 'react';
import { noloc } from '../core/ctx';
import {
    AllTaggedTypeNames,
    AllTaggedTypes,
    parseFile,
} from '../core/grammar/base.parser';
import { transformFile, Visitor } from '../core/transform-ast';
import { Loc } from '../core/typed-ast';
import {
    Fixed,
    Fixture,
    parseFixtureFile,
    runFixture,
    serializeFixture,
} from '../core/typing/__test__/fixture-utils';
import { usePromise } from './index';

const colors: { [key in keyof Visitor<null>]: string } = {
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

const Highlight = ({ text }: { text: string }) => {
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
                // dangerouslySetInnerHTML={{ __html: marked }}
            >
                <Tree tree={marked} hover={hover} />
            </span>
            {JSON.stringify(hover)}
        </Text>
    );
};

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

export const FixtureFile = ({ name }: { name: string }) => {
    const [data, setData] = usePromise(
        () =>
            fetch(`/element/${name}`)
                .then((res) => res.text())
                .then(parseFixtureFile),
        [name],
    );
    if (!data) {
        return null;
    }
    return (
        <Container css={{ p: '$6', mb: '50vh' }}>
            {data.map((fixture: Fixture, i) => (
                <OneFixture
                    fixture={fixture}
                    key={i}
                    onChange={(fixed) => {
                        console.log('ok', fixed);
                        const fixes: Fixture[] = data.map((f, j) =>
                            j === i ? { ...f, ...fixed } : f,
                        );
                        fetch(`/element/${name}`, {
                            method: 'POST',
                            body: fixes.map(serializeFixture).join('\n'),
                        }).then(() => setData(fixes));
                    }}
                />
            ))}
        </Container>
    );
};

function OneFixture({
    fixture,
    onChange,
}: {
    fixture: Fixture;
    onChange: (v: Fixed) => void;
}) {
    const { title, aliases, builtins, input, output, i } = fixture;

    const newOutput = React.useMemo(
        () => runFixture(builtins, input, output),
        [builtins, input, output],
    );

    const changed =
        output !== newOutput.newOutput || !equal(aliases, newOutput.aliases);
    return (
        <Card
            variant={'bordered'}
            css={{
                p: '$6',
                m: '$6',
                borderColor: changed ? 'red' : undefined,
                position: 'relative',
            }}
        >
            <Card.Header>
                <Text b>{title}</Text>
            </Card.Header>
            <Card.Divider />
            <Card.Body css={{ display: 'flex' }}>
                {builtins.length ? (
                    <>
                        {builtins.map((item, i) => (
                            <Text key={i} css={{ fontFamily: '$mono' }}>
                                {item}
                            </Text>
                        ))}
                        <Card.Divider css={{ marginBlock: '$6' }} />
                    </>
                ) : null}
                <Highlight text={input} />
                <Card.Divider css={{ marginBlock: '$6' }} />
                <Aliases aliases={aliases} />
                <Highlight text={output} />
                {changed ? (
                    <>
                        <Card.Divider css={{ marginBlock: '$6' }} />
                        <Aliases aliases={newOutput.aliases} />
                        <Highlight text={newOutput.newOutput} />
                    </>
                ) : null}
            </Card.Body>
            {changed ? (
                <div
                    style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                    }}
                >
                    <Button
                        size={'xs'}
                        onPress={() => {
                            onChange({
                                output: newOutput.newOutput,
                                errors: newOutput.errorText,
                                aliases: newOutput.aliases,
                            });
                        }}
                    >
                        Accept
                    </Button>
                    <Spacer x={0.5} />
                    <Button
                        size="xs"
                        color="secondary"
                        onClick={() => {
                            // So if the old one is rejected, we overwrite
                            // but if the old one is accepted, then we keep it around as "the right one"
                        }}
                    >
                        Reject
                    </Button>
                </div>
            ) : null}
        </Card>
    );
}

const Aliases = ({ aliases }: { aliases: { [key: string]: string } }) => {
    return (
        <div
            style={{ flexDirection: 'row', display: 'flex', flexWrap: 'wrap' }}
        >
            {Object.entries(aliases)
                .sort((a, b) => (b[1] > a[1] ? -1 : 1))
                .map(([key, value]) => (
                    <Text key={key} css={{ marginRight: 8, marginBottom: 8 }}>
                        {value}{' '}
                        <span style={{ color: '#666' }}>
                            {key.slice(0, 10)}...
                        </span>
                    </Text>
                ))}
        </div>
    );
};

function sortLocs(locs: { loc: Loc; type: string }[]) {
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
