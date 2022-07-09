import { runTypeTest, TypeTest } from '../core/typing/__test__/typetest';
import * as React from 'react';
import { Editor } from './Editor';
import { printCtx } from '../core/typing/to-ast';
import { newPPCtx } from '../core/printer/to-pp';
import { injectComments } from '../core/elements/comments';
import { printToString } from '../core/printer/pp';
import { Card } from '@nextui-org/react';
import { fixComments } from '../core/grammar/fixComments';
import { parseTypeFile } from '../core/grammar/base.parser';

export const TypeTestView = ({
    test,
    onChange,
    name,
}: {
    name: string;
    test: TypeTest;
    onChange: (v: TypeTest) => void;
}) => {
    const [text, setText] = React.useState(() => {
        const actx = printCtx(test.ctx);
        const ast = actx.ToAst.TypeFile(test.file, actx);
        const pctx = newPPCtx();
        const pp = injectComments(
            pctx.ToPP.TypeFile(ast, pctx),
            ast.comments.slice(),
        );
        return printToString(pp, 100).replace(/[ \t]+$/gm, '');
    });

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
                        typeFile
                        text={text}
                        ctx={test.ctx}
                        extraLocs={(v) => {
                            if (v.type === 'File') {
                                return [];
                            }
                            const results = runTypeTest(v);
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
                            try {
                                onChange(
                                    runTypeTest(
                                        fixComments(parseTypeFile(text)),
                                    ),
                                );
                                fetch(`/elements/typetest/${name}`, {
                                    method: 'POST',
                                    body: text,
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
