import React, { useLayoutEffect, useRef } from 'react';

export const ContentEditable = ({
    idx,
    value,
    onChange,
    onKeyDown,
    onBlur,
    style,
}: {
    idx: number;
    value: string;
    onChange: (value: string) => void;
    onKeyDown?: (e: React.KeyboardEvent) => void;
    onBlur?: (e: React.FocusEvent) => void;
    style?: React.CSSProperties;
}) => {
    const ref = useRef(null as null | HTMLSpanElement);
    useLayoutEffect(() => {
        if (!ref.current) {
            return;
        }
        if (ref.current.textContent !== value) {
            ref.current.textContent = value;
        }
    }, [value]);
    return (
        <span
            data-idx={idx}
            ref={ref}
            style={{
                outline: 'none',
                minHeight: '1.5em',
                minWidth: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                ...style,
            }}
            onInput={(evt) => onChange(evt.currentTarget.textContent!)}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            contentEditable
        />
    );
};
