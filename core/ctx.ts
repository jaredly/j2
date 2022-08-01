import hashObject from 'object-hash';
import { Ctx } from '.';
import { noloc, tref } from './consts';
import { DecoratorDecl } from './elements/decorators';
import { typeForPattern } from './elements/pattern';
import { TVar } from './elements/type-vbls';
import { errors } from './errors';
import { Loc, parseType } from './grammar/base.parser';
import { extract, Id, toId } from './ids';
import { refsEqual } from './refsEqual';
import { resolveAnalyzeType } from './resolveAnalyzeType';
import { transformExpression, transformType, Visitor } from './transform-tast';
import { Expression, GlobalRef, RefKind, Sym, TVars, Type } from './typed-ast';
import { Ctx as ACtx } from './typing/analyze';
import { getType } from './typing/getType';
import { tnever, tunit } from './typing/tasks';
import { makeToTast, ToplevelConfig } from './typing/to-tast';
import { Ctx as TCtx } from './typing/typeMatches';
import { constrainTypes } from './typing/unifyTypes';

export const locClearVisitor: Visitor<null> = {
    // ToplevelLet(node, ctx) {
    //     return node.hash ? { ...node, hash: undefined } : null;
    // },
    Loc: () => noloc,
    // RefKind(node) {
    //     if (node.type === 'Global') {
    //         return { ...node, id: idToString(node.id) as any } as RefKind;
    //     }
    //     return null;
    // },
};

export type HashedNames<Contents, NameV> = {
    hashed: { [hash: string]: Array<Contents> };
    // builtins: { [key: string]: Type };
    names: { [key: string]: NameV };
};

export type GlobalValue =
    | { type: 'builtin'; typ: Type }
    | { type: 'user'; typ: Type; expr: Expression };

export type GlobalType =
    | {
          type: 'builtin';
          args: TVar[];
      }
    | { type: 'user'; typ: Type };

export const opaque = Symbol('opaque');

type Internal = {
    symid: number;
    aliases: { [readableName: string]: string };
    values: HashedNames<GlobalValue, Array<GlobalRef>>;
    types: HashedNames<GlobalType, GlobalRef>;
    decorators: HashedNames<
        | { type: 'builtin'; typ: 0 }
        | { type: 'user'; typ: 0; decl: DecoratorDecl },
        Array<GlobalRef>
    >;
    // Used in the first traversal & resolving
    // After that, we use syms
    constraints: {
        [key: number]: Type;
    };
    locals: {
        types: { sym: Sym; bound: Type | null }[];
        values: { sym: Sym; type: Type }[];
    }[];
    toplevel: null | ToplevelConfig;
};

export type FullContext = {
    clone: () => FullContext;
    extract: () => Internal;
    [opaque]: Internal;
} & Ctx &
    TCtx &
    ACtx;

export const addBuiltin = (
    ctx: FullContext,
    name: string,
    typ: Type,
    unique = 0,
): GlobalRef => {
    const hash = hashObject({ name, typ, unique });
    const ref: RefKind = { type: 'Global', id: toId(hash, 0) };
    if (ctx[opaque].values.names.hasOwnProperty(name)) {
        ctx[opaque].values.names[name].push(ref);
    } else {
        ctx[opaque].values.names[name] = [ref];
    }
    ctx[opaque].values.hashed[hash] = [{ type: 'builtin', typ }];
    return ref;
};

export const addBuiltinDecorator = (
    ctx: FullContext,
    name: string,
    typ: 0,
    unique = 0,
): GlobalRef => {
    const hash = hashObject({ name, typ, unique });
    const ref: GlobalRef = { type: 'Global', id: toId(hash, 0) };
    if (ctx[opaque].decorators.names.hasOwnProperty(name)) {
        ctx[opaque].decorators.names[name].push(ref);
    } else {
        ctx[opaque].decorators.names[name] = [ref];
    }
    ctx[opaque].decorators.hashed[hash] = [{ type: 'builtin', typ }];
    return ref;
};

