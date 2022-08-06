import { noloc } from '../../core/consts';
import { FullContext } from '../../core/ctx';
import { processTypeFile } from '../../core/full/full';
import { extract, Id, toId } from '../../core/ids';
import { collapseConstraints } from '../../core/typing/analyze';
import { applyType } from '../../core/typing/getType';
import { maybeExpandTask } from '../../core/typing/tasks';
import { ConstraintMap, typeMatches } from '../../core/typing/typeMatches';
import * as t from '../../core/typed-ast';
import React from 'react';
import { typeToString } from '../Highlight';

const loadTypes = (text: string, ctx: FullContext) => {
    const named: { [key: string]: Id } = {};

    const result = processTypeFile(text, ctx);
    if (result.type === 'Error') {
        throw new Error(`Failed to load`);
    }
    result.info.forEach((info) => {
        if (info.contents.top.type === 'TypeAlias') {
            const hash = info.contents.top.hash!;
            info.contents.top.elements.forEach((el, i) => {
                named[el.name] = toId(hash, i);
            });
        }
    });

    return { ctx: result.ctx, named };
};

const allTypes = `
type attrs_ = <Effects: task>{
    style: {
        display: string = "",
        flex: uint = 1u,
        padding: string = "",
        margin: string = "",
        backgroundColor: string = "",
    } = (),
    onClick: () => Task<Effects, ()> = () => \`Return(),
}
type Node_ = <Effects: task>[\`Node(string, attrs_<Effects>, Array<Node_<Effects>>) | \`Text(string)]
type Render = <State>Task<[\`Render(((state: State) => Node_<[\`SetState(State, ()) | \`Confirm((), bool)]>, State), [])], ()>
`;

type Render<State> =
    | {
          tag: 'Return';
          payload: null;
      }
    | {
          tag: 'Render';
          payload: [[(v: State) => TUI<State>, State], null];
      };

type Task<State, T> =
    | {
          tag: 'Return';
          payload: T;
      }
    | {
          tag: 'SetState';
          payload: [State, (arg: any) => Task<State, T>];
      };

type Attrs<State> = {
    style: { display: string; flex: number; padding: string };
    onClick: () => Task<State, null>;
};
type TUI<State> =
    | {
          tag: 'Node';
          payload: [string, Attrs<State>, Array<TUI<State>>];
      }
    | {
          tag: 'Text';
          payload: string;
      };

const handleTask = <State,>(
    task: Task<State, null>,
    state: State,
    setState: (v: State) => void,
) => {
    switch (task.tag) {
        case 'Return':
            return;
        case 'SetState':
            console.log(task.payload[0]);
            setState(task.payload[0]);
            task.payload[1](null);
    }
};

export const View = <State,>({
    state,
    node,
    setState,
}: {
    state: State;
    node: TUI<State>;
    setState: (v: State) => void;
}) => {
    if (node.tag === 'Text') {
        return <span>{node.payload}</span>;
    }
    const [tag, attrs, children] = node.payload;
    return React.createElement(
        tag,
        {
            onClick: attrs.onClick
                ? () => {
                      console.log('clickcc', attrs.onClick());
                      handleTask(attrs.onClick(), state, setState);
                  }
                : undefined,
            style: attrs.style,
        },
        children.map((item, i) => (
            <View key={i} state={state} node={item} setState={setState} />
        )),
    );
    // return (
    //     <div
    //         onClick={
    //         }
    //     >
    //         {}
    //     </div>
    // );
};

export const UI = <State,>({
    render,
    initial,
}: {
    render: (v: State) => TUI<State>;
    initial: State;
}) => {
    const [state, setState] = React.useState(initial);
    if (!render) {
        return <span>No render??</span>;
    }
    return <View state={state} node={render(state)} setState={setState} />;
};

// export const

// type Render = <State>

export const vdomWidget = (type: t.Type, value: any, baseCtx: FullContext) => {
    const types = loadTypes(allTypes, baseCtx);
    const ctx = types.ctx;

    const constraints: ConstraintMap = {};
    const tv = ctx.newTypeVar(noloc);

    if (!types.named.Render) {
        return console.error('no Render');
    }
    const { hash } = extract(types.named.Render);
    if (!ctx.extract().types.hashed[hash]) {
        return console.error('no Render in ctx');
    }

    const Render = ctx.resolveAnalyzeType({
        type: 'TRef',
        ref: { type: 'Global', id: types.named.Render },
        loc: noloc,
    });
    if (!Render) {
        console.error('not resolved');
        return;
    }
    const applied = applyType([tv], Render as t.TVars, ctx);
    if (!applied) {
        return;
    }

    const tt = maybeExpandTask(applied, ctx) ?? applied;
    console.log('vdomwidget');

    // Need to be able to typeMatches on two recursive types
    const ok = true;
    if (ok) {
        debugger;
        if (!typeMatches(type, tt, ctx, undefined, constraints)) {
            console.log('didnt match either');
            console.log(typeToString(type, ctx));
            console.log(typeToString(tt, ctx));
            return;
        }
        const t = collapseConstraints(constraints[tv.id] || {}, ctx);
        const render = value as Render<any>;
        if (render.tag === 'Return') {
            return null;
        }
        console.log('YES', t, render);
        return (
            <UI render={render.payload[0][0]} initial={render.payload[0][1]} />
        );
    }
};
