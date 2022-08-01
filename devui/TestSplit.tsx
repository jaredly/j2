import { Button, Card, Input } from '@nextui-org/react';
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
import * as p from '../core/grammar/base.parser';
import { noloc } from '../core/consts';
import { newPPCtx } from '../core/printer/to-pp';
import { printToString } from '../core/printer/pp';
import { NameTrack } from '../core/ir/to-js';

/*

So what if ... we had a 'splitEditor'

ok so, file.info doesn't have any aliases in it ...

*/

export const fmtItem = (
    aliases: { [key: string]: string },
    item: p.Toplevel,
) => {
    const ast: p.File = {
        type: 'File',
        comments: [],
        toplevels: [],
        loc: noloc,
    };

    const keys = Object.keys(aliases);
    if (keys.length) {
        ast.toplevels.push({
            type: 'Aliases',
            items: keys.sort().map((k) => ({
                type: 'AliasItem',
                name: k,
                hash: `#[${aliases[k]}]`,
                loc: noloc,
            })),
            loc: noloc,
        });
    }
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
    return printToString(pp, 100).replace(/[ \t]+$/gm, '');
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
    file.info.forEach((info) => {
        statuses.push(...verifyHL(info.verify));
    });

    results.info.exprs;
    results.testResults.forEach((result) => {
        statuses.push({
            loc: result.loc,
            type: result.msg == null ? 'Success' : 'Error',
            prefix: {
                text: result.msg == null ? '✅' : '🚨',
                message: result.msg ?? undefined,
            },
        });
    });

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
    onChange: (v: TestWhat) => void;
    changeName: (v: string) => void;
}) => {
    // can I attribute comments to each of the infos?
    // also, how do I add / remove items?
    const [items, setItems] = React.useState(() => {
        if (test.file.type === 'Error') {
            return [];
        }
        return test.file.info;
    });

    const shared = React.useRef({
        track: { names: {}, used: {} },
        terms: {},
    } as { track: NameTrack; terms: { [key: string]: any } });

    React.useEffect(() => {
        const res = processFileR({
            type: 'File',
            comments: [],
            toplevels: items.map((item) => item.contents.refmt),
            loc: noloc,
        });
        const fmt = refmt(res);
        fetch(`/elements/test/${name}`, {
            method: 'POST',
            body: fmt,
        });
    }, [items]);

    // OK so ... what needs to share?
    // global ctx
    // also ... ectx?
    // oh and jctx for sure
    // but I can re-run all the ectx & jctx madness on each keystroke, that's probably fine.
    // as long as I'm not re-processing absolutely everything all the time.

    let ctx = builtinContext;
    const editors = items
        .map((item, i) => {
            const myctx = ctx;
            ctx = ctx.withToplevel(item.contents.top) as FullContext;
            const text = fmtItem(item.aliases, item.contents.refmt);
            return (
                <Editor
                    key={i}
                    text={text}
                    onBlur={(text) => {
                        const file = processFile(text, ctx);
                        if (file.type === 'Success') {
                            setItems(
                                items
                                    .slice(0, i)
                                    .concat(file.info)
                                    .concat(items.slice(i + 1)),
                            );
                        }
                    }}
                    onChange={(text) => {}}
                    extraLocs={(v) => {
                        if (v.type !== 'File') {
                            return [];
                        }
                        const file = processFileR(
                            v,
                            myctx,
                            undefined,
                            shared.current.track,
                        );
                        const results = getTestResults(
                            file,
                            shared.current.terms,
                        );
                        console.log(file, results);
                        // ok, so we have an AST
                        return testStatuses(file, results);
                    }}
                />
            );
        })
        .concat([
            <Editor
                key={'last' + items.length}
                text={'// add new item'}
                onBlur={(text) => {
                    const file = processFile(text, ctx);
                    if (file.type === 'Success') {
                        setItems(items.concat(file.info));
                    }
                }}
                onChange={(text) => {}}
                extraLocs={(v) => {
                    if (v.type !== 'File') {
                        return [];
                    }
                    const file = processFileR(v, ctx);
                    const results = getTestResults(file);
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
            <div>
                <BlurInput text={name} onChange={(name) => changeName(name)} />
            </div>
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
                    }}
                >
                    {editors}
                </Card.Body>
            </Card>
        </div>
    );
};

export const BlurInput = ({
    text,
    onChange,
}: {
    text: string;
    onChange: (v: string) => void;
}) => {
    const [value, setValue] = React.useState(text);
    const lastText = React.useRef(text);
    React.useEffect(() => {
        if (text !== lastText.current) {
            lastText.current = text;
            setValue(text);
        }
    }, [text]);
    return (
        <Input
            aria-label={'text input'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            bordered
            fullWidth
            onKeyDown={(evt) => {
                if (evt.key === 'Enter') {
                    onChange(value);
                    evt.preventDefault();
                }
                if (evt.key === 'Escape') {
                    onChange(value);
                    evt.preventDefault();
                }
            }}
            onBlur={() => {
                onChange(value);
            }}
        />
    );
};
