import { Card, Text } from '@nextui-org/react';
import * as React from 'react';
import { Fixture, parseFixture } from '../core/typing/__test__/fixture-utils';
import { usePromise } from './index';

export const FixtureFile = ({ name }: { name: string }) => {
    const data = usePromise(
        () =>
            fetch(`/element/${name}`)
                .then((res) => res.text())
                .then(parseFixture),
        [name],
    );
    if (!data) {
        return null;
    }
    return (
        <div>
            {data.map((fixture: Fixture) => {
                const { title, builtins, input, output, i } = fixture;

                return (
                    <Card variant={'bordered'} css={{ p: '$6', m: '$6' }}>
                        <Card.Header>
                            <Text b>{title}</Text>
                        </Card.Header>
                        <Card.Divider />
                        <Card.Body>
                            <Text
                                css={{
                                    whiteSpace: 'pre-wrap',
                                    fontFamily: '$mono',
                                }}
                            >
                                {input}
                            </Text>
                        </Card.Body>
                    </Card>
                );
            })}
        </div>
    );
};
