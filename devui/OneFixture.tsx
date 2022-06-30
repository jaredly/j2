import {
    Button,
    Card,
    Checkbox,
    Input,
    Link,
    Spacer,
    Text,
    Textarea,
} from '@nextui-org/react';
import equal from 'fast-deep-equal';
import * as React from 'react';
import { builtinContext, FullContext } from '../core/ctx';
import { errorCount } from '../core/typing/analyze';
import {
    aliasesFromString,
    Builtin,
    Fixture,
    FixtureResult,
    loadBuiltins,
    runFixture,
} from '../core/typing/__test__/fixture-utils';
import { Editor } from './Editor';
import { Highlight } from './Highlight';

export function OneFixture({
    fixture,
    onChange,
    portal,
    id,
    ctx,
    builtins,
}: {
    id: string;
    ctx: FullContext;
    portal: HTMLDivElement;
    fixture: Fixture;
    onChange: (v: Fixture) => void;
    builtins: Builtin[];
}) {
    const { title, input, output_expected } = fixture;
    const [editing, setEditing] = React.useState(null as null | string);

    const newOutput = React.useMemo(():
        | { type: 'error'; error: Error }
        | { type: 'success'; result: FixtureResult } => {
        if (editing != null) {
            try {
                return {
                    type: 'success',
                    result: runFixture({ ...fixture, input: editing }, ctx),
                };
            } catch (err) {
                console.log(err);
            }
        }
        try {
            return { type: 'success', result: runFixture(fixture, ctx) };
        } catch (err) {
            return { type: 'error', error: err as Error };
        }
    }, [fixture, builtins, editing]);
    const [titleEdit, setTitleEdit] = React.useState(null as null | string);

    const changed =
        newOutput.type === 'error' ||
        compare(output_expected, newOutput.result.newOutput);

    const numErrors =
        newOutput.type === 'error' ? 1 : errorCount(newOutput.result.verify);

    return (
        <div id={id} style={{ paddingTop: 24 }}>
            <Card
                variant={'bordered'}
                css={{
                    borderColor: changed ? 'orange' : undefined,
                    position: 'relative',
                    borderRadius: 3,
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    {titleEdit ? (
                        <Input
                            autoFocus
                            aria-label="Fixture title"
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
                                    onChange({ ...fixture, title: titleEdit });
                                    evt.preventDefault();
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
                    <div
                        style={{
                            flex: 1,
                            textAlign: 'right',
                            // paddingRight: 12,
                            // paddingTop: 4,
                        }}
                    >
                        <Checkbox
                            css={{
                                backgroundColor:
                                    numErrors > 0 !== fixture.shouldFail
                                        ? 'rgba(255,0,0,0.6)'
                                        : undefined,
                                padding: '4px 8px',
                                margin: 0,
                                borderRadius: 4,
                            }}
                            size="xs"
                            label="Should Fail"
                            disableAnimation
                            isSelected={fixture.shouldFail}
                            onChange={(shouldFail) =>
                                onChange({ ...fixture, shouldFail })
                            }
                        />
                    </div>
                    {changed && newOutput.type === 'success' ? (
                        <>
                            <Button
                                size={'xs'}
                                onPress={() => {
                                    onChange({
                                        ...fixture,
                                        output_expected:
                                            newOutput.result.newOutput,
                                        aliases_deprecated:
                                            newOutput.result.aliases,
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
                                onPress={() => {
                                    // So if the old one is rejected, we overwrite
                                    // but if the old one is accepted, then we keep it around as "the right one"
                                    onChange({
                                        ...fixture,
                                        output_expected:
                                            newOutput.result.newOutput,
                                        aliases_deprecated:
                                            newOutput.result.aliases,
                                        failing_deprecated: true,
                                    });
                                }}
                            >
                                Reject
                            </Button>
                        </>
                    ) : null}
                </div>
                <Card.Body css={{ display: 'flex', fontFamily: '$mono' }}>
                    <Editor
                        text={editing ?? input}
                        onChange={setEditing}
                        onBlur={(input) => {
                            setEditing(null);
                            if (
                                newOutput.type === 'error' ||
                                input === newOutput.result.input
                            ) {
                                onChange({
                                    ...fixture,
                                    input,
                                });
                            }
                        }}
                    />
                    {/*editing != null ? (
                        <Textarea
                            autoFocus
                            fullWidth
                            aria-label="Input"
                            style={{
                                fontFamily: 'inherit',
                                fontSize: 'inherit',
                                padding: 0,
                                margin: 0,
                                flexShrink: 0,
                            }}
                            minRows={10}
                            value={editing}
                            onChange={(evt) => setEditing(evt.target.value)}
                            onKeyDown={(evt) => {
                                if (evt.key === 'Escape') {
                                    setEditing(null);
                                    if (
                                        newOutput.type === 'error' ||
                                        editing === newOutput.result.input
                                    ) {
                                        onChange({
                                            ...fixture,
                                            input: editing,
                                        });
                                    }
                                } else if (evt.key === 'Enter' && evt.metaKey) {
                                    evt.preventDefault();
                                    if (
                                        newOutput.type === 'error' ||
                                        editing === newOutput.result.input
                                    ) {
                                        onChange({
                                            ...fixture,
                                            input: editing,
                                        });
                                    }
                                }
                            }}
                            onBlur={() => {
                                if (
                                    newOutput.type === 'error' ||
                                    editing === newOutput.result.input
                                ) {
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
                    )*/}
                    <Card.Divider css={{ marginBlock: '$6' }} />
                    <div style={{ position: 'relative' }}>
                        {numErrors != 0 ? (
                            <Text
                                css={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    flex: 1,
                                    textAlign: 'right',
                                    flexShrink: 0,
                                    paddingRight: '$6',
                                    paddingLeft: '$6',
                                    backgroundColor: 'rgba(255,0,0,0.1)',
                                }}
                            >
                                {numErrors} issue{numErrors > 1 ? 's' : ''}
                            </Text>
                        ) : fixture.shouldFail ? (
                            <Text
                                css={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    flex: 1,
                                    textAlign: 'right',
                                    flexShrink: 0,
                                    paddingRight: '$6',
                                    paddingLeft: '$6',
                                    backgroundColor: 'rgba(255,0,0,0.3)',
                                }}
                            >
                                No errors, but expected failure
                            </Text>
                        ) : null}

                        {newOutput.type === 'success' ? (
                            <>
                                <Aliases
                                    aliases={parseAliases(output_expected)}
                                />
                                <Highlight
                                    portal={portal}
                                    text={output_expected}
                                    info={{
                                        tast: newOutput.result.outputTast,
                                        ctx: newOutput.result.ctx2,
                                    }}
                                />
                            </>
                        ) : (
                            <Text>
                                Failed to parse probably{' '}
                                {newOutput.error.message}{' '}
                            </Text>
                        )}
                    </div>
                    {changed && newOutput.type === 'success' ? (
                        <>
                            <Card.Divider css={{ marginBlock: '$6' }} />
                            <Aliases
                                aliases={parseAliases(
                                    newOutput.result.newOutput,
                                )}
                            />
                            {changed !== 'aliases' ? (
                                <Highlight
                                    portal={portal}
                                    text={newOutput.result.newOutput}
                                    info={{
                                        tast: newOutput.result.checked,
                                        ctx: newOutput.result.ctx,
                                    }}
                                />
                            ) : null}
                        </>
                    ) : null}
                </Card.Body>
            </Card>
        </div>
    );
}

const parseAliases = (text: string) => {
    if (text.startsWith('alias ')) {
        const line = text.slice(0, text.indexOf('\n'));
        return aliasesFromString(line);
    }
    return {};
};

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
    one: { [key: string]: string },
    two: { [key: string]: string },
) => {
    return (
        Object.keys(one).length === Object.keys(two).length &&
        Object.keys(one).every((key) => one[key] === two[key])
    );
};

const splitAliases = (text: string): [string, string] => {
    if (text.startsWith('alias ')) {
        const idx = text.indexOf('\n');
        return [text.slice(0, idx), text.slice(idx + 1)];
    }
    return ['', text];
};

export const compare = (one: string, two: string): boolean | 'aliases' => {
    if (one == two) {
        return false;
    }
    const [oneAliases, oneText] = splitAliases(one);
    const [twoAliases, twoText] = splitAliases(two);
    if (oneText === twoText) {
        return 'aliases';
    }
    return true;
};
