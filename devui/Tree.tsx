import { Tooltip } from '@nextui-org/react';
import * as React from 'react';
import { Tree as TreeT } from './markUpTree';
import { styles, colors } from './Highlight';

export const Tree = ({
    tree,
    hover,
}: {
    tree: TreeT;
    hover: null | [number, number];
}) => {
    return (
        <span
            className={tree.hl.type}
            // data-prefix={tree.hl.prefix ? tree.hl.prefix.text : undefined}
            // data-suffix={tree.hl.suffix ? tree.hl.suffix.text : undefined}
            style={{
                ...styles[tree.hl.type],
                color: colors[tree.hl.type] ?? '#aaa',
            }}
        >
            {tree.hl.prefix && (
                <span title={tree.hl.prefix.message}>
                    {tree.hl.prefix.text}
                </span>
            )}
            {tree.children.map((child, i) =>
                child.type === 'leaf' ? (
                    <span
                        data-span={`${child.span[0]}:${child.span[1]}`}
                        style={
                            hover &&
                            hover[0] === child.span[0] &&
                            hover[1] === child.span[1]
                                ? {
                                      // outline: '3px dotted rgba(255,255,0,0.1)'
                                      textDecoration: 'underline',
                                  }
                                : {}
                        }
                        key={i}
                    >
                        {child.text}
                    </span>
                ) : (
                    <Tree tree={child} key={i} hover={hover} />
                ),
            )}
            {tree.hl.suffix && tree.hl.suffix.message ? (
                <Tooltip content={tree.hl.suffix.message}>
                    <span style={{ whiteSpace: 'pre-wrap' }}>
                        {tree.hl.suffix.text}
                    </span>
                </Tooltip>
            ) : null}
        </span>
    );
};
