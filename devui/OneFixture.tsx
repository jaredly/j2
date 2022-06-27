import { Button, Card, Input, Spacer, Text, Textarea } from '@nextui-org/react';
import equal from 'fast-deep-equal';
import * as React from 'react';
import { FullContext } from '../core/ctx';
import { errorCount } from '../core/typing/analyze';
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
    const { title, input, output_expected } = fixture;
    const [editing, setEditing] = React.useState(null as null | string);

    const newOutput = React.useMemo(() => {
        if (editing != null) {
            try {
                return runFixture({ ...fixture, input: editing }, builtins);
            } catch (err) {}
        }
        return runFixture(fixture, builtins);
    }, [fixture, builtins, editing]);

    const changed = output_expected !== newOutput.newOutput;

    const numErrors = errorCount(newOutput.verify);

    const [titleEdit, setTitleEdit] = React.useState(null as null | string);
    return (
        <div id={id} style={{ paddingTop: 24 }}>
            <Card
                variant={'bordered'}
                css={{
                    borderColor: changed
                        ? 'orange'
                        : // : numErrors
                          // ? 'red'
                          undefined,
                    position: 'relative',
                    borderRadius: 3,
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'row' }}>
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
                            onKeyDown={(evt) => {
                                if (evt.key === 'Enter') {
                                    setTitleEdit(null);
                                    onChange({ ...fixture, title: titleEdit });
                                    evt.preventDefault();
                                }
                                if (evt.key === 'Escape') {
                                    setTitleEdit(null);
                                }
                            }}
                            onChange={(evt) => setTitleEdit(evt.target.value)}
                            onBlur={() => {
                                setTitleEdit(null);
                                onChange({ ...fixture, title: titleEdit });
                            }}
                        />
                    ) : (
                        <Text
                            css={{
                                cursor: 'pointer',
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
                <Card.Body css={{ display: 'flex', fontFamily: '$mono' }}>
                    {editing != null ? (
                        <Textarea
                            autoFocus
                            fullWidth
                            style={{
                                fontFamily: 'inherit',
                                fontSize: 'inherit',
                                padding: 0,
                                margin: 0,
                            }}
                            minRows={3}
                            value={editing}
                            onChange={(evt) => setEditing(evt.target.value)}
                            onKeyDown={(evt) => {
                                if (evt.key === 'Escape') {
                                    setEditing(null);
                                    if (editing === newOutput.input) {
                                        onChange({
                                            ...fixture,
                                            input: editing,
                                        });
                                    }
                                } else if (evt.key === 'Enter' && evt.metaKey) {
                                    evt.preventDefault();
                                    if (editing === newOutput.input) {
                                        onChange({
                                            ...fixture,
                                            input: editing,
                                        });
                                    }
                                }
                            }}
                            onBlur={() => {
                                if (editing === newOutput.input) {
                                    onChange({ ...fixture, input: editing });
                                }
                                setEditing(null);
                            }}
                        />
                    ) : (
                        <Highlight
                            text={input}
                            portal={portal}
                            onClick={() => setEditing(input)}
                        />
                    )}
                    <Card.Divider css={{ marginBlock: '$6' }} />
                    <div style={{ position: 'relative' }}>
                        {numErrors != 0 ? (
                            <Text
                                css={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 4,
                                    flex: 1,
                                    textAlign: 'right',
                                    flexShrink: 0,
                                    paddingRight: '$6',
                                    paddingLeft: '$6',
                                    backgroundColor: 'rgba(255,0,0,0.3)',
                                }}
                            >
                                {numErrors} issues
                            </Text>
                        ) : null}

                        <Highlight
                            portal={portal}
                            text={output_expected}
                            info={{
                                tast: newOutput.outputTast,
                                ctx: newOutput.ctx2,
                            }}
                        />
                    </div>
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
