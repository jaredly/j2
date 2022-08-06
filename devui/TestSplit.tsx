import { Card, styled } from '@nextui-org/react';
import * as React from 'react';
import { noloc } from '../core/consts';
import { builtinContext, FullContext } from '../core/ctx';
import { injectComments } from '../core/elements/comments';
import {
    FileContents,
    processFile,
    processFileR,
    Result,
    ToplevelInfo,
} from '../core/full/full';
import * as p from '../core/grammar/base.parser';
import { NameTrack } from '../core/ir/to-js';
import { printToString } from '../core/printer/pp';
import { newPPCtx } from '../core/printer/to-pp';
import { verifyHL } from '../core/typing/__test__/verifyHL';
import { getTestResults, TestValues, TestWhat } from './App';
import { BlurInput } from './BlurInput';
import { Editor } from './Editor';
import { HL } from './HL';
import { reconcileChanges, TestItem, TopEditor } from './TopEditor';

/*

So what if ... we had a 'splitEditor'

ok so, file.info doesn't have any aliases in it ...

*/

export const Hoverr = styled('div', {
    opacity: 0.5,
    transition: 'opacity 0.2s ease-in-out',
});
export const Hovery = styled('div', {
    '&:hover .hello': {
        opacity: 1,
    },
});

export const fmtItem = (item: p.Toplevel, comments: [p.Loc, string][]) => {
    const ast: p.File = {
        type: 'File',
        comments: [],
        toplevels: [],
        loc: noloc,
    };

    ast.toplevels.push(item);

    if (ast.toplevels.length > 0) {
        ast.loc = {
            start: { line: 0, column: 0, offset: 0 },
            end: ast.toplevels[ast.toplevels.length - 1].loc.end,
            idx: -1,
        };
    }

    const pctx = newPPCtx();
    const pp = pctx.ToPP.File(ast, pctx);
    return printToString(injectComments(pp, comments), 100).replace(
        /[ \t]+$/gm,
        '',
    );
};

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
    file.info.forEach((info, i) => {
        statuses.push(...verifyHL(info.verify));
        if (results.info.exprs[i] !== undefined) {
            const v = results.info.exprs[i];
            const { end } = info.contents.top.loc;
            statuses.push({
                loc: {
                    ...info.contents.top.loc,
                    end: { ...end, offset: end.offset + Infinity },
                },
                type: 'Success',
                suffix: {
                    text:
                        ' ' +
                        (typeof v === 'function'
                            ? info.contents.irtops
                                  ?.map((m) => m.tstring)
                                  .join(' : ') ?? 'not evaluated?'
                            : JSON.stringify(v)),
                },
            });
        }
    });

    // Object.keys(results.info.exprs).forEach((expr) => {
    // })
    // results.testResults.forEach((result) => {
    //     statuses.push({
    //         loc: result.loc,
    //         type: result.msg == null ? 'Success' : 'Error',
    //         prefix: {
    //             text: result.msg == null ? '✅' : '🚨',
    //             message: result.msg ?? undefined,
    //         },
    //     });
    // });

    return statuses;
};

export const TestSplit = ({
    test,
    onChange,
    name,
    changeName,
}: {
    name: string;
    test: TestWhat;
    onChange: (v: TestWhat, text: string) => void;
    changeName?: (v: string) => void;
}) => {
    console.log('test split');
    // can I attribute comments to each of the infos?
    // also, how do I add / remove items?
    const [items, setItems] = React.useState<TestItem[]>(() => {
        if (test.file.type === 'Error') {
            return [
                { type: 'Failed', text: test.file.text, err: test.file.err },
            ];
        }
        return test.file.info;
    });

    const shared = React.useRef({
        track: { names: {}, used: {} },
        terms: {},
    } as { track: NameTrack; terms: { [key: string]: any } });

    React.useEffect(() => {
        const res = processFileR(
            {
                type: 'File',
                comments: [],
                toplevels: items
                    .filter((item) => item.type === 'Info')
                    .map(
                        (item) =>
                            (item as ToplevelInfo<FileContents>).contents.refmt,
                    ),
                loc: noloc,
            },
            undefined,
            shared.current.terms,
            undefined,
            true,
        );
        const texts = items.map((item) =>
            item.type === 'Failed'
                ? item.text
                : fmtItem(item.contents.refmt, item.comments),
        );
        onChange({ file: res, values: getTestResults(res) }, texts.join('\n'));
    }, [items]);

    // OK so ... what needs to share?
    // global ctx
    // also ... ectx?
    // oh and jctx for sure
    // but I can re-run all the ectx & jctx madness on each keystroke, that's probably fine.
    // as long as I'm not re-processing absolutely everything all the time.

    const hover = React.useMemo(() => {
        const div = document.createElement('div');
        document.body.appendChild(div);
        return div;
    }, []);

    React.useEffect(() => {
        return () => hover.remove();
    }, []);

    let ctx = builtinContext;
    const editors = items
        .map((item, i) => {
            const myctx = ctx;
            ctx =
                item.type === 'Info'
                    ? (ctx.withToplevel(item.contents.top) as FullContext)
                    : ctx;
            return (
                <TopEditor
                    key={i}
                    onChange={(info) => {
                        setItems(
                            reconcileChanges(
                                items,
                                i,
                                info,
                                shared.current,
                                myctx,
                            ),
                        );
                    }}
                    shared={shared}
                    ctx={myctx}
                    item={item}
                    hover={hover}
                />
            );
        })
        .concat([
            <Editor
                key={'last' + items.length}
                obsref={{ current: () => () => {} }}
                text={'// add new item'}
                onBlur={(text) => {
                    const file = processFile(
                        text,
                        ctx,
                        undefined,
                        shared.current.track,
                        true,
                    );
                    if (file.type === 'Success') {
                        setTimeout(() => {
                            setItems(items.concat(file.info));
                        }, 10);
                    }
                }}
                onChange={(text) => {}}
                extraLocs={(v) => {
                    if (v.type !== 'File') {
                        return [];
                    }
                    const file = processFileR(
                        v,
                        ctx,
                        undefined,
                        shared.current.track,
                        true,
                    );
                    const results = getTestResults(file, shared.current.terms);
                    // ok, so we have an AST
                    return testStatuses(file, results);
                }}
            />,
        ]);

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
            {changeName ? (
                <div>
                    <BlurInput
                        text={name}
                        onChange={(name) => changeName(name)}
                    />
                </div>
            ) : null}
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
                        overflow: 'auto',
                        paddingBottom: 300,
                    }}
                >
                    {editors}
                </Card.Body>
            </Card>
        </div>
    );
};
