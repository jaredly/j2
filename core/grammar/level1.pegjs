
Atom /= Lambda / Parened / TypeLambda

// ParenedOp = "(" binopWithHash ")"

Parened = "(" _ Expression _ ")"

// oof ok, so using parentheses to distinguish + operators
// might run afoul of lambda syntax
Lambda = "(" _ params:Params? ")" _ "=>" _ body:Expression

Params = first:Param rest:(_ "," _ Param)* _ ","? _

TypeLambda = "<" _ params:CommaTypeParam ">" _ body:Expression

CommaTypeParam = first:TypeParam rest:(_ "," _ TypeParam)* _ ","? _

// TODO constraints I think
TypeParam = id:Identifier hash:JustSym?

// TODO allow type annotations probably
Param = Pattern

Pattern = id:Identifier hash:JustSym?

Suffix /= TypeApplication

TypeApplication = "<" _ args:CommaType? ">"

CommaType = first:Type rest:(_ "," _ Type)* _ ","? _

Type = id:Identifier args:TypeApplication?