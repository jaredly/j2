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
    needsTypeVariables: 0,
    ifBranchesDisagree: 2,
    patternMismatch: 0,
    resMismatch: 1,
    notExhaustive: 0,
    caseMismatch: 1,
};
export type ErrorTag = keyof typeof errors;
