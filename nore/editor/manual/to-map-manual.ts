import * as tm from './type-map';
import * as t from './types';

export const add = (map: tm.Map, item: tm.Map[0]) => {
    map[item.value.loc.idx] = item;
    return item.value.loc.idx;
};

export const PIdentifier = (
    value: t.PIdentifier,
    map: tm.Map,
): tm.PIdentifier => {
    return {
        ...value,
        ref: value.ref
            ? {
                  ...value.ref,
                  value: add(map, {
                      type: 'LocalHash',
                      value: LocalHash(value.ref.value, map),
                  }),
              }
            : null,
    };
};

export const Identifier = (value: t.Identifier, map: tm.Map): tm.Identifier => {
    return {
        ...value,
        ref: value.ref
            ? {
                  ...value.ref,
                  value:
                      value.ref.value.type === 'IdHash'
                          ? add(map, {
                                type: 'IdHash',
                                value: IdHash(value.ref.value, map),
                            })
                          : add(map, {
                                type: 'LocalHash',
                                value: LocalHash(value.ref.value, map),
                            }),
              }
            : null,
    };
};

export const IdHash = (value: t.IdHash, map: tm.Map): tm.IdHash => {
    return {
        ...value,
        idx: value.idx ? add(map, { type: 'UInt', value: value.idx }) : null,
    };
};

export const LocalHash = (value: t.LocalHash, map: tm.Map): tm.LocalHash => {
    return {
        ...value,
        sym: add(map, { type: 'UInt', value: value.sym }),
    };
};

export const CallSuffix = (value: t.CallSuffix, map: tm.Map): tm.CallSuffix => {
    return {
        ...value,
        args: value.args.map((arg) =>
            add(map, { type: 'Expression', value: Expression(arg, map) }),
        ),
    };
};

export const Apply = (value: t.Apply, map: tm.Map): tm.Apply => {
    return {
        ...value,
        target: add(map, {
            type: 'Applyable',
            value: Applyable(value.target, map),
        }),
        suffixes: value.suffixes.map((suffix) =>
            add(map, { type: 'Suffix', value: Suffix(suffix, map) }),
        ),
    };
};

export const Suffix = (value: t.Suffix, map: tm.Map): tm.Suffix => {
    if (value.type === 'Blank') {
        return value;
    }
    return CallSuffix(value, map);
};

export const Expression = (value: t.Expression, map: tm.Map): tm.Expression => {
    return value.type === 'Apply'
        ? Apply(value, map)
        : value.type === 'Lambda'
        ? Lambda(value, map)
        : Applyable(value, map);
};

export const Lambda = (value: t.Lambda, map: tm.Map): tm.Lambda => {
    return {
        ...value,
        args: value.args.map((larg) =>
            add(map, { type: 'Larg', value: Larg(larg, map) }),
        ),
        body: add(map, {
            type: 'Expression',
            value: Expression(value.body, map),
        }),
        res: value.res
            ? {
                  ...value.res,
                  value: add(map, {
                      type: 'Type',
                      value: Type(value.res.value, map),
                  }),
              }
            : null,
    };
};

export const Pattern = (value: t.Pattern, map: tm.Map): tm.Pattern => {
    if (value.type === 'Blank') {
        return value;
    }
    return PIdentifier(value, map);
};

// export const PIdentifier = (
//     value: t.PIdentifier,
//     map: tm.Map,
// ): tm.PIdentifier => {
//     return {
//         ...value,
//         ref: value.ref
//             ? add(map, {
//                   type: 'LocalHash',
//                   value: LocalHash(value.ref, map),
//               })
//             : null,
//     };
// };

export const Larg = (value: t.Larg, map: tm.Map): tm.Larg => {
    return {
        ...value,
        pat: add(map, { type: 'Pattern', value: Pattern(value.pat, map) }),
        typ: null,
    };
};

export const Applyable = (value: t.Applyable, map: tm.Map): tm.Applyable => {
    return value.type === 'Number' ||
        value.type === 'Blank' ||
        value.type === 'Boolean'
        ? value
        : Identifier(value, map);
};

export const Type = (value: t.Type, map: tm.Map): tm.Type => {
    return value.type === 'Number' ||
        value.type === 'Blank' ||
        value.type === 'Boolean'
        ? value
        : Identifier(value, map);
};
