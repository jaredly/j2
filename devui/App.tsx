import { Divider, Link, Text } from '@nextui-org/react';
import * as React from 'react';
import { builtinContext, FullContext } from '../core/ctx';
import { parseFile, parseTypeFile } from '../core/grammar/base.parser';
import { fixComments } from '../core/grammar/fixComments';
import {
    Builtin,
    Fixture,
    FixtureFile as FixtureFileType,
    FixtureResult,
    loadBuiltins,
    parseFixtureFile,
    runFixture,
} from '../core/typing/__test__/fixture-utils';
import { Test } from '../core/typing/__test__/run-test';
import { runTypeTest, TypeTest } from '../core/typing/__test__/typetest';
import { FixtureFile } from './FixtureFile';
import {
    CancelIcon,
    CheckmarkIcon,
    PushpinIcon,
    PushpinIconFilled,
    ReportProblemIcon,
} from './Icons';
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

export type Status = {
    name: string;
    file: FixtureFileType;
    ctx: FullContext;
    results: Array<{
        result: FixtureResult;
        input: string;
        builtins: Builtin[];
    }>;
};

// export const processTypeTest = (raw: string, ctx: FullContext) => {
//     const parsed = parseTypeFile(raw);
//     const tast = typeFileToTast(parsed, ctx);
// };

export type Files = {
    fixtures: { [key: string]: Status };
    typetest: { [key: string]: TypeTest };
    test: { [key: string]: Test };
};

export const FixStatus = ({ status, idx }: { status: Status; idx: number }) => {
    const result = status.results[idx].result;
    const fixture = status.file.fixtures[idx];
    const prev = fixture.output_expected
        ? fixture.output_expected
        : fixture.output_failed;
    return (
        <span style={{ marginRight: 8 }}>
            {prev !== result.newOutput ? (
                <ReportProblemIcon style={{ color: 'orange' }} />
            ) : fixture.output_failed ? (
                <CancelIcon style={{ color: 'red' }} />
            ) : (
                <CheckmarkIcon style={{ color: 'green' }} />
            )}
        </span>
    );
};

export const ShowTest = ({ statuses }: { statuses: TypeTest['statuses'] }) => {
    return (
        <span style={{ marginRight: 8 }}>
            {statuses.some((m) => m.text != null) ? (
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
        if (prev !== status.results[i].result.newOutput) {
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
    const ctx = builtinContext.clone();
    loadBuiltins(file.builtins, ctx);
    return {
        name,
        file,
        ctx,
        results: file.fixtures.map((f) => ({
            result: runFixture(f, ctx),
            builtins: file.builtins,
            input: f.input,
        })),
    };
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
                files[fixtures[i]] = fileStatus(fixtures[i], file);
            });
            const typetestFiles = {} as Files['typetest'];
            typetestContents.forEach((contents, i) => {
                try {
                    typetestFiles[typetest[i]] = runTypeTest(
                        fixComments(parseTypeFile(contents)),
                    );
                } catch (err) {
                    old.error('Failed to parse typetest', err);
                    // typetestFiles[typetest[i]] = runTypeTest(
                    //     fixComments(parseTypeFile(contents)),
                    // );
                }
            });
            const testFiles = {} as Files['test'];
            testContents.forEach((contents, i) => {
                try {
                    testFiles[test[i]] = runTest(parseFile(contents));
                } catch (err) {
                    old.error(`Failed to parse test`, err);
                }
            });
            setFiles({
                fixtures: files,
                typetest: typetestFiles,
                test: testFiles,
            });

            window.console = old;
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
                {Object.keys(files.fixtures)
                    .sort()
                    .map((fixture) => (
                        <Link
                            key={fixture}
                            href={`#${fixture}`}
                            block
                            color={
                                fixture === hashName ? 'primary' : 'secondary'
                            }
                        >
                            <ShowStatus status={files.fixtures[fixture]} />
                            {fixture}
                        </Link>
                    ))}
                <Divider css={{ marginBottom: 24, marginTop: 24 }} />
                <Text>Type Tests</Text>
                {Object.keys(files.typetest)
                    .sort()
                    .map((name) => (
                        <Link
                            key={name}
                            href={`#${name}`}
                            block
                            color={name === hashName ? 'primary' : 'secondary'}
                        >
                            <ShowTest
                                statuses={files.typetest[name].statuses}
                            />
                            {name}
                        </Link>
                    ))}
                <Divider css={{ marginBottom: 24, marginTop: 24 }} />
                {files.fixtures[hashName]
                    ? files.fixtures[hashName].file.fixtures.map(
                          (fixture: Fixture, i) => (
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
                        const newFixtures = { ...files.fixtures };
                        newFixtures[hashName] = fileStatus(hashName, data);
                        setFiles({ ...files, fixtures: newFixtures });
                    }}
                    files={files.fixtures}
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
            ) : (
                <div style={{ flex: 1 }}>Select a fixture</div>
            )}
        </div>
    );
};
