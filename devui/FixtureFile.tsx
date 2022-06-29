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
import { FullContext } from '../core/ctx';
import {
    Fixture,
    parseFixtureFile,
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
    pin,
}: {
    name: string;
    listing: string[];
    pin: number | null;
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
                    <div key={i}>
                        <Link href={`#${name}/${i}`} key={i}>
                            {fixture.title}
                        </Link>
                        <Link href={`#${name}/${i}/pin`} key={i}>
                            Pin
                        </Link>
                    </div>
                ))}
            </div>

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
                    {editBuiltins != null ? (
                        <div>
                            <Textarea
                                autoFocus
                                fullWidth
                                minRows={5}
                                label="Builtins"
                                value={editBuiltins}
                                onChange={(evt) =>
                                    setEditBuiltins(evt.target.value)
                                }
                                onKeyDown={(evt) => {
                                    if (evt.key === 'Escape') {
                                        setEditBuiltins(null);
                                        evt.preventDefault();
                                        setData({
                                            ...data,
                                            builtins: editBuiltins
                                                .split('\n')
                                                .map(parseBuiltin),
                                        });
                                    } else if (
                                        evt.key === 'Enter' &&
                                        evt.metaKey
                                    ) {
                                        setEditBuiltins(null);
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

                    {data.fixtures.map((fixture: Fixture, i) =>
                        pin == null || i == pin ? (
                            <OneFixture
                                key={i}
                                builtins={data.builtins}
                                portal={portal.current!}
                                id={`${name}/${i}`}
                                fixture={fixture}
                                onChange={(fixture) => {
                                    console.log('chagne', fixture, i);
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
                                        // nope
                                        failing_deprecated: false,
                                        aliases_deprecated: {},
                                        builtins_deprecated: [],
                                    },
                                ]),
                            });
                        }}
                    >
                        Add fixture
                    </Button>
                </Container>
            </Container>
        </div>
    );
};
