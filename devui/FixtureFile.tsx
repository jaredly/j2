import { Container, Divider, Link } from '@nextui-org/react';
import * as React from 'react';
import { FullContext } from '../core/ctx';
import {
    Fixture,
    parseFixtureFile,
    serializeFixture,
} from '../core/typing/__test__/fixture-utils';
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
        () => data?.map(serializeFixture).join('\n'),
        [data],
    );
    React.useEffect(() => {
        if (!serialized || serialized === last.current) {
            return;
        }
        last.current = serialized;
        fetch(`/element/${name}`, { method: 'POST', body: serialized });
    }, [serialized]);
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
                {data.map((fixture: Fixture, i) => (
                    <Link href={`#${name}/${i}`} key={i} block>
                        {fixture.title}
                    </Link>
                ))}
            </div>

            <Container css={{ p: '$6', pb: '50vh', overflow: 'auto' }}>
                {data.map((fixture: Fixture, i) => (
                    <OneFixture
                        id={`${name}/${i}`}
                        fixture={fixture}
                        key={i}
                        onChange={(fixture) => {
                            setData(
                                data.map((f, j) => (j === i ? fixture : f)),
                            );
                        }}
                    />
                ))}
            </Container>
        </div>
    );
};
