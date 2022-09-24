
import * as t from './types';
import * as tm from './type-map';

const fail = (message?: string) => {
    throw new Error("IDK " + message);
}

export const add = (map: tm.Map, item: tm.Map[0]) => {
    map[item.value.loc.idx] = item;
    return item.value.loc.idx;
};


export const Lambda = (value: t.Lambda, map: tm.Map): tm.Lambda => ({
    ...value,
    ...{
        args: value.args.map(item => Larg_id(item, map)),
        res: value.res ? {...value.res, value: Type_id(value.res.value, map)} : null,
        body: Expression_id(value.body, map),
    },
});
export const Lambda_id = (value: t.Lambda, map: tm.Map): number => add(map, {
    type: "Lambda",
    value: Lambda(value, map)
});


export const Larg = (value: t.Larg, map: tm.Map): tm.Larg => ({
    ...value,
    ...{
        pat: Pattern_id(value.pat, map),
        typ: value.typ ? {...value.typ, value: Type_id(value.typ.value, map)} : null,
    },
});
export const Larg_id = (value: t.Larg, map: tm.Map): number => add(map, {
    type: "Larg",
    value: Larg(value, map)
});


export const Number = (value: t.Number, map: tm.Map): tm.Number => ({
    ...value,
    ...{
        num: value.num,
        kind: value.kind ? {...value.kind, value: value.kind.value} : null,
    },
});
export const Number_id = (value: t.Number, map: tm.Map): number => add(map, {
    type: "Number",
    value: Number(value, map)
});


export const Boolean = (value: t.Boolean, map: tm.Map): tm.Boolean => ({
    ...value,
    ...{
        value: value.value,
    },
});
export const Boolean_id = (value: t.Boolean, map: tm.Map): number => add(map, {
    type: "Boolean",
    value: Boolean(value, map)
});


export const PIdentifier = (value: t.PIdentifier, map: tm.Map): tm.PIdentifier => ({
    ...value,
    ...{
        text: value.text,
        ref: value.ref ? {...value.ref, value: LocalHash_id(value.ref.value, map)} : null,
    },
});
export const PIdentifier_id = (value: t.PIdentifier, map: tm.Map): number => add(map, {
    type: "PIdentifier",
    value: PIdentifier(value, map)
});


export const Identifier = (value: t.Identifier, map: tm.Map): tm.Identifier => ({
    ...value,
    ...{
        text: value.text,
        ref: value.ref ? {...value.ref, value: value.ref.value.type === 'IdHash' ? IdHash_id(value.ref.value, map) : value.ref.value.type === 'LocalHash' ? LocalHash_id(value.ref.value, map) :  fail("no option")} : null,
    },
});
export const Identifier_id = (value: t.Identifier, map: tm.Map): number => add(map, {
    type: "Identifier",
    value: Identifier(value, map)
});


export const UInt = (value: t.UInt, map: tm.Map): tm.UInt => ({
    ...value,
    ...value,
});
export const UInt_id = (value: t.UInt, map: tm.Map): number => add(map, {
    type: "UInt",
    value: UInt(value, map)
});


export const LocalHash = (value: t.LocalHash, map: tm.Map): tm.LocalHash => ({
    ...value,
    ...{
        sym: UInt_id(value.sym, map),
    },
});
export const LocalHash_id = (value: t.LocalHash, map: tm.Map): number => add(map, {
    type: "LocalHash",
    value: LocalHash(value, map)
});


export const IdHash = (value: t.IdHash, map: tm.Map): tm.IdHash => ({
    ...value,
    ...{
        hash: value.hash,
        idx: value.idx ? UInt_id(value.idx, map) : null,
    },
});
export const IdHash_id = (value: t.IdHash, map: tm.Map): number => add(map, {
    type: "IdHash",
    value: IdHash(value, map)
});


export const Apply = (value: t.Apply, map: tm.Map): tm.Apply => ({
    ...value,
    ...{
            target: Applyable_id(value.target, map),
            suffixes: value.suffixes.map(suffix => Suffix_id(suffix, map)),

        },
});
export const Apply_id = (value: t.Apply, map: tm.Map): number => add(map, {
    type: "Apply",
    value: Apply(value, map)
});


export const CallSuffix = (value: t.CallSuffix, map: tm.Map): tm.CallSuffix => ({
    ...value,
    ...{
        args: value.args.map(item => Expression_id(item, map)),
    },
});
export const CallSuffix_id = (value: t.CallSuffix, map: tm.Map): number => add(map, {
    type: "CallSuffix",
    value: CallSuffix(value, map)
});


export const Expression = (value: t.Expression, map: tm.Map): tm.Expression => (value.type === "Lambda" ? Lambda(value, map) : 
value.type === "Apply" ? Apply(value, map) : 
value.type === "Number" || value.type === "Boolean" || value.type === "Identifier" ? Applyable(value, map) : 
fail("Unexpected type: " + value.type));
export const Expression_id = (value: t.Expression, map: tm.Map): number => add(map, {
    type: "Expression",
    value: Expression(value, map)
});


export const Applyable = (value: t.Applyable, map: tm.Map): tm.Applyable => (value.type === "Number" ? Number(value, map) : 
value.type === "Boolean" ? Boolean(value, map) : 
value.type === "Identifier" ? Identifier(value, map) : 
fail("Unexpected type: " + value.type));
export const Applyable_id = (value: t.Applyable, map: tm.Map): number => add(map, {
    type: "Applyable",
    value: Applyable(value, map)
});


export const Type = (value: t.Type, map: tm.Map): tm.Type => (value.type === "Number" ? Number(value, map) : 
value.type === "Boolean" ? Boolean(value, map) : 
value.type === "Identifier" ? Identifier(value, map) : 
fail("Unexpected type: " + value.type));
export const Type_id = (value: t.Type, map: tm.Map): number => add(map, {
    type: "Type",
    value: Type(value, map)
});


export const Atom = (value: t.Atom, map: tm.Map): tm.Atom => (value.type === "Number" ? Number(value, map) : 
value.type === "Boolean" ? Boolean(value, map) : 
value.type === "PIdentifier" ? PIdentifier(value, map) : 
value.type === "Identifier" ? Identifier(value, map) : 
fail("Unexpected type: " + value.type));
export const Atom_id = (value: t.Atom, map: tm.Map): number => add(map, {
    type: "Atom",
    value: Atom(value, map)
});


export const Pattern = (value: t.Pattern, map: tm.Map): tm.Pattern => (value.type === "PIdentifier" ? PIdentifier(value, map) : 
fail("Unexpected type: " + value.type));
export const Pattern_id = (value: t.Pattern, map: tm.Map): number => add(map, {
    type: "Pattern",
    value: Pattern(value, map)
});


export const Suffix = (value: t.Suffix, map: tm.Map): tm.Suffix => (value.type === "CallSuffix" ? CallSuffix(value, map) : 
fail("Unexpected type: " + value.type));
export const Suffix_id = (value: t.Suffix, map: tm.Map): number => add(map, {
    type: "Suffix",
    value: Suffix(value, map)
});