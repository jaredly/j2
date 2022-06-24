import { Card, Text } from '@nextui-org/react';
import * as React from 'react';
import {
    AllTaggedTypeNames,
    AllTaggedTypes,
    parseFile,
} from '../core/grammar/base.parser';
import { transformFile, Visitor } from '../core/transform-ast';
import { Loc } from '../core/typed-ast';
import { Fixture, parseFixture } from '../core/typing/__test__/fixture-utils';
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

const markUp = (text: string, locs: Array<{ loc: Loc; type: string }>) => {
    const points = sortLocs(locs);
    let pos = 0;
    let res = '';
    points.forEach(({ at, starts, ends }) => {
        if (at > pos) {
            res += text.slice(pos, at);
        }
        ends.forEach(({ type }) => {
            res += `</span>`;
        });
        starts.forEach(({ type }) => {
            const color = colors[type as keyof Visitor<null>];
            res += `<span class="${type}" style="color: ${color ?? '#aaa'}">`;
        });

        pos = at;
    });
    return res;
};

const Highlight = ({ text }: { text: string }) => {
    const parsed = React.useMemo(() => {
        const ast = parseFile(text);
        const locs: Array<{ loc: Loc; type: string }> = [];
        ast.comments.forEach(([loc, _]) => {
            locs.push({ loc, type: 'comment' });
        });
        transformFile(ast, visitor, locs);
        return locs;
    }, [text]);
    const marked = React.useMemo(() => {
        return markUp(text, parsed);
    }, [parsed]);
    return (
        <div>
            <Text css={{ whiteSpace: 'pre', fontFamily: '$mono' }}>
                <span dangerouslySetInnerHTML={{ __html: marked }} />
            </Text>
            {/* {parsed.map(({ loc, type }, i) => {
                return <div>{JSON.stringify({ loc, type })}</div>;
            })} */}
        </div>
    );
};

export const FixtureFile = ({ name }: { name: string }) => {
    const data = usePromise(
        () =>
            fetch(`/element/${name}`)
                .then((res) => res.text())
                .then(parseFixture),
        [name],
    );
    if (!data) {
        return null;
    }
    return (
        <div>
            {data.map((fixture: Fixture) => {
                const { title, builtins, input, output, i } = fixture;

                return (
                    <Card variant={'bordered'} css={{ p: '$6', m: '$6' }}>
                        <Card.Header>
                            <Text b>{title}</Text>
                        </Card.Header>
                        <Card.Divider />
                        <Card.Body>
                            <Highlight text={input} />
                        </Card.Body>
                    </Card>
                );
            })}
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
