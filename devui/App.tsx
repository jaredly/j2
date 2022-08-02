import { Button, Divider, Link, Text } from '@nextui-org/react';
import * as React from 'react';
import { builtinContext } from '../core/ctx';
import {
    emptyFileResult,
    executeFile,
    ExecutionInfo,
    processFile,
    processTypeFile,
    SuccessTestResult,
    SuccessTypeResult,
    TestResult,
    TypeTestResult,
} from '../core/full/full';
import { idToString } from '../core/ids';
import { Loc } from '../core/typed-ast';
import { errorCount } from '../core/typing/analyze';
import {
    Builtin,
    loadBuiltins,
    parseFixtureFile,
} from '../core/typing/__test__/fixture-utils';
import { typeAssertById, typeTestCtx } from '../core/typing/__test__/utils';
import { FixtureFile } from './FixtureFile';
import {
    CancelIcon,
    CheckmarkIcon,
    PushpinIcon,
    PushpinIconFilled,
    ReportProblemIcon,
} from './Icons';
import { refmt } from './refmt';
import { TestView } from './Test';
import { TestSplit } from './TestSplit';
import { TypeTestView } from './TypeTest';

export const usePromise = <T,>(
    fn: () => Promise<T>,
    bust: any[],
): [T | null, (v: T) => void] => {
    const [data, setData] = React.useState<T | null>(null);
    React.useEffect(() => {
        fn().then(setData);
    }, bust);
    return [data, setData];
};

export const useHash = () => {
    const [hash, setHash] = React.useState(location.hash?.slice(1));
    React.useEffect(() => {
        if (location.hash !== (hash ? '#' + hash : '')) {
            location.hash = '#' + hash;
        }
        const fn = () => {
            setHash(location.hash.slice(1));
        };
        window.addEventListener('hashchange', fn);
        return () => window.removeEventListener('hashchange', fn);
    }, [hash]);
    return hash;
};

export type FixtureFileType = {
    builtins: Builtin[];
    fixtures: Array<FixtureWithResult>;
};

export type FixtureWithResult = {
    title: string;
    input: string;
    builtins: Builtin[];
    output_expected: string;
    output_failed: string;
    shouldFail: boolean;
    result: TestResult;
    newOutput: string;
};

export type Status = {
    name: string;
    file: FixtureFileType;
};

export type Files = {
    fixtures: { [key: string]: Status };
    typetest: { [key: string]: TypeWhat };
    test: { [key: string]: TestWhat };
};

export type TypeWhat = {
    file: TypeTestResult;
    values: Array<{ message: string | null; loc: Loc; idx: number }>;
};

export type TestWhat = {
    file: TestResult;
    values: null | TestValues;
};

export type TestValues = {
    info: ExecutionInfo;
    debugs: { [key: number]: boolean };
    testResults: Array<{
        // success: boolean;
        msg: string | null;
        loc: Loc;
    }>;
    failed: boolean;
};

export const typeResults = (
    file: SuccessTypeResult,
    debug?: boolean,
): Array<{ loc: Loc; idx: number; message: string | null }> => {
    const results: Array<{ loc: Loc; idx: number; message: string | null }> =
        [];
    const { info, ctx } = file;

    info.forEach((info, i) => {
        const type = info.contents.top;
        if (type.type === 'TDecorated') {
            const inner = type.inner;
            type.decorators.forEach((d) => {
                if (d.id.ref.type !== 'Global') {
                    return;
                }
                const hash = idToString(d.id.ref.id);
                if (typeAssertById[hash]) {
                    const err = typeAssertById[hash](
                        d.args.map((arg) => arg.arg),
                        inner,
                        ctx,
                    );
                    results.push({
                        // success: err == null,
                        message: err,
                        loc: d.loc,
                        idx: i,
                    });
                    if (err && debug) {
                        console.log(`Debugging failing assertion`);
                        debugger;
                        typeAssertById[hash](
                            d.args.map((arg) => arg.arg),
                            inner,
                            {
                                ...ctx,
                                debugger() {
                                    debugger;
                                },
                            },
                        );
                    }
                }
            });
        }
    });

    return results;
};

