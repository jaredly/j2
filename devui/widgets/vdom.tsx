import { noloc } from '../../core/consts';
import { builtinContext, FullContext, GlobalUserType } from '../../core/ctx';
import { parseTypeFile } from '../../core/grammar/base.parser';
import { Id, toId } from '../../core/ids';
import * as t from '../../core/typed-ast';
import { collapseConstraints } from '../../core/typing/analyze';
import { applyType } from '../../core/typing/getType';
import { ConstraintMap, typeMatches } from '../../core/typing/typeMatches';

const loadTypes = (text: string) => {
    const named: { [key: string]: Id } = {};
    let ctx = builtinContext.clone();

    parseTypeFile(text).toplevels.forEach((ast) => {
        if (ast.type === 'TypeAlias') {
            const top = ctx.ToTast.TypeAlias(ast, ctx);
            const res = ctx.withTypes(top.elements);
            ctx = res.ctx as FullContext;
            top.elements.forEach((el, idx) => {
                named[el.name] = toId(res.hash, idx);
            });
        }
    });
    return { ctx, named };
};

const { ctx, named } = loadTypes(`
type attrs = <Effects: task>{
    style: {display: string = "", flex: uint = 1u, padding: string = ""} = (),
    onClick: () => Task<Effects, ()> = () => \`Return(),
}
type Node = <Effects: task>[\`Node(string, attrs<Effects>, Array<Node<Effects>>) | \`Text(string)]
type Render = <State>Task<[\`Render((state: State) => Node<[\`SetState(State, ())]>, [])], ()>
`);

const type = ctx.typeForId(named.Render) as GlobalUserType;

export const vdomWidget = (type: t.Type, value: any) => {
    const constraints: ConstraintMap = {};
    debugger;
    const tv = ctx.newTypeVar(noloc);
    const Render = ctx.resolveAnalyzeType({
        type: 'TRef',
        ref: { type: 'Global', id: named.Render },
        loc: noloc,
    });
    const applied = applyType([tv], Render as t.TVars, ctx);
    if (!applied) {
        return;
    }
    // const expected = ctx.resolveRefsAndApplies({
    //     type: 'TApply',
    //     target: Render,
    //     args: [tv],
    //     loc: noloc,
    // });
    // if (!expected) {
    //     console.log('No good resolution');
    //     return;
    // }
    if (!typeMatches(type, applied, ctx, [], constraints)) {
        console.log('didnt match either');
        return;
    }
    console.log(collapseConstraints(constraints[tv.id] || {}, ctx));
};

// Render :
