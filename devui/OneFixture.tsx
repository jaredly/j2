import { Button, Card, Input, Spacer, Text } from '@nextui-org/react';
import * as React from 'react';
import { FullContext } from '../core/ctx';
import {
    Builtin,
    Fixture,
    runFixture,
} from '../core/typing/__test__/fixture-utils';
import { Highlight } from './Highlight';

export function OneFixture({
    fixture,
    onChange,
    portal,
    id,
    builtins,
}: {
    id: string;
    portal: HTMLDivElement;
    fixture: Fixture;
    onChange: (v: Fixture) => void;
    builtins: Builtin[];
}) {
    const {
        title,
        // aliases_deprecated: aliases,
        input,
        output_expected,
    } = fixture;

    const newOutput = React.useMemo(
        () => runFixture(fixture, builtins),
        [fixture, builtins],
    );

    const changed = output_expected !== newOutput.newOutput;

    const [titleEdit, setTitleEdit] = React.useState(null as null | string);
    return (
        <div id={id} style={{ paddingTop: 24 }}>
            <Card
                variant={'bordered'}
                css={{
                    // p: '$6',
                    // m: '$6',
                    borderColor: changed
                        ? 'orange'
                        : fixture.failing_deprecated
                        ? 'red'
                        : undefined,
                    position: 'relative',
                    borderRadius: 3,
                }}
            >
                {/* <Card.Header
                    onClick={() => (titleEdit ? null : setTitleEdit(title))}
                > */}
                <div style={{}}>
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
                                backgroundColor: 'rgba(0,0,0,0.3)',
                                display: 'inline-block',
                                paddingLeft: 8,
                                paddingRight: 8,
                            }}
                            onClick={() => setTitleEdit(title)}
                        >
                            {title}
                        </Text>
                    )}
                </div>
                {/* </Card.Header> */}
                {/* <Card.Divider /> */}
                <Card.Body css={{ display: 'flex' }}>
                    <Highlight text={input} portal={portal} />
                    <Card.Divider css={{ marginBlock: '$6' }} />
                    {/* <Aliases aliases={aliases} /> */}
                    <Highlight
                        portal={portal}
                        text={output_expected}
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
                                portal={portal}
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
                                    output_expected: newOutput.newOutput,
                                    aliases_deprecated: newOutput.aliases,
                                    failing_deprecated: false,
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
                                    output_expected: newOutput.newOutput,
                                    aliases_deprecated: newOutput.aliases,
                                    failing_deprecated: true,
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
