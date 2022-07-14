import {
    Button,
    Card,
    Container,
    Divider,
    Link,
    Spacer,
    Text,
    Textarea,
} from '@nextui-org/react';
import * as React from 'react';
import { builtinContext, FullContext } from '../core/ctx';
import {
    Fixture,
    parseFixtureFile,
    serializeFixtureFile,
    serializeBuiltin,
    parseBuiltin,
    loadBuiltins,
    FixtureFile as FixtureFileType,
    Builtin,
} from '../core/typing/__test__/fixture-utils';
import { colors } from './Highlight';
import { Status, usePromise } from './App';
import { OneFixture } from './OneFixture';

export const FixtureFile = ({
    name,
    files,
    setData,
    pin,
    data,
}: {
    data: FixtureFileType;
    name: string;
    files: { [key: string]: Status };
    setData: (data: FixtureFileType) => void;
    pin: number | null;
}) => {
    let last = React.useRef(null as null | string);

    // const [data, setData] = usePromise(
    //     () =>
    //         fetch(`/elements/${name}`)
    //             .then((res) => res.text())
    //             .then((raw) => {
    //                 last.current = raw;
    //                 return parseFixtureFile(raw);
    //             }),
    //     [name],
    // );
    const serialized = React.useMemo(
        () => (data ? serializeFixtureFile(data) : null),
        [data],
    );
    React.useEffect(() => {
        if (!serialized || serialized === last.current) {
            return;
        }
        if (last.current) {
            fetch(`/elements/fixtures/${name}`, {
                method: 'POST',
                body: serialized,
            });
        }
        last.current = serialized;
    }, [serialized]);

    const portal = React.useRef(null as null | HTMLDivElement);

    // const data = files[name].file;
    // const setData = (file: FixtureFileType) => {};

    const ctx = React.useMemo(() => {
        let ctx = builtinContext.clone();
        if (data) {
            loadBuiltins(data.builtins, ctx);
        }
        return ctx;
    }, [data?.builtins]);

    React.useEffect(() => {
        portal.current = document.createElement('div');
        document.body.append(portal.current);
        return () => portal.current!.remove();
    }, []);

    if (!data) {
        return null;
    }
    return (
        <Container
            css={{
                maxWidth: 'none',
                overflow: 'auto',
                paddingLeft: '$12',
                paddingRight: '$12',
                margin: 0,
                flex: 1,
            }}
        >
            <Container
                css={{
                    p: '$6',
                    pb: '50vh',
                    // margin: '$12',
                }}
            >
                <ShowBuiltins
                    setBuiltins={(builtins) =>
                        setData({
                            ...data,
                            builtins,
                        })
                    }
                    builtins={data.builtins}
                />

                <Card.Divider css={{ marginBlock: '$6' }} />

                {data.fixtures.map((fixture: Fixture, i) =>
                    pin == null || i == pin ? (
                        <OneFixture
                            isPinned={i == pin}
                            key={i}
                            ctx={ctx}
                            builtins={data.builtins}
                            portal={portal.current!}
                            id={`${name}/${i}`}
                            fixture={fixture}
                            onChange={(fixture) => {
                                // console.log('chagne', fixture, i);
                                const fixtures = data.fixtures.slice();
                                fixtures[i] = fixture;
                                setData({ ...data, fixtures });
                            }}
                        />
                    ) : null,
                )}
                <Spacer />
                <Button
                    onPress={() => {
                        setData({
                            ...data,
                            fixtures: data.fixtures.concat([
                                {
                                    title: 'New fixture',
                                    input: '// hello',
                                    output_expected: '// hello',
                                    output_failed: '',
                                    shouldFail: false,
                                    builtins: [],
                                },
                            ]),
                        });
                        location.hash = `#${name}/${data.fixtures.length}`;
                    }}
                >
                    Add fixture
                </Button>
            </Container>
        </Container>
    );
};

export const ShowBuiltins = ({
    setBuiltins,
    builtins,
}: {
    builtins: Builtin[];
    setBuiltins: (builtins: Builtin[]) => void;
}) => {
    const [editBuiltins, setEditBuiltins] = React.useState(
        null as null | string,
    );

    return editBuiltins != null ? (
        <div>
            <Textarea
                autoFocus
                fullWidth
                minRows={5}
                label="Builtins"
                value={editBuiltins}
                onChange={(evt) => setEditBuiltins(evt.target.value)}
                onKeyDown={(evt) => {
                    if (evt.key === 'Escape') {
                        setEditBuiltins(null);
                        evt.preventDefault();
                        setBuiltins(
                            editBuiltins
                                .split('\n')
                                .filter(Boolean)
                                .map(parseBuiltin),
                        );
                    } else if (evt.key === 'Enter' && evt.metaKey) {
                        setEditBuiltins(null);
                        evt.preventDefault();
                        setBuiltins(
                            editBuiltins
                                .split('\n')
                                .filter(Boolean)
                                .map(parseBuiltin),
                        );
                    }
                }}
                onBlur={() => {
                    setBuiltins(
                        editBuiltins
                            .split('\n')
                            .filter(Boolean)
                            .map(parseBuiltin),
                    );
                    setEditBuiltins(null);
                }}
            />
        </div>
    ) : (
        <div
            onClick={() =>
                setEditBuiltins(builtins.map(serializeBuiltin).join('\n'))
            }
        >
            <Text css={{ fontFamily: '$mono' }} small>
                Builtins:
                {!builtins.length ? ' no builtins' : ''}
                {builtins.map((item, i) => (
                    <span
                        key={i}
                        style={{
                            marginLeft: 8,
                            color:
                                item.kind === 'decorator'
                                    ? colors.DecoratorId
                                    : item.kind === 'type'
                                    ? colors.TRef
                                    : colors.Identifier,
                        }}
                    >
                        {item.name}
                    </span>
                ))}
            </Text>
        </div>
    );
};
