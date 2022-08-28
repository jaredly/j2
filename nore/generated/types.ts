export type Identifier = {
  type: "Identifier";
  text: string;
  ref: {
    inferred: boolean;
    item: IdHash | LocalHash;
  };
};
export type LocalHash = {
  type: "LocalHash";
  text: UIntLiteral;
};
export type IdHash = {
  type: "IdHash";
  hash: string;
  idx: null | UIntLiteral;
};
export type Apply = {
  type: "Apply";
  target: Expression;
  suffixes: Suffix[];
};
export type CallSuffix = {
  type: "CallSuffix";
  args: Expression[];
};
export type Expression = Identifier | Apply;
export type Type = Identifier;
export type Suffix = CallSuffix;
export type UIntLiteral = number;