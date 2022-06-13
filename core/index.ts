// Generated?

export type Type = '';
export type FromAst = 'a';
// export type Loc = { line: number; column: number };
// export type Location = { start: Loc; end: Loc };

export type Id = string;

export type Identifier =
    | {
          type: 'Global';
          id: Id;
      }
    | {
          type: 'Local';
          sym: number;
      };

export type AmbiguousIdentifier = {
    type: 'AmbiguousIdentifier';
    ids: Array<Identifier>;
};

export type Ctx = {
    resolve: (name: string, hash?: string | null) => AmbiguousIdentifier | null;
};
