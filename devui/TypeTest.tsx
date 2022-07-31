import { Button, Card } from '@nextui-org/react';
import * as React from 'react';
import { noloc } from '../core/consts';
import { injectComments } from '../core/elements/comments';
import {
    processTypeFile,
    processTypeFileR,
    TypeTestResult,
} from '../core/full/full';
import * as p from '../core/grammar/base.parser';
import { printToString } from '../core/printer/pp';
import { newPPCtx } from '../core/printer/to-pp';
import { typeTestCtx } from '../core/typing/__test__/utils';
import { typeResults, TypeWhat } from './App';
import { Editor } from './Editor';

const refmt = (file: TypeTestResult) => {
    if (file.type === 'Error') {
        return file.text;
    }

    const ast: p.TypeFile = {
        type: 'TypeFile',
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

    if (ast.toplevels.length > 0) {
        ast.loc = {
            start: { line: 0, column: 0, offset: 0 },
            end: ast.toplevels[ast.toplevels.length - 1].loc.end,
            idx: -1,
        };
    }

    const pctx = newPPCtx();
    const pp = injectComments(
        pctx.ToPP.TypeFile(ast, pctx),
        ast.comments.slice(),
    );
    return printToString(pp, 100).replace(/[ \t]+$/gm, '');
};

export const TypeTestView = ({
    test,
    onChange,
    name,
}: {
    name: string;
    test: TypeWhat;
    onChange: (v: TypeWhat) => void;
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
                        typeFile
                        text={text}
                        extraLocs={(v) => {
                            if (v.type === 'File') {
                                return [];
                            }
                            const results = processTypeFileR(v, typeTestCtx);
                            const values =
                                results.type === 'Success'
                                    ? typeResults(results)
                                    : [];
                            return values
                                .filter((t) => t.message != null)
                                .map((v) => ({
                                    loc: v.loc,
                                    type: 'Error',
                                    prefix: {
                                        text: '🚨',
                                        message: v.message!,
                                    },
                                    underline: 'red',
                                }));
                        }}
                        onBlur={(text) => {
                            const ran = processTypeFile(text, {
                                ...typeTestCtx,
                                debugger() {
                                    debugger;
                                },
                            });
                            const values =
                                ran.type === 'Success' ? typeResults(ran) : [];
                            const fmt = refmt(ran);
                            try {
                                onChange({ file: ran, values });
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
            <Button
                css={{ marginTop: 16 }}
                disabled={test.file.type === 'Error' || !test.values}
                onPress={() => {
                    if (test.file.type === 'Success' && test.values) {
                        const debugs: { [key: number]: boolean } = {};
                        test.values.forEach((v) => {
                            if (v.message) {
                                debugs[v.idx] = true;
                            }
                        });
                        processTypeFile(text, undefined, debugs);
                        typeResults(test.file, true);
                    }
                }}
            >
                Run with debug
            </Button>
        </div>
    );
};