export const addBuiltinType = (
    ctx: FullContext,
    name: string,
    args: TVar[],
    unique = 0,
): GlobalRef => {
    const hash = hashObject({ name, args, unique });
    const ref: RefKind = { type: 'Global', id: toId(hash, 0) };
    ctx[opaque].types.names[name] = ref;
    ctx[opaque].types.hashed[hash] = [{ type: 'builtin', args }];
    return ref;
};

export type Hash =
    | {
          type: 'sym';
          num: number;
      }
    | {
          type: 'global';
          hash: string;
          idx: number;
      }
    | { type: 'recur'; idx: number };
const parseHash = (hash: string): Hash => {
    if (hash.startsWith('r')) {
        return { type: 'recur', idx: +hash.slice(1) };
    }
    if (!hash.startsWith('h')) {
        return {
            type: 'sym',
            num: parseInt(hash, 10),
        };
    }
    const parts = hash.slice(1).split('.');
    return {
        type: 'global',
        hash: parts[0],
        idx: parts.length > 1 ? parseInt(parts[1], 10) : 0,
    };
};

const resolveDecorator = (
    ctx: Internal,
    name: string,
    rawHash?: string | null,
): Array<GlobalRef> => {
    if (rawHash || Object.hasOwn(ctx.aliases, name)) {
        const hash = parseHash(rawHash ?? ctx.aliases[name]);
        if (hash.type === 'sym') {
            throw new Error(
                `decorators can only be global ${name} - ${rawHash} ${ctx.aliases[name]}`,
            );
        } else if (hash.type === 'recur') {
            throw new Error('decorators can only be global');
        } else {
            const ref = ctx.decorators.hashed[hash.hash];
            if (ref && hash.idx < ref.length) {
                return [{ type: 'Global', id: toId(hash.hash, hash.idx) }];
            }
        }
    }
    if (ctx.decorators.names[name]) {
        return ctx.decorators.names[name];
    }
    return [];
};

const resolveType = (
    ctx: Internal,
    name: string,
    rawHash?: string | null,
): RefKind | null => {
    if (ctx.toplevel?.type === 'Type') {
        const idx = ctx.toplevel.items.findIndex((v) => v.name === name);
        if (idx !== -1) {
            return { type: 'Recur', idx };
        }
    }
    if (rawHash || Object.hasOwn(ctx.aliases, name)) {
        const hash = parseHash(rawHash ?? ctx.aliases[name]);
        if (hash.type === 'sym') {
            for (let { types } of ctx.locals) {
                for (let { sym, bound } of types) {
                    if (sym.id === hash.num) {
                        return { type: 'Local', sym: sym.id }; // , bound};
                    }
                }
            }
        } else if (hash.type === 'recur') {
            return { type: 'Recur', idx: hash.idx };
        } else {
            const ref = ctx.types.hashed[hash.hash];
            if (ref && hash.idx < ref.length) {
                return { type: 'Global', id: toId(hash.hash, hash.idx) };
            }
        }
    }
    for (let { types } of ctx.locals) {
        for (let { sym, bound } of types) {
            if (sym.name === name) {
                return { type: 'Local', sym: sym.id }; // , bound};
            }
        }
    }
    if (ctx.types.names[name]) {
        return ctx.types.names[name];
    }
    return null;
};

