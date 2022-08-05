import { Input } from '@nextui-org/react';
import * as React from 'react';

export const BlurInput = ({
    text,
    onChange,
}: {
    text: string;
    onChange: (v: string) => void;
}) => {
    const [value, setValue] = React.useState(text);
    const lastText = React.useRef(text);
    React.useEffect(() => {
        if (text !== lastText.current) {
            lastText.current = text;
            setValue(text);
        }
    }, [text]);
    return (
        <Input
            aria-label={'text input'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            bordered
            fullWidth
            onKeyDown={(evt) => {
                if (evt.key === 'Enter') {
                    onChange(value);
                    evt.preventDefault();
                }
                if (evt.key === 'Escape') {
                    onChange(value);
                    evt.preventDefault();
                }
            }}
            onBlur={() => {
                onChange(value);
            }}
        />
    );
};
