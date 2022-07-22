import generate from '@babel/generator';
import {
    Button,
    Card,
    Checkbox,
    Input,
    Spacer,
    Text,
    Tooltip,
} from '@nextui-org/react';
import * as React from 'react';
import { builtinContext, FullContext } from '../core/ctx';
import { fileToTast } from '../core/elements/base';
import { fixComments } from '../core/grammar/fixComments';
import { iCtx } from '../core/ir/ir';
import { jCtx } from '../core/ir/to-js';
import { transformExpression } from '../core/transform-tast';
import {
    analyzeTop,
    errorCount,
    initVerify,
    verify,
    verifyVisitor,
} from '../core/typing/analyze';
import {
    aliasesFromString,
    Builtin,
    Fixture,
    FixtureResult,
    loadBuiltins,
    runFixture,
    splitAliases,
} from '../core/typing/__test__/fixture-utils';
import { Editor } from './Editor';
import { ShowBuiltins } from './FixtureFile';
import { Highlight, HL } from './Highlight';
import { CancelIcon, ReportProblemIcon } from './Icons';

export function OneFixture({
    fixture,
    onChange,
    portal,
    id,
    isPinned,
    ctx,
    builtins,
}: {
    isPinned: boolean;
    id: string;
    ctx: FullContext;
    portal: HTMLDivElement;
    fixture: Fixture;
    onChange: (v: Fixture) => void;
    builtins: Builtin[];
}) {
    const { title, input, output_expected, output_failed } = fixture;
    const [editing, setEditing] = React.useState(null as null | string);

    const prevOutput = output_expected ? output_expected : output_failed;

    const loadedCtx = React.useMemo(() => {
        const cloned = ctx.clone();
        loadBuiltins(fixture.builtins, cloned);
        return cloned;
    }, [fixture.builtins, ctx]);

    const newOutput = React.useMemo(():
        | { type: 'error'; error: Error }
        | { type: 'success'; result: FixtureResult } => {
        if (isPinned) {
            ctx = {
                ...ctx,
                debugger() {
                    debugger;
                },
            };
        }
        if (editing != null) {
            try {
                return {
                    type: 'success',
                    result: runFixture({ ...fixture, input: editing }, ctx),
                };
            } catch (err) {}
        }
        // hmmmmm I think I'd rather the fallback be "the last successful one"
        try {
            return { type: 'success', result: runFixture(fixture, ctx) };
        } catch (err) {
            return { type: 'error', error: err as Error };
        }
    }, [fixture, builtins, editing, isPinned]);
    const [titleEdit, setTitleEdit] = React.useState(null as null | string);

    const changed =
        newOutput.type === 'error' ||
        compare(prevOutput, newOutput.result.newOutput);

    const numErrors =
        newOutput.type === 'error' ? 1 : errorCount(newOutput.result.verify);

    return (
        <div id={id} style={{ paddingTop: 24 }}>
            <Card
                variant={'bordered'}
                css={{
                    position: 'relative',
                    borderRadius: 3,
                    borderColor: changed ? 'orange' : undefined,
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
                            color="#aaa"
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
                            {changed ? (
                                <ReportProblemIcon
                                    style={{
                                        color: 'orange',
                                        marginRight: 8,
                                        marginBottom: -2,
                                    }}
                                />
                            ) : output_failed === prevOutput ? (
                                <CancelIcon
                                    style={{
                                        color: 'red',
                                        marginRight: 8,
                                        marginBottom: -2,
                                    }}
                                />
                            ) : null}
                            {title}
                        </Text>
                    )}
                    <div
                        style={{
                            flex: 1,
                            textAlign: 'right',
                            // paddingRight: 12,
                            // paddingTop: 4,
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}
                    >
                        {newOutput.type === 'success' ? (
                            <div
                                style={{
                                    marginTop: 4,
                                    marginRight: 8,
                                    display: 'flex',
                                    flexDirection: 'row',
                                }}
                            >
                                <Button
                                    size={'xs'}
                                    disabled={
                                        !changed &&
                                        newOutput.result.newOutput ===
                                            fixture.output_expected
                                    }
                                    onPress={() => {
                                        onChange({
                                            ...fixture,
                                            output_expected:
                                                newOutput.result.newOutput,
                                            output_failed: '',
                                        });
                                    }}
                                >
                                    Accept
                                </Button>
                                <Spacer x={0.5} />
                                <Button
                                    size="xs"
                                    color="secondary"
                                    disabled={
                                        !changed &&
                                        fixture.output_expected === ''
                                    }
                                    onPress={() => {
                                        // So if the old one is rejected, we overwrite
                                        // but if the old one is accepted, then we keep it around as "the right one"
                                        onChange({
                                            ...fixture,
                                            output_failed:
                                                newOutput.result.newOutput,
                                            output_expected: '',
                                        });
                                    }}
                                >
                                    Reject
                                </Button>
                            </div>
                        ) : null}
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
                </div>
                <Card.Body css={{ display: 'flex', fontFamily: '$mono' }}>
                    <ShowBuiltins
                        setBuiltins={(builtins) =>
                            onChange({ ...fixture, builtins })
                        }
                        builtins={fixture.builtins}
                    />
                    <Card.Divider css={{ marginBlock: '$6' }} />
                    <Editor
                        text={editing ?? input}
                        onChange={setEditing}
                        ctx={loadedCtx}
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
                    <Card.Divider css={{ marginBlock: '$6' }} />
                    <div style={{ position: 'relative' }}>
                        {numErrors != 0 && newOutput.type === 'success' ? (
                            <TopRight
                                tooltip={JSON.stringify(
                                    newOutput.result.verify,
                                )}
                                text={`${numErrors} issue${
                                    numErrors > 1 ? 's' : ''
                                }`}
                            />
                        ) : fixture.shouldFail ? (
                            <TopRight
                                text={'No errors, but expected failure'}
                            />
                        ) : null}

                        {newOutput.type === 'success' ? (
                            <>
                                <Aliases aliases={parseAliases(prevOutput)} />
                                <Highlight
                                    portal={portal}
                                    text={prevOutput}
                                    info={{
                                        tast: newOutput.result.outputTast,
                                        ctx: newOutput.result.ctx2,
                                    }}
                                    extraLocs={(ast) => {
                                        if (ast.type !== 'File') {
                                            return [];
                                        }

                                        // TODO: Just be able to use newOutput
                                        // with a source map for locs
                                        const fctx = ctx.clone();
                                        loadBuiltins(fixture.builtins, fctx);

                                        const [file, tctx] = fileToTast(
                                            fixComments(ast),
                                            fctx,
                                            true,
                                        );
                                        const ictx = iCtx();

                                        const locs: HL[] = [];
                                        file.toplevels.forEach((top) => {
                                            if (
                                                top.type !==
                                                'ToplevelExpression'
                                            ) {
                                                return;
                                            }

                                            const v = initVerify();
                                            transformExpression(
                                                top.expr,
                                                verifyVisitor(v, fctx),
                                                fctx,
                                            );
                                            if (errorCount(v)) {
                                                return;
                                            }

                                            const ir = ictx.ToIR.Expression(
                                                top.expr,
                                                ictx,
                                            );
                                            const jctx = jCtx(tctx);
                                            const js = jctx.ToJS.IExpression(
                                                ir,
                                                jctx,
                                            );
                                            const jsraw = generate(js).code;
                                            locs.push({
                                                loc: top.loc,
                                                type: 'Success',
                                                suffix: {
                                                    text: ' 🏃‍♀️',
                                                    message: jsraw,
                                                },
                                            });
                                        });
                                        return locs;
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

export const TopRight = ({
    text,
    tooltip,
}: {
    text: string;
    tooltip?: string;
}) => {
    const inner = (
        <Text
            css={{
                flex: 1,
                textAlign: 'right',
                flexShrink: 0,
                paddingRight: '$6',
                paddingLeft: '$6',
                backgroundColor: 'rgba(255,0,0,0.1)',
            }}
        >
            {text}
        </Text>
    );
    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                right: 0,
            }}
        >
            {tooltip ? <Tooltip content={tooltip}>{inner}</Tooltip> : inner}
        </div>
    );
};
