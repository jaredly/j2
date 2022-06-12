// This is just sugar for an apply

/*:peg:
UnaryOp = op_drop:unaryOpWithHash? inner:UnaryInner 
unaryOpWithHash = op:unaryOp hash:(($opHash / $BuiltinHash) _)?
unaryOp = "-" / "!"

UnaryInner = Apply
*/
