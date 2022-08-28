export type Number = {
  type: "Number";
  raw: RawNumber;
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
export type LocalHash = {
  type: "LocalHash";
  text: UIntLiteral;
};
export type IdHash = {
  type: "IdHash";
  hash: HashText;
  idx: null | UIntLiteral;
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
export type UIntLiteral = number;