const resolve = (
    ctx: Internal,
    name: string,
    rawHash?: string | null,
): RefKind[] => {
    if (ctx.toplevel?.type === 'Expr') {
        const idx = ctx.toplevel.items.findIndex((v) => v.name === name);
        if (idx !== -1) {
            return [{ type: 'Recur', idx }];
        }
    }
    // console.log(ctx.aliases, name, Object.hasOwn(ctx.aliases, name), rawHash);
    if (rawHash || Object.hasOwn(ctx.aliases, name)) {
        // console.log('ok', name);
        const hash = parseHash(rawHash ?? ctx.aliases[name]);
        if (hash.type === 'sym') {
            for (let { values } of ctx.locals) {
                for (let { sym, type } of values) {
                    if (sym.id === hash.num) {
                        return [{ type: 'Local', sym: sym.id }]; // , bound};
                    }
                }
            }
        } else if (hash.type === 'recur') {
            return [{ type: 'Recur', idx: hash.idx }];
            // const ref = ctx.values.names[name]
            // if (ref) {
            // 	return ref
            // }
        } else {
            const ref = ctx.values.hashed[hash.hash];
            // console.log(ref, hash);
            if (ref && hash.idx < ref.length) {
                return [{ type: 'Global', id: toId(hash.hash, hash.idx) }];
            }
        }
    }
    for (let { values } of ctx.locals) {
        for (let { sym, type } of values) {
            if (sym.name === name) {
                return [{ type: 'Local', sym: sym.id }]; // , bound};
            }
        }
    }
    // TODO: local resolution
    if (ctx.values.names[name]) {
        return ctx.values.names[name];
    }
    return [];
};

const cloneInternal = (internal: Internal) => ({
    ...internal,
    values: {
        hashed: { ...internal.values.hashed },
        names: { ...internal.values.names },
    },
    decorators: {
        hashed: { ...internal.decorators.hashed },
        names: { ...internal.decorators.names },
    },
    types: {
        hashed: { ...internal.types.hashed },
        names: { ...internal.types.names },
    },
    locals: internal.locals.slice(),
    aliases: { ...internal.aliases },
});

export const nodebug = () => {};

