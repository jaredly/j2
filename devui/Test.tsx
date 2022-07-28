import { Card } from '@nextui-org/react';
import * as React from 'react';
import { builtinContext, FullContext, noloc } from '../core/ctx';
import { injectComments } from '../core/elements/comments';
import {
    FileContents,
    processFile,
    processFileR,
    Result,
    TestResult,
} from '../core/full/full';
import * as p from '../core/grammar/base.parser';
import { printToString } from '../core/printer/pp';
import { newPPCtx } from '../core/printer/to-pp';
import {
    aliasesFromString,
    splitAliases,
} from '../core/typing/__test__/fixture-utils';
import { verifyHL } from '../core/typing/__test__/verifyHL';
import { getTestResults, TestValues, TestWhat } from './App';
import { Editor } from './Editor';
import { HL } from './HL';

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

export const refmt = (file: TestResult) => {
    if (file.type === 'Error') {
        return file.text;
    }

    const ast: p.File = {
        type: 'File',
        comments: file.comments,
        toplevels: [],
        loc: noloc,
    };

    file.info.forEach((info) => {
        const keys = Object.keys(info.aliases);
        if (keys.length) {
            ast.toplevels.push({
                type: 'Aliases',
                items: keys.sort().map((k) => ({
                    type: 'AliasItem',
                    name: k,
                    hash: `#[${info.aliases[k]}]`,
                    loc: noloc,
                })),
                loc: noloc,
            });
        }
        ast.toplevels.push(info.contents.refmt);
    });

    const pctx = newPPCtx();
    const pp = injectComments(pctx.ToPP.File(ast, pctx), ast.comments.slice());
    return printToString(pp, 100).replace(/[ \t]+$/gm, '');
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
                </Card.Body>
            </Card>
        </div>
    );
};
