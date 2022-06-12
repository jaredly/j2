import { Location } from './base.parser';

export type File = {
    type: 'File';
    toplevels: Array<Toplevel>;
    loc: Location;
};

export type Toplevel = {
    type: 'ToplevelExpression';
    expr: Expression;
    loc: Location;
};

export type Expression = Apply | Int;

export type Int = {
    type: 'Int';
    loc: Location;
    value: number;
};

export type Apply = {
    type: 'Apply';
    loc: Location;
    target: Expression;
    args: Array<Expression>;
};
