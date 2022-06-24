import { Text } from '@nextui-org/react';
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
                    <div>
                        <Text h3>{title}</Text>
                        <Text>{input}</Text>
                    </div>
                );
            })}
        </div>
    );
};
