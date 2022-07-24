import * as t from '../typed-ast';
import { Ctx as ACtx } from './analyze';
import { ToTast } from './to-tast.gen';
export { makeToTast, type ToTast } from './to-tast.gen';

export type Ctx = {
    resetSym: () => void;
    // hmm
    // seems like the ctx probably wants a say in the assignment of symbol IDs.
    // to ensure there aren't collisions.
    sym: (name: string) => t.Sym;
    newTypeVar: () => t.TVbl;
    withLocalTypes: (locals: { sym: t.Sym; bound: t.Type | null }[]) => Ctx;
    withAliases: (aliases: { [readableName: string]: string }) => Ctx;
    withTypes: (types: { name: string; type: t.Type }[]) => Ctx;
    withValues: (types: { name: string; expr: t.Expression; loc: t.Loc }[]) => {
        hash: string;
        ctx: Ctx;
    };
    toplevelConfig: (top: Toplevel | null) => Ctx;
    ToTast: ToTast;
} & ACtx;

export type Toplevel =
    | {
          type: 'Type';
          // TODO: This shouldn't be optional,
          // it should be never there for to-tast,
          // and always there for analyze.
          hash?: string;
          items: {
              name: string;
              args: t.TVar[];
              kind: TopTypeKind;
          }[];
      }
    | { type: 'Expr'; hash?: string; items: { name: string; type: t.Type }[] };

export type TopTypeKind = 'enum' | 'record' | 'builtin' | 'lambda' | 'unknown';
