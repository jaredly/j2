import { ToTast as ConstantsToTast } from '../elements/constants';
import { ToTast as DecoratorsToTast } from '../elements/decorators';
import { ToTast as ApplyToTast } from '../elements/apply';
import { ToTast as TypeToTast } from '../elements/type';
import { ToTast as GenericsToTast } from '../elements/generics';
import * as p from '../grammar/base.parser';
import * as t from '../typed-ast';
import { GlobalType, GlobalValue } from '../ctx';
import { Ctx as ACtx } from './analyze';
import { ToTast } from './to-tast.gen';
export { type ToTast, makeToTast } from './to-tast.gen';

export type Ctx = {
    resetSym: () => void;
    typeForId: (id: t.Id) => GlobalType | null;
    valueForId: (id: t.Id) => GlobalValue | null;
    resolveType: (name: string, hash?: string | null) => t.RefKind | null;
    resolveDecorator: (name: string, hash?: string | null) => Array<t.RefKind>;
    // hmm
    // seems like the ctx probably wants a say in the assignment of symbol IDs.
    // to ensure there aren't collisions.
    sym: (name: string) => t.Sym;
    withLocalTypes: (locals: { sym: t.Sym; bound: t.Type | null }[]) => Ctx;
    withAliases: (aliases: { [readableName: string]: string }) => Ctx;
    withTypes: (types: { name: string; type: t.Type }[]) => Ctx;
    ToTast: ToTast;
} & ACtx;
