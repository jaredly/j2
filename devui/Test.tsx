import * as React from 'react';
import { Editor } from './Editor';
import { printCtx } from '../core/typing/to-ast';
import { newPPCtx } from '../core/printer/to-pp';
import { injectComments } from '../core/elements/comments';
import { printToString } from '../core/printer/pp';
import { Card } from '@nextui-org/react';
import { fixComments } from '../core/grammar/fixComments';
import { parseFile, parseTypeFile } from '../core/grammar/base.parser';
import { runTest, Test } from '../core/typing/__test__/run-test';

const refmt = (test: Test) => {
    const actx = printCtx(test.ctx);
    const ast = actx.ToAst.File(test.file, actx);
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
    test: Test;
    onChange: (v: Test) => void;
}) => {
    const [text, setText] = React.useState(() => refmt(test));

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
                        ctx={test.ctx}
                        extraLocs={(v) => {
                            if (v.type !== 'File') {
                                return [];
                            }
                            const results = runTest(v, true);
                            return results.statuses.map((status) => {
                                if (status.text) {
                                    return {
                                        loc: status.loc,
                                        type: 'Error',
                                        prefix: {
                                            text: `🚨`,
                                            message: status.text,
                                        },
                                        underline: 'red',
                                    };
                                } else {
                                    return {
                                        type: 'Success',
                                        loc: status.loc,
                                        prefix: {
                                            text: `✅`,
                                        },
                                    };
                                }
                            });
                        }}
                        onBlur={(text) => {
                            const ran = runTest(fixComments(parseFile(text)));
                            const fmt = refmt(ran);
                            try {
                                onChange(ran);
                                setText(fmt);
                                fetch(`/elements/typetest/${name}`, {
                                    method: 'POST',
                                    body: fmt,
                                });
                            } catch (err) {
                                //
                            }
                        }}
                        onChange={(text) => setText(text)}
                    />
                </Card.Body>
            </Card>
        </div>
    );
};
