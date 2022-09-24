export type Loc = {
    start: number;
    end: number;
    idx: number;
}

export type Blank = {
  type: "Blank";
  loc: Loc;
};

export type Lambda = {
  type: "Lambda";
  args: Larg[];
  res: {
    inferred: boolean;
    value: Type;
  } | null;
  body: Expression;
  loc: Loc;
};

export type Larg = {
  type: "Larg";
  pat: Pattern;
  typ: {
    inferred: boolean;
    value: Type;
  } | null;
  loc: Loc;
};

export type Number = {
  type: "Number";
  num: {
    raw: RawNumber;
    value: number;
  };
  kind: {
    inferred: boolean;
    value: "u" | "i" | "f";
  } | null;
  loc: Loc;
};

export type RawNumber = string;

export type Boolean = {
  type: "Boolean";
  value: "true" | "false";
  loc: Loc;
};

export type PIdentifier = {
  type: "PIdentifier";
  text: IdText;
  ref: {
    inferred: boolean;
    value: LocalHash;
  } | null;
  loc: Loc;
};

export type Identifier = {
  type: "Identifier";
  text: IdText;
  ref: {
    inferred: boolean;
    value: IdHash | LocalHash;
  } | null;
  loc: Loc;
};

export type IdText = string;

export type HashText = string;

export type UIntLiteral = string;

export type UInt = {
  type: "UInt";
  raw: UIntLiteral;
  value: number;
  loc: Loc;
};

export type LocalHash = {
  type: "LocalHash";
  sym: UInt;
  loc: Loc;
};

export type IdHash = {
  type: "IdHash";
  hash: HashText;
  idx: null | UInt;
  loc: Loc;
};

export type Apply = {
  type: "Apply";
  target: Applyable;
  suffixes: Suffix[];
  loc: Loc;
};

export type CallSuffix = {
  type: "CallSuffix";
  args: Expression[];
  loc: Loc;
};

export type _ = string;

export type Expression = Lambda | Apply | Applyable | Blank;

export type Applyable = Number | Boolean | Identifier | Blank;

export type Type = Number | Boolean | Identifier | Blank;

export type Atom = Number | Boolean | PIdentifier | Identifier | Blank;

export type Pattern = PIdentifier | Blank;

export type Suffix = CallSuffix | Blank;