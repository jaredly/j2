// A hand-crafted editor for just fn application and idents and numbers
import React, { useEffect, useRef } from 'react';
import {
    parseApplyable,
    parseExpression,
    parseIdentifier,
    parseNumber,
} from '../generated/parser';
import * as t from '../generated/types';

export const Editor = () => {
    const [ast, setAst] = React.useState(parseExpression('hello(1, 2u)'));

    return (
        <div style={{ margin: 48, fontSize: 48 }}>
            <Expression value={ast} onChange={setAst} />
            <div
                style={{
                    marginTop: 48,
                    fontSize: 10,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                }}
            >
                {JSON.stringify(ast, null, 2)}
            </div>
        </div>
    );
};

export type OnArg = (left: t.Expression, right: t.Expression) => void;

export const Expression = ({
    value,
    onChange,
    onArg,
    onRemove,
}: {
    value: t.Expression;
    onChange: (v: t.Expression) => void;
    onArg?: OnArg;
    onRemove?: () => void;
}) => {
    if (value.type === 'Apply') {
        return (
            <Apply
                value={value}
                onChange={onChange}
                onArg={onArg}
                onRemove={onRemove}
            />
        );
    }
    return (
        <Applyable
            value={value}
            onChange={onChange}
            onExpression={onChange}
            onArg={onArg}
            onRemove={onRemove}
        />
    );
};

export const Apply = ({
    value,
    onChange,
}: {
    value: t.Apply;
    onChange: (v: t.Apply) => void;
    onArg?: OnArg;
    onRemove?: () => void;
}) => {
    return (
        <span>
            <Applyable
                value={value.target}
                onChange={(target) => onChange({ ...value, target })}
            />
            {value.suffixes.map((arg, i) => (
                <Suffix
                    key={i}
                    value={arg}
                    onChange={(arg) =>
                        onChange({
                            ...value,
                            suffixes: value.suffixes.map((a, j) =>
                                i === j ? arg : a,
                            ),
                        })
                    }
                />
            ))}
        </span>
    );
};

export const Suffix = ({
    value,
    onChange,
}: {
    value: t.Suffix;
    onChange: (v: t.Suffix) => void;
}) => {
    if (value.type === 'CallSuffix') {
        return <CallSuffix value={value} onChange={onChange} />;
    }
    return <span>Unknown suffix type {value.type} </span>;
};

export const CallSuffix = ({
    value,
    onChange,
}: {
    value: t.CallSuffix;
    onChange: (v: t.CallSuffix) => void;
}) => {
    return (
        <span>
            (
            {value.args.map((arg, i) => (
                <React.Fragment key={i}>
                    <Expression
                        value={arg}
                        onChange={(arg) =>
                            onChange({
                                ...value,
                                args: value.args.map((a, j) =>
                                    i === j ? arg : a,
                                ),
                            })
                        }
                        onArg={(left, right) => {
                            onChange({
                                ...value,
                                args: value.args
                                    .slice(0, i)
                                    .concat([left, right])
                                    .concat(value.args.slice(i + 1)),
                            });
                        }}
                        onRemove={() => {
                            onChange({
                                ...value,
                                args: value.args
                                    .slice(0, i)
                                    .concat(value.args.slice(i + 1)),
                            });
                        }}
                    />
                    {i < value.args.length - 1 ? ', ' : null}
                </React.Fragment>
            ))}
            )
        </span>
    );
};

export const Applyable = ({
    value,
    onChange,
    onExpression,
    onArg,
    onRemove,
}: {
    value: t.Applyable;
    onChange: (v: t.Applyable) => void;
    onExpression?: (v: t.Expression) => void;
    onArg?: OnArg;
    onRemove?: () => void;
}) => {
    if (value.type === 'Identifier') {
        return (
            <Identifier
                value={value}
                onChange={onChange}
                onApplyable={onChange}
                onExpression={onExpression}
                onArg={onArg}
                onRemove={onRemove}
            />
        );
    }
    if (value.type === 'Number') {
        return (
            <Number
                value={value}
                onChange={onChange}
                onApplyable={onChange}
                onExpression={onExpression}
                onArg={onArg}
                onRemove={onRemove}
            />
        );
    }
    return <span>Unknown applyable type {value.type}</span>;
};

