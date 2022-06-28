import hashObject from 'object-hash';
import { Ctx } from '.';
import { DecoratorDecl } from './elements/decorators';
import { TVar } from './elements/type';
import { Loc } from './grammar/base.parser';
import { extract, toId } from './ids';
import {
    Expression,
    GlobalRef,
    refHash,
    RefKind,
    Sym,
    TLambda,
    TVars,
    Type,
} from './typed-ast';
import { makeToTast } from './typing/to-tast';

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

export type FullContext = {
    values: HashedNames<GlobalValue, Array<GlobalRef>>;
    types: HashedNames<GlobalType, GlobalRef>;
    decorators: HashedNames<
        | { type: 'builtin'; typ: 0 }
        | { type: 'user'; typ: 0; decl: DecoratorDecl },
        Array<GlobalRef>
    >;
    locals: {
        types: { sym: Sym; bound: Type | null }[];
        values: { sym: Sym; type: Type }[];
    }[];
} & Ctx;

export const addBuiltin = (
    ctx: FullContext,
    name: string,
    typ: Type,
    unique = 0,
): RefKind => {
    const hash = hashObject({ name, typ, unique });
    const ref: RefKind = { type: 'Global', id: toId(hash, 0) };
    if (ctx.values.names.hasOwnProperty(name)) {
        ctx.values.names[name].push(ref);
    } else {
        ctx.values.names[name] = [ref];
    }
    ctx.values.hashed[hash] = [{ type: 'builtin', typ }];
    return ref;
};

export const addBuiltinDecorator = (
    ctx: FullContext,
    name: string,
    typ: 0,
    unique = 0,
): RefKind => {
    const hash = hashObject({ name, typ, unique });
    const ref: GlobalRef = { type: 'Global', id: toId(hash, 0) };
    if (ctx.decorators.names.hasOwnProperty(name)) {
        ctx.decorators.names[name].push(ref);
    } else {
        ctx.decorators.names[name] = [ref];
    }
    ctx.decorators.hashed[hash] = [{ type: 'builtin', typ }];
    return ref;
};

export const addBuiltinType = (
    ctx: FullContext,
    name: string,
    args: TVar[],
    unique = 0,
): RefKind => {
    const hash = hashObject({ name, args, unique });
    const ref: RefKind = { type: 'Global', id: toId(hash, 0) };
    ctx.types.names[name] = ref;
    ctx.types.hashed[hash] = [{ type: 'builtin', args }];
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
      };
const parseHash = (hash: string): Hash => {
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
    ctx: FullContext,
    name: string,
    rawHash?: string | null,
): Array<GlobalRef> => {
    if (rawHash || Object.hasOwn(ctx.aliases, name)) {
        const hash = parseHash(rawHash ?? ctx.aliases[name]);
        if (hash.type === 'sym') {
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
    ctx: FullContext,
    name: string,
    rawHash?: string | null,
): RefKind | null => {
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
    ctx: FullContext,
    name: string,
    rawHash?: string | null,
): RefKind[] => {
    // console.log(ctx.aliases, name, Object.hasOwn(ctx.aliases, name), rawHash);
    if (rawHash || Object.hasOwn(ctx.aliases, name)) {
        // console.log('ok', name);
        const hash = parseHash(rawHash ?? ctx.aliases[name]);
        if (hash.type === 'sym') {
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

export const newContext = (aliases: FullContext['aliases']): FullContext => {
    let symid = 0;
    const ctx: FullContext = {
        locals: [],
        aliases,
        decorators: { hashed: {}, names: {} },
        values: { hashed: {}, names: {} },
        types: { hashed: {}, names: {} },
        typeForId(id) {
            const { idx, hash } = extract(id);
            const types = this.types.hashed[hash];
            return types ? types[idx] : null;
        },
        valueForId(id) {
            const { idx, hash } = extract(id);
            const values = this.values.hashed[hash];
            return values ? values[idx] : null;
        },
        resolve(name, rawHash) {
            return resolve(this, name, rawHash);
        },
        resolveType(name, rawHash) {
            return resolveType(this, name, rawHash);
        },
        resolveDecorator(name, rawHash) {
            return resolveDecorator(this, name, rawHash);
        },
        ToTast: makeToTast(),
        sym(name) {
            return {
                name,
                id: symid++,
            };
        },

        // Modifiers
        withLocalTypes(types) {
            const locals: FullContext['locals'][0] = { types, values: [] };
            return { ...this, locals: [locals, ...this.locals] };
        },
        withTypes(types) {
            const defns = types.map((m) => m.type);
            const hash = hashObject(defns);
            const ctx = { ...this };
            ctx.types = {
                ...ctx.types,
                hashed: {
                    ...ctx.types.hashed,
                    [hash]: types.map(({ name, type }) => ({
                        type: 'user',
                        typ: type,
                    })),
                },
                names: {
                    ...ctx.types.names,
                },
            };
            types.forEach(({ name }, i) => {
                ctx.types.names[name] = {
                    type: 'Global',
                    id: toId(hash, i),
                };
            });
            return ctx;
        },
    };
    return ctx;
};

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

export const fullContext = (aliases: FullContext['aliases'] = {}) => {
    const ctx = newContext(aliases);
    setupDefaults(ctx);
    return ctx;
};
