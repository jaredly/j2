
import {parse} from './grammar';
import * as t from './types';
export const parseLambda = (x: string): t.Lambda => parse(x, {startRule: 'Lambda'}) as t.Lambda;

export const parseLarg = (x: string): t.Larg => parse(x, {startRule: 'Larg'}) as t.Larg;

export const parseNumber = (x: string): t.Number => parse(x, {startRule: 'Number'}) as t.Number;

export const parseRawNumber = (x: string): t.RawNumber => parse(x, {startRule: 'RawNumber'}) as t.RawNumber;

export const parseBoolean = (x: string): t.Boolean => parse(x, {startRule: 'Boolean'}) as t.Boolean;

export const parsePIdentifier = (x: string): t.PIdentifier => parse(x, {startRule: 'PIdentifier'}) as t.PIdentifier;

export const parseIdentifier = (x: string): t.Identifier => parse(x, {startRule: 'Identifier'}) as t.Identifier;

export const parseIdText = (x: string): t.IdText => parse(x, {startRule: 'IdText'}) as t.IdText;

export const parseHashText = (x: string): t.HashText => parse(x, {startRule: 'HashText'}) as t.HashText;

export const parseUIntLiteral = (x: string): t.UIntLiteral => parse(x, {startRule: 'UIntLiteral'}) as t.UIntLiteral;

export const parseUInt = (x: string): t.UInt => parse(x, {startRule: 'UInt'}) as t.UInt;

export const parseLocalHash = (x: string): t.LocalHash => parse(x, {startRule: 'LocalHash'}) as t.LocalHash;

export const parseIdHash = (x: string): t.IdHash => parse(x, {startRule: 'IdHash'}) as t.IdHash;

export const parseApply = (x: string): t.Apply => parse(x, {startRule: 'Apply'}) as t.Apply;

export const parseCallSuffix = (x: string): t.CallSuffix => parse(x, {startRule: 'CallSuffix'}) as t.CallSuffix;

export const parse_ = (x: string): t._ => parse(x, {startRule: '_'}) as t._;

export const parseExpression = (x: string): t.Expression => parse(x, {startRule: 'Expression'}) as t.Expression;

export const parseApplyable = (x: string): t.Applyable => parse(x, {startRule: 'Applyable'}) as t.Applyable;

export const parseType = (x: string): t.Type => parse(x, {startRule: 'Type'}) as t.Type;

export const parseAtom = (x: string): t.Atom => parse(x, {startRule: 'Atom'}) as t.Atom;

export const parsePattern = (x: string): t.Pattern => parse(x, {startRule: 'Pattern'}) as t.Pattern;

export const parseSuffix = (x: string): t.Suffix => parse(x, {startRule: 'Suffix'}) as t.Suffix;