export const newContext = (): FullContext => {
    const ctx: FullContext = {
        log(...args) {
            console.log(...args);
        },
        debugger: nodebug,
        clone() {
            return {
                ...this,
                [opaque]: cloneInternal(this[opaque]),
            };
        },
        toplevelConfig(toplevel) {
            return {
                ...this,
                [opaque]: { ...this[opaque], toplevel },
            };
        },
        localType(sym) {
            for (let local of this[opaque].locals) {
                for (let { sym: s, type } of local.values) {
                    if (s.id === sym) {
                        return type;
                    }
                }
            }
            return null;
        },
        extract() {
            return this[opaque];
        },
        [opaque]: {
            constraints: {},
            aliases: {},
            locals: [],
            symid: 0,
            decorators: { hashed: {}, names: {} },
            values: { hashed: {}, names: {} },
            types: { hashed: {}, names: {} },
            toplevel: null,
        },

        withAliases(aliases) {
            return {
                ...this,
                [opaque]: {
                    ...this[opaque],
                    aliases: {
                        ...this[opaque].aliases,
                        ...aliases,
                    },
                },
            };
        },

        withBounds(bounds) {
            return {
                ...this,
                [opaque]: {
                    ...this[opaque],
                    locals: [
                        {
                            values: [],
                            types: Object.keys(bounds).map((k) => ({
                                sym: { name: bounds[+k].name, id: +k },
                                bound: bounds[+k].bound,
                            })),
                        },
                        ...this[opaque].locals,
                    ],
                },
            };
        },

        valueForSym(sym) {
            for (let { values } of this[opaque].locals) {
                for (let t of values) {
                    if (t.sym.id === sym) {
                        return { type: t.type, name: t.sym.name };
                    }
                }
            }
            return null;
        },

        getBound(sym) {
            for (let { types } of this[opaque].locals) {
                for (let t of types) {
                    if (t.sym.id === sym) {
                        return t.bound;
                    }
                }
            }
            console.error('Failed to find bound for', sym);
            return null;
        },
        resetSym(min) {
            this[opaque].symid =
                min == null ? 0 : Math.max(this[opaque].symid, min);
            this[opaque].constraints = {};
        },
        isBuiltinType(t, name) {
            return (
                t.type === 'TRef' &&
                t.ref.type === 'Global' &&
                refsEqual(t.ref, this[opaque].types.names[name])
            );
        },
        // builtinNames
        // getBuiltinNames

        getBuiltinRef(name) {
            const gref = this[opaque].types.names[name];
            if (!gref) {
                return this[opaque].values.names[name][0];
            }
            return gref;
        },
        resolveRefsAndApplies(t, path) {
            return resolveAnalyzeType(t, this, path);
        },
        getValueType(id) {
            const { hash, idx } = extract(id);
            if (!this[opaque].values.hashed[hash]) {
                return null;
            }

            return this[opaque].values.hashed[hash][idx].typ;
        },
        typeForId(id) {
            const { idx, hash } = extract(id);
            const types = this[opaque].types.hashed[hash];
            return types ? types[idx] : null;
        },
        valueForId(id) {
            const { idx, hash } = extract(id);
            const values = this[opaque].values.hashed[hash];
            return values ? values[idx] : null;
        },
        resolve(name, rawHash) {
            return resolve(this[opaque], name, rawHash);
        },
        resolveType(name, rawHash) {
            return resolveType(this[opaque], name, rawHash);
        },
        resolveDecorator(name, rawHash) {
            return resolveDecorator(this[opaque], name, rawHash);
        },
        ToTast: makeToTast(),
        sym(name) {
            return {
                name,
                id: this[opaque].symid++,
            };
        },

        // Modifiers
        withLocalTypes(types) {
            const locals: Internal['locals'][0] = { types, values: [] };
            return {
                ...this,
                [opaque]: {
                    ...this[opaque],
                    locals: [locals, ...this[opaque].locals],
                },
            };
        },

        newTypeVar() {
            const id = this[opaque].symid++;
            return {
                type: 'TVbl',
                id,
                loc: noloc,
            };
        },

        withLocals(values) {
            const locals: Internal['locals'][0] = { types: [], values };
            return {
                ...this,
                [opaque]: {
                    ...this[opaque],
                    locals: [locals, ...this[opaque].locals],
                },
            };
        },

        addTypeConstraint(id, constraint) {
            if (!this[opaque].constraints[id]) {
                this[opaque].constraints[id] = constraint;
                return constraint;
            }
            const mix = constrainTypes(
                this[opaque].constraints[id],
                constraint,
                this,
            );
            if (!mix) {
                return this[opaque].constraints[id];
            }
            this[opaque].constraints[id] = mix;
            return mix;
        },

        currentConstraints(id) {
            // console.log('get', id, this[opaque].constraints[id]);
            if (!this[opaque].constraints[id]) {
                return { type: 'TBlank', loc: noloc };
            }
            return this[opaque].constraints[id];
        },

        withValues(exprs) {
            const defns = exprs.map((t) =>
                transformExpression(t.expr, locClearVisitor, null),
            );
            const hash = hashExprs(defns);
            const rctx = this.toplevelConfig({
                type: 'Expr',
                hash,
                items: exprs.map((expr) => ({
                    name: expr.name,
                    type: expr.typ ?? { type: 'TBlank', loc: noloc },
                })),
            });
            // console.log(hash, defns);
            // require('fs').writeFileSync(hash, JSON.stringify(defns));
            const ctx = { ...this[opaque] };
            ctx.values = {
                ...ctx.values,
                hashed: {
                    ...ctx.values.hashed,
                    [hash]: exprs.map(({ name, expr, typ }) => ({
                        type: 'user',
                        typ:
                            typ != null && typ.type !== 'TBlank'
                                ? typ
                                : rctx.getType(expr)!,
                        expr,
                    })),
                },
                names: {
                    ...ctx.values.names,
                },
            };
            exprs.forEach(({ name }, i) => {
                if (!ctx.values.names[name]) {
                    ctx.values.names[name] = [];
                }
                ctx.values.names[name].push({
                    type: 'Global',
                    id: toId(hash, i),
                });
            });
            if (ctx.toplevel?.type === 'Expr') {
                ctx.toplevel.hash = hash;
            }
            return { hash, ctx: { ...this, [opaque]: ctx } };
        },

        withToplevel(t) {
            if (t.type === 'TypeAlias') {
                return this.withTypes(t.elements).ctx;
            }
            if (t.type === 'ToplevelLet') {
                return this.withValues(t.elements).ctx;
            }
            return this;
        },

        withTypes(types) {
            const defns = types.map((m) =>
                transformType(m.type, locClearVisitor, null),
            );
            const hash = hashTypes(defns);
            const ctx = { ...this[opaque] };
            ctx.types = {
                ...ctx.types,
                hashed: {
                    ...ctx.types.hashed,
                    [hash]: types.map(({ name, type }) => ({
                        type: 'user',
                        typ: type,
                    })),
                },
                names: { ...ctx.types.names },
            };
            types.forEach(({ name }, i) => {
                ctx.types.names[name] = {
                    type: 'Global',
                    id: toId(hash, i),
                };
            });
            if (ctx.toplevel?.type === 'Type') {
                ctx.toplevel.hash = hash;
            }
            return { hash, ctx: { ...this, [opaque]: ctx } };
        },

        // Analyze!
        getType(expr: Expression) {
            return getType(expr, this);
        },
        resolveAnalyzeType(type: Type) {
            return resolveAnalyzeType(type, this);
        },
        typeForRecur(idx) {
            const { toplevel } = this[opaque];
            if (!toplevel || toplevel.type !== 'Expr') {
                return null;
            }
            return toplevel.items[idx].type;
        },
        resolveTypeRecur(idx) {
            const { toplevel } = this[opaque];
            if (toplevel && toplevel.type === 'Type') {
                if (toplevel.items[idx].actual) {
                    return toplevel.items[idx].actual!;
                }
                const hash = toplevel.hash;
                if (hash) {
                    return {
                        type: 'TRef',
                        ref: { type: 'Global', id: toId(hash, idx) },
                        loc: noloc,
                    };
                } else {
                    console.log('no hash on toplevel sry', toplevel);
                }
            }
            return null;
        },
        resolveRecur(idx) {
            const { toplevel } = this[opaque];
            if (!toplevel) {
                return null;
            }
            const hash = toplevel.hash;
            if (hash) {
                return toId(hash, idx);
            } else {
                console.log('no hash on toplevel sry', toplevel);
            }
            return null;
        },
        getTopKind(idx) {
            if (this[opaque].toplevel?.type === 'Type') {
                return this[opaque].toplevel.items[idx].kind;
            }
            return null;
        },
        typeByName(name: string) {
            const ref = this[opaque].types.names[name];
            return ref ? { type: 'TRef', ref: ref, loc: noloc } : null;
        },
        getTypeArgs(ref) {
            if (ref.type === 'Global') {
                const { idx, hash } = extract(ref.id);
                const t = this[opaque].types.hashed[hash][idx];
                if (t.type === 'builtin') {
                    return t.args;
                } else {
                    return null;
                }
            } else if (ref.type === 'Recur') {
                const { toplevel } = this[opaque];
                if (toplevel?.type === 'Type') {
                    return toplevel.items[ref.idx].args;
                }
                return null;
            } else {
                return null;
            }
        },
        getDecorator(name) {
            return this[opaque].decorators.names[name] ?? [];
        },
        // decoratorNames() {
        //     const result: { [hash: string]: string } = {};
        //     Object.keys(this[opaque].decorators.names).forEach((name) => {
        //         this[opaque].decorators.names[name].forEach((r) => {
        //             result[idToString(r.id)] = name;
        //         });
        //     });
        //     return result;
        // },
        errorDecorators() {
            const result: Id[] = [];
            Object.keys(this[opaque].decorators.names).forEach((name) => {
                if (name.startsWith('error:')) {
                    result.push(
                        ...this[opaque].decorators.names[name].map((r) => r.id),
                    );
                }
            });
            return result;
        },
    };
    return ctx;
};

