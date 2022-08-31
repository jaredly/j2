
import {parse} from './grammar';
import * as t from './types';
export const parseExpression = (x: string): t.Expression => parse(x, {startRule: 'Expression'})

export const parseApplyable = (x: string): t.Applyable => parse(x, {startRule: 'Applyable'})

export const parseNumber = (x: string): t.Number => parse(x, {startRule: 'Number'})

export const parseIdentifier = (x: string): t.Identifier => parse(x, {startRule: 'Identifier'})

export const parseSuffix = (x: string): t.Suffix => parse(x, {startRule: 'Suffix'})
