import {
    Card,
    Container,
    Divider,
    Link,
    Text,
    Textarea,
} from '@nextui-org/react';
import * as React from 'react';
import { FullContext } from '../core/ctx';
import {
    Fixture,
    parseFixtureFile,
    serializeFixtureOld,
    serializeFixtureFile,
    serializeBuiltin,
    parseBuiltin,
} from '../core/typing/__test__/fixture-utils';
import { colors } from './Highlight';
import { usePromise } from './index';
import { OneFixture } from './OneFixture';

export const FixtureFile = ({
    name,
    listing,
}: {
    name: string;
    listing: string[];
}) => {
    let last = React.useRef(null as null | string);
    const [data, setData] = usePromise(
        () =>
            fetch(`/element/${name}`)
                .then((res) => res.text())
                .then((raw) => {
                    last.current = raw;
                    return parseFixtureFile(raw);
                }),
        [name],
    );
    const serialized = React.useMemo(
        () => (data ? serializeFixtureFile(data) : null),
        [data],
    );
    React.useEffect(() => {
        if (!serialized || serialized === last.current) {
            return;
        }
        last.current = serialized;
        fetch(`/element/${name}`, { method: 'POST', body: serialized });
    }, [serialized]);

    const portal = React.useRef(null as null | HTMLDivElement);

    const [editBuiltins, setEditBuiltins] = React.useState(
        null as null | string,
    );

    React.useEffect(() => {
        portal.current = document.createElement('div');
        document.body.append(portal.current);
        return () => portal.current!.remove();
    }, []);

    if (!data) {
        return null;
    }
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
                {listing.map((fixture) => (
                    <Link
                        key={fixture}
                        href={`#${fixture}`}
                        block
                        color={fixture === name ? 'primary' : 'secondary'}
                    >
                        {fixture}
                    </Link>
                ))}
                <Divider css={{ marginBottom: 24, marginTop: 24 }} />
                {data.fixtures.map((fixture: Fixture, i) => (
                    <Link href={`#${name}/${i}`} key={i} block>
                        {fixture.title}
                    </Link>
                ))}
            </div>

            <Container css={{ p: '$6', pb: '50vh', overflow: 'auto' }}>
                <>
                    {editBuiltins != null ? (
                        <div>
                            <Textarea
                                autoFocus
                                fullWidth
                                minRows={5}
                                value={editBuiltins}
                                onChange={(evt) =>
                                    setEditBuiltins(evt.target.value)
                                }
                                onKeyDown={(evt) => {
                                    if (evt.key === 'Escape') {
                                        setEditBuiltins(null);
                                    } else if (
                                        evt.key === 'Enter' &&
                                        evt.metaKey
                                    ) {
                                        evt.preventDefault();
                                        setData({
                                            ...data,
                                            builtins: editBuiltins
                                                .split('\n')
                                                .map(parseBuiltin),
                                        });
                                    }
                                }}
                                onBlur={() => {
                                    setData({
                                        ...data,
                                        builtins: editBuiltins
                                            .split('\n')
                                            .map(parseBuiltin),
                                    });
                                    setEditBuiltins(null);
                                }}
                            />
                        </div>
                    ) : (
                        <div
                            onClick={() =>
                                setEditBuiltins(
                                    data.builtins
                                        .map(serializeBuiltin)
                                        .join('\n'),
                                )
                            }
                        >
                            <Text css={{ fontFamily: '$mono' }} small>
                                Builtins:
                                {data.builtins.map((item, i) => (
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
                    )}
                    <Card.Divider css={{ marginBlock: '$6' }} />
                </>

                {data.fixtures.map((fixture: Fixture, i) => (
                    <OneFixture
                        builtins={data.builtins}
                        portal={portal.current!}
                        id={`${name}/${i}`}
                        fixture={fixture}
                        key={i}
                        onChange={(fixture) => {
                            setData({
                                ...data,
                                fixtures: data.fixtures.map((f, j) =>
                                    j === i ? fixture : f,
                                ),
                            });
                        }}
                    />
                ))}
            </Container>
        </div>
    );
};
