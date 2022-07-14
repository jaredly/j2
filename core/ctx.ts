import hashObject from 'object-hash';
import { Ctx } from '.';
import { DecoratorDecl } from './elements/decorators';
import { TVar } from './elements/type-vbls';
import { Loc } from './grammar/base.parser';
import { extract, Id, idsEqual, toId } from './ids';
import { resolveAnalyzeType } from './resolveAnalyzeType';
import { transformType } from './transform-tast';
import { Expression, GlobalRef, RefKind, Sym, TVars, Type } from './typed-ast';
import { Ctx as ACtx } from './typing/analyze';
import { getType } from './typing/getType';
import { makeToTast, Toplevel } from './typing/to-tast';
import { Ctx as TCtx } from './typing/typeMatches';
import { locClearVisitor } from './typing/__test__/fixture-utils';

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
    locals: {
        types: { sym: Sym; bound: Type | null }[];
        values: { sym: Sym; type: Type }[];
    }[];
    syms: {
        types: { [key: number]: Type | null };
        // lots of questions about how Type variables
        // get inferred
        values: { [key: number]: Type };
    };
    toplevel: null | Toplevel;
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
            throw new Error('decorators can only be global');
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
    // TODO: local resolution
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
    // console.log(ctx.aliases, name, Object.hasOwn(ctx.aliases, name), rawHash);
    if (rawHash || Object.hasOwn(ctx.aliases, name)) {
        // console.log('ok', name);
        const hash = parseHash(rawHash ?? ctx.aliases[name]);
        if (hash.type === 'sym' || hash.type === 'recur') {
            throw new Error('not yet: ' + rawHash);
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
    // TODO: local resolution
    if (ctx.values.names[name]) {
        return ctx.values.names[name];
    }
    return [];
};

export const refsEqual = (a: RefKind, b: RefKind): boolean => {
    if (a.type !== b.type) {
        return false;
    }
    if (a.type === 'Global') {
        return b.type === 'Global' && idsEqual(a.id, b.id);
    }
    if (a.type === 'Recur') {
        return b.type === 'Recur' && a.idx === b.idx;
    }
    return b.type === 'Local' && a.sym === b.sym;
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

export const newContext = (): FullContext => {
    const ctx: FullContext = {
        log(...args) {
            console.log(...args);
        },
        debugger() {},
        clone() {
            return {
                ...this,
                [opaque]: cloneInternal(this[opaque]),
            };
        },
        toplevelConfig(toplevel) {
            if (toplevel && this[opaque].toplevel?.hash) {
                toplevel.hash = this[opaque].toplevel.hash;
            }
            return {
                ...this,
                [opaque]: { ...this[opaque], toplevel },
            };
        },
        extract() {
            return this[opaque];
        },
        [opaque]: {
            aliases: {},
            locals: [],
            symid: 0,
            syms: { types: {}, values: {} },
            decorators: { hashed: {}, names: {} },
            values: { hashed: {}, names: {} },
            types: { hashed: {}, names: {} },
            toplevel: null,
        },

        withAliases(aliases) {
            return { ...this, [opaque]: { ...this[opaque], aliases } };
        },

        withBounds(bounds) {
            const types = {
                ...this[opaque].syms.types,
                ...bounds,
            };
            return {
                ...this,
                [opaque]: {
                    ...this[opaque],
                    syms: { ...this[opaque].syms, types },
                },
            };
        },

        getBound(sym) {
            if (this[opaque].syms.types[sym] !== undefined) {
                return this[opaque].syms.types[sym];
            }
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
        resetSym() {
            this[opaque].symid = 0;
            this[opaque].syms = { types: {}, values: {} };
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
            return gref;
        },
        resolveRefsAndApplies(t, path) {
            return resolveAnalyzeType(t, this, path);
        },
        getValueType(id) {
            const { hash, idx } = extract(id);
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
            types.forEach((t) => {
                this[opaque].syms.types[t.sym.id] = t.bound;
            });
            return {
                ...this,
                [opaque]: {
                    ...this[opaque],
                    locals: [locals, ...this[opaque].locals],
                },
            };
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
            return { ...this, [opaque]: ctx };
        },

        // Analyze!
        getType(expr: Expression) {
            return getType(expr, this);
        },
        resolveAnalyzeType(type: Type) {
            return resolveAnalyzeType(type, this);
        },
        resolveRecur(idx) {
            if (this[opaque].toplevel?.type === 'Type') {
                const hash = this[opaque].toplevel.hash;
                if (hash) {
                    return toId(hash, idx);
                } else {
                    console.log(
                        'no hash on toplevel sry',
                        this[opaque].toplevel,
                    );
                }
            } else {
                console.log('cant resolve recur', this[opaque].toplevel, idx);
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
            return ref
                ? { type: 'TRef', ref: ref, loc: noloc, args: [] }
                : null;
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

export const noloc: Loc = {
    start: { line: 0, column: 0, offset: -1 },
    end: { line: 0, column: 0, offset: -1 },
    idx: -1,
};
export const tref = (ref: RefKind): Type => ({
    type: 'TRef',
    ref,
    loc: noloc,
    // args: [],
});
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
// const tapply = (args: Array<Type>, target: Type): TApply => ({
//     type: 'TApply',
//     args,
//     loc: noloc,
//     target,
// });

const prelude = `
enum Result<Ok, Failure> {
	Ok<Ok>{v: Ok}<Ok>,
	Failure<Failure>{v: Failure}<Failure>, // lol
	// maybe we'll allow it as shorthand?
	// Failure{v: Failure} gets turned into that, because it can tell
	// that we're using some locally defined types
}

struct Ok<Ok>{v: Ok}
struct Failure<Failure>{v: Failure}
`;

// So ... the ....
// types here, I think I'm going to want them to be
// in the in-universe AST. hmm.
export const errors = {
    extraArg: 0,
    typeNotFound: 3,
    notAFunction: 1,
    wrongNumberOfArgs: 4,
    wrongNumberOfTypeArgs: 1,
    argWrongType: 5,
    notAString: 6,
    notATypeVars: 1,
    invalidOps: 0,
    invalidEnum: 0,
    notAnEnum: 0,
    conflictingEnumTag: 1,
    invalidType: 0,
    notARecord: 0,
    invalidRecord: 0,
};
export type ErrorTag = keyof typeof errors;

const builtinTypes = `
int
uint
float
bool
string
`
    .trim()
    .split('\n');

// TODO: allow parsing from a `Declaration` rule,
// which will let us declare our builtins like this.
// although ... maybe what I want is to autogenerate
// the types from the .ts file of builtins 🤔
const builtinValues = `
.toString: (value: int) => () => string
.toString: (value: float) => () => string
.toString: (value: bool) => () => string
`;

export const setupDefaults = (ctx: FullContext) => {
    const named: { [key: string]: RefKind } = {};
    builtinTypes.forEach((name) => {
        named[name] = addBuiltinType(ctx, name, []);
    });
    Object.keys(errors).forEach((tag) => {
        addBuiltinDecorator(ctx, `error:` + tag, 0);
    });
    addBuiltinDecorator(ctx, `test:type`, 0);
    addBuiltin(
        ctx,
        'toString',
        tlam(
            [{ label: 'v', typ: tref(named.int), loc: noloc }],
            tref(named.string),
        ),
    );
    addBuiltin(
        ctx,
        'toString',
        tlam(
            [{ label: 'v', typ: tref(named.float), loc: noloc }],
            tref(named.string),
        ),
    );

    addBuiltin(
        ctx,
        'add',
        tlam(
            [
                { label: 'a', typ: tref(named.int), loc: noloc },
                { label: 'b', typ: tref(named.int), loc: noloc },
            ],
            tref(named.int),
        ),
    );

    addBuiltin(
        ctx,
        'add',
        tlam(
            [
                { label: 'a', typ: tref(named.float), loc: noloc },
                { label: 'b', typ: tref(named.float), loc: noloc },
            ],
            tref(named.float),
        ),
    );

    addBuiltin(
        ctx,
        'literalTypes',
        tlam(
            [
                {
                    label: 'a',
                    typ: { type: 'Number', kind: 'Int', loc: noloc, value: 20 },
                    loc: noloc,
                },
                {
                    label: 'a',
                    typ: { type: 'String', loc: noloc, text: 'yep' },
                    loc: noloc,
                },
            ],
            tref(named.float),
        ),
    );

    // addBuiltin(
    //     ctx,
    //     'addg',
    //     tvars(
    //         [
    //             { id: 0, name: 'A' },
    //             { id: 1, name: 'B' },
    //         ],
    //         tlam(
    //             [
    //                 { label: 'a', typ: tref({ type: 'Local', sym: 0 }) },
    //                 { label: 'b', typ: tref({ type: 'Local', sym: 1 }) },
    //             ],
    //             {
    //                 type: 'TAdd',
    //                 loc: noloc,
    //                 elements: [
    //                     tref({ type: 'Local', sym: 0 }),
    //                     tref({ type: 'Local', sym: 1 }),
    //                 ],
    //             },
    //         ),
    //     ),
    // );
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
