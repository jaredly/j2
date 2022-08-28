export type Number = {
  type: "Number";
  num: {
    raw: RawNumber;
    value: number;
  };
  kind: {
    inferred: boolean;
    item: "u" | "i" | "f";
  };
};

export type RawNumber = string;

export type Boolean = {
  type: "Boolean";
  value: "true" | "false";
};

export type Identifier = {
  type: "Identifier";
  text: IdText;
  ref: {
    inferred: boolean;
    item: IdHash | LocalHash;
  };
};

export type IdText = string;

export type HashText = string;

export type UIntLiteral = string;

export type UInt = {
  type: "UInt";
  raw: UIntLiteral;
  value: number;
};

export type LocalHash = {
  type: "LocalHash";
  sym: UInt;
};

export type IdHash = {
  type: "IdHash";
  hash: HashText;
  idx: null | UInt;
};

export type CallSuffix = {
  type: "CallSuffix";
  args: Expression[];
};

export type Apply = {
  type: "Apply";
  target: Applyable;
  suffixes: Suffix[];
};

export type _ = string;

export type Applyable = Number | Boolean | Identifier;

export type Type = Number | Boolean | Identifier;

export type Suffix = CallSuffix;

export type Expression = Apply;