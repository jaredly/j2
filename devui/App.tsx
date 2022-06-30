import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { NextUIProvider, createTheme, Link, Divider } from '@nextui-org/react';
import { FixtureFile } from './FixtureFile';
import {
    Builtin,
    Fixture,
    FixtureFile as FixtureFileType,
    FixtureResult,
    loadBuiltins,
    parseFixtureFile,
    runFixture,
} from '../core/typing/__test__/fixture-utils';
import { builtinContext } from '../core/ctx';

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
    results: Array<{
        result: FixtureResult;
        input: string;
        builtins: Builtin[];
    }>;
};

export const FixStatus = ({ status, idx }: { status: Status; idx: number }) => {
    let failed =
        status.file.fixtures[idx].output_expected !==
        status.results[idx].result.newOutput;
    return <span style={{ marginRight: 8 }}>{failed ? '🚨' : '✅'}</span>;
};

export const ShowStatus = ({ status }: { status: Status }) => {
    let failures = 0;
    status.file.fixtures.forEach((fixture, i) => {
        if (fixture.output_expected !== status.results[i].result.newOutput) {
            failures++;
        }
    });
    return <span style={{ marginRight: 8 }}>{failures ? '🚨' : '✅'}</span>;
};

export const App = () => {
    const hash = useHash();
    const [listing] = usePromise<string[]>(
        () => fetch('/element/').then((res) => res.json()),
        [],
    );

    const [files, setFiles] = React.useState({} as { [key: string]: Status });

    // Ok, so when we update a fixture, we might update things off built
    React.useEffect(() => {
        if (!listing) {
            return;
        }
        Promise.all(
            listing.map((line) =>
                fetch(`/element/${line}`).then((v) => v.text()),
            ),
        ).then((fixtures) => {
            const files = {} as { [key: string]: Status };
            fixtures.forEach((fixture, i) => {
                const file = parseFixtureFile(fixture);
                const ctx = builtinContext.clone();
                loadBuiltins(file.builtins, ctx);
                files[listing[i]] = {
                    name: listing[i],
                    file,
                    results: file.fixtures.map((f) => ({
                        result: runFixture(f, ctx),
                        builtins: file.builtins,
                        input: f.input,
                    })),
                };
            });
            setFiles(files);
        });
    }, [listing]);

    if (!listing) {
        return <>Loading...</>;
    }

    const hashName = hash.split('/')[0];

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
                    width: 200,
                    padding: 16,
                }}
            >
                {Object.keys(files)
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
                            <ShowStatus status={files[fixture]} />
                            {fixture}
                        </Link>
                    ))}
                <Divider css={{ marginBottom: 24, marginTop: 24 }} />
                {files[hashName]
                    ? files[hashName].file.fixtures.map(
                          (fixture: Fixture, i) => (
                              <div
                                  key={i}
                                  style={{
                                      display: 'flex',
                                      flexDirection: 'row',
                                  }}
                              >
                                  <Link href={`#${hashName}/${i}`}>
                                      <FixStatus
                                          status={files[hashName]}
                                          idx={i}
                                      />
                                      {fixture.title}
                                  </Link>
                                  <div style={{ flex: 1 }} />
                                  <Link href={`#${hashName}/${i}/pin`}>
                                      Pin
                                  </Link>
                              </div>
                          ),
                      )
                    : null}
            </div>

            {hash && files[hashName] ? (
                <FixtureFile
                    data={files[hashName].file}
                    setData={(data) => {
                        const newFiles = { ...files };
                        newFiles[hashName] = {
                            ...newFiles[hashName],
                            file: data,
                        };
                        setFiles(newFiles);
                    }}
                    files={files}
                    name={hashName}
                    pin={hash.endsWith('/pin') ? +hash.split('/')[1] : null}
                />
            ) : (
                <div style={{ flex: 1 }}>Select a fixture</div>
            )}
        </div>
    );
};
