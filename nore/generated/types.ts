export type Loc = {
    start: number;
    end: number;
    idx: number;
}

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

export type CallSuffix = {
  type: "CallSuffix";
  args: Expression[];
  loc: Loc;
};

export type Apply = {
  type: "Apply";
  target: Applyable;
  suffixes: Suffix[];
  loc: Loc;
};

export type _ = string;

export type Expression = Applyable | Apply;

export type Applyable = Number | Boolean | Identifier;

export type Type = Number | Boolean | Identifier;

export type Suffix = CallSuffix;