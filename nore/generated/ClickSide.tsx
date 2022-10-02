import { Path } from './react-map';
import React from 'react';

export const ClickSide = ({
    path,
    children,
}: {
    path: Path[];
    children: JSX.Element | string;
}) => {
    return (
        <span
            style={{ color: '#aaf' }}
            className="hover"
            onMouseDown={(evt) => {
                const box = evt.currentTarget.getBoundingClientRect();
                const leftSide = evt.clientX < box.left + box.width / 2;
                console.log('ok what', leftSide, JSON.stringify(path));
            }}
        >
            {children}
        </span>
    );
};
