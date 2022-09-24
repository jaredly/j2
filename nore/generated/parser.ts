
import {parse} from './grammar';
import * as t from './types';
export const parseNumber = (x: string): t.Number => parse(x, {startRule: 'Number'}) as t.Number;

export const parseBoolean = (x: string): t.Boolean => parse(x, {startRule: 'Boolean'}) as t.Boolean;

export const parsePIdentifier = (x: string): t.PIdentifier => parse(x, {startRule: 'PIdentifier'}) as t.PIdentifier;

export const parseIdentifier = (x: string): t.Identifier => parse(x, {startRule: 'Identifier'}) as t.Identifier;

export const parseExpression = (x: string): t.Expression => parse(x, {startRule: 'Expression'}) as t.Expression;

export const parseApplyable = (x: string): t.Applyable => parse(x, {startRule: 'Applyable'}) as t.Applyable;

export const parseType = (x: string): t.Type => parse(x, {startRule: 'Type'}) as t.Type;

export const parseAtom = (x: string): t.Atom => parse(x, {startRule: 'Atom'}) as t.Atom;

export const parsePattern = (x: string): t.Pattern => parse(x, {startRule: 'Pattern'}) as t.Pattern;

export const parseSuffix = (x: string): t.Suffix => parse(x, {startRule: 'Suffix'}) as t.Suffix;
