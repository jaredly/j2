//

/*:peg:
WithUnary = op_drop:UnaryOpWithHash? inner:UnaryInner 
UnaryOpWithHash = op:UnaryOp hash:(OpHash _)?
UnaryOp = "-" / "!"
*/