export const Identifier = ({
    value,
    onChange,
    onApplyable,
    onExpression,
    onRemove,
}: {
    value: t.Identifier;
    onChange: (v: t.Identifier) => void;
    onApplyable?: (v: t.Applyable) => void;
    onExpression?: (v: t.Expression) => void;
    onArg?: OnArg;
    onRemove?: () => void;
}) => {
    // return <span>{value.text}</span>;
    return (
        <Editable
            text={value.text}
            onChange={(text) => {
                console.log(text);
            }}
            onBlur={(text) => {
                if (!text && onRemove) {
                    return onRemove();
                }
                // console.log(text);
                try {
                    if (onExpression) {
                        onExpression(parseExpression(text));
                    } else if (onApplyable) {
                        onApplyable(parseApplyable(text));
                    } else {
                        onChange(parseIdentifier(text));
                    }
                } catch (err) {
                    // its fine
                }
            }}
        />
    );
};

export const Number = ({
    value,
    onChange,
    onApplyable,
    onExpression,
    onArg,
    onRemove,
}: {
    value: t.Number;
    onChange: (v: t.Number) => void;
    onApplyable?: (v: t.Applyable) => void;
    onExpression?: (v: t.Expression) => void;
    onArg?: OnArg;
    onRemove?: () => void;
}) => {
    return (
        <Editable
            text={value.num.raw + (value.kind.inferred ? '' : value.kind.value)}
            onChange={(text) => {
                console.log(text);
                if (onArg && text.endsWith(',')) {
                    try {
                        const left = parseExpression(text.slice(0, -1));
                        onArg(left, parseExpression('1'));
                    } catch (err) {}
                }
                if (onExpression && text.endsWith('(')) {
                    try {
                        const left = parseApplyable(text.slice(0, -1));
                        onExpression({
                            type: 'Apply',
                            target: left,
                            suffixes: [
                                {
                                    type: 'CallSuffix',
                                    args: [parseExpression('1')],
                                },
                            ],
                        });
                    } catch (err) {}
                }
            }}
            onBlur={(text) => {
                if (!text && onRemove) {
                    return onRemove();
                }
                if (onArg && text.endsWith(',')) {
                    try {
                        const left = parseExpression(text.slice(0, -1));
                        onArg(left, parseExpression('1'));
                    } catch (err) {}
                }
                // console.log(text);
                try {
                    if (onExpression) {
                        onExpression(parseExpression(text));
                    } else if (onApplyable) {
                        onApplyable(parseApplyable(text));
                    } else {
                        onChange(parseNumber(text));
                    }
                } catch (err) {
                    // its fine
                }
            }}
        />
    );
};

export const Editable = ({
    text,
    onChange,
    onBlur,
}: {
    text: string;
    onChange: (v: string) => void;
    onBlur: (v: string) => void;
}) => {
    const [focus, setFocus] = React.useState(false);
    const ref = useRef(null as null | HTMLSpanElement);

    useEffect(() => {
        if (!focus || !ref.current) {
            return;
        }
        const obs = new MutationObserver(() => {
            onChange(ref.current!.innerText);
        });
        obs.observe(ref.current, {
            subtree: true,
            childList: true,
            attributes: true,
            characterData: true,
        });
        return () => {
            obs.disconnect();
        };
    }, [focus]);

    useEffect(() => {
        ref.current!.innerText = text;
    }, [text]);

    return (
        <span
            className="hover"
            ref={(node) => (ref.current = node)}
            style={{ outline: 'none' }}
            contentEditable
            onFocus={() => setFocus(true)}
            onKeyDown={(evt) => {
                if (evt.key === 'Escape') {
                    ref.current!.blur();
                }
            }}
            onBlur={() => {
                setFocus(false);
                onBlur(ref.current!.innerText);
            }}
        />
    );
};
