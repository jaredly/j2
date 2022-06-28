import * as React from 'react';
import { FullContext } from '../core/ctx';

export const isAncestor = (child: Node | null, parent: Node) => {
    while (child) {
        if (child === parent) {
            return true;
        }
        child = child.parentElement;
    }
    return false;
};

export const getText = (node: HTMLDivElement) => {
    let text: string[] = [];
    node.childNodes.forEach((node) => {
        text.push(node.textContent ?? '');
    });
    return text.join('\n');
};

export const Editor = ({
    // ctx,
    text,
    onBlur,
    onChange,
}: {
    // ctx: FullContext;
    text: string;
    onBlur: (text: string) => void;
    onChange: (v: string) => void;
}) => {
    const ref = React.useRef(null as null | HTMLDivElement);
    const [editing, setEditing] = React.useState(false);
    React.useEffect(() => {
        if (getText(ref.current!) !== text) {
            ref.current!.innerHTML = '';
            text.split('\n').map((line) => {
                const div = document.createElement('div');
                div.textContent = line || 'nbsp';
                ref.current!.append(div);
            });
        }
    }, [text]);
    React.useEffect(() => {
        if (!editing) {
            return;
        }
        const fn = () => {
            const sel = document.getSelection()!;
            console.log('selections');
            if (!isAncestor(sel?.anchorNode, ref.current!)) {
                setEditing(false);
                onBlur(getText(ref.current!));
                return;
            }
            onChange(getText(ref.current!));
        };
        const obs = new MutationObserver(fn);
        obs.observe(ref.current!, {
            subtree: true,
            childList: true,
            attributes: true,
            characterData: true,
        });
        // document.addEventListener('selectionchange', fn);
        // return () => document.removeEventListener('selectionchange', fn);
        return () => obs.disconnect();
    }, [editing]);
    return (
        <div
            contentEditable
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            style={{
                outline: editing ? '2px solid #f00' : 'none',
                whiteSpace: 'pre-wrap',
                minHeight: '1.5em',
                minWidth: 50,
            }}
            onBlur={() => {
                setEditing(false);
                onBlur(getText(ref.current!));
            }}
            onFocus={() => setEditing(true)}
            onKeyDown={(evt) => {
                if (evt.key === 'Escape') {
                    // setEditing(false);
                    // onBlur(getText(ref.current!));
                    ref.current!.blur();
                    // document.body.focus();
                    document.getSelection()?.removeAllRanges();
                }
            }}
            ref={(node) => (ref.current = node)}
        ></div>
    );
};