export const hashType = (type: Type): string => {
    return hashObject(serial(type));
};
export const hashTypes = (t: Type[]): string => hashObject(t.map(hashType));
export const hashExpr = (t: Expression) =>
    hashObject(serial(transformExpression(t, locClearVisitor, null)));
export const hashExprs = (t: Expression[]) => hashObject(serial(t));

const ref = (kind: RefKind): Expression => ({ type: 'Ref', kind, loc: noloc });
const tlam = (
    args: Array<{ label: string; typ: Type; loc: Loc }>,
    result: Type,
): Type => ({
    type: 'TLambda',
    args,
    result,
    loc: noloc,
});
const tvars = (
    args: { sym: Sym; bound: Type | null; default_: Type | null; loc: Loc }[],
    inner: Type,
): TVars => ({
    type: 'TVars',
    args,
    inner,
    loc: noloc,
});

const builtinTypes = `
int
uint
float
bool
string
eq
task
`
    .trim()
    .split('\n');

// ... maybe what I want is to autogenerate
// the types from the .ts file of builtins 🤔
const builtinValues = `
toString: (value: int) => string
toString: (value: float) => string
toString: (value: bool) => string
+: <A: int, B: int>(a: A, b: B) => A + B
>: (a: int, b: int) => bool
<: (a: int, b: int) => bool
>=: (a: int, b: int) => bool
<=: (a: int, b: int) => bool
+: (a: float, b: float) => float
*: (a: int, b: int) => int
-: (a: float, b: float) => float
-: (a: int, b: int) => int
==: <T: eq>(a: T, b: T) => bool
andThen: <A: task, B: task, R, R2>(a: Task<A, R>, b: (res: R) => Task<B, R2>) => Task<[A | B], R2>
testIO: <T>(read: string, task: Task<[\`Read((), string) | \`Print(string, ())], T>) => T
withHandler: <Effects: task, Result, HandledEffects: task, Result2>(task: Task<Effects, Result, HandledEffects>, handler: (input: Task<[Effects | HandledEffects], Result>) => Task<Effects, Result2>) => Task<Effects, Result2>
isSquare: (int) => bool
`;
// withHandler: <A: task, B: task>
/*

withHandler
takes a thing
hmmmmmm what if Task gets a third optional argument?

Task<Effects, Result=(), InnerEffects=[]>


*/

