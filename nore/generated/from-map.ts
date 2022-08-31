import * as tm from './type-map';
import * as t from './types';

export const Expression = (value: tm.Expression, map: tm.Map): t.Expression => {
    return value.type === 'Apply' ? Apply(value, map) : Applyable(value, map);
};
export const Apply = (value: tm.Apply, map: tm.Map): t.Apply => {
    return {
        ...value,
        target: Applyable(map[value.target].value as tm.Applyable, map),
        suffixes: value.suffixes.map((suffix) =>
            Suffix(map[suffix].value as tm.Suffix, map),
        ),
    };
};

export const Suffix = (value: tm.Suffix, map: tm.Map): t.Suffix => {
    return value.type === 'CallSuffix' ? CallSuffix(value, map) : value;
};
export const CallSuffix = (value: tm.CallSuffix, map: tm.Map): t.CallSuffix => {
    return {
        ...value,
        args: value.args.map((arg) =>
            Expression(map[arg].value as tm.Expression, map),
        ),
    };
};
export const Applyable = (value: tm.Applyable, map: tm.Map): t.Applyable => {
    return value.type === 'Identifier' ? Identifier(value, map) : value;
};
export const Identifier = (value: tm.Identifier, map: tm.Map): t.Identifier => {
    return {
        ...value,
        ref: value.ref
            ? {
                  ...value.ref,
                  value:
                      map[value.ref.value].type === 'IdHash'
                          ? IdHash(map[value.ref.value].value as tm.IdHash, map)
                          : LocalHash(
                                map[value.ref.value].value as tm.LocalHash,
                                map,
                            ),
              }
            : null,
    };
};
export const IdHash = (value: tm.IdHash, map: tm.Map): t.IdHash => {
    return {
        ...value,
        idx: value.idx ? (map[value.idx].value as t.UInt) : null,
    };
};

export const LocalHash = (value: tm.LocalHash, map: tm.Map): t.LocalHash => {
    return {
        ...value,
        sym: map[value.sym].value as t.UInt,
    };
};
