import { runTypeTest, TypeTest } from '../core/typing/__test__/typetest';
import * as React from 'react';
import { Editor } from './Editor';
import { printCtx } from '../core/typing/to-ast';
import { newPPCtx } from '../core/printer/to-pp';
import { injectComments } from '../core/elements/comments';
import { printToString } from '../core/printer/pp';

export const TypeTestView = ({
    test,
    onChange,
}: {
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
        return printToString(pp, 100);
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
            <Editor
                typeFile
                text={text}
                ctx={test.ctx}
                onBlur={(text) => {
                    try {
                        onChange(runTypeTest(text));
                    } catch (err) {
                        //
                    }
                }}
                onChange={(text) => setText(text)}
            />
        </div>
    );
};
