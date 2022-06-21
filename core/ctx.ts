import hashObject from 'object-hash';
import { Ctx } from '.';
import { DecoratorDecl } from './elements/decorators';
import { Loc } from './grammar/base.parser';
import { toId } from './ids';
import {
    Expression,
    GlobalRef,
    RefKind,
    Sym,
    TApply,
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

export type FullContext = {
    values: HashedNames<
        | { type: 'builtin'; typ: Type }
        | { type: 'user'; typ: Type; expr: Expression },
        Array<GlobalRef>
    >;
    types: HashedNames<
        | { type: 'builtin'; args: number }
        // TODO: once I get records going
        // ... this'll be a 'type declaration, I think'
        // kind: Kind,
        | { type: 'user' },
        GlobalRef
    >;
    decorators: HashedNames<
        | { type: 'builtin'; typ: Type }
        | { type: 'user'; typ: TLambda; decl: DecoratorDecl },
        Array<GlobalRef>
    >;
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

export const addBuiltinType = (
    ctx: FullContext,
    name: string,
    args: number,
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
    // hash = hash.slice(2, -1); // #[]
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
        idx: parseInt(parts[1], 10),
    };
};

const resolveDecorator = (
    ctx: FullContext,
    name: string,
    rawHash?: string | null,
): Array<GlobalRef> => {
    if (rawHash) {
        const hash = parseHash(rawHash);
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
    if (rawHash) {
        const hash = parseHash(rawHash);
        if (hash.type === 'sym') {
            throw new Error('not yet');
        } else {
            const ref = ctx.types.hashed[hash.hash];
            if (ref && hash.idx < ref.length) {
                return { type: 'Global', id: toId(hash.hash, hash.idx) };
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
    if (rawHash) {
        const hash = parseHash(rawHash);
        if (hash.type === 'sym') {
            throw new Error('not yet: ' + rawHash);
            // const ref = ctx.values.names[name]
            // if (ref) {
            // 	return ref
            // }
        } else {
            const ref = ctx.values.hashed[hash.hash];
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

export const newContext = (): FullContext => {
    const ctx: FullContext = {
        // locals: {},
        decorators: { hashed: {}, names: {} },
        values: { hashed: {}, names: {} },
        types: { hashed: {}, names: {} },
        resolve: (name, rawHash) => resolve(ctx, name, rawHash),
        resolveType: (name, rawHash) => resolveType(ctx, name, rawHash),
        resolveDecorator: (name, rawHash) =>
            resolveDecorator(ctx, name, rawHash),
        ToTast: makeToTast(),
    };
    return ctx;
};

export const noloc: Loc = {
    start: { line: 0, column: 0, offset: -1 },
    end: { line: 0, column: 0, offset: -1 },
    idx: -1,
};
export const tref = (ref: RefKind): Type => ({ type: 'TRef', ref, loc: noloc });
const ref = (kind: RefKind): Expression => ({ type: 'Ref', kind, loc: noloc });
const tlam = (
    args: Array<{ label: string; typ: Type }>,
    result: Type,
): Type => ({
    type: 'TLambda',
    args,
    result,
    loc: noloc,
});
const tvars = (args: Sym[], inner: Type): TVars => ({
    type: 'TVars',
    args,
    inner,
    loc: noloc,
});
const tapply = (args: Array<Type>, target: Type): TApply => ({
    type: 'TApply',
    args,
    loc: noloc,
    target,
});

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

const builtinTypes = `
int
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
        named[name] = addBuiltinType(ctx, name, 0);
    });
    addBuiltin(
        ctx,
        'toString',
        tlam([{ label: 'v', typ: tref(named.int) }], tref(named.string)),
    );

    addBuiltin(
        ctx,
        'add',
        tlam(
            [
                { label: 'a', typ: tref(named.int) },
                { label: 'b', typ: tref(named.int) },
            ],
            tref(named.int),
        ),
    );

    addBuiltin(
        ctx,
        'add',
        tlam(
            [
                { label: 'a', typ: tref(named.float) },
                { label: 'b', typ: tref(named.float) },
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
                },
                {
                    label: 'a',
                    typ: { type: 'String', loc: noloc, text: 'yep' },
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
