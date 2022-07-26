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
import {
    aliasesFromString,
    aliasesToString,
    splitAliases,
} from '../core/typing/__test__/fixture-utils';
import { builtinContext, FullContext, noloc } from '../core/ctx';

const refmt = (test: Test) => {
    const actx = printCtx(test.ctx);
    const ast = actx.ToAst.File(test.file, actx);
    ast.toplevels.unshift({
        type: 'Aliases',
        items: Object.keys(actx.backAliases)
            .sort()
            .map((k) => ({
                type: 'AliasItem',
                name: k,
                hash: `#[${actx.backAliases[k]}]`,
                loc: noloc,
            })),
        loc: noloc,
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
                            const results = runTest(
                                v,
                                builtinContext.clone(),
                                true,
                            );
                            return results.statuses;
                        }}
                        onBlur={(contents) => {
                            const [aliasRaw, text] = splitAliases(contents);
                            let ctx = builtinContext.clone();
                            if (aliasRaw) {
                                ctx = ctx.withAliases(
                                    aliasesFromString(aliasRaw),
                                ) as FullContext;
                            }
                            const ran = runTest(
                                fixComments(parseFile(text)),
                                ctx,
                            );
                            const fmt = refmt(ran);
                            try {
                                onChange(ran);
                                setText(fmt);
                                fetch(
                                    `/elements/test/${name.slice(
                                        'test:'.length,
                                    )}`,
                                    {
                                        method: 'POST',
                                        body: fmt,
                                    },
                                );
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
