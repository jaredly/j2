import { Container } from '@nextui-org/react';
import * as React from 'react';
import { FullContext } from '../core/ctx';
import {
    Fixture,
    parseFixtureFile,
    serializeFixture,
} from '../core/typing/__test__/fixture-utils';
import { usePromise } from './index';
import { OneFixture } from './OneFixture';

export const FixtureFile = ({ name }: { name: string }) => {
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
        <Container css={{ p: '$6', mb: '50vh' }}>
            {data.map((fixture: Fixture, i) => (
                <OneFixture
                    fixture={fixture}
                    key={i}
                    onChange={(fixture) => {
                        setData(data.map((f, j) => (j === i ? fixture : f)));
                    }}
                />
            ))}
        </Container>
    );
};