export const getTestResults = (
    file: SuccessTestResult,
    shared?: { [key: string]: any },
): TestValues => {
    const values: TestValues = {
        info: executeFile(file, shared),
        testResults: [],
        failed: false,
        debugs: {},
    };
    file.info.forEach((info, i) => {
        if (
            info.contents.top.type === 'ToplevelExpression' &&
            info.contents.irtops
        ) {
            const top = info.contents.irtops[0];
            if (top.type && file.ctx.isBuiltinType(top.type!, 'bool')) {
                values.testResults.push({
                    // success: values.info.exprs[i],
                    loc: info.contents.top.loc,
                    msg: values.info.exprs[i]
                        ? null
                        : values.info.errors[i]?.message ?? 'False',
                });
                if (!values.info.exprs[i]) {
                    values.debugs[i] = true;
                    values.failed = true;
                }
            }
        }
        if (errorCount(info.verify)) {
            values.debugs[i] = true;
            values.failed = true;
        }
    });
    return values;
};

export const FixStatus = ({ status, idx }: { status: Status; idx: number }) => {
    const fixture = status.file.fixtures[idx];
    const prev = fixture.output_expected
        ? fixture.output_expected
        : fixture.output_failed;
    return (
        <span style={{ marginRight: 8 }}>
            {prev !== fixture.newOutput ? (
                <ReportProblemIcon style={{ color: 'orange' }} />
            ) : fixture.output_failed ? (
                <CancelIcon style={{ color: 'red' }} />
            ) : (
                <CheckmarkIcon style={{ color: 'green' }} />
            )}
        </span>
    );
};

export const ShowTest = ({ failed }: { failed: boolean }) => {
    return (
        <span style={{ marginRight: 8 }}>
            {failed ? (
                <CancelIcon style={{ color: 'red' }} />
            ) : (
                <CheckmarkIcon style={{ color: 'green' }} />
            )}
        </span>
    );
};

export const ShowStatus = ({ status }: { status: Status }) => {
    let failures = 0;
    let changes = 0;
    status.file.fixtures.forEach((fixture, i) => {
        const prev = fixture.output_expected
            ? fixture.output_expected
            : fixture.output_failed;
        if (prev !== status.file.fixtures[i].newOutput) {
            changes++;
        } else if (fixture.output_failed) {
            failures++;
        }
    });
    return (
        <span style={{ marginRight: 8 }}>
            {changes ? (
                <ReportProblemIcon style={{ color: 'orange' }} />
            ) : failures ? (
                <CancelIcon style={{ color: 'red' }} />
            ) : (
                <CheckmarkIcon style={{ color: 'green' }} />
            )}
        </span>
    );
};

export const fileStatus = (name: string, file: FixtureFileType): Status => {
    return { name, file };
};

