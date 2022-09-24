import React, { useEffect, useLayoutEffect, useRef } from 'react';

export const ContentEditable = ({
    value,
    onChange,
    onKeyDown,
    onBlur,
    style,
}: {
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
            ref={ref}
            style={{
                outline: 'none',
                ...style,
            }}
            onInput={(evt) => onChange(evt.currentTarget.textContent!)}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            contentEditable
        />
    );
};
