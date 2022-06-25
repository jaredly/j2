import { Button, Card, Input, Spacer, Text } from '@nextui-org/react';
import * as React from 'react';
import { FullContext } from '../core/ctx';
import {
    Fixed,
    Fixture,
    runFixture,
} from '../core/typing/__test__/fixture-utils';
import { Highlight } from './Highlight';

export function OneFixture({
    fixture,
    onChange,
    id,
}: {
    id: string;
    fixture: Fixture;
    onChange: (v: Fixture) => void;
}) {
    const { title, aliases, builtins, input, output } = fixture;

    const newOutput = React.useMemo(() => runFixture(fixture), [fixture]);

    const changed =
        output !== newOutput.newOutput ||
        !aliasesMatch(aliases, newOutput.aliases);

    const [titleEdit, setTitleEdit] = React.useState(null as null | string);
    return (
        <div id={id} style={{ paddingTop: 24 }}>
            <Card
                variant={'bordered'}
                css={{
                    p: '$6',
                    // m: '$6',
                    borderColor: changed
                        ? 'orange'
                        : fixture.failing
                        ? 'red'
                        : undefined,
                    position: 'relative',
                }}
            >
                <Card.Header
                    onClick={() => (titleEdit ? null : setTitleEdit(title))}
                >
                    {titleEdit ? (
                        <Input
                            autoFocus
                            css={{
                                letterSpacing: '$wide',
                                fontWeight: '$light',
                            }}
                            bordered
                            fullWidth
                            value={titleEdit}
                            onChange={(evt) => setTitleEdit(evt.target.value)}
                            onBlur={() => {
                                setTitleEdit(null);
                                onChange({ ...fixture, title: titleEdit });
                            }}
                        />
                    ) : (
                        <Text
                            css={{
                                fontWeight: '$light',
                                letterSpacing: '$wide',
                            }}
                            onClick={() => setTitleEdit(title)}
                        >
                            {title}
                        </Text>
                    )}
                </Card.Header>
                <Card.Divider />
                <Card.Body css={{ display: 'flex' }}>
                    {builtins.length ? (
                        <>
                            <div>
                                <Text css={{ fontFamily: '$mono' }} small>
                                    Builtins:
                                    {builtins.map((item, i) => (
                                        <span key={i} style={{ marginLeft: 8 }}>
                                            {item.name}
                                        </span>
                                    ))}
                                </Text>
                            </div>
                            <Card.Divider css={{ marginBlock: '$6' }} />
                        </>
                    ) : null}
                    <Highlight text={input} />
                    <Card.Divider css={{ marginBlock: '$6' }} />
                    <Aliases aliases={aliases} />
                    <Highlight
                        text={output}
                        info={{
                            tast: newOutput.outputTast,
                            ctx: newOutput.ctx2,
                        }}
                    />
                    {changed ? (
                        <>
                            <Card.Divider css={{ marginBlock: '$6' }} />
                            <Aliases aliases={newOutput.aliases} />
                            <Highlight
                                text={newOutput.newOutput}
                                info={{
                                    tast: newOutput.checked,
                                    ctx: newOutput.ctx,
                                }}
                            />
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
                                    ...fixture,
                                    output: newOutput.newOutput,
                                    aliases: newOutput.aliases,
                                    failing: false,
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
                                onChange({
                                    ...fixture,
                                    output: newOutput.newOutput,
                                    aliases: newOutput.aliases,
                                    failing: true,
                                });
                            }}
                        >
                            Reject
                        </Button>
                    </div>
                ) : null}
            </Card>
        </div>
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
                        {key}{' '}
                        <span style={{ color: '#666' }}>
                            {value.slice(0, 10)}...
                        </span>
                    </Text>
                ))}
        </div>
    );
};

export const aliasesMatch = (
    one: FullContext['aliases'],
    two: FullContext['aliases'],
) => {
    return (
        Object.keys(one).length === Object.keys(two).length &&
        Object.keys(one).every((key) => one[key] === two[key])
    );
};
