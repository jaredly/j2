
import * as t from './types';
import * as tm from './type-map';

const fail = (message?: string) => {
    throw new Error("IDK " + message);
}

export const add = (map: tm.Map, item: tm.Map[0]) => {
    map[item.value.loc.idx] = item;
    return item.value.loc.idx;
};

export const Blank = (b: t.Blank, m: tm.Map): tm.Blank => b;
export const from_Blank = (b: tm.Blank, m: tm.Map): t.Blank => b;


export const Lambda = (value: t.Lambda, map: tm.Map): tm.Lambda => ({
    ...value,
    ...{
        args: value.args.map(item => Larg_id(item, map)),
        res: value.res ? {...value.res, value: Type_id(value.res.value, map)} : null,
        body: Expression_id(value.body, map),
    },
});
export const from_Lambda = (value: tm.Lambda, map: tm.Map): t.Lambda => ({
    ...value,
    ...{
        args: value.args.map(item => from_Larg(map[item].value as tm.Larg, map)),
        res: value.res ? {...value.res, value: from_Type(map[value.res.value].value as tm.Type, map)} : null,
        body: from_Expression(map[value.body].value as tm.Expression, map),
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
export const from_Larg = (value: tm.Larg, map: tm.Map): t.Larg => ({
    ...value,
    ...{
        pat: from_Pattern(map[value.pat].value as tm.Pattern, map),
        typ: value.typ ? {...value.typ, value: from_Type(map[value.typ.value].value as tm.Type, map)} : null,
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
export const from_Number = (value: tm.Number, map: tm.Map): t.Number => ({
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
export const from_Boolean = (value: tm.Boolean, map: tm.Map): t.Boolean => ({
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
export const from_PIdentifier = (value: tm.PIdentifier, map: tm.Map): t.PIdentifier => ({
    ...value,
    ...{
        text: value.text,
        ref: value.ref ? {...value.ref, value: from_LocalHash(map[value.ref.value].value as tm.LocalHash, map)} : null,
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
export const from_Identifier = (value: tm.Identifier, map: tm.Map): t.Identifier => ({
    ...value,
    ...{
        text: value.text,
        ref: value.ref ? {...value.ref, value: map[value.ref.value].value.type === 'IdHash' ? from_IdHash(map[value.ref.value].value as tm.IdHash, map) : map[value.ref.value].value.type === 'LocalHash' ? from_LocalHash(map[value.ref.value].value as tm.LocalHash, map) :  fail("no option")} : null,
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
export const from_UInt = (value: tm.UInt, map: tm.Map): t.UInt => ({
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
export const from_LocalHash = (value: tm.LocalHash, map: tm.Map): t.LocalHash => ({
    ...value,
    ...{
        sym: from_UInt(map[value.sym].value as tm.UInt, map),
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
export const from_IdHash = (value: tm.IdHash, map: tm.Map): t.IdHash => ({
    ...value,
    ...{
        hash: value.hash,
        idx: value.idx ? from_UInt(map[value.idx].value as tm.UInt, map) : null,
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
export const from_Apply = (value: tm.Apply, map: tm.Map): t.Apply => ({
    ...value,
    ...{
            target: from_Applyable(map[value.target].value as tm.Applyable, map),
            suffixes: value.suffixes.map(suffix => from_Suffix(map[suffix].value as tm.Suffix, map)),

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
export const from_CallSuffix = (value: tm.CallSuffix, map: tm.Map): t.CallSuffix => ({
    ...value,
    ...{
        args: value.args.map(item => from_Expression(map[item].value as tm.Expression, map)),
    },
});
export const CallSuffix_id = (value: t.CallSuffix, map: tm.Map): number => add(map, {
    type: "CallSuffix",
    value: CallSuffix(value, map)
});


export const Expression = (value: t.Expression, map: tm.Map): tm.Expression => (value.type === "Lambda" ? Lambda(value, map) : 
value.type === "Apply" ? Apply(value, map) : 
value.type === "Number" || value.type === "Boolean" || value.type === "Identifier" ? Applyable(value, map) : 
value.type === "Blank" ? Blank(value, map) : 
fail("Unexpected type: " + (value as any).type));
export const from_Expression = (value: tm.Expression, map: tm.Map): t.Expression => (value.type === "Lambda" ? from_Lambda(value, map) : 
value.type === "Apply" ? from_Apply(value, map) : 
value.type === "Number" || value.type === "Boolean" || value.type === "Identifier" ? from_Applyable(value, map) : 
value.type === "Blank" ? from_Blank(value, map) : 
fail("Unexpected type: " + (value as any).type));
export const Expression_id = (value: t.Expression, map: tm.Map): number => add(map, {
    type: "Expression",
    value: Expression(value, map)
});


export const Applyable = (value: t.Applyable, map: tm.Map): tm.Applyable => (value.type === "Number" ? Number(value, map) : 
value.type === "Boolean" ? Boolean(value, map) : 
value.type === "Identifier" ? Identifier(value, map) : 
value.type === "Blank" ? Blank(value, map) : 
fail("Unexpected type: " + (value as any).type));
export const from_Applyable = (value: tm.Applyable, map: tm.Map): t.Applyable => (value.type === "Number" ? from_Number(value, map) : 
value.type === "Boolean" ? from_Boolean(value, map) : 
value.type === "Identifier" ? from_Identifier(value, map) : 
value.type === "Blank" ? from_Blank(value, map) : 
fail("Unexpected type: " + (value as any).type));
export const Applyable_id = (value: t.Applyable, map: tm.Map): number => add(map, {
    type: "Applyable",
    value: Applyable(value, map)
});


export const Type = (value: t.Type, map: tm.Map): tm.Type => (value.type === "Number" ? Number(value, map) : 
value.type === "Boolean" ? Boolean(value, map) : 
value.type === "Identifier" ? Identifier(value, map) : 
value.type === "Blank" ? Blank(value, map) : 
fail("Unexpected type: " + (value as any).type));
export const from_Type = (value: tm.Type, map: tm.Map): t.Type => (value.type === "Number" ? from_Number(value, map) : 
value.type === "Boolean" ? from_Boolean(value, map) : 
value.type === "Identifier" ? from_Identifier(value, map) : 
value.type === "Blank" ? from_Blank(value, map) : 
fail("Unexpected type: " + (value as any).type));
export const Type_id = (value: t.Type, map: tm.Map): number => add(map, {
    type: "Type",
    value: Type(value, map)
});


export const Atom = (value: t.Atom, map: tm.Map): tm.Atom => (value.type === "Number" ? Number(value, map) : 
value.type === "Boolean" ? Boolean(value, map) : 
value.type === "PIdentifier" ? PIdentifier(value, map) : 
value.type === "Identifier" ? Identifier(value, map) : 
value.type === "Blank" ? Blank(value, map) : 
fail("Unexpected type: " + (value as any).type));
export const from_Atom = (value: tm.Atom, map: tm.Map): t.Atom => (value.type === "Number" ? from_Number(value, map) : 
value.type === "Boolean" ? from_Boolean(value, map) : 
value.type === "PIdentifier" ? from_PIdentifier(value, map) : 
value.type === "Identifier" ? from_Identifier(value, map) : 
value.type === "Blank" ? from_Blank(value, map) : 
fail("Unexpected type: " + (value as any).type));
export const Atom_id = (value: t.Atom, map: tm.Map): number => add(map, {
    type: "Atom",
    value: Atom(value, map)
});


export const Pattern = (value: t.Pattern, map: tm.Map): tm.Pattern => (value.type === "PIdentifier" ? PIdentifier(value, map) : 
value.type === "Blank" ? Blank(value, map) : 
fail("Unexpected type: " + (value as any).type));
export const from_Pattern = (value: tm.Pattern, map: tm.Map): t.Pattern => (value.type === "PIdentifier" ? from_PIdentifier(value, map) : 
value.type === "Blank" ? from_Blank(value, map) : 
fail("Unexpected type: " + (value as any).type));
export const Pattern_id = (value: t.Pattern, map: tm.Map): number => add(map, {
    type: "Pattern",
    value: Pattern(value, map)
});


export const Suffix = (value: t.Suffix, map: tm.Map): tm.Suffix => (value.type === "CallSuffix" ? CallSuffix(value, map) : 
value.type === "Blank" ? Blank(value, map) : 
fail("Unexpected type: " + (value as any).type));
export const from_Suffix = (value: tm.Suffix, map: tm.Map): t.Suffix => (value.type === "CallSuffix" ? from_CallSuffix(value, map) : 
value.type === "Blank" ? from_Blank(value, map) : 
fail("Unexpected type: " + (value as any).type));
export const Suffix_id = (value: t.Suffix, map: tm.Map): number => add(map, {
    type: "Suffix",
    value: Suffix(value, map)
});


export const Node = (value: t.Node, map: tm.Map): tm.Node => (value.type === "Lambda" ? Lambda(value, map) : 
value.type === "Larg" ? Larg(value, map) : 
value.type === "Number" ? Number(value, map) : 
value.type === "Boolean" ? Boolean(value, map) : 
value.type === "PIdentifier" ? PIdentifier(value, map) : 
value.type === "Identifier" ? Identifier(value, map) : 
value.type === "UInt" ? UInt(value, map) : 
value.type === "LocalHash" ? LocalHash(value, map) : 
value.type === "IdHash" ? IdHash(value, map) : 
value.type === "Apply" ? Apply(value, map) : 
value.type === "CallSuffix" ? CallSuffix(value, map) : 
value.type === "Blank" ? Blank(value, map) : 
fail("Unexpected type: " + (value as any).type));
export const from_Node = (value: tm.Node, map: tm.Map): t.Node => (value.type === "Lambda" ? from_Lambda(value, map) : 
value.type === "Larg" ? from_Larg(value, map) : 
value.type === "Number" ? from_Number(value, map) : 
value.type === "Boolean" ? from_Boolean(value, map) : 
value.type === "PIdentifier" ? from_PIdentifier(value, map) : 
value.type === "Identifier" ? from_Identifier(value, map) : 
value.type === "UInt" ? from_UInt(value, map) : 
value.type === "LocalHash" ? from_LocalHash(value, map) : 
value.type === "IdHash" ? from_IdHash(value, map) : 
value.type === "Apply" ? from_Apply(value, map) : 
value.type === "CallSuffix" ? from_CallSuffix(value, map) : 
value.type === "Blank" ? from_Blank(value, map) : 
fail("Unexpected type: " + (value as any).type));
export const Node_id = (value: t.Node, map: tm.Map): number => add(map, {
    type: "Node",
    value: Node(value, map)
});