// ok

/*:peg:
BinOp = first:BinOpInner rest_drop:BinOpRight* 
BinOpRight = _ op:binopWithHash _ right:BinOpInner 

binopWithHash = op:binop hash:($BuiltinHash / $opHash)?
binop = $(!"//" [+*^/<>=|&-]+)
opHash = (JustSym / HashRef) (JustSym / HashRef) HashNum

BinOpInner = UnaryOp
*/