export const App = () => {
    const hash = useHash();

    const [listing] = usePromise<{
        fixtures: string[];
        typetest: string[];
        test: string[];
    }>(
        () =>
            Promise.all([
                fetch('/elements/fixtures/').then((res) => res.json()),
                fetch('/elements/typetest/').then((res) => res.json()),
                fetch('/elements/test/').then((res) => res.json()),
            ]).then(([fixtures, typetest, test]) => ({
                fixtures,
                typetest,
                test,
            })),
        [],
    );

    const [files, setFiles] = React.useState<Files>({
        fixtures: {},
        typetest: {},
        test: {},
    });

    // Ok, so when we update a fixture, we might update things off built
    React.useEffect(() => {
        if (!listing) {
            return;
        }
        const { fixtures, typetest, test } = listing;
        Promise.all([
            Promise.all(
                fixtures.map((line) =>
                    fetch(`/elements/fixtures/${line}`).then((v) => v.text()),
                ),
            ),
            Promise.all(
                typetest.map((line) =>
                    fetch(`/elements/typetest/${line}`).then((v) => v.text()),
                ),
            ),
            Promise.all(
                test.map((line) =>
                    fetch(`/elements/test/${line}`).then((v) => v.text()),
                ),
            ),
        ]).then(([fixtureContents, typetestContents, testContents]) => {
            const old = window.console;

            // Silence console during others
            // if (hash.endsWith('/pin')) {
            console.warn(`NOTE: suppressing logs from non-pinned items.`);
            window.console = {
                ...old,
                log: () => {},
                warn: () => {},
                error: () => {},
            };
            // }

            const files = {} as Files['fixtures'];
            fixtureContents.forEach((contents, i) => {
                const file = parseFixtureFile(contents);
                const ctx = builtinContext.clone();
                loadBuiltins(file.builtins, ctx);
                const news = file.fixtures.map((fixture) => {
                    const bctx = ctx.clone();
                    loadBuiltins(fixture.builtins, bctx);
                    const result = processFile(fixture.input, bctx);
                    return {
                        ...fixture,
                        result,
                        newOutput: refmt(result, true),
                    };
                });
                files[fixtures[i]] = fileStatus(fixtures[i], {
                    ...file,
                    fixtures: news,
                });
            });
            const typetestFiles = {} as Files['typetest'];
            typetestContents.forEach((contents, i) => {
                try {
                    const file = processTypeFile(contents, typeTestCtx);
                    typetestFiles[typetest[i]] = {
                        file,
                        values:
                            file.type === 'Success' ? typeResults(file) : [],
                    };
                } catch (err) {
                    old.error('Failed to parse typetest', err);
                }
            });
            window.console = old;
            const testFiles = {} as Files['test'];
            testContents.forEach((contents, i) => {
                const file = processFile(
                    contents,
                    undefined,
                    undefined,
                    undefined,
                    true,
                );
                // old.log('contents', i)
                testFiles[test[i]] = {
                    file,
                    values:
                        file.type === 'Success' ? getTestResults(file) : null,
                };
            });
            setFiles({
                fixtures: files,
                typetest: typetestFiles,
                test: testFiles,
            });
        });
    }, [listing]);

    if (!listing) {
        return <>Loading...</>;
    }

    const hashParts = hash.split('/');
    const hashName = hashParts[0];
    const hashPin =
        hashParts.length === 3 && hashParts[2] === 'pin' && hashParts[1];

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'stretch',
                height: '100vh',
                width: '100vw',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto',
                    width: 200,
                    padding: 16,
                }}
            >
                <Text>Fixtures</Text>
                <details
                    open={!!files.fixtures[hashName]}
                    style={{ backgroundColor: 'transparent' }}
                >
                    <Button
                        style={{ flexShrink: 0 }}
                        size="xs"
                        onClick={() => {
                            const newFixtures: Files['fixtures'] = {
                                ...files.fixtures,
                            };
                            let num = 0;
                            while (true) {
                                const name = `test${num}.jd`;
                                if (newFixtures[name] == null) {
                                    newFixtures[name] = {
                                        name,
                                        file: { builtins: [], fixtures: [] },
                                    };
                                    break;
                                }
                                num++;
                            }
                            setFiles({ ...files, fixtures: newFixtures });
                        }}
                    >
                        New Fixture
                    </Button>
                    {Object.keys(files.fixtures)
                        .sort()
                        .map((fixture) => (
                            <Link
                                key={fixture}
                                href={`#${fixture}`}
                                block
                                color={
                                    fixture === hashName
                                        ? 'primary'
                                        : 'secondary'
                                }
                            >
                                <ShowStatus status={files.fixtures[fixture]} />
                                {fixture}
                            </Link>
                        ))}
                </details>
                <Divider css={{ marginBottom: 24, marginTop: 24 }} />
                <Text>Tests</Text>
                <details
                    open={!!files.test[hashName?.slice('test:'.length) ?? '']}
                    style={{ backgroundColor: 'transparent' }}
                >
                    <Button
                        style={{ flexShrink: 0 }}
                        size="xs"
                        onClick={() => {
                            const newFiles = { ...files.test };
                            let num = 0;
                            while (true) {
                                const name = `test${num}.jd`;
                                if (newFiles[name] == null) {
                                    newFiles[name] = {
                                        file: emptyFileResult,
                                        values: {
                                            info: {
                                                terms: {},
                                                exprs: {},
                                                errors: {},
                                            },
                                            testResults: [],
                                            failed: false,
                                            debugs: {},
                                        },
                                    };
                                    break;
                                }
                                num++;
                            }
                            setFiles({ ...files, test: newFiles });
                        }}
                    >
                        New Test
                    </Button>
                    {Object.keys(files.test)
                        .sort()
                        .map((name) => (
                            <Link
                                key={name}
                                href={`#test:${name}`}
                                block
                                color={
                                    name === hashName?.slice('text:'.length)
                                        ? 'primary'
                                        : 'secondary'
                                }
                            >
                                <ShowTest
                                    failed={
                                        files.test[name].values?.failed ?? true
                                    }
                                />
                                {name}
                            </Link>
                        ))}
                </details>
                <Divider css={{ marginBottom: 24, marginTop: 24 }} />
                <Text>Type Tests</Text>
                <details
                    open={!!files.typetest[hashName]}
                    style={{ backgroundColor: 'transparent' }}
                >
                    {Object.keys(files.typetest)
                        .sort()
                        .map((name) => (
                            <Link
                                key={name}
                                href={`#${name}`}
                                block
                                color={
                                    name === hashName ? 'primary' : 'secondary'
                                }
                            >
                                <ShowTest
                                    failed={isFailedTypeTest(
                                        files.typetest[name],
                                    )}
                                />
                                {name}
                            </Link>
                        ))}
                </details>
                <Divider css={{ marginBottom: 24, marginTop: 24 }} />
                {files.fixtures[hashName]
                    ? files.fixtures[hashName].file.fixtures.map(
                          (fixture: FixtureWithResult, i) => (
                              <div
                                  key={i}
                                  style={{
                                      display: 'flex',
                                      flexDirection: 'row',
                                      marginBottom: 8,
                                  }}
                              >
                                  <Link href={`#${hashName}/${i}`}>
                                      <FixStatus
                                          status={files.fixtures[hashName]}
                                          idx={i}
                                      />
                                      {fixture.title}
                                  </Link>
                                  <div style={{ flex: 1 }} />
                                  <Link
                                      href={
                                          '' + i === hashPin
                                              ? `#${hashName}/${i}`
                                              : `#${hashName}/${i}/pin`
                                      }
                                  >
                                      {'' + i === hashPin ? (
                                          <PushpinIconFilled color="green" />
                                      ) : (
                                          <PushpinIcon />
                                      )}
                                  </Link>
                              </div>
                          ),
                      )
                    : null}
            </div>

            {hash && files.fixtures[hashName] ? (
                <FixtureFile
                    data={files.fixtures[hashName].file}
                    setData={(data) => {
                        // STOPSHIP
                        const newFixtures = { ...files.fixtures };
                        newFixtures[hashName] = fileStatus(hashName, data);
                        setFiles({ ...files, fixtures: newFixtures });
                    }}
                    name={hashName}
                    pin={hash.endsWith('/pin') ? +hash.split('/')[1] : null}
                />
            ) : files.typetest[hashName] ? (
                <TypeTestView
                    name={hashName}
                    key={hashName}
                    test={files.typetest[hashName]}
                    onChange={(data) => {
                        const newTypes = { ...files.typetest };
                        newTypes[hashName] = data;
                        setFiles({ ...files, typetest: newTypes });
                    }}
                />
            ) : hashName?.startsWith('test:') &&
              files.test[hashName.slice('test:'.length)] ? (
                <TestSplit
                    // TestView
                    name={hashName.slice('test:'.length)}
                    key={hashName}
                    test={files.test[hashName.slice('test:'.length)]}
                    changeName={(name) => {
                        const old = hashName.slice('test:'.length);
                        fetch(
                            `/rename/elements/test/${old}:elements/test/${name}`,
                        );
                        const newTest = { ...files.test };
                        newTest[name] = newTest[old];
                        delete newTest[old];
                        setFiles({ ...files, test: newTest });
                        location.hash = `#test:${name}`;
                    }}
                    onChange={(data) => {
                        const newTest = { ...files.test };
                        newTest[hashName.slice('test:'.length)] = data;
                        setFiles({ ...files, test: newTest });
                    }}
                />
            ) : (
                <div style={{ flex: 1 }}>Select a fixture</div>
            )}
        </div>
    );
};

const isFailedTypeTest = (t: TypeWhat) => {
    if (t.file.type === 'Error') {
        return true;
    }
    return (
        // t.file.info.some((top) => errorCount(top.verify) > 0) ||
        t.values.some((t) => t.message != null)
    );
};
