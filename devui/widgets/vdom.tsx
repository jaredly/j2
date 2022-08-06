import { noloc } from '../../core/consts';
import { builtinContext, FullContext, GlobalUserType } from '../../core/ctx';
import { processTypeFile } from '../../core/full/full';
import { parseTypeFile } from '../../core/grammar/base.parser';
import { extract, Id, toId } from '../../core/ids';
import * as t from '../../core/typed-ast';
import { collapseConstraints } from '../../core/typing/analyze';
import { applyType } from '../../core/typing/getType';
import { maybeExpandTask } from '../../core/typing/tasks';
import { ConstraintMap, typeMatches } from '../../core/typing/typeMatches';

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
type attrs = <Effects: task>{
    style: {display: string = "", flex: uint = 1u, padding: string = ""} = (),
    onClick: () => Task<Effects, ()> = () => \`Return(),
}
type Node = <Effects: task>[\`Node(string, attrs<Effects>, Array<Node<Effects>>) | \`Text(string)]
type Render = <State>Task<[\`Render((state: State) => Node<[\`SetState(State, ())]>, [])], ()>
`;

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
    // const failures: Failures = [];
    console.log('vdomwidget');
    debugger;
    // if (!typeMatches(type, tt, ctx, [], constraints, failures)) {

    // Need to be able to typeMatches on two recursive types
    const ok = false;
    if (ok) {
        if (!typeMatches(type, applied, ctx, [], constraints)) {
            console.log('didnt match either');
            return;
        }
        console.log('YES', collapseConstraints(constraints[tv.id] || {}, ctx));
    }
};
