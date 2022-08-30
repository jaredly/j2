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
  };
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
    value: number | number;
  };
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
  sym: number;
  loc: Loc;
};

export type IdHash = {
  type: "IdHash";
  hash: HashText;
  idx: null | number;
  loc: Loc;
};

export type CallSuffix = {
  type: "CallSuffix";
  args: number[];
  loc: Loc;
};

export type Apply = {
  type: "Apply";
  target: number;
  suffixes: number[];
  loc: Loc;
};

export type _ = string;

export type Expression = Applyable | Apply | Apply;

export type Applyable = Number | Boolean | Identifier;

export type Type = Number | Boolean | Identifier;

export type Suffix = CallSuffix;
	
export type Map = {
	[key: number]: {
			type: 'Number',
			value: Number,
		} | {
			type: 'Boolean',
			value: Boolean,
		} | {
			type: 'Identifier',
			value: Identifier,
		} | {
			type: 'UInt',
			value: UInt,
		} | {
			type: 'LocalHash',
			value: LocalHash,
		} | {
			type: 'IdHash',
			value: IdHash,
		} | {
			type: 'CallSuffix',
			value: CallSuffix,
		} | {
			type: 'Apply',
			value: Apply,
		} | {
			type: 'Expression',
			value: Expression,
		} | {
			type: 'Applyable',
			value: Applyable,
		} | {
			type: 'Type',
			value: Type,
		} | {
			type: 'Suffix',
			value: Suffix,
		}
}
