// ok

/*:peg:
BinOp = first:BinOpInner rest_drop:BinOpRight* 
BinOpRight = _ op:binopWithHash _ right:BinOpInner 

binopWithHash = op:binop hash:($BuiltinHash / $binopHash)?
binop = $(!"//" [+*^/<>=|&-]+)
binopHash = (JustSym / HashRef) (JustSym / HashRef) HashNum
*/
