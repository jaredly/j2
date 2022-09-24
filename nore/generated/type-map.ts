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
  args: number[];
  res: {
    inferred: boolean;
    value: number;
  } | null;
  body: number;
  loc: Loc;
};

export type Larg = {
  type: "Larg";
  pat: number;
  typ: {
    inferred: boolean;
    value: number;
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
    value: number;
  } | null;
  loc: Loc;
};

export type Identifier = {
  type: "Identifier";
  text: IdText;
  ref: {
    inferred: boolean;
    value: number | number;
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
  sym: number;
  loc: Loc;
};

export type IdHash = {
  type: "IdHash";
  hash: HashText;
  idx: null | number;
  loc: Loc;
};

export type Apply = {
  type: "Apply";
  target: number;
  suffixes: number[];
  loc: Loc;
};

export type CallSuffix = {
  type: "CallSuffix";
  args: number[];
  loc: Loc;
};

export type _ = string;

export type Expression = Lambda | Apply | Applyable | Blank;

export type Applyable = Number | Boolean | Identifier | Blank;

export type Type = Number | Boolean | Identifier | Blank;

export type Atom = Number | Boolean | PIdentifier | Identifier | Blank;

export type Pattern = PIdentifier | Blank;

export type Suffix = CallSuffix | Blank;
 
export type MapLambda = {
    type: 'Lambda',
    value: Lambda,
}

export type MapLarg = {
    type: 'Larg',
    value: Larg,
}

export type MapNumber = {
    type: 'Number',
    value: Number,
}

export type MapBoolean = {
    type: 'Boolean',
    value: Boolean,
}

export type MapPIdentifier = {
    type: 'PIdentifier',
    value: PIdentifier,
}

export type MapIdentifier = {
    type: 'Identifier',
    value: Identifier,
}

export type MapUInt = {
    type: 'UInt',
    value: UInt,
}

export type MapLocalHash = {
    type: 'LocalHash',
    value: LocalHash,
}

export type MapIdHash = {
    type: 'IdHash',
    value: IdHash,
}

export type MapApply = {
    type: 'Apply',
    value: Apply,
}

export type MapCallSuffix = {
    type: 'CallSuffix',
    value: CallSuffix,
}

export type MapExpression = {
    type: 'Expression',
    value: Expression,
}

export type MapApplyable = {
    type: 'Applyable',
    value: Applyable,
}

export type MapType = {
    type: 'Type',
    value: Type,
}

export type MapAtom = {
    type: 'Atom',
    value: Atom,
}

export type MapPattern = {
    type: 'Pattern',
    value: Pattern,
}

export type MapSuffix = {
    type: 'Suffix',
    value: Suffix,
}

export type Map = {
	[key: number]: MapLambda | MapLarg | MapNumber | MapBoolean | MapPIdentifier | MapIdentifier | MapUInt | MapLocalHash | MapIdHash | MapApply | MapCallSuffix | MapExpression | MapApplyable | MapType | MapAtom | MapPattern | MapSuffix
}
