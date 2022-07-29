import { Button, Card } from '@nextui-org/react';
import * as React from 'react';
import { builtinContext, FullContext } from '../core/ctx';
import {
    FileContents,
    processFile,
    processFileR,
    Result,
} from '../core/full/full';
import {
    aliasesFromString,
    splitAliases,
} from '../core/typing/__test__/fixture-utils';
import { verifyHL } from '../core/typing/__test__/verifyHL';
import { getTestResults, TestValues, TestWhat } from './App';
import { Editor } from './Editor';
import { HL } from './HL';
import { refmt } from './refmt';

export const testStatuses = (
    file: Result<FileContents>,
    results: TestValues,
): HL[] => {
    if (file.type === 'Error') {
        return [
            {
                loc: file.err,
                type: 'Error',
                prefix: {
                    text: '🚨',
                    message: `Error locations`,
                },
            },
        ];
    }
    const statuses: HL[] = [];
    file.info.forEach((info) => {
        statuses.push(...verifyHL(info.verify));
    });

    results.info.exprs;
    results.testResults.forEach((result) => {
        statuses.push({
            loc: result.loc,
            type: result.success ? 'Success' : 'Error',
            prefix: {
                text: result.success ? '✅' : '🚨',
            },
        });
    });

    return statuses;
};

export const TestView = ({
    test,
    onChange,
    name,
}: {
    name: string;
    test: TestWhat;
    onChange: (v: TestWhat) => void;
}) => {
    const [text, setText] = React.useState(() => refmt(test.file));

    return (
        <div
            style={{
                padding: 24,
                display: 'flex',
                alignItems: 'stretch',
                flexDirection: 'column',
                flex: 1,
            }}
        >
            <Card
                variant={'bordered'}
                css={{
                    position: 'relative',
                    borderRadius: 3,
                }}
            >
                <Card.Body
                    css={{
                        display: 'flex',
                        fontFamily: '$mono',
                        fontWeight: '$light',
                    }}
                >
                    <Editor
                        text={text}
                        extraLocs={(v) => {
                            if (v.type !== 'File') {
                                return [];
                            }
                            const file = processFileR(v);
                            const results = getTestResults(file);
                            return testStatuses(file, results);
                        }}
                        onBlur={(contents) => {
                            const [aliasRaw, text] = splitAliases(contents);
                            let ctx = builtinContext.clone();
                            if (aliasRaw) {
                                ctx = ctx.withAliases(
                                    aliasesFromString(aliasRaw),
                                ) as FullContext;
                            }
                            const ran = processFile(text);
                            const fmt = refmt(ran);
                            setText(fmt);
                            fetch(
                                `/elements/test/${name.slice('test:'.length)}`,
                                {
                                    method: 'POST',
                                    body: fmt,
                                },
                            );
                            if (ran.type === 'Error') {
                                onChange({ file: ran, values: null });
                            } else {
                                onChange({
                                    file: ran,
                                    values: getTestResults(ran),
                                });
                            }
                        }}
                        onChange={(text) => setText(text)}
                    />
                    <Button
                        onPress={() => {
                            if (test.file.type === 'Success' && test.values) {
                                processFile(
                                    text,
                                    undefined,
                                    test.values?.debugs,
                                );
                            }
                        }}
                    >
                        Run with debug
                    </Button>
                </Card.Body>
            </Card>
        </div>
    );
};