export const setupDefaults = (ctx: FullContext) => {
    const named: { [key: string]: RefKind } = {};
    builtinTypes.forEach((name) => {
        named[name] = addBuiltinType(ctx, name, []);
    });
    addBuiltinType(ctx, 'Task', [
        {
            sym: { id: 0, name: 'Effects' },
            bound: tref(named['task']),
            loc: noloc,
            default_: null,
        },
        {
            sym: { id: 1, name: 'Result' },
            bound: null,
            loc: noloc,
            default_: tunit,
        },
        {
            sym: { id: 1, name: 'ExtraInner' },
            bound: tref(named['task']),
            loc: noloc,
            default_: tnever,
        },
    ]);
    Object.keys(errors).forEach((tag) => {
        addBuiltinDecorator(ctx, `error:` + tag, 0);
    });
    addBuiltinDecorator(ctx, `test:type`, 0);

    builtinValues
        .split('\n')
        .filter((line) => line.trim())
        .forEach((line) => {
            ctx.resetSym();
            const [name, ...rest] = line.split(':');
            const type = rest.join(':');
            try {
                const t = parseType(type.trim());
                const tast = ctx.ToTast.Type(t, ctx);
                addBuiltin(
                    ctx,
                    name,
                    transformType(tast, locClearVisitor, null),
                );
            } catch (err) {
                console.log(type);
            }
        });
    ctx.resetSym();
};

export const fullContext = () => {
    const ctx = newContext();
    setupDefaults(ctx);
    return ctx;
};

export const serial = (x: any): any => {
    if (Array.isArray(x)) {
        return '[' + x.map(serial).join(', ') + ']';
    }
    if (!x) {
        return '' + x;
    }
    if (typeof x === 'object') {
        return (
            '{' +
            Object.keys(x)
                .sort()
                .map((k) => k + ': ' + serial(x[k]))
                .join(', ') +
            '}'
        );
    }
    if (typeof x === 'function') {
        return 'function ' + x;
    }
    if (typeof x === 'string') {
        return JSON.stringify(x);
    }
    return '' + x;
};

export const builtinContext = fullContext();